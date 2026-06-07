# jbot-review-action

Agentic PR reviewer powered by OpenCode. Drops into any repo with one workflow file.

## Usage

```yaml
# .github/workflows/jbot-review.yml
name: jbot-review
on:
  pull_request:
    types: [opened, reopened, ready_for_review, synchronize]

concurrency:
  group: jbot-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  packages: read
  pull-requests: write

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pgup-ai/jbot-review-action@v0   # latest v0.x.y
        with:
          provider: ${{ vars.JBOT_REVIEW_PROVIDER || 'opencode' }}
          model: ${{ vars.JBOT_REVIEW_MODEL || '' }}
          api-key: ${{ secrets.OPENCODE_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `provider` | No | `opencode` | LLM provider (opencode, deepseek, openai, anthropic, openrouter) |
| `model` | No | Provider default | Model as `provider/model` |
| `api-key` | Yes | — | API key for the selected provider (matches the `provider` value) |
| `github-token` | Yes | `${{ github.token }}` | Token for posting the review |
| `pr-number` | No | — | PR number for manual `workflow_dispatch` runs |
| `dry-run` | No | `false` | Log review output without posting comments |
| `max-findings` | No | `0` | Maximum findings to post; `0` means no limit |
| `min-severity` | No | `nit` | Minimum severity to include: `P0`, `P1`, `P2`, `P3`, or `nit` |
| `include-prior-comments` | No | `true` | Include prior PR review comments in context |
| `fail-on-error` | No | `true` | Fail the workflow when review cannot complete |

See [models.dev](https://models.dev/) for the full list of available models.
Use repository or organization Actions variables `JBOT_REVIEW_PROVIDER` and
`JBOT_REVIEW_MODEL` to change future review runs without editing workflow YAML.
Keep `api-key` matched to the selected provider; the example uses
`OPENCODE_API_KEY` because `opencode` is the default.

## Versioning

This project is in beta. Tags follow [SemVer](https://semver.org/): pinned to
`v0.1.0` for now. While in `0.x.y`, breaking changes may ship on any minor
bump. The first `v1.0.0` will mark API stability.

Pin to a specific tag for reproducibility. To track the latest beta:

```yaml
- uses: pgup-ai/jbot-review-action@v0
  # equivalent to the latest v0.x.y release
```

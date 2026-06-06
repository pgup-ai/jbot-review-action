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
  pull-requests: write

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: jingbof/jbot-review-action@v0.1.0
        with:
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

See [models.dev](https://models.dev/) for the full list of available models.

## Versioning

This project is in beta. Tags follow [SemVer](https://semver.org/): pinned to
`v0.1.0` for now. While in `0.x.y`, breaking changes may ship on any minor
bump. The first `v1.0.0` will mark API stability.

Pin to a specific tag for reproducibility. To track the latest beta:

```yaml
- uses: jingbof/jbot-review-action@v0
  # equivalent to the latest v0.x.y release
```

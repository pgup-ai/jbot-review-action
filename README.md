# jbot-review-action

Agentic PR reviewer powered by OpenCode. Drops into any repo with one workflow file.

## Usage

Copy [`examples/jbot-review.yml`](examples/jbot-review.yml) into
`.github/workflows/jbot-review.yml`, or use this minimal version:

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
  checks: read

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pgup-ai/jbot-review-action@v0 # latest v0.x.y
        with:
          provider: ${{ vars.JBOT_REVIEW_PROVIDER || 'opencode' }}
          model: ${{ vars.JBOT_REVIEW_MODEL || '' }}
          opencode-api-key: ${{ secrets.OPENCODE_API_KEY }}
          deepseek-api-key: ${{ secrets.DEEPSEEK_API_KEY }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          openrouter-api-key: ${{ secrets.OPENROUTER_API_KEY }}
          nvidia-api-key: ${{ secrets.NVIDIA_API_KEY }}
          xai-api-key: ${{ secrets.XAI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          thread-resolution-token: ${{ secrets.JBOT_REVIEW_THREAD_RESOLUTION_TOKEN }}
```

## Inputs

| Input                     | Required | Default               | Description                                                                   |
| ------------------------- | -------- | --------------------- | ----------------------------------------------------------------------------- |
| `provider`                | No       | `opencode`            | LLM provider (opencode, deepseek, openai, anthropic, openrouter, nvidia, xai) |
| `model`                   | No       | Provider default      | Model as `provider/model`                                                     |
| `opencode-api-key`        | No       | —                     | Required when `provider=opencode`                                             |
| `deepseek-api-key`        | No       | —                     | Required when `provider=deepseek`                                             |
| `openai-api-key`          | No       | —                     | Required when `provider=openai`                                               |
| `anthropic-api-key`       | No       | —                     | Required when `provider=anthropic`                                            |
| `openrouter-api-key`      | No       | —                     | Required when `provider=openrouter`                                           |
| `nvidia-api-key`          | No       | —                     | Required when `provider=nvidia`                                               |
| `xai-api-key`             | No       | —                     | Required when `provider=xai`                                                  |
| `github-token`            | Yes      | `${{ github.token }}` | Token for posting the review                                                  |
| `thread-resolution-token` | No       | —                     | Optional token used only to resolve addressed review threads                  |
| `pr-number`               | No       | —                     | PR number for manual `workflow_dispatch` runs                                 |
| `dry-run`                 | No       | `false`               | Log review output without posting comments                                    |
| `max-findings`            | No       | `0`                   | Maximum findings to post; `0` means no limit                                  |
| `min-severity`            | No       | `nit`                 | Minimum severity to include: `P0`, `P1`, `P2`, `P3`, or `nit`                 |
| `include-prior-comments`  | No       | `true`                | Include prior PR review comments in context                                   |
| `fail-on-error`           | No       | `true`                | Fail the workflow when review cannot complete                                 |

See [models.dev](https://models.dev/) for the full list of available models.
Use repository or organization Actions variables `JBOT_REVIEW_PROVIDER` and
`JBOT_REVIEW_MODEL` to change future review runs without editing workflow YAML.
The action reads only the key matching the selected `provider`, so the example
can pass multiple provider secrets and leave unused ones empty. It accepts
provider and model from either action inputs or environment variables:
`provider` or `JBOT_REVIEW_PROVIDER` for the provider, and `model` or
`JBOT_REVIEW_MODEL` for the model. Provider API keys can also be supplied
through their standard env vars, such as `OPENROUTER_API_KEY` or
`NVIDIA_API_KEY`. This convenience pattern exposes every configured provider key
to the action runtime. For a least-privilege setup, pass only the selected
provider's key:

```yaml
with:
  provider: opencode
  model: ${{ vars.JBOT_REVIEW_MODEL || '' }}
  opencode-api-key: ${{ secrets.OPENCODE_API_KEY }}
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

When jbot verifies a prior finding is fixed, it posts an addressed reply and
then attempts to resolve the GitHub review thread. Some `GITHUB_TOKEN`
integrations can post review comments but cannot run GitHub's
`resolveReviewThread` mutation. If you see `Resource not accessible by
integration` in the logs, add a secret such as
`JBOT_REVIEW_THREAD_RESOLUTION_TOKEN` with a PAT or GitHub App token that can
resolve PR review threads, then pass it through `thread-resolution-token`.

If `model` is set, its `provider/model` prefix must match the selected
`provider`.

Migrating from `api-key`: replace the old unified `api-key` input with the
matching provider-specific input, such as `opencode-api-key` for
`provider: opencode`. The unified input is not read by current `v0` builds.

## Versioning

This project is in beta. Tags follow [SemVer](https://semver.org/): pinned to
`v0.1.0` for now. While in `0.x.y`, breaking changes may ship on any minor
bump. The first `v1.0.0` will mark API stability.

Pin to a specific tag for reproducibility. To track the latest beta:

```yaml
- uses: pgup-ai/jbot-review-action@v0
  # equivalent to the latest v0.x.y release
```

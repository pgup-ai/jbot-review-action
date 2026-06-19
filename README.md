# jbot-review-action

Agentic PR reviewer powered by OpenCode. Drops into any repo with one workflow file.

## Usage

Copy [`examples/jbot-review.yml`](examples/jbot-review.yml) into
`.github/workflows/jbot-review.yml`, or use this minimal version:

```yaml
# .github/workflows/jbot-review.yml
name: J-Bot Code Review
on:
  pull_request:
    types: [opened, reopened, ready_for_review, synchronize]

concurrency:
  group: jbot-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write
  issues: write # PR reactions (jbot's review-done 🚀) use the issues API
  checks: read

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
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
          enable-context7: auto
          context7-api-key: ${{ secrets.CONTEXT7_API_KEY }}
          # Recall/precision controls (defaults shown): one general pass,
          # blocking findings adversarially verified before posting. Set
          # aux-provider + aux-model can run auxiliary sessions on a cheaper
          # provider/model when the main model is a stronger tier.
          review-passes: '1'
          verify-findings: 'true'
          aux-provider: ${{ vars.JBOT_AUX_PROVIDER || '' }}
          aux-model: ${{ vars.JBOT_REVIEW_AUX_MODEL || '' }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          thread-resolution-token: ${{ secrets.JBOT_REVIEW_THREAD_RESOLUTION_TOKEN }}
```

## Inputs

| Input                     | Required | Default               | Description                                                                                |
| ------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `provider`                | No       | `opencode`            | LLM provider (opencode, opencode-go, deepseek, openai, anthropic, openrouter, nvidia, xai) |
| `model`                   | No       | Provider default      | Provider model id, optionally prefixed as `provider/model`                                 |
| `opencode-api-key`        | No       | —                     | Required when `provider=opencode` or `provider=opencode-go`                                |
| `deepseek-api-key`        | No       | —                     | Required when `provider=deepseek`                                                          |
| `openai-api-key`          | No       | —                     | Required when `provider=openai`                                                            |
| `anthropic-api-key`       | No       | —                     | Required when `provider=anthropic`                                                         |
| `openrouter-api-key`      | No       | —                     | Required when `provider=openrouter`                                                        |
| `nvidia-api-key`          | No       | —                     | Required when `provider=nvidia`                                                            |
| `xai-api-key`             | No       | —                     | Required when `provider=xai`                                                               |
| `enable-context7`         | No       | `auto`                | Use Context7 MCP for external contract changes; `auto`, `true`, or `false`                 |
| `context7-api-key`        | No       | —                     | Optional Context7 key for reliable CI docs lookup                                          |
| `github-token`            | Yes      | `${{ github.token }}` | Token for posting the review                                                               |
| `thread-resolution-token` | No       | —                     | Optional token used only to resolve addressed review threads                               |
| `pr-number`               | No       | —                     | PR number for manual `workflow_dispatch` runs                                              |
| `dry-run`                 | No       | `false`               | Log review output without posting comments                                                 |
| `max-findings`            | No       | `0`                   | Maximum findings to post; `0` means no limit                                               |
| `min-severity`            | No       | `nit`                 | Minimum severity to include: `P0`, `P1`, `P2`, `P3`, or `nit`                              |
| `include-prior-comments`  | No       | `true`                | Include prior PR review comments in context                                                |
| `enable-guideline-pass`   | No       | `true`                | Run a dedicated guideline-compliance pass when repository guidelines are discovered         |
| `aux-model`               | No       | —                     | Model for auxiliary sessions; uses the main model when unset                               |
| `aux-provider`            | No       | —                     | Provider for auxiliary sessions; uses the main provider when unset                         |
| `review-passes`           | No       | `1`                   | Total review passes, 1-3. Raise to 2-3 for extra recall lenses                             |
| `verify-findings`         | No       | `true`                | Re-check blocking findings before posting; uncertain findings become advisory              |
| `time-budget-minutes`     | No       | `30`                  | Wall-clock target in minutes; `0` disables budget-derived session timeouts                 |
| `review-shards`           | No       | `1`                   | Parallel main-review shards. `1` = single full-diff session (default); `0` auto-scales by diff size, capped at 4. Only speeds up on providers with real session concurrency; free/throttled tiers serialize shards on one key |
| `model-options`           | No       | `{"reasoningEffort":"medium"}` | JSON provider options for the main model; pass `{}` to send none                  |
| `prompt-cache`            | No       | `true`                | Enable opencode provider prompt caching (`setCacheKey`); cuts input-token cost on providers that honor it, no-op elsewhere |
| `skip-doc-only`           | No       | `true`                | Skip the review (no model call) when the PR changes only documentation/diagram assets (`.md`, `.svg`, `.drawio`, `.pdf`, …); the reaction is left unchanged (a docs push does not change the verdict) |
| `max-concurrent-sessions` | No       | `0`                   | Max model sessions in flight; `0` means unlimited                                          |
| `fail-on-error`           | No       | `true`                | Fail the workflow when review cannot complete                                              |

See [models.dev](https://models.dev/) for the full list of available models.
Use repository or organization Actions variables `JBOT_REVIEW_PROVIDER`,
`JBOT_REVIEW_MODEL`, `JBOT_AUX_PROVIDER`, and `JBOT_REVIEW_AUX_MODEL` to change
future review runs without editing workflow YAML.
The action uses the key matching the selected `provider`, plus the aux provider
key when one is configured and supplied. The example can pass multiple provider
secrets and leave unused ones empty. It accepts provider and model from either
action inputs or environment variables:
`provider` or `JBOT_REVIEW_PROVIDER` for the provider, and `model` or
`JBOT_REVIEW_MODEL` for the model. Auxiliary sessions use `aux-provider` or
`JBOT_AUX_PROVIDER` when set, otherwise the main provider. Their model comes
from `aux-model` or `JBOT_REVIEW_AUX_MODEL` when set, otherwise the main model.
Provider API keys can also be supplied through their standard env vars, such as
`OPENROUTER_API_KEY` or `NVIDIA_API_KEY`. `opencode-go` uses the same
`OPENCODE_API_KEY` as `opencode`.
This convenience pattern exposes every configured provider key to the action
runtime. For a least-privilege setup, pass only the selected provider's key and,
when needed, the aux provider's key:

```yaml
with:
  provider: opencode
  model: ${{ vars.JBOT_REVIEW_MODEL || '' }}
  opencode-api-key: ${{ secrets.OPENCODE_API_KEY }}
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

Set `enable-context7: auto` and pass `context7-api-key` from
`secrets.CONTEXT7_API_KEY` to let the review agent verify current docs when the
PR changes external API, SDK, framework, CLI, cloud-service, or GitHub Actions
usage. Context7 is skipped for ordinary business-logic changes, and Context7
MCP failures are non-blocking.

When jbot verifies a prior finding is fixed, it posts an addressed reply and
then attempts to resolve the GitHub review thread. Some `GITHUB_TOKEN`
integrations can post review comments but cannot run GitHub's
`resolveReviewThread` mutation. If you see `Resource not accessible by
integration` in the logs, add a secret such as
`JBOT_REVIEW_THREAD_RESOLUTION_TOKEN` with a PAT or GitHub App token that can
resolve PR review threads, then pass it through `thread-resolution-token`.

If an aux-provider key is supplied, jbot uses it for auxiliary sessions. If it
is not supplied, jbot reuses the review provider's key.

If `model` is prefixed as `provider/model`, that prefix must match the selected
`provider`. If `aux-model` is prefixed as `provider/model`, that prefix must
match the selected `aux-provider` when set, otherwise the selected `provider`.
Bare model ids are resolved against their selected provider.

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

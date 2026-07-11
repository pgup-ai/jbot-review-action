<p align="center">
  <img src="docs/assets/social-preview.png" alt="J-Bot Review" />
</p>

# jbot-review-action

[![GitHub Marketplace](https://img.shields.io/github/v/release/pgup-ai/jbot-review-action?label=Marketplace&color=5ee39a&logo=github)](https://github.com/marketplace/actions/j-bot-code-review)
[![License: MIT](https://img.shields.io/badge/License-MIT-5ee39a.svg)](LICENSE)

**Open-source agentic PR reviewer — drops into any repo with one workflow
file.** It runs inside your own GitHub Actions, on your runner, with a model
you already pay for: an [OpenCode](https://opencode.ai/) gateway key (Claude,
OpenAI, Gemini, DeepSeek, and 28+ backends) or a coding-CLI account or subscription —
Codex (ChatGPT Plus/Pro), Cursor, Devin, Cline, Grok Build, Kilo, Command Code. Findings
are diff-anchored and adversarially verified before they post. **$0 per
seat** — no reviewer SaaS, no per-review bill.

[Website](https://www.pgupai.com) ·
[Setup guides](https://www.pgupai.com/guides) ·
[Reuse your ChatGPT seat →](https://www.pgupai.com/guides/codex-code-review-github-actions)

## Supported integrations

Top-level providers use `provider: ...`. Model-family rows use an OpenCode
gateway plus the shown `model` namespace.

| Integration | Configure with | Status |
| --- | --- | --- |
| <img src="docs/assets/logos/anthropic.svg" width="15" style="vertical-align: -0.125em;" alt=""> Claude | `provider: anthropic` | Fully supported |
| <img src="docs/assets/logos/cline.svg" width="15" style="vertical-align: -0.125em;" alt=""> Cline | `provider: cline` (pay-as-you-go) or `cline-pass` (subscription) | Fully supported |
| <img src="docs/assets/logos/codex.svg" width="15" style="vertical-align: -0.125em;" alt=""> Codex | `provider: codex` | Fully supported |
| <img src="docs/assets/logos/commandcode.svg" width="15" style="vertical-align: -0.125em;" alt=""> Command Code | `provider: commandcode` | Fully supported |
| <img src="docs/assets/logos/cursor.svg" width="15" style="vertical-align: -0.125em;" alt=""> Cursor | `provider: cursor` | Fully supported |
| <img src="docs/assets/logos/deepseek.svg" width="15" style="vertical-align: -0.125em;" alt=""> DeepSeek | `provider: deepseek` | Fully supported |
| <img src="docs/assets/logos/devin.svg" width="15" style="vertical-align: -0.125em;" alt=""> Devin | `provider: devin` | Fully supported |
| <img src="docs/assets/logos/fireworks.svg" width="15" style="vertical-align: -0.125em;" alt=""> Fireworks | `provider: fireworks-ai` | Fully supported |
| <img src="docs/assets/logos/google.svg" width="15" style="vertical-align: -0.125em;" alt=""> Gemini | `provider: google` | Fully supported |
| <img src="docs/assets/logos/zai-coding-plan.svg" width="15" style="vertical-align: -0.125em;" alt=""> GLM | `provider: zai-coding-plan` or `provider: opencode-go`, `model: glm-*` | Fully supported |
| <img src="docs/assets/logos/xai.svg" width="15" style="vertical-align: -0.125em;" alt=""> Grok Build | `provider: grok` | Fully supported |
| <img src="docs/assets/logos/kilo.svg" width="15" style="vertical-align: -0.125em;" alt=""> Kilo | `provider: kilo` (free gateway default) | Fully supported |
| <img src="docs/assets/logos/kimi.svg" width="15" style="vertical-align: -0.125em;" alt=""> Kimi | `provider: opencode-go`, `model: moonshotai/kimi-*` | Fully supported |
| <img src="docs/assets/logos/minimax.svg" width="15" style="vertical-align: -0.125em;" alt=""> MiniMax | `provider: opencode` or `provider: opencode-go`, `model: minimax-*` | Fully supported |
| <img src="docs/assets/logos/mimo.svg" width="15" style="vertical-align: -0.125em;" alt=""> MiMo | `provider: xiaomi-token-plan-sgp` or `provider: opencode-go`, `model: xiaomi/mimo-*` | Fully supported |
| <img src="docs/assets/logos/nvidia.svg" width="15" style="vertical-align: -0.125em;" alt=""> NVIDIA | `provider: nvidia` | Fully supported |
| <img src="docs/assets/logos/openai.svg" width="15" style="vertical-align: -0.125em;" alt=""> OpenAI | `provider: openai` | Fully supported |
| <img src="docs/assets/logos/opencode.svg" width="15" style="vertical-align: -0.125em;" alt=""> OpenCode | `provider: opencode` | Fully supported |
| <img src="docs/assets/logos/opencode-go.svg" width="15" style="vertical-align: -0.125em;" alt=""> OpenCode Go | `provider: opencode-go` | Fully supported |
| <img src="docs/assets/logos/openrouter.svg" width="15" style="vertical-align: -0.125em;" alt=""> OpenRouter | `provider: openrouter` | Fully supported |
| <img src="docs/assets/logos/qwen.svg" width="15" style="vertical-align: -0.125em;" alt=""> Qwen | `provider: opencode-go`, `model: qwen*` | Fully supported |
| <img src="docs/assets/logos/vercel.svg" width="15" style="vertical-align: -0.125em;" alt=""> Vercel | `provider: opencode`, `model: vercel/...` | Fully supported |
| <img src="docs/assets/logos/xai.svg" width="15" style="vertical-align: -0.125em;" alt=""> xAI | `provider: xai` | Fully supported |

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
      - uses: actions/checkout@v7
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
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          openrouter-api-key: ${{ secrets.OPENROUTER_API_KEY }}
          nvidia-api-key: ${{ secrets.NVIDIA_API_KEY }}
          zai-api-key: ${{ secrets.ZAI_API_KEY }}
          xai-api-key: ${{ secrets.XAI_API_KEY }}
          grok-auth: ${{ secrets.GROK_AUTH_JSON }}
          fireworks-api-key: ${{ secrets.FIREWORKS_API_KEY }}
          mimo-api-key: ${{ secrets.MIMO_API_KEY }}
          devin-windsurf-api-key: ${{ secrets.DEVIN_WINDSURF_API_KEY }}
          commandcode-access-key: ${{ secrets.COMMANDCODE_ACCESS_KEY }}
          cursor-api-key: ${{ secrets.CURSOR_API_KEY }}
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

## One-off reviews (`/jbot`)

The [full example workflow](examples/jbot-review.yml) (not the minimal version
above) also lets you trigger a one-off review by commenting on a PR — say, a
final sign-off with a stronger model than the auto-review default:

```
/jbot --provider=devin --model=devin/glm-5.2
```

- Both flags are optional. A flag you pass overrides the repo variable
  (`JBOT_REVIEW_PROVIDER` / `JBOT_REVIEW_MODEL`); a flag you omit falls back to
  it. Bare `/jbot` re-runs the review with your configured defaults. The
  command is the first line of the comment: `/jbot` followed only by
  `--provider=<id>` / `--model=<id>` flags. Anything else on that line —
  prose like "/jbot is failing", or an unknown flag — rejects the command
  without spending a review, and lines after the first are ignored.
- `--model` alone switches the model **within the configured provider**. To
  switch providers, pass `--provider` too (as above) — a `provider/` model
  prefix is only stripped when it matches the selected provider, so a foreign
  prefix would be sent to the configured provider verbatim and typically 404.
  The provider you pick must have its API key wired up in the workflow.
- Only comments from users with repo rights (owner, member, or collaborator —
  GitHub counts read-only org members as members) trigger a run — each run
  spends provider credits. jbot reacts 👀 when it accepts the command; the
  review then posts like any auto-review (the 🚀 review-done reaction appears
  only when no jbot findings remain open).
- **Fork PRs are refused by default.** Unlike `pull_request` runs (where
  GitHub strips secrets on fork PRs), a `/jbot` run executes in base-repo
  context: your provider keys and a write-scoped `GITHUB_TOKEN` sit in the
  review container's environment while it reads the fork's code. Delete the
  `Require same-repo PR head` step in the workflow to allow it, and invoke
  only on fork PRs you've inspected.
- One-off and auto reviews share a concurrency group per PR: a `/jbot` run
  cancels an in-flight auto review of that PR and vice versa. Prior findings
  are not re-posted — a one-off with a stronger model only **adds** what the
  auto-runs missed, which is exactly what a sign-off pass should do.
- Prefer a UI? `workflow_dispatch` (Actions → J-Bot Code Review → *Run
  workflow*) takes the same `provider` / `model` overrides plus a `pr-number`.
- Once the `issue_comment` trigger is installed, every comment in the repo
  records a skipped zero-step run in the Actions tab — expected, free, and
  the reason non-command comments can never cancel a running review.

## Inputs

| Input                     | Required | Default               | Description                                                                                |
| ------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `provider`                | No       | `opencode`            | LLM provider (opencode, opencode-go, deepseek, openai, anthropic, google, openrouter, nvidia, zai-coding-plan, xai, xiaomi-token-plan-sgp, fireworks-ai, devin, commandcode, cursor, codex, cline, cline-pass, grok, kilo) |
| `model`                   | No       | Provider default      | Provider model id, optionally prefixed as `provider/model`                                 |
| `opencode-api-key`        | No       | —                     | Used when `provider` or `aux-provider` is `opencode`/`opencode-go`                         |
| `deepseek-api-key`        | No       | —                     | Used when `provider` or `aux-provider` is `deepseek`                                       |
| `openai-api-key`          | No       | —                     | Used when `provider` or `aux-provider` is `openai`                                         |
| `anthropic-api-key`       | No       | —                     | Used when `provider` or `aux-provider` is `anthropic`                                      |
| `gemini-api-key`          | No       | —                     | Used when `provider` or `aux-provider` is `google`                                         |
| `openrouter-api-key`      | No       | —                     | Used when `provider` or `aux-provider` is `openrouter`                                     |
| `nvidia-api-key`          | No       | —                     | Used when `provider` or `aux-provider` is `nvidia`                                         |
| `zai-api-key`             | No       | —                     | Used when `provider` or `aux-provider` is `zai-coding-plan`                                |
| `xai-api-key`             | No       | —                     | Used by `xai`, or by `grok` when `grok-auth` is empty                                      |
| `fireworks-api-key`       | No       | —                     | Used when `provider` or `aux-provider` is `fireworks-ai`                                   |
| `mimo-api-key`            | No       | —                     | Used when `provider` or `aux-provider` is `xiaomi-token-plan-sgp`                          |
| `devin-windsurf-api-key`  | No       | —                     | Used when `provider` or active `aux-provider` is `devin`                                   |
| `commandcode-access-key`  | No       | —                     | Used when `provider` or active `aux-provider` is `commandcode`                             |
| `cursor-api-key`          | No       | —                     | Used when `provider` or active `aux-provider` is `cursor`                                  |
| `codex-auth`              | No       | —                     | Codex CLI auth (contents of `~/.codex/auth.json`); used when `provider` or active `aux-provider` is `codex` |
| `cline-auth`              | No       | —                     | Cline CLI auth (contents of `~/.cline/data/settings/providers.json`); used when `provider` or active `aux-provider` is `cline` / `cline-pass` |
| `grok-auth`               | No       | —                     | Grok account auth (contents of `~/.grok/auth.json`); preferred over `xai-api-key` when `grok` is selected |
| `kilo-auth`               | No       | —                     | Kilo CLI auth (contents of `~/.local/share/kilo/auth.json`); used when `provider` or active `aux-provider` is `kilo` |
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
| `prompt-cache`            | No       | `true`                | Prompt caching for OpenCode-server sessions (`setCacheKey`); cuts input-token cost on models that honor it; models marked unsupported omit the cache key. The default pi engine caches provider-side automatically, so this only affects the OpenCode-server path |
| `skip-doc-only`           | No       | `true`                | Skip the review (no model call) when the PR changes only documentation/diagram assets (`.md`, `.svg`, `.drawio`, `.pdf`, …); the reaction is left unchanged (a docs push does not change the verdict) |
| `max-concurrent-sessions` | No       | `3`                   | Max model sessions in flight (default `3`); `0` = unlimited                                |
| `review-telemetry`        | No       | `true`                | Emit per-finding + per-session telemetry to `.jbot-review/telemetry.jsonl`                 |
| `evidence-quotes`         | No       | `true`                | Ask each finding to carry a verbatim quote of the changed line it flags                    |
| `fail-on-error`           | No       | `true`                | Fail the workflow when review cannot complete                                              |

See [models.dev](https://models.dev/) for the opencode-backed provider model
catalog. Devin, CommandCode, Cursor, and Grok Build models are managed by their CLI accounts.
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
`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `ZAI_API_KEY`,
`FIREWORKS_API_KEY`, or `DEVIN_WINDSURF_API_KEY`. `opencode-go` uses the same
`OPENCODE_API_KEY` as
`opencode`.
Use `provider: devin` with `devin-windsurf-api-key` /
`DEVIN_WINDSURF_API_KEY` for the Devin CLI backend — the secret is the
`windsurf_api_key` value (`devin-session-token$…`) from
`~/.local/share/devin/credentials.toml` after `devin auth login`.
Use `provider: commandcode` with `commandcode-access-key` /
`COMMANDCODE_ACCESS_KEY` for the CommandCode CLI backend — the `apiKey`
value (`user_…`) from `~/.commandcode/auth.json`.
Use `provider: cursor` with `cursor-api-key` / `CURSOR_API_KEY` for the Cursor
CLI backend. It authenticates straight from `CURSOR_API_KEY` and runs read-only
(`cursor-agent --mode plan`).
Use `provider: codex` with `codex-auth` / `CODEX_AUTH_JSON` (the contents of
`~/.codex/auth.json` from a ChatGPT Plus/Pro `codex login`) for the Codex CLI
backend. It runs read-only (`codex exec --sandbox read-only`).
Use `provider: cline` (pay-as-you-go) or `provider: cline-pass` (Cline subscription)
with `cline-auth` / `CLINE_AUTH_JSON` (the contents of
`~/.cline/data/settings/providers.json` from a local `cline auth`) for the Cline CLI
backend. The two billing modes are separate providers sharing the one secret; both run
read-only (`cline --plan --auto-approve false`) and use only the auth token. Set `model`
as `cline/<type>/<model>` (e.g. `cline/deepseek/deepseek-v4-flash`) or
`cline-pass/<model>` (e.g. `cline-pass/glm-5.2`); omit it to use each mode's default.
Use `provider: grok` with `grok-auth` / `GROK_AUTH_JSON` (the contents of
`~/.grok/auth.json` after `grok login --device-auth`) for the Grok Build CLI backend.
If both credentials are supplied, account auth takes precedence over `xai-api-key` /
`XAI_API_KEY`.
Use `provider: kilo` with `kilo-auth` / `KILO_AUTH_CONTENT` (the contents of
`~/.local/share/kilo/auth.json`) for the Kilo CLI backend; it defaults to the free
`kilo/kilo-auto/free` gateway model.
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

If the selected aux provider's normal key input or env var is supplied, jbot
uses it for auxiliary sessions. If it is not supplied, jbot reuses the review
provider's key.
CLI backends cannot reuse opencode-provider keys, and opencode-backed providers
cannot reuse CLI credentials such as `DEVIN_WINDSURF_API_KEY`,
`COMMANDCODE_ACCESS_KEY`, `CURSOR_API_KEY`, or `GROK_AUTH_JSON`, so mixed CLI/opencode-backed
main+aux configurations must pass both keys.

If `model` is prefixed as `provider/model`, that prefix must match the selected
`provider`. If `aux-model` is prefixed as `provider/model`, that prefix must
match the selected `aux-provider` when set, otherwise the selected `provider`.
Bare model ids are resolved against their selected provider.

Migrating from `api-key`: replace the old unified `api-key` input with the
matching provider-specific input, such as `opencode-api-key` for
`provider: opencode`. The unified input is not read by current `v0` builds.

## FAQ

**Can I use my ChatGPT Plus/Pro, Cursor, or other CLI account for code review?**
Yes — that's the point. Codex (via a ChatGPT Plus/Pro `codex login`), Cursor,
Devin, Cline, Grok Build, Kilo, and Command Code accounts all work as review backends. Claude
runs through your own Anthropic API key or an OpenCode gateway instead — a
Claude Pro/Max seat is not a supported CI credential today. Per-CLI setup:
[pgupai.com/guides](https://www.pgupai.com/guides).

**Does my code get uploaded to a third-party service?**
There is no hosted reviewer in the loop, and the checkout never leaves your
GitHub Actions runner. What does leave is the diff, plus whatever context the
reviewing agent requests — sent only to the model provider you configured, on
your own key or seat.

**What does it cost?**
The action is MIT-licensed and adds no per-seat or per-review charge. You pay
only the model you bring — $0 with OpenCode Zen free models or a CLI seat you
already pay for — plus normal CI minutes.

**Can the action modify my code?**
No. The checkout is read-only, and nothing in the example workflows can push
code: they request `contents: read`, plus `pull-requests: write` (review
comments), `issues: write` (PR reactions), and `checks: read`. On
`pull_request` events GitHub strips secrets from fork PRs.

**What runs the review under the hood?**
For model-key providers the reviewing agent runs in-process through the
[pi](https://pi.dev/) SDK; coding-CLI backends (Codex, Cursor, Devin, Cline,
Grok Build, Kilo, Command Code) run their own CLI. Either way your checkout stays
read-only — pi sessions get no shell at all — and the review footer names the
engine that ran each session (e.g. `via pi`). It's chosen automatically from
your `provider`; there's nothing to configure.

**How is this different from hosted reviewers like CodeRabbit or Greptile?**
Hosted reviewers run your code through their own servers and charge per seat;
this is an open action in your CI with any model, at $0/seat. It also reads
existing `.coderabbit.yaml` and `greptile.json` rule files, so switching keeps
your house rules. Side-by-side comparisons:
[CodeRabbit](https://www.pgupai.com/compare/coderabbit-alternative) ·
[Greptile](https://www.pgupai.com/compare/greptile-alternative) ·
[Qodo](https://www.pgupai.com/compare/qodo-alternative) ·
[Cubic](https://www.pgupai.com/compare/cubic-alternative)

## Versioning

This project is in beta. Tags follow [SemVer](https://semver.org/): pinned to
`v0.1.0` for now. While in `0.x.y`, breaking changes may ship on any minor
bump. The first `v1.0.0` will mark API stability.

Pin to a specific tag for reproducibility. To track the latest beta:

```yaml
- uses: pgup-ai/jbot-review-action@v0
  # equivalent to the latest v0.x.y release
```

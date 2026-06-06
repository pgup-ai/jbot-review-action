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
      - uses: jingbof/jbot-review-action@v1
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

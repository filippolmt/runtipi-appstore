BUN_IMAGE ?= oven/bun:1.2.2
DOCKER_RUN := docker run --rm -v $(PWD):/app -w /app

.PHONY: test
test:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun test && bun run scripts/validate-json.js"

.PHONY: readme
readme:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun .github/scripts/readme-generator.ts"

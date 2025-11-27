BUN_IMAGE ?= oven/bun:1.2.2
DOCKER_RUN := docker run --rm -v $(PWD):/app -w /app
RENOVATE_IMAGE ?= renovate/renovate:latest
RENOVATE_LOG_LEVEL ?= debug
.PHONY: test renovate-test readme bun-shell

test:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun run lint && bun test && bun run scripts/validate-json.js"

readme:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun .github/scripts/readme-generator.ts"

renovate-test:
	docker run --rm \
  	-u "0:0" \
  	-e LOG_LEVEL=$(RENOVATE_LOG_LEVEL) \
  	-v "$(PWD)":/tmp/app \
  	--entrypoint bash \
  	$(RENOVATE_IMAGE) -lc "set -eo pipefail; cp -a /tmp/app /usr/src; cd /usr/src/app; jq 'del(.extends)' /tmp/app/renovate.json >/usr/src/app/renovate.json; renovate --platform=local --dry-run"

bun-shell:
	docker run --rm -it -v $(PWD):/app -w /app $(BUN_IMAGE) bash

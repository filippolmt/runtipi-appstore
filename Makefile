BUN_IMAGE ?= oven/bun:1.3.14
DOCKER_RUN := docker run --rm -v $(PWD):/app -w /app
RENOVATE_IMAGE ?= renovate/renovate:latest
RENOVATE_LOG_LEVEL ?= debug
.PHONY: test ci renovate-test readme bun-shell

test:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun run lint && bun test"

ci:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun run lint:ci && bun test"

readme:
	$(DOCKER_RUN) $(BUN_IMAGE) sh -lc "bun install --ignore-scripts && bun .github/scripts/readme-generator.ts"

# Pass DOCKERHUB_USERNAME/DOCKERHUB_TOKEN so config.js authenticates Docker Hub
# lookups (otherwise the dry-run aborts on 429 rate limits before the update
# phase) and GITHUB_COM_TOKEN for github-tags/release-notes lookups.
# extends is kept: config:recommended and :dependencyDashboard are internal
# presets, resolved offline — local run matches production config.
renovate-test:
	docker run --rm \
  	-u "0:0" \
  	-e LOG_LEVEL=$(RENOVATE_LOG_LEVEL) \
  	-e DOCKERHUB_USERNAME \
  	-e DOCKERHUB_TOKEN \
  	-e GITHUB_COM_TOKEN \
  	-v "$(PWD)":/tmp/app \
  	--entrypoint bash \
  	$(RENOVATE_IMAGE) -lc "set -eo pipefail; cp -a /tmp/app /usr/src; cd /usr/src/app; renovate --platform=local --dry-run=full"

bun-shell:
	docker run --rm -it -v $(PWD):/app -w /app $(BUN_IMAGE) bash

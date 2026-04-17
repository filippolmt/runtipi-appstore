---
name: versions-renovate
description: Use when configuring Renovate for dependency automation — custom regex managers, packageRules, registryAliases, hostRules, versioning patterns, grouping PRs. Triggers on renovate.json edits, dependency update automation, Docker image tracking, git-refs commit pinning, or Helm values.yaml.tpl image detection.
---

# Renovate Configuration

## Overview

Renovate automates dependency updates by creating PRs. This skill covers custom regex managers, packageRules, versioning, and authentication for non-standard file formats (JSON manifests, Helm templates, Dockerfiles with proxies).

## Quick Reference

| Field | Purpose | Example |
|-------|---------|---------|
| `managerFilePatterns` | Files to scan (regex) | `["/^config/deps\\.json$/"]` |
| `matchStrings` | Regex with named capture groups | `"(?<depName>.*?)"` |
| `datasourceTemplate` | Where to check versions | `"git-refs"`, `"docker"` |
| `packageNameTemplate` | Full package URL | `"https://github.com/{{{depName}}}"` |
| `currentValueTemplate` | Branch/version to track | `"{{{branchName}}}"` |
| `depNameTemplate` | Override depName | `"{{{depName}}}"` |
| `registryAliases` | Map proxy to real registry | proxy to `"registry-1.docker.io"` |
| `allowedVersions` | Constrain branch/version | `"main"` (plain string for git-refs) |
| `groupName` | Group updates into one PR | `"Dependencies update"` |
| `prPriority` | Higher = processed first | `10` |
| `matchDepNames` | Match by depName (supports regex `/pattern/`) | `["/my-org/.*/"]` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `fileMatch` | Use `managerFilePatterns` (fileMatch is deprecated) |
| `registryAliases` target `docker.io` | Use `registry-1.docker.io` |
| `matchPackageNames` for regex custom managers | Use `matchDepNames` — custom managers set `depName` |
| `${ENV_VAR}` in renovate.json | Env vars don't interpolate in JSON config. Use `hostRules` in JS config or set via `RENOVATE_HOST_RULES` env var |
| `allowedVersions: "/^main$/"` for git-refs | Plain string `"main"` works — no regex needed |
| Missing `currentValueTemplate` | Required for git-refs to know which branch to track |
| `registryUrlTemplate` with git-refs | Not needed when `packageNameTemplate` contains full URL |

## Custom Regex Manager Patterns

### Required Capture Groups

Every regex manager needs:
- `currentValue` OR `currentValueTemplate` — the version/branch
- `depName` OR `depNameTemplate` — the package identifier
- `datasource` OR `datasourceTemplate` — where to look up versions

For digest tracking (git commits): also capture `currentDigest`.

### Git Refs (commit pinning from JSON manifest)

Track latest commits on a branch for repos in a custom JSON file:

```json
{
  "customType": "regex",
  "managerFilePatterns": ["/^config/deps\\.json$/"],
  "matchStrings": [
    "\"repo\":\\s*\"(?<depName>.*?)\",[\\s\\S]*?\"branch\":\\s*\"(?<branchName>.*?)\",[\\s\\S]*?\"commit\":\\s*\"(?<currentDigest>.*?)\""
  ],
  "currentValueTemplate": "{{{branchName}}}",
  "depNameTemplate": "{{{depName}}}",
  "packageNameTemplate": "https://github.com/{{{depName}}}",
  "datasourceTemplate": "git-refs"
}
```

Key: `[\\s\\S]*?` matches across lines in JSON. `currentDigest` captures the commit SHA.

### Docker Images (version in separate config file)

Track Docker image versions defined in a JSON config (e.g., `config.json` with a `"version"` field):

```json
{
  "customType": "regex",
  "managerFilePatterns": ["/apps/my-app/config\\.json$/"],
  "matchStrings": ["\"version\":\\s*\"(?<currentValue>[^\"]+)\""],
  "depNameTemplate": "docker-image-name",
  "datasourceTemplate": "docker"
}
```

### Docker Images in Helm values.yaml.tpl

Detect multi-line `image.repository` + `image.tag` in YAML templates:

```json
{
  "customType": "regex",
  "managerFilePatterns": ["/kubernetes/helm/.*/values\\.yaml\\.tpl$/"],
  "matchStrings": [
    "image:\\s*\\n\\s*repository:\\s*(?<depName>[^\\n]+)\\s*\\n\\s*tag:\\s*(?<currentValue>[^\\n]+)"
  ],
  "datasourceTemplate": "docker"
}
```

### Docker Images with Digest Pinning

Track Docker images with optional `@sha256:` digest:

```json
{
  "customType": "regex",
  "matchStrings": [
    "\"image\":\\s*\"(?<depName>[^:@\"]+):(?<currentValue>[^@\"]+)(?:@(?<currentDigest>[^\"]+))?\""
  ],
  "datasourceTemplate": "docker"
}
```

### Self-hosted Git Repos (GitLab, Gitea, etc.)

Same as GitHub pattern but with custom host URL:

```json
{
  "packageNameTemplate": "https://gitlab.example.com/{{{depName}}}.git",
  "datasourceTemplate": "git-refs"
}
```

Note: `.git` suffix may be required for GitLab repos.

## Registry Aliases

Map proxy registries to their upstream so Renovate checks the correct source:

```json
{
  "registryAliases": {
    "my-registry-proxy.example.com/docker-hub": "registry-1.docker.io"
  }
}
```

Target MUST be `registry-1.docker.io` (not `docker.io` or `hub.docker.com`).

## Package Rules

### Grouping & Priority

```json
{
  "packageRules": [
    {
      "matchDatasources": ["git-refs"],
      "matchDepNames": ["!/internal-org/.*/"],
      "groupName": "Community module updates",
      "prPriority": 5,
      "allowedVersions": "main"
    }
  ]
}
```

- `matchDepNames` supports exact strings, globs, and regex (`/pattern/`)
- Negate with `!` prefix: `"!/internal-org/.*/"` excludes matches
- `prPriority`: higher value = created first (default 0)

### Custom Versioning (regex)

For non-semver tags like `2.0-20250101` (major.minor-date):

```json
{
  "matchDatasources": ["docker"],
  "matchDepNames": ["**/my-app"],
  "versioning": "regex:^(?<major>\\d+)\\.(?<minor>\\d+)-(?<patch>\\d+)$",
  "groupName": "My app image"
}
```

Groups: `major`=2, `minor`=0, `patch`=20250101. Renovate only proposes updates within same major.minor.

### Disable for Specific Packages

```json
{
  "matchDatasources": ["docker"],
  "matchDepNames": ["postgres", "mysql", "redis"],
  "enabled": false
}
```

### Disable Digest Pinning for Docker

```json
{
  "matchCategories": ["docker"],
  "pinDigests": false
}
```

### Auto-merge Minor/Patch

```json
{
  "matchUpdateTypes": ["minor", "patch"],
  "automerge": true,
  "automergeType": "pr",
  "labels": ["automerge"]
}
```

### Separate Minor/Patch (for gradual upgrades)

```json
{
  "matchDepNames": ["some-critical-dep"],
  "separateMinorPatch": true,
  "separateMultipleMinor": true
}
```

## Authentication (hostRules)

### Self-hosted registries — via environment variable

Set `RENOVATE_HOST_RULES` as a CI/CD variable:

```bash
RENOVATE_HOST_RULES='[{"matchHost":"git.example.com","hostType":"gitlab","token":"glpat-xxx"}]'
```

In CI, reference the variable:
```bash
export RENOVATE_HOST_RULES="[{\"matchHost\":\"git.example.com\",\"hostType\":\"gitlab\",\"token\":\"${GIT_TOKEN}\"}]"
```

### In JS config file (self-hosted)

```javascript
module.exports = {
  hostRules: [
    {
      matchHost: 'git.example.com',
      hostType: 'gitlab',
      token: process.env.GIT_TOKEN,
    },
  ],
};
```

**Never put tokens in renovate.json** — use env vars or JS config.

### Docker Registry Authentication

```bash
RENOVATE_HOST_RULES='[{"matchHost":"registry.example.com","hostType":"docker","username":"user","password":"token"}]'
```

## Shared Config (extends)

Inherit from a shared config in another repo:

```json
{
  "extends": ["local>my-org/renovate-config/base"]
}
```

`local>` = same platform (GitLab/GitHub). The target repo must contain `renovate.json` or a preset.

## Local Testing

Run Renovate locally with dry-run to validate config:

```bash
docker run --rm \
  -v $(pwd):/app \
  -e RENOVATE_TOKEN="$TOKEN" \
  -e LOG_LEVEL=debug \
  renovate/renovate --platform=local --dry-run=full
```

Check logs for `"manager"` and `"matchStrings"` to verify regex matches.

## Context7 Docs

For latest Renovate docs, use context7 MCP:
```
resolve-library-id: "renovatebot/renovate"
library-id: /renovatebot/renovate  (source code)
library-id: /websites/renovatebot  (official docs site)
```
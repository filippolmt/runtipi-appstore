SonarQube Community Build is a self-hosted platform for continuous inspection of code quality and security. It detects bugs, vulnerabilities and code smells across many programming languages and integrates with your CI pipeline.

This app ships the [`mc1arke/sonarqube-with-community-branch-plugin`](https://github.com/mc1arke/sonarqube-community-branch-plugin) image, which bundles the Community Branch Plugin on top of the official SonarQube Community Build. This unlocks **branch and pull-request analysis** — features otherwise reserved for the commercial editions. The image version is kept in lockstep with the plugin, so SonarQube and the plugin are always compatible.

## Features

- **Branch & PR Analysis**: Analyze feature branches and pull requests (via the Community Branch Plugin)
- **Multi-language Analysis**: Static analysis for 30+ languages (Java, JavaScript, TypeScript, Python, Go, C#, PHP, and more)
- **Bugs & Vulnerabilities**: Detects reliability bugs, security vulnerabilities and security hotspots
- **Code Smells**: Highlights maintainability issues and technical debt
- **Quality Gates**: Enforce quality thresholds that fail the build when not met
- **Web Dashboard**: Rich UI with project overviews, trends and drill-down
- **CI/CD Integration**: Works with the SonarScanner for Maven, Gradle, .NET, npm and CLI
- **PostgreSQL Backed**: Persistent storage via a bundled PostgreSQL database

## Use Cases

- Continuous code quality inspection in CI pipelines
- Security review and vulnerability detection
- Tracking and reducing technical debt over time
- Enforcing team coding standards via quality gates

## Requirements

SonarQube embeds Elasticsearch, which requires the host kernel setting
`vm.max_map_count` to be at least `524288`. This is a **non-namespaced** kernel
parameter and cannot be set from the container — it must be configured on the
host **before** starting the app, otherwise SonarQube will fail to boot.

```bash
# apply now
sudo sysctl -w vm.max_map_count=524288
# persist across reboots
echo "vm.max_map_count=524288" | sudo tee -a /etc/sysctl.conf
```

The default login is `admin` / `admin`; you will be prompted to change the
password on first sign-in.

> Note: the `extensions` directory is not persisted, so the bundled branch
> plugin always stays intact. Additional marketplace plugins installed at
> runtime will not survive a container recreation — install them at image
> level if you need them permanently.

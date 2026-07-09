# Forgejo Beyond coding. We forge. 

Hi there! Tired of big platforms playing monopoly? Providing Git hosting for your project, friends, company or community? Forgejo (/for'd͡ʒe.jo/ inspired by forĝejo – the Esperanto word for forge) has you covered with its intuitive interface, light and easy hosting and a lot of builtin functionality.

Forgejo was [created in 2022](https://forgejo.org/2022-12-15-hello-forgejo/) because we think that the project should be owned by an independent community. If you second that, then Forgejo is for you! Our promise: Independent Free/Libre Software forever!

## Built-in CI/CD with Forgejo Actions

This package ships **Forgejo Actions enabled out of the box** together with a self-hosted **Actions runner** — the Free Software equivalent of GitHub Actions. No manual setup is required:

- A dedicated **Docker-in-Docker** sidecar executes your CI jobs in isolation from the host.
- The runner **auto-registers on first boot** as a global runner named `tipi-runner`, using an auto-generated shared secret (`FORGEJO_RUNNER_SECRET`). You never have to copy a registration token from the admin UI.
- Add a workflow under `.forgejo/workflows/` in any repository with `runs-on: docker` and it will be picked up automatically.

You can verify the runner is connected under **Site Administration → Actions → Runners**.

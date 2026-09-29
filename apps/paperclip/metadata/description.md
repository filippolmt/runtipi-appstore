## Paperclip

Paperclip is an open-source control plane for coordinating teams of AI agents. It combines task management, organizational structure, budgets, governance, scheduled heartbeats, persistent workspaces, and audit logs in one dashboard.

## First Run

Open Paperclip after installation, create an account, and select **Claim this instance** to become the first administrator. You can then create a company and configure agents from the dashboard.

Anthropic and OpenAI API keys are optional during installation and can also be configured later. Without a provider credential, the dashboard works but local AI agents cannot run.

## Storage and Agent Workspaces

The embedded database, uploads, secrets, and agent workspaces are persisted in the Runtipi app data directory. Agents run inside the Paperclip container; repositories on the Runtipi host are not automatically visible and should be cloned into a Paperclip workspace.

## Security

Paperclip authentication is enabled. This Runtipi package intentionally disables public exposure because Paperclip's private deployment mode allows the first signed-in browser user to claim administrator access. Complete setup on a trusted network and review agent permissions carefully because agents can execute commands and modify workspace files.

Anonymous usage telemetry is disabled by default in this Runtipi package.

## Links

- [Website](https://paperclip.ing/)
- [Documentation](https://docs.paperclip.ing/)
- [Source code](https://github.com/paperclipai/paperclip)

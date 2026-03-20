# Agent Skill Installer

This project is a CLI tool for the Agent platform. It allows users to browse and install skills on various AI agents using a beautiful interactive Terminal UI.

![Skill Installer TUI](cli-usage.png)

## Features
- **Multi-Agent Support**: Automatically detects installed AI agents (e.g., Google Antigravity, Gemini CLI, Claude Code).
- **Interactive TUI Picker**: Beautiful interface to select multiple skills to install or upgrade at once.
- **Configuration-Driven Fetching**: Scans deterministic Git paths (like `anthropics/skills/skills` and `garrytan/gstack/.agents/skills`) via the GitHub API to list available skills.
- **Smart Installation**: Clones new skills or intelligently upgrades (`git pull`) already installed ones straight into your local agent environment.
- **Installed Status**: Visually indicates which skills are already installed.

# Usage

`skill-installer start` # Start the skill installer

## Setup & Running Locally

1. Install dependencies:
   ```sh
   npm install
   ```
2. Build the project:
   ```sh
   npm run build
   ```
3. Run the installer:
   ```sh
   npm start
   # or
   node dist/index.js start
   ```

To install the CLI globally on your system for testing:
```sh
npm link
skill-installer start
```

## Supported Target Agents

- [x] Gemini CLI (`~/.gemini/skills/`) - [Documentation](https://geminicli.com/docs/cli/skills/)
- [x] Google Antigravity (`~/.gemini/antigravity/skills/`)
- [x] Claude Code (`~/.claude/skills/`) - [Documentation](https://code.claude.com/docs/en/skills)
- [x] OpenAI Codex (`~/.agents/skills/`) - [Documentation](https://developers.openai.com/codex/skills)

## Skill Repositories Supported

- `anthropics/skills` (`skills/`)
- `garrytan/gstack` (`.agents/skills/`)
- `openai/skills` (`skills/.curated/`)
- Future custom skills support planned!
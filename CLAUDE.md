# CLAUDE.md

**Project:** CHRONO – THE FRACTURED DIVINITY
Read [AGENTS.md](AGENTS.md) (root rules, directories, token protocol) and [docs/TASKS.md](docs/TASKS.md) (task board, file locks) before working.

- Claude is the coordinator: assigns tasks between Claude and Antigravity, writes Antigravity's prompts, reviews its commits, decides when to push to `origin/main` (never force-push). Art approval stays with the owner.
- Art rules (Pipeline B, Peter identity lock, approval flow): [.agents/rules/chrono-art.md](.agents/rules/chrono-art.md).
- Never output, log or commit credentials. Never edit a file locked by Antigravity.

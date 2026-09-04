# Obsidian project skills

Drop-in skills for Claude Code sessions working on this repo. Copy the whole
`.claude/skills/` folder to the repo root and commit it — both parallel
sessions pick them up automatically.

| Skill | Triggers on |
|---|---|
| `obsidian-stack` | Any framework/library API call — forces reading `node_modules` docs |
| `obsidian-prisma` | Schema edits, migrations, queries, client imports |
| `obsidian-api-routes` | Anything in `src/app/api/` or `src/actions/` |
| `obsidian-rag` | Qdrant, embeddings, chunking, document deletion |
| `obsidian-ui` | Components, dialogs, panels, loading/error states |
| `obsidian-verify` | End of every phase, before any "it works" claim |
| `obsidian-parallel` | Two-session coordination, ownership, merges |
| `obsidian-formats` | Adding or fixing a document source format |

Install:

```bash
cp -r .claude/skills /path/to/Obsidian/.claude/
cd /path/to/Obsidian && git add .claude && git commit -m "chore: add project skills"
```

Verify a session sees them by asking it to list its available skills before
you paste the phase prompt.

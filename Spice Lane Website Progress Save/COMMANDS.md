# COMMANDS (numbered; working dir = repo root unless noted; app dir = "Spice Lane Website Progress Save/")

### 1. Configure git (session #3)
$ git config --global user.name/email/pull.rebase/credential.helper store ; write ~/.git-credentials
Result: SUCCESS — Configured git credentials (token hidden)

### 2. Clone
$ git clone https://github.com/nomanrafi/Spice-Lane-Website.git project
Result: SUCCESS — 7 commits, assets/ has 8 GLBs (16–20 MB each)

### 3. Create scripts/checkpoint.sh + scripts/autopush.sh (copied from AI_AGENT_INSTRUCTIONS.md §8)
Result: SUCCESS — paths adapted: autopush cd's into the progress folder; checkpoint's "recent files" find prunes */node_modules, */.next, */scripts/logs

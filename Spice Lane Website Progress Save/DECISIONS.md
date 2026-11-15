# DECISIONS

### 1. Where everything lives
Decision: ALL agent work (Next.js app, logs, scripts, outputs) lives inside `Spice Lane Website Progress Save/`.
Why: user's explicit instruction in chat ("Save agents all progress in just 'Spice Lane Website Progress Save' folder").
The original GLBs stay in repo-root `assets/` (read-only input); optimized copies go to `Spice Lane Website Progress Save/public/models/`.

### 2. Menu = our 8 GLBs, not sushi
Decision: Seed menu.ts with the 8 Spice Lane dishes in `/assets` (wagyu, fondant, ribeye, lamb, lobster, salmon roll, tuna tataki, spaghetti), mapped to the 5 price tiers / ring colors of the reference.
Why: build prompt says "adjust to my GLB files"; never invent filenames.

### 3. Push cadence
Decision: push after every small micro-task.
Why: user said in chat (Bengali) "Aktu fast push korba choto choto task korei" = push quickly after each small task.

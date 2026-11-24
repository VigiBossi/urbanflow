# DB Trainer — CAI 105 Database Systems

A free web app to **learn the whole Database Systems course and train for the exam**, made for a class: every classmate signs up with just a name and gets their own progress.

**What's inside**

| | |
|---|---|
| 4 modules, 18 lessons | ER model (Chen) · ERD → relational schema (Metro Bus case study) · Relational algebra + SQL · Functional dependencies & normalization |
| Every lesson | 1) intuition → 2) rules → 3) worked example step by step → 4) a very similar exercise → 5) harder exercises, one twist at a time → 6) a 5-question quiz with explanations |
| 73 exercises | hints first; the solution appears after 2 wrong tries or on "Show solution" |
| ERD builder | forms (or a text format) → Chen-style SVG with draggable shapes; checked against the model answer, wrong parts in red |
| Schema checker | type `DOCTOR(DoctorID PK, FirstName, DeptID FK->DEPARTMENT)`; order, capitals and small naming differences are ignored |
| RA & SQL | your relational algebra **and** your SQL (sql.js) run on a built-in sample database; your result is shown next to the expected one |
| Normalization tool | closures, candidate keys, minimal cover, highest normal form, 3NF synthesis, BCNF decomposition, chase test — every step shown |
| Exam mode | 90-minute mock exams (2 papers): scenario → ERD, ERD → schema + explanation, queries, normalization. No hints; score + breakdown |
| Weak-point tracker | mistakes are filed by category ("forgot weak entity key", "FK on wrong side in 1:1", …) + "practise my weak spots" |
| Flashcards | 66 cards (definitions + Chen symbols) with spaced repetition |
| Review sheets | one printable page per module |
| Leaderboard | lessons completed, best exam, streak — opt-out in Settings |
| "How the DB works" | this app's own ERD, relational schema and SQL, as one more study example |

Everything is static HTML/CSS/JavaScript — **no build step**. Data is saved in **Supabase** (free). Hosting is on **Vercel** (free).

---

## Project files

```
db-trainer/
├── index.html          the single page
├── config.js           ⬅ YOUR Supabase URL + anon key go here (the only file you must edit)
├── supabase.sql        paste into the Supabase SQL editor (tables, security, leaderboard view)
├── css/styles.css
├── js/
│   ├── store.js        name-only accounts, progress, offline queue, sync with Supabase
│   ├── ra.js           relational algebra parser + evaluator
│   ├── fd.js           functional dependency / normalization engine
│   ├── erd.js          ERD text format, Chen SVG renderer, ERD checker
│   ├── schema.js       relational schema parser + checker
│   ├── sampledb.js     the sample database (COMPANY + METRO BUS)
│   ├── util.js         name matching helpers
│   ├── widgets.js      exercise widgets, ERD builder, quiz
│   └── app.js          pages and navigation
├── content/            ⬅ ALL lessons, exercises, quizzes, flashcards and exams
│   ├── common.js       weak-spot categories + accepted name synonyms
│   ├── m1.js … m4.js   one file per module
│   └── extras.js       flashcards + mock exams
├── tests/              optional checks you can run with Node.js
└── vercel.json
```

Without Supabase settings the app still works in **local demo mode** (everything stays in your browser) — handy for trying it out.

---

## Step 1 — Create the free Supabase database (≈ 5 minutes)

1. Go to **https://supabase.com** → **Start your project** → sign in (GitHub or email).
2. Click **New project**. Choose any name (e.g. `db-trainer`), type a database password (save it somewhere, you won't need it in the app), pick the region closest to you, keep the **Free** plan → **Create new project**. Wait until it says the project is ready (1–2 minutes).
3. In the left menu open **SQL Editor** → **New query**.
4. Open the file `supabase.sql` from this project, copy **all** of it, paste it into the editor, and click **Run**. You should see "Success. No rows returned".
5. Check: left menu → **Table Editor**. You should see `users`, `progress`, `mistakes`, `exam_results`, `flashcards`.
6. Get your keys: click **Connect** at the top (or **Project Settings → API Keys**).
   - Copy the **Project URL** (looks like `https://abcdefghijkl.supabase.co`).
   - Copy the **anon public** key (a long text starting with `eyJ…`). In newer dashboards it is under the **"Legacy API keys"** tab. (A newer `sb_publishable_…` key may also work; if you get errors, use the legacy anon key.)
   - ⚠ Never use the **service_role** / secret key in the app.

## Step 2 — Put the keys into `config.js`

Open `config.js` and replace the two placeholders:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://abcdefghijkl.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
  ...
};
```

The anon key is **meant to be public** — what people can do with it is limited by the Row Level Security rules in `supabase.sql`.

*(Optional) Try it on your computer first:* open a terminal in the `db-trainer` folder and run `python3 -m http.server 8000` (or `npx serve`), then open http://localhost:8000. (Opening `index.html` by double-clicking also works, except the "How the DB works" page can't load the SQL file.)

## Step 3 — Publish it for free on Vercel

You get a public link like **https://my-db-trainer.vercel.app**. Pick **one** of the two ways.

### Way A — with GitHub (no terminal needed, recommended)

1. Create a free account at **https://github.com** if you don't have one.
2. Click **+** (top right) → **New repository** → name it `db-trainer` → **Public** or **Private** → **Create repository**.
3. On the new repository page click **uploading an existing file**. Drag in **the contents** of the `db-trainer` folder (`index.html`, `config.js`, `supabase.sql`, `vercel.json`, and the folders `css`, `js`, `content`, `tests`) → **Commit changes**.
   *(If you keep the app inside a bigger repository instead — like now, in the `db-trainer/` subfolder — that's fine too; see step 6.)*
4. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub** (Hobby plan = free).
5. Click **Add New… → Project** → find your repository → **Import**.
6. Settings on the import screen:
   - **Framework Preset:** `Other`
   - **Root Directory:** leave `./` if the files are at the top of the repository; if the app is in a subfolder, click **Edit** and choose `db-trainer`.
   - Build and output settings: leave everything **empty/default** (there is no build step).
   - **Project Name:** `my-db-trainer` (this becomes the address).
7. Click **Deploy**. After ~20 seconds you get **https://my-db-trainer.vercel.app** (if the name is taken, Vercel adds letters; you can change it later in **Settings → Domains**).
8. Every time you change a file on GitHub, Vercel publishes the new version automatically.

### Way B — with the Vercel command line

```bash
npm install -g vercel
```

```bash
cd db-trainer
```

```bash
vercel
```

Answer the questions: log in, "Set up and deploy?" → **Y**, "Link to existing project?" → **N**, project name → `my-db-trainer`, directory → `./`, "Modify settings?" → **N**. Then publish the production link:

```bash
vercel --prod
```

## Step 4 — Test it (2 users, separate progress)

1. Open your link. Type a name, e.g. **Test Anna** → **Sign up**.
2. Open Lesson 1, answer an exercise and submit the quiz. The chip at the top right should say **✓ Saved**.
3. In Supabase → **Table Editor → progress** you should now see rows with Anna's `user_id`.
4. Open the link in a **private/incognito window** (or another browser/phone). Sign up as **Test Ben**. Ben's home page must show **0** progress — Anna's answers are not there.
5. In the Ben window, try to sign up again as **test anna** → you must see *"This name is already used, try another"* and a button to log in instead.
6. Back in Anna's window, click **Switch user** → log in as **Test Anna** → her progress is still there. Log in as Anna on a phone → progress is there too (it comes from the database).
7. Offline test (optional): Chrome → DevTools (F12) → **Network** → **Offline**, answer an exercise → chip shows **Offline — 1 change waiting**; switch back to **No throttling** → it syncs and shows **✓ Saved**.
8. Open **Leaderboard** — both names appear. In **Settings** untick "Show me on the class leaderboard" → the name disappears for everybody.
9. Delete the test users afterwards: Supabase → **Table Editor → users** → select the rows → delete (their progress is removed automatically thanks to `ON DELETE CASCADE`).

## Step 5 — Share

Send your classmates the link. They type their name, click **Sign up**, and start. The app remembers them on their device; **Switch user** lets several people share one computer.

> **About name-only login:** there is no password, so anyone who types your name can open your progress. That's fine for a study app — don't store anything private.

> **Free-tier note:** Supabase pauses free projects after about a week with no activity. If the app suddenly shows "Sync problem", open the Supabase dashboard and click **Restore project**. Progress saved while it was paused waits in each browser and is uploaded later.

---

## Adding more content

All content lives in `content/`. Add an object to the right array and reload — no build step. Each module is `CONTENT.modules.push({ id, title, short, icon, description, lessons: [...], review: {...} })`. A lesson:

```js
{ id: 'm2l5', title: 'My new lesson', minutes: 15,
  intuition: `<p>plain words…</p>`,
  formal: `<ul><li>rules… {{sym:weak}} inserts a Chen symbol</li></ul>`,
  worked: { problem: `…`, steps: [`step 1`, `step 2`], erd: 'ENTITY …' /* or ra:'…', sql:'…' or fd:'R(A,B)\nA->B' */ },
  exercises: [ /* first = very similar, then harder */ ],
  quiz: [ /* exactly 5 questions */ ] }
```

Exercise types (every exercise has `id`, `type`, `level`, `prompt`, `hints: []`, `solution`, `tags: []` — tags are categories from `content/common.js`):

| type | extra fields | how it is checked |
|---|---|---|
| `mcq` | `options: [...]`, `answer: index` | exact |
| `text` | `keywords: [['a','b'], ['c']]`, `sample` | every group needs at least one word (or `exact: [...]`) |
| `erd` | `model:` ERD text (or an array of acceptable models), `aliases: {Name: ['Synonym']}` | ERD checker |
| `schema` | `model:` tables text (or array), `erd:` given ERD, `notes: {kinds, composite, derived, multivalued}` | schema checker |
| `query` | `ra:` model RA, `sql:` model SQL | both run on the sample DB; results compared |
| `fd` | `problem: 'R(A,B,C)\nA->B'`, `ask: closure|keys|prime|nf|cover|decomp3nf|decompbcnf`, `of` (for closure) | answer computed by the engine |

ERD text format: `ENTITY NAME: *Key, Composite(Part1, Part2), [Multivalued], /Derived` · `WEAK NAME: ~PartialKey, …` · `REL NAME: A 1, B N total | RelAttr` · `IDREL NAME: OWNER 1, WEAK N total` (`?` instead of `total` = participation not graded).

Mock exams and flashcards are in `content/extras.js`; sample-database tables in `js/sampledb.js` (new tables are automatically available in RA and SQL).

**Check your content** (needs Node.js):

```bash
cd db-trainer && npm install --no-save sql.js@1.10.3 && node tests/content.test.js
```

It runs every model RA expression and compares it with the model SQL, parses every ERD/schema/FD answer, and checks every exercise has hints and a solution.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Orange "Local demo mode" banner | `config.js` still has the placeholders, or the supabase-js script could not load. |
| "Sync problem: new row violates row-level security policy" | Run `supabase.sql` again (all of it). |
| "permission denied for table …" | The `grant` lines didn't run — run `supabase.sql` again. |
| Login says "offline" but internet works | Check the URL in `config.js` (must start with `https://` and end with `.supabase.co`) and that the project isn't paused. |
| Leaderboard empty | Nobody has opted in yet / view missing → run `supabase.sql` again. |
| SQL exercises say "Could not load the SQL engine" | The browser could not reach `cdnjs.cloudflare.com` (school network filter?). RA exercises still work. |

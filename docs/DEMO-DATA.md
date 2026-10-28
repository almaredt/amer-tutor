# Amer Tutor sample accounts (opt-in only)

The sample seed creates **6 teachers, 3 parents and 6 students** in the configured SQLite database, with parent–child and teacher–student links. Teachers have approved demo profiles, point rates and recurring weekly availability. Parents start with 500 non-redeemable demo points.

## Run locally

```bash
git switch chatgptv1
git pull origin chatgptv1
npm ci
npm run seed-demo
npm start
```

**Important:** The seed does not run on app startup. It writes to the SQLite database configured by `DB_PATH` in `.env` (default `data/tutor.db`). Use a local/test database. Do **not** run against production without explicit approval.

The first run prints a **unique random password for each new account**. Copy the credentials immediately into a private password manager. Passwords are stored as hashes only. Subsequent runs keep existing users, passwords, profiles, and availability unchanged, and do not create duplicates. To reset a forgotten demo password, use an admin-controlled reset workflow; the seed will not reveal existing passwords.

Accounts:
- Teachers: `demo.teacher.aisyah`, `demo.teacher.daniel`, `demo.teacher.kavitha`, `demo.teacher.jason`, `demo.teacher.farah`, `demo.teacher.amir`
- Parents: `demo.parent.sara`, `demo.parent.omar`, `demo.parent.lina`
- Students: `demo.student.amer`, `demo.student.ali`, `demo.student.noor`, `demo.student.adam`, `demo.student.maya`, `demo.student.leo`

The sample tutor images are externally served from `i.pravatar.cc`, so the browser needs internet access to load them. They are **illustrative sample portraits, not identity-verified photos**. Demo teacher cards are marked DEMO. Never present them as real instructors, display fabricated ratings, or accept actual payments for them.

To remove demo data, use a fresh test database; do not manually delete linked accounts in production.

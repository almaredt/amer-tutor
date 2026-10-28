# Admin console and public tutor discovery

## Admin

The /admin page retains all original authenticated APIs and forms, but groups them into a professional operations workspace:

- Overview: live student, teacher, parent, booking, approval and refund KPIs; booking status visualization; attention queue; recent lessons.
- Students: real progress table, report drill-down and creation form.
- Teachers & parents: create accounts, approve/revoke teacher listings, link accounts to students, search accounts.
- Bookings: searchable-by-status lesson table, real booking status and point-transfer information.
- Points & settlements: grant demo points to a selected parent, settle completed lessons at 85/15.
- Refunds: review and decide point refund requests.
- Schools: school list and school creation.
- Platform settings: existing AI and plan controls.

All styles are neo-brutalist and responsive, with shared light/dark support. Data is sourced from existing endpoints; no fabricated chart values. Some advanced platform features (teacher credential verification, audit trail, support tickets, bulk scheduling) are **not implemented**.

## Public tutor catalogue

- /tutors is available **without logging in**.
- Search/filter teachers by subject, grade, curriculum and 45-minute point rate; view full teacher profiles and save favourites locally.
- Click “See available times” to inspect weekly teaching hours in Dubai time. These are weekly slots, not confirmed open booking times.
- Login is requested only when the visitor chooses to book a lesson.
- The home page tutor cards link to public profile pages rather than login.
- Demo portraits are **self-hosted stylized SVG illustrations**, not photos of real people; demo teacher cards carry a DEMO label.
- Only approved and active teacher profiles are shown.

## Run locally

```bash
git switch chatgptv1
git pull origin chatgptv1
npm ci
npm run seed-demo # only if sample accounts have not been added to this local database
npm start
```

Visit /, /tutors, /admin. No changes were deployed to main or VPS.

# TutorGPT — install four approved demo portrait assets

The illustrations generated with the user-approved reference are:
- `public/demo-portraits/aisyah.webp` — Aisyah Rahman, blue hijab
- `public/demo-portraits/daniel.webp` — Daniel Tan, black glasses
- `public/demo-portraits/kavitha.webp` — Kavitha Nair, long black hair
- `public/demo-portraits/jason.webp` — Jason Lim, yellow shirt

The `tutorgpt_demo_portraits.zip` file was delivered through ChatGPT as a download. It is intentionally not in GitHub until the images are uploaded to the repository.

## Installation using Windows PowerShell

Download the zip from ChatGPT to your Downloads folder.

```powershell
cd C:\amer-tutor                # change to your local clone path
git switch chatgptv1
git pull origin chatgptv1
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\tutorgpt_demo_portraits.zip" -DestinationPath . -Force
Get-ChildItem .\public\demo-portraits\*.webp
git add public/demo-portraits/
git commit -m "assets: install four reference-style illustrated demo teacher portraits"
git push origin chatgptv1
npm start
```

The public teacher API automatically uses installed `/demo-portraits/{teacher}.webp` for these four approved demo teachers and uses the older SVG fallback when an image is missing. The same `photo_url` appears throughout the public listing, full profile and parent marketplace.

Images are synthetic and should never be represented as photographs of real tutors.

Do not upload portraits to `main`; do not deploy to production without authorization.

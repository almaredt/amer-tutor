# Tutor demo portraits

This directory holds the four user-approved generated illustrated portraits:

- `aisyah.webp` — Aisyah Rahman (blue hijab)
- `daniel.webp` — Daniel Tan (glasses)
- `kavitha.webp` — Kavitha Nair (long hair)
- `jason.webp` — Jason Lim (yellow top)

**Important:** The binary images are not yet committed. The approved images are bundled as `tutorgpt_demo_portraits.zip` in the ChatGPT conversation. Download that ZIP, then from the repository root on `chatgptv1`:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\tutorgpt_demo_portraits.zip" -DestinationPath . -Force
git add public/demo-portraits/*.webp
git commit -m "assets: add approved teacher portraits"
git push origin chatgptv1
```

The demo teacher API uses `/demo-portraits/<name>.webp` if the file exists, otherwise falls back to the old SVG illustration. Neither `main` nor production hosting should be changed without authorization.

<div dir="rtl">

# راهنمای نصب Amer Tutor روی VPS (اوبونتو ۲۴)

این راهنما قدم‌به‌قدم است. دستورها را یکی‌یکی در SSH سرور اجرا کنید. هر جا `study.example.com` آمده، زیردامنه خودتان را بگذارید.

## قبل از شروع

۱. **یک زیردامنه بسازید:** در پنل DNS دامنه‌تان یک رکورد **A** بسازید، مثلاً `study`، که به IP سرور شما (`162.35.163.244`) اشاره کند.

۲. **پورت‌های ۸۰ و ۴۴۳ را چک کنید.** چون روی این سرور X-UI و WireGuard هم دارید، اول ببینید این پورت‌ها آزادند یا نه:

```bash
sudo ss -tlnp | grep -E ':80 |:443 '
```

- اگر خروجی خالی بود، هر دو پورت آزادند و می‌توانید ادامه دهید.
- اگر X-UI روی ۴۴۳ است، ادامه ندهید و خروجی را برای من بفرستید تا راه درست را بگویم (مثلاً جابه‌جا کردن inbound یا تقسیم ترافیک با SNI).

## ۱. نصب Node.js 22 و nginx

```bash
sudo apt update
sudo apt install -y curl ca-certificates nginx build-essential python3
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # باید v22 نشان بدهد
```

## ۲. کپی برنامه روی سرور

فایل `amer-tutor.zip` را از کامپیوتر ویندوزتان به سرور بفرستید. در PowerShell ویندوز:

```powershell
scp amer-tutor.zip root@162.35.163.244:/tmp/
```

بعد روی سرور:

```bash
sudo useradd --system --create-home --home-dir /opt/amer-tutor --shell /usr/sbin/nologin amertutor
sudo apt install -y unzip
sudo unzip /tmp/amer-tutor.zip -d /opt/
sudo chown -R amertutor:amertutor /opt/amer-tutor
cd /opt/amer-tutor
sudo -u amertutor npm ci --omit=dev
sudo -u amertutor mkdir -p data backups
```

## ۳. تنظیمات (.env)

```bash
sudo -u amertutor cp .env.example .env
sudo -u amertutor nano .env
```

- **کلید API:** جلوی `ANTHROPIC_API_KEY=` کلید API خودتان را از platform.claude.com بگذارید. اگر فعلاً خالی بماند، برنامه فقط با بانک سؤال کار می‌کند.
- **سقف هزینه:** `AI_MONTHLY_LIMIT_USD=10` یعنی اگر هزینه ماهانه Claude به ۱۰ دلار برسد، قابلیت‌های Claude تا اول ماه بعد متوقف می‌شوند.
- **ذخیره:** با Ctrl+O ذخیره کنید و با Ctrl+X خارج شوید.

```bash
sudo chmod 600 .env
```

## ۴. ساخت حساب ادمین (برای خودتان)

```bash
sudo -u amertutor npm run create-admin -- ahmad "Ahmad"
```

برنامه رمز را می‌پرسد. حداقل ۸ کاراکتر وارد کنید. موقع تایپ، رمز با ستاره نمایش داده می‌شود.

## ۵. اجرای دائمی با systemd

```bash
sudo cp deploy/amer-tutor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now amer-tutor
sudo systemctl status amer-tutor --no-pager    # باید active (running) باشد
curl -s http://127.0.0.1:3100/api/me           # باید {"error":"Please log in."} برگرداند
```

## ۶. nginx و HTTPS

```bash
sudo cp deploy/nginx-amer-tutor.conf /etc/nginx/sites-available/amer-tutor
sudo sed -i 's/study.example.com/study.YOURDOMAIN.com/' /etc/nginx/sites-available/amer-tutor
sudo ln -s /etc/nginx/sites-available/amer-tutor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d study.YOURDOMAIN.com
```

certbot گواهی HTTPS رایگان می‌گیرد و هر ۹۰ روز خودکار تمدیدش می‌کند. اگر فایروال ufw فعال است:

```bash
sudo ufw allow 'Nginx Full'
```

## ۷. اولین استفاده

۱. به `https://study.YOURDOMAIN.com/admin` بروید و با حساب ادمین وارد شوید.
۲. در بخش **Add a student** برای عامر حساب بسازید. مثلاً نام `Amer`، نام کاربری `amer` و یک رمز.
۳. عامر به `https://study.YOURDOMAIN.com` می‌رود و با همان نام کاربری و رمز وارد می‌شود.

## ۸. پشتیبان‌گیری خودکار (هر شب ساعت ۳)

```bash
sudo crontab -u amertutor -e
```

این خط را اضافه کنید:

```
0 3 * * * cd /opt/amer-tutor && /usr/bin/node --env-file=.env scripts/backup.js >> backups/backup.log 2>&1
```

۳۰ نسخه آخر در `/opt/amer-tutor/backups` نگه داشته می‌شود. هر چند وقت یک بار یکی از این فایل‌ها را روی کامپیوتر خودتان هم کپی کنید.

## به‌روزرسانی (هر بار که برنامه تغییر کرد)

کد برنامه در مخزن خصوصی **github.com/almaredt/amer-tutor** است. بعد از راه‌اندازی یک‌باره پایین، هر به‌روزرسانی فقط همین یک دستور است:

```bash
sudo bash /opt/amer-tutor/scripts/update.sh
```

اسکریپت این کارها را انجام می‌دهد:

- از دیتابیس پشتیبان می‌گیرد.
- آخرین نسخه را از GitHub می‌گیرد.
- پکیج‌ها را نصب و برنامه را ری‌استارت می‌کند.
- چک می‌کند برنامه بالا آمده باشد.

فایل `.env` و پوشه `data/` (پیشرفت دانش‌آموزان) دست نمی‌خورند. اگر مشکلی پیش بیاید، دستور برگشت به نسخه قبل را نشان می‌دهد.

### راه‌اندازی یک‌باره اتصال سرور به GitHub

۱. یک کلید فقط‌خواندنی (deploy key) برای سرور بسازید:

```bash
sudo apt install -y git
sudo -u amertutor mkdir -p /opt/amer-tutor/.ssh && sudo chmod 700 /opt/amer-tutor/.ssh
sudo -u amertutor ssh-keygen -t ed25519 -N "" -C "amer-tutor-vps" -f /opt/amer-tutor/.ssh/id_ed25519
sudo -u amertutor sh -c 'ssh-keyscan github.com >> /opt/amer-tutor/.ssh/known_hosts'
sudo cat /opt/amer-tutor/.ssh/id_ed25519.pub
```

۲. خط آخری که چاپ شد (با `ssh-ed25519` شروع می‌شود) را کپی کنید و در GitHub اضافه کنید:

- به **github.com/almaredt/amer-tutor** بروید و از آنجا وارد **Settings ← Deploy keys ← Add deploy key** شوید.
- عنوان را `VPS` بگذارید و کلید را paste کنید.
- تیک **Allow write access** را **نزنید**.
- **Add key** را بزنید.

۳. پوشه برنامه را به GitHub وصل کنید و اولین به‌روزرسانی را اجرا کنید:

```bash
cd /opt/amer-tutor
sudo -u amertutor git init -q -b main
sudo -u amertutor git remote add origin git@github.com:almaredt/amer-tutor.git
sudo -u amertutor git fetch origin
sudo -u amertutor git reset --hard origin/main
sudo bash scripts/update.sh
```

اگر در پایان «✓ Updated and running» دیدید، کار تمام است.

### روش جایگزین با zip

اگر روزی GitHub در دسترس نبود:

```bash
sudo bash /opt/amer-tutor/scripts/update.sh /tmp/amer-tutor.zip
```

## این نسخه چه دارد

| بخش | توضیح |
|---|---|
| برنامه هفتگی | ۷ روز: یکشنبه تا پنجشنبه ریاضی، فیزیک و شیمی؛ جمعه روز اشتباه‌ها؛ شنبه انگلیسی |
| Learn topics | ۳۱ درس با شکل، مثال قدم‌به‌قدم، اشتباه‌های رایج، «Ask Claude» و آزمون از همان موضوع |
| بانک سؤال | ۲۶۵ تست و ۹۹ سؤال تشریحی؛ بقیه را Claude Opus 5.5 می‌سازد |
| پنل ادمین | گزارش هر دانش‌آموز در ۴ درس، موضوع‌های ضعیف، اشتباه‌ها، هزینه Claude |

## دستورهای مفید

| کار | دستور |
|---|---|
| دیدن لاگ‌ها | `sudo journalctl -u amer-tutor -f` |
| ری‌استارت | `sudo systemctl restart amer-tutor` |
| به‌روزرسانی برنامه | zip جدید را مثل مرحله ۲ باز کنید (`.env` و `data/` دست نمی‌خورند)، بعد `sudo -u amertutor npm ci --omit=dev` و ری‌استارت |
| تغییر رمز ادمین | `sudo -u amertutor npm run create-admin -- ahmad` |

## اگر مشکلی پیش آمد

| مشکل | راه‌حل |
|---|---|
| صفحه باز نمی‌شود | `sudo systemctl status amer-tutor` و `sudo nginx -t` را اجرا کنید و خروجی را بفرستید. |
| خطای 502 | برنامه اجرا نیست. لاگ را با `journalctl` ببینید. |
| Claude سؤال نمی‌سازد | کلید API را در `.env` چک کنید، بعد ری‌استارت کنید. در پنل ادمین، کارت «Claude this month» وضعیت را نشان می‌دهد. |

## امن کردن ورود SSH (یک بار)

فایل‌های `secure_server.py` و `secure_server.bat` را کنار `update_server.py` در پوشه‌ی کامپیوتر خودتان بگذارید و روی `secure_server.bat` دوبار کلیک کنید. این برنامه:

1. یک کلید SSH روی همین کامپیوتر می‌سازد (فایل `amer_server_key`؛ از آن یک نسخه‌ی پشتیبان جای امن نگه دارید).
2. با رمز `.env` وارد سرور می‌شود و کلید را اضافه می‌کند، بعد امتحان می‌کند که کلید کار می‌کند.
3. بعد از تأیید شما: به‌روزرسانی امنیتی خودکار و fail2ban را روشن می‌کند و ورود با رمز را خاموش می‌کند.

از آن به بعد `update_server.bat` خودش با کلید وصل می‌شود. برای برگرداندن ورود با رمز: `python secure_server.py --undo`. اگر فایل کلید گم شد، از کنسول (VNC) پنل InterServer این را بزنید:
`rm /etc/ssh/sshd_config.d/00-amer-keys-only.conf && systemctl reload ssh`

</div>

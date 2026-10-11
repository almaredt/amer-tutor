#!/usr/bin/env bash
# Update Amer Tutor, keeping .env and the database.
#   From GitHub (default when the app folder is a git clone):  sudo bash /opt/amer-tutor/scripts/update.sh
#   From a zip file:                                            sudo bash /opt/amer-tutor/scripts/update.sh /tmp/amer-tutor.zip
set -euo pipefail
APP=/opt/amer-tutor
ZIP=${1:-}
STAMP=$(date +%Y-%m-%d-%H%M)
cd "$APP"
as_app() { sudo -u amertutor "$@"; }

echo "1/5 Backing up the database…"
as_app /usr/bin/node --env-file=.env scripts/backup.js

if [ -z "$ZIP" ] && [ -d .git ]; then
  PREV=$(as_app git rev-parse HEAD)
  ROLLBACK="cd $APP && sudo -u amertutor git reset --hard $PREV && sudo -u amertutor npm ci --omit=dev && sudo systemctl restart amer-tutor"
  echo "2/5 Getting the latest version from GitHub…"
  as_app git fetch --quiet origin
  as_app git reset --hard --quiet origin/main
  echo "3/5 Now at: $(as_app git log -1 --format='%h  %s  (%cr)')"
else
  [ -n "$ZIP" ] && [ -f "$ZIP" ] || { echo "✗ No git clone here and no zip given. Usage: update.sh /tmp/amer-tutor.zip"; exit 1; }
  echo "2/5 Saving the current code (for rollback)…"
  tar -czf "backups/code-$STAMP.tgz" src public scripts package.json package-lock.json
  chown amertutor:amertutor "backups/code-$STAMP.tgz"
  ROLLBACK="sudo tar -xzf $APP/backups/code-$STAMP.tgz -C $APP && cd $APP && sudo -u amertutor npm ci --omit=dev && sudo systemctl restart amer-tutor"
  echo "3/5 Unpacking the zip (.env and data/ are left untouched)…"
  unzip -o -q "$ZIP" -d /opt/ -x 'amer-tutor/.env' 'amer-tutor/data/*' 'amer-tutor/backups/*'
  chown -R amertutor:amertutor "$APP"
fi

echo "4/5 Installing packages…"
as_app npm ci --omit=dev --silent

echo "5/5 Restarting…"
systemctl restart amer-tutor
sleep 3
CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/api/me || true)
if [ "$CODE" = "401" ]; then
  echo "✓ Updated and running."
  echo "  To go back to the previous version: $ROLLBACK"
else
  echo "✗ The app did not start (HTTP $CODE). Last log lines:"
  journalctl -u amer-tutor -n 30 --no-pager
  echo "Go back to the previous version with:"
  echo "  $ROLLBACK"
  exit 1
fi

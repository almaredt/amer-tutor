"""
Secure the server's SSH login, from your own PC. Run once (double-click secure_server.bat).

What it does, in this order, stopping at the first problem:
  1. Makes an SSH key on this PC (file "amer_server_key" next to this script; keep it private).
  2. Logs in with your password (from .env) and adds the key to the server.
  3. Checks that the key really works. If not, it stops and changes nothing else.
  4. Asks you, then: turns on automatic security updates, installs fail2ban (blocks
     IPs that keep guessing passwords), and switches SSH to key-only login.
  5. Checks again: key login works, password login is refused.

After this, update_server.bat logs in with the key automatically.
Undo (allow password login again):  python secure_server.py --undo
If you ever lose the key file: use the VNC/console in the InterServer panel and run
  rm /etc/ssh/sshd_config.d/00-amer-keys-only.conf && systemctl reload ssh
"""
import getpass
import os
import sys
import time

try:
    import paramiko
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ed25519
except ImportError:
    import subprocess
    print(f"Installing paramiko for this Python:\n  {sys.executable}\n")
    pip = [sys.executable, "-m", "pip", "install", "paramiko"]
    if subprocess.call(pip) != 0:
        subprocess.check_call(pip + ["--user"])
    import site, importlib
    site.addsitedir(site.getusersitepackages())
    importlib.invalidate_caches()
    import paramiko
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ed25519

HERE = os.path.dirname(os.path.abspath(__file__))
KNOWN_HOSTS = os.path.join(HERE, "amer_known_hosts")
KEY_FILE = os.path.join(HERE, "amer_server_key")
ENV_FILE = os.path.join(HERE, ".env")
DROPIN = "/etc/ssh/sshd_config.d/00-amer-keys-only.conf"

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def load_env(path):
    env = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    v = v.strip()
                    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                        v = v[1:-1]
                    env[k.strip()] = v
    return env


ENV = load_env(ENV_FILE)
HOST = ENV.get("SSH_HOST", "162.35.163.244")
PORT = int(ENV.get("SSH_PORT", "22"))
USER = ENV.get("SSH_USER", "root")
PASSWORD = ENV.get("SSH_PASSWORD", "")


class AskFirstTime(paramiko.MissingHostKeyPolicy):
    def missing_host_key(self, client, hostname, key):
        print(f"\nFirst connection to {hostname}. Server key ({key.get_name()}): {key.get_fingerprint().hex(':')}")
        if input("Trust this server and remember it? (y/n): ").strip().lower() != "y":
            raise SystemExit("Stopped. Nothing was changed.")
        client.get_host_keys().add(hostname, key.get_name(), key)
        client.save_host_keys(KNOWN_HOSTS)


def new_client():
    c = paramiko.SSHClient()
    if os.path.exists(KNOWN_HOSTS):
        c.load_host_keys(KNOWN_HOSTS)
    c.set_missing_host_key_policy(AskFirstTime())
    return c


def connect_key():
    c = new_client()
    c.connect(HOST, PORT, USER, key_filename=KEY_FILE, look_for_keys=False, allow_agent=False, timeout=15)
    return c


def connect_password(pw):
    c = new_client()
    c.connect(HOST, PORT, USER, password=pw, look_for_keys=False, allow_agent=False, timeout=15)
    return c


def run(client, cmd, stdin_text=None, show=True):
    stdin, stdout, _ = client.exec_command(cmd, get_pty=stdin_text is None)
    if stdin_text is not None:
        stdin.write(stdin_text)
        stdin.channel.shutdown_write()
    out = []
    for line in iter(stdout.readline, ""):
        out.append(line)
        if show:
            print("   " + line, end="")
    return stdout.channel.recv_exit_status(), "".join(out)


def ensure_key():
    """An Ed25519 key pair for this PC; made once, reused after."""
    if not os.path.exists(KEY_FILE):
        priv = ed25519.Ed25519PrivateKey.generate()
        pem = priv.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.OpenSSH, serialization.NoEncryption())
        with open(KEY_FILE, "wb") as f:
            f.write(pem)
        try:
            os.chmod(KEY_FILE, 0o600)
        except OSError:
            pass
        print(f"   New key saved: {KEY_FILE}")
    else:
        print(f"   Using the existing key: {KEY_FILE}")
    k = paramiko.Ed25519Key.from_private_key_file(KEY_FILE)
    return f"{k.get_name()} {k.get_base64()} amer-tutor-pc"


HARDEN = r"""
set -u
export DEBIAN_FRONTEND=noninteractive
echo "[1/3] Automatic security updates"
if apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq unattended-upgrades fail2ban >/dev/null 2>&1; then echo "  installed: unattended-upgrades, fail2ban"; else echo "  WARNING: apt could not install packages"; fi
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'X'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
X
echo "  security updates install automatically every day"

echo "[2/3] fail2ban: block IPs that keep failing to log in"
mkdir -p /etc/fail2ban/jail.d
cat > /etc/fail2ban/jail.d/amer-sshd.local <<'X'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
X
if command -v systemctl >/dev/null 2>&1 && systemctl enable --now fail2ban >/dev/null 2>&1 && systemctl restart fail2ban >/dev/null 2>&1; then echo "  fail2ban is running (5 wrong tries in 10 minutes = 1 hour block)"; else echo "  WARNING: fail2ban is installed but could not be started"; fi

echo "[3/3] SSH: key login only"
if ! grep -Eqi '^\s*Include\s+/etc/ssh/sshd_config\.d/\*\.conf' /etc/ssh/sshd_config; then
  echo "  ERROR: this server's SSH config does not read sshd_config.d. Password login was NOT changed."; exit 3
fi
cat > __DROPIN__ <<'X'
# Added by secure_server.py: log in with the SSH key only.
# Remove this file and reload ssh to allow passwords again.
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
X
if ! sshd -t; then rm -f __DROPIN__; echo "  ERROR: SSH config test failed, change removed. Nothing changed."; exit 4; fi
if [ "$(sshd -T 2>/dev/null | awk '/^passwordauthentication/{print $2}')" != "no" ]; then
  rm -f __DROPIN__; echo "  ERROR: another SSH setting overrides this. Password login was NOT changed."; exit 5
fi
systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || pkill -HUP -o -x sshd
echo "  password login is now off; the key works"
"""

UNDO = r"""
rm -f __DROPIN__
systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || pkill -HUP -o -x sshd
echo "Password login is allowed again (fail2ban and automatic updates stay on)."
"""


def undo():
    print("Connecting with the key ...")
    c = connect_key()
    code, _ = run(c, "bash -s", UNDO.replace("__DROPIN__", DROPIN))
    c.close()
    return code


def main():
    if "--undo" in sys.argv:
        return undo()

    print(f"Server: {USER}@{HOST}:{PORT}\n")
    print("Step 1: SSH key on this PC")
    pub = ensure_key()

    print("\nStep 2: add the key to the server")
    try:
        c = connect_key()
        print("   The key already works.")
    except paramiko.AuthenticationException:
        pw = PASSWORD or getpass.getpass(f"   Password for {USER}@{HOST}: ")
        try:
            c = connect_password(pw)
        except paramiko.AuthenticationException:
            print("   Wrong password. Nothing was changed.")
            return 1
        b64 = pub.split()[1]
        cmd = ("umask 077; mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && "
               f"(grep -qF '{b64}' ~/.ssh/authorized_keys || echo '{pub}' >> ~/.ssh/authorized_keys) && echo added")
        code, out = run(c, cmd, show=False)
        c.close()
        if code != 0 or "added" not in out:
            print("   Could not add the key. Nothing else was changed.")
            return 1
        print("   Key added.")

        print("\nStep 3: test the key")
        try:
            c = connect_key()
        except Exception as e:
            print(f"   The key does not work ({e}). Password login stays ON. Nothing else was changed.")
            return 1
        print("   The key works.")

    print("\nStep 4 will turn on automatic security updates and fail2ban,")
    print("and switch SSH to KEY ONLY: after this, the password no longer works for SSH")
    print(f"(only from this PC with {os.path.basename(KEY_FILE)}). Back up that file somewhere safe.")
    if input("Continue? (y/n): ").strip().lower() != "y":
        c.close()
        print("Stopped. The key was added; password login is still on.")
        return 0
    code, _ = run(c, "bash -s", HARDEN.replace("__DROPIN__", DROPIN))
    c.close()
    if code != 0:
        print("\nStopped before switching off passwords. Read the lines above.")
        return code

    print("\nStep 5: check")
    err = None
    for _ in range(6):  # SSH restarts itself after the reload; give it a few seconds
        time.sleep(2)
        try:
            connect_key().close()
            err = None
            break
        except Exception as e:
            err = e
    if err:
        print(f"   Key login FAILED ({err}). Your current session is closed, so use the InterServer")
        print(f"   console (VNC) and run:  rm {DROPIN} && systemctl reload ssh")
        return 1
    print("   Key login: works ✓")
    if PASSWORD:
        try:
            connect_password(PASSWORD).close()
            print("   Password login: still accepted ✗ (check the lines above)")
        except paramiko.AuthenticationException:
            print("   Password login: refused ✓")
        except paramiko.SSHException:
            print("   Password login: refused ✓")
    print("\n✓ Done. update_server.bat now uses the key. You can remove SSH_PASSWORD from .env.")
    return 0


if __name__ == "__main__":
    try:
        rc = main()
    except (OSError, paramiko.SSHException) as e:
        print(f"Could not connect: {e}")
        rc = 1
    if "--no-pause" not in sys.argv:
        input("\nPress Enter to close...")
    sys.exit(rc)

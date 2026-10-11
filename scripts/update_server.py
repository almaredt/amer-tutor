"""
Update Amer Tutor on the VPS from your own PC.

It connects to the server over SSH and runs:
    bash /opt/amer-tutor/scripts/update.sh
then shows the output live, exactly as if you typed it on the server.

One-time setup (Windows):
    pip install paramiko

Run:
    python update_server.py

Password: put it in a file named .env next to this script:
    SSH_PASSWORD=your-root-password
If .env has no password, it is asked each time.
If amer_server_key (made by secure_server.bat) or an SSH key in C:\\Users\\<you>\\.ssh exists, it is used first.
"""
import getpass
import os
import sys

try:
    import paramiko
except ImportError:
    # Double-click may start a different Python than the one in the terminal.
    # Install paramiko into whichever Python is running this file.
    import subprocess
    print(f"paramiko is missing for this Python:\n  {sys.executable}\nInstalling it now...\n")
    try:
        pip = [sys.executable, "-m", "pip", "install", "paramiko"]
        if subprocess.call(pip) != 0:
            subprocess.check_call(pip + ["--user"])  # no write access to Python's folder
        import site, importlib
        site.addsitedir(site.getusersitepackages())
        importlib.invalidate_caches()
        import paramiko
        print("\nparamiko installed.\n")
    except Exception as e:
        print(f"\nCould not install paramiko automatically ({e}).")
        print(f'Run this once in PowerShell:\n  "{sys.executable}" -m pip install paramiko')
        input("Press Enter to close...")
        sys.exit(1)

HERE = os.path.dirname(os.path.abspath(__file__))
KNOWN_HOSTS = os.path.join(HERE, "amer_known_hosts")
ENV_FILE = os.path.join(HERE, ".env")
KEY_FILE = os.path.join(HERE, "amer_server_key")  # made by secure_server.py


def load_env(path):
    """Read KEY=VALUE lines from .env (no extra packages needed)."""
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            v = v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                v = v[1:-1]
            env[k.strip()] = v
    return env


ENV = load_env(ENV_FILE)

# ---- settings (can be overridden in .env) ----
HOST = ENV.get("SSH_HOST", "162.35.163.244")
PORT = int(ENV.get("SSH_PORT", "22"))
USER = ENV.get("SSH_USER", "root")
PASSWORD = ENV.get("SSH_PASSWORD", "")
UPDATE_CMD = "bash /opt/amer-tutor/scripts/update.sh"
# ----------------------------------------------

# Windows console: print ✓ ✗ … without crashing
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


class AskFirstTime(paramiko.MissingHostKeyPolicy):
    """First connection: show the server fingerprint and ask. Later: it must match."""

    def missing_host_key(self, client, hostname, key):
        fp = key.get_fingerprint().hex(":")
        print(f"\nFirst connection to {hostname}.")
        print(f"Server key ({key.get_name()}): {fp}")
        if input("Trust this server and remember it? (y/n): ").strip().lower() != "y":
            raise SystemExit("Stopped. Nothing was changed on the server.")
        client.get_host_keys().add(hostname, key.get_name(), key)
        client.save_host_keys(KNOWN_HOSTS)


def new_client():
    client = paramiko.SSHClient()
    if os.path.exists(KNOWN_HOSTS):
        client.load_host_keys(KNOWN_HOSTS)
    client.set_missing_host_key_policy(AskFirstTime())
    return client


def connect():
    # 1) try SSH keys / agent (skipped quietly when there are none)
    client = new_client()
    try:
        key = KEY_FILE if os.path.exists(KEY_FILE) else None
        client.connect(HOST, PORT, USER, timeout=15, key_filename=key, look_for_keys=True, allow_agent=True)
        return client, None
    except paramiko.BadHostKeyException:
        raise SystemExit(
            "WARNING: the server key has CHANGED. If you reinstalled the server, delete the file\n"
            f"  {KNOWN_HOSTS}\nand run again. Otherwise do not continue."
        )
    except paramiko.SSHException:
        # no key, or the key was refused -> fall back to the password
        client.close()

    # 2) password: from .env, otherwise ask
    pw = PASSWORD or getpass.getpass(f"Password for {USER}@{HOST}: ")
    client = new_client()
    client.connect(HOST, PORT, USER, password=pw, timeout=15, look_for_keys=False, allow_agent=False)
    return client, pw


def main():
    print(f"Connecting to {USER}@{HOST} ...")
    try:
        client, pw = connect()
    except paramiko.AuthenticationException:
        if PASSWORD:
            print(f"Wrong password in {ENV_FILE}. Fix SSH_PASSWORD there and run again.")
        else:
            print("Wrong username or password.")
        return 1
    except (OSError, paramiko.SSHException) as e:
        print(f"Could not connect: {e}")
        print("Check the internet / VPN, and that the server is on.")
        return 1

    cmd = UPDATE_CMD if USER == "root" else f"sudo -S -p '' {UPDATE_CMD}"
    print("Connected. Updating...\n")
    stdin, stdout, _ = client.exec_command(cmd, get_pty=True)
    if USER != "root" and pw:
        stdin.write(pw + "\n")
        stdin.flush()

    for line in iter(stdout.readline, ""):
        print(line, end="")
    code = stdout.channel.recv_exit_status()
    client.close()

    print()
    print("✓ Done." if code == 0 else f"✗ Update failed (exit code {code}). Read the lines above.")
    return code


if __name__ == "__main__":
    rc = main()
    input("\nPress Enter to close...")
    sys.exit(rc)

"""
Update Amer Tutor on the VPS from your own PC.

It connects to the server over SSH and runs:
    bash /opt/amer-tutor/scripts/update.sh
then shows the output live, exactly as if you typed it on the server.

One-time setup (Windows):
    pip install paramiko

Run:
    python update_server.py

The password is asked every time and never saved.
If you have an SSH key (C:\\Users\\<you>\\.ssh\\id_ed25519 or id_rsa), it is used instead.
"""
import getpass
import os
import sys

try:
    import paramiko
except ImportError:
    print("paramiko is not installed. Run this once:  pip install paramiko")
    input("Press Enter to close...")
    sys.exit(1)

# ---- settings ----
HOST = "162.35.163.244"
PORT = 22
USER = "root"          # change if you log in with another user
UPDATE_CMD = "bash /opt/amer-tutor/scripts/update.sh"
# -------------------

HERE = os.path.dirname(os.path.abspath(__file__))
KNOWN_HOSTS = os.path.join(HERE, "amer_known_hosts")

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


def connect():
    client = paramiko.SSHClient()
    if os.path.exists(KNOWN_HOSTS):
        client.load_host_keys(KNOWN_HOSTS)
    client.set_missing_host_key_policy(AskFirstTime())

    # 1) try SSH keys / agent
    try:
        client.connect(HOST, PORT, USER, timeout=15, look_for_keys=True, allow_agent=True)
        return client, None
    except paramiko.AuthenticationException:
        pass
    except paramiko.BadHostKeyException:
        raise SystemExit(
            "WARNING: the server key has CHANGED. If you reinstalled the server, delete the file\n"
            f"  {KNOWN_HOSTS}\nand run again. Otherwise do not continue."
        )

    # 2) password
    pw = getpass.getpass(f"Password for {USER}@{HOST}: ")
    client.connect(HOST, PORT, USER, password=pw, timeout=15, look_for_keys=False, allow_agent=False)
    return client, pw


def main():
    print(f"Connecting to {USER}@{HOST} ...")
    try:
        client, pw = connect()
    except paramiko.AuthenticationException:
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

import os
import sys
import ftplib

def load_env():
    """Load variables from .env file into os.environ"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def sync_folder(ftp, local_dir, remote_dir):
    """Recursively upload a folder to FTP"""
    print(f"Syncing {local_dir} -> {remote_dir}")
    try:
        ftp.mkd(remote_dir)
    except ftplib.error_perm:
        pass # Directory likely exists

    ftp.cwd(remote_dir)

    for item in os.listdir(local_dir):
        if item in ['.git', '.env', 'ftp_deploy.py', 'deploy.py', '__pycache__', '.DS_Store']:
            continue

        local_path = os.path.join(local_dir, item)

        if os.path.isfile(local_path):
            print(f"Uploading {item}...")
            with open(local_path, 'rb') as f:
                # Use binary mode for all files is safer for media
                ftp.storbinary(f'STOR {item}', f)
        elif os.path.isdir(local_path):
            # Recurse into subdirectories
            sync_folder(ftp, local_path, item)
            # Must return to parent directory after recursing
            ftp.cwd('..')

def main():
    print("Loading credentials...")
    load_env()

    ftp_host = os.environ.get('FTP_HOST')
    ftp_user = os.environ.get('FTP_USER')
    ftp_pass = os.environ.get('FTP_PASS')
    ftp_port = int(os.environ.get('FTP_PORT', 21))

    if not ftp_host or not ftp_user or not ftp_pass:
        print("Error: Missing FTP credentials.")
        print("Please create a .env file in this directory with:")
        print("FTP_HOST=ftp.yourdomain.com")
        print("FTP_USER=your_username")
        print("FTP_PASS=your_password")
        sys.exit(1)

    # Note: On some hostinger setups the public HTML is under public_html/
    # If the root of your FTP user is already the public web folder, leave this.
    remote_target = os.environ.get('FTP_DIR', '/')

    print(f"Connecting to {ftp_host}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(ftp_host, ftp_port)
        ftp.login(ftp_user, ftp_pass)
        print("Login successful.")

        # Change to the target directory if specified
        if remote_target and remote_target != '/':
            try:
                ftp.cwd(remote_target)
            except ftplib.error_perm:
                print(f"Could not change to target directory: {remote_target}")

        local_dir = os.path.dirname(os.path.abspath(__file__))

        # Begin sync
        for item in os.listdir(local_dir):
            # Skip hidden files, git, python cache, and our deploy script
            if item in ['.git', '.env', 'ftp_deploy.py', 'deploy.py', '__pycache__', '.DS_Store']:
                continue

            local_path = os.path.join(local_dir, item)
            if os.path.isfile(local_path):
                print(f"Uploading {item}...")
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f'STOR {item}', f)
            elif os.path.isdir(local_path):
                sync_folder(ftp, local_path, item)

        ftp.quit()
        print("\nDeployment completed successfully!")

    except Exception as e:
        print(f"\nDeployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

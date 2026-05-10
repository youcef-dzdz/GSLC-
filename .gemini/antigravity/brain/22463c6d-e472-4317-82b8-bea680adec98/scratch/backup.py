import os
import shutil
from datetime import datetime

timestamp = datetime.now().strftime('%Y%m%dT%H%M%S')
backup_dir = os.path.join('.backups', timestamp)
os.makedirs(backup_dir, exist_ok=True)

src_dir = os.path.join('resources', 'js', 'pages', 'admin')
dst_dir = os.path.join(backup_dir, 'admin')

shutil.copytree(src_dir, dst_dir)
print(f"Backup created at {dst_dir}")

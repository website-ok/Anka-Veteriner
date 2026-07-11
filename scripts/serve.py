"""Local gelistirme sunucusu.

Siteyi http://localhost:8000 adresinde yayinlar.

Kullanım (venv aktifken, proje kökünden):
    python Anka-Veteriner/scripts/serve.py
"""

import http.server
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_DIR), **kwargs)


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"Vet Anka Veteriner -> http://localhost:{PORT}")
        httpd.serve_forever()

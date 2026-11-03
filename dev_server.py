"""Local static preview: serve this repository without browser caching."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # Always read the current file, even after edits within the same second.
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


class PreviewServer(ThreadingHTTPServer):
    # The page loads images and fonts concurrently, including hidden sections.
    request_queue_size = 64


if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    handler = partial(PreviewHandler, directory=str(root))
    with PreviewServer(("127.0.0.1", 4173), handler) as server:
        print("Previsualització: http://127.0.0.1:4173 (sense memòria cau)", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass

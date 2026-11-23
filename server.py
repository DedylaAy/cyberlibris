#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CyberLibris High-Performance Dual-Stack (IPv4 + IPv6) Multi-Threaded Server & Live Book Relay
Дисциплина: Технологии программирования
Особенность: Потоковая ретрансляция книг из открытых источников в реальном времени.
Никаких файлов книг на локальном диске (Zero-Storage Policy).
"""

import http.server
import os
import sys
import socket
import urllib.parse
import json
import relay_service

PORT = 8080

# In-memory runtime cache (RAM only, never written to disk)
RELAY_MEMORY_CACHE = {}

class CyberLibrisHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 15

    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Connection', 'close')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()

    def do_GET(self):
        # Silently handle favicon without 404
        if self.path in ('/favicon.ico', '/favicon.png'):
            self.send_response(204)
            self.end_headers()
            return

        parsed_url = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed_url.query)

        # ----------------------------------------------------
        # API: Потоковая ретрансляция книги из внешнего источника
        # ----------------------------------------------------
        if parsed_url.path == '/api/relay/stream':
            provider = params.get('provider', ['wikisource'])[0]
            page = params.get('page', [''])[0]
            lang = params.get('lang', ['ru'])[0]
            identifier = params.get('identifier', [''])[0]
            max_chapters = int(params.get('max_chapters', [15])[0])

            cache_key = f"{provider}:{lang}:{page or identifier}"
            if cache_key in RELAY_MEMORY_CACHE:
                result_data = RELAY_MEMORY_CACHE[cache_key]
            else:
                if provider == 'archive' and identifier:
                    result_data = relay_service.stream_archive_book(identifier)
                else:
                    result_data = relay_service.stream_wikisource_book(page, lang=lang, max_subchapters=max_chapters)

                if result_data and result_data.get('success'):
                    RELAY_MEMORY_CACHE[cache_key] = result_data

            if not result_data:
                result_data = {
                    "success": False,
                    "error": f"Не удалось ретранслировать книгу из {provider} ({page})"
                }

            response_bytes = json.dumps(result_data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        # ----------------------------------------------------
        # API: Сквозной живой поиск по открытым библиотекам
        # ----------------------------------------------------
        if parsed_url.path == '/api/relay/search':
            query = params.get('q', [''])[0]
            lang = params.get('lang', ['ru'])[0]
            results = relay_service.search_live_books(query, lang=lang) if query else []
            
            response_bytes = json.dumps({"success": True, "results": results}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        super().do_GET()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.html'):
            return 'text/html; charset=utf-8'
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Clean timestamp logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

class DualStackThreadingServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()

class IPv4ThreadingServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def run_server(port):
    # Try Dual-Stack first (IPv6 + IPv4), fallback to IPv4
    try:
        httpd = DualStackThreadingServer(('::', port), CyberLibrisHandler)
        return httpd
    except Exception:
        try:
            httpd = IPv4ThreadingServer(('0.0.0.0', port), CyberLibrisHandler)
            return httpd
        except Exception:
            return None

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    target_port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        target_port = int(sys.argv[1])

    httpd = run_server(target_port)
    if not httpd:
        for p in range(8081, 8090):
            httpd = run_server(p)
            if httpd:
                target_port = p
                break

    if not httpd:
        print(f"Error: Could not bind to port {PORT} or fallback ports.")
        sys.exit(1)

    print(f"CyberLibris server running at http://127.0.0.1:{target_port} (and http://localhost:{target_port})")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        httpd.server_close()

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CyberLibris High-Performance Dual-Stack (IPv4 + IPv6) Multi-Threaded Server
Дисциплина: Технологии программирования
"""

import http.server
import os
import sys
import socket

PORT = 8080

class CyberLibrisHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 5

    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Connection', 'close')
        super().end_headers()

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

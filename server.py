#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CyberLibris Local Development & Demonstration Server
Дисциплина: Технологии программирования
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class CyberLibrisHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper modern MIME types
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.json'):
            return 'application/json'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    try:
        with ReusableTCPServer(("", PORT), CyberLibrisHandler) as httpd:
            print(f"CyberLibris server running at http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} already in use or error: {e}")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CyberLibris Local Development & Demonstration Server
Дисциплина: Технологии программирования
Запуск: python server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class CyberLibrisHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching for instant updates
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = CyberLibrisHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print("⚡ CyberLibris — Нео-Библиотека & Геймифицированный Хаб")
        print("=" * 65)
        print(f"Сервер успешно запущен по адресу: {url}")
        print("База данных: database.json")
        print("Для выхода нажмите Ctrl+C")
        print("=" * 65)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен пользователем.")

if __name__ == '__main__':
    main()

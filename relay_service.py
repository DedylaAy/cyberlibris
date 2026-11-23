#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CyberLibris - Live Book Streaming & Content Relay Engine v5.0
Ретранслятор книг из открытых источников в реальном времени.
Принцип: НОЛЬ книг на локальном диске сервера!
Вся литература подкачивается и ретранслируется в реальном времени.
Источники: Wikisource (Викитека), Open Library, Internet Archive, Standard Ebooks.
"""

import urllib.request
import urllib.parse
import json
import ssl
import re
import html
import concurrent.futures

SSL_CTX = ssl._create_unverified_context()
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (CyberLibris Stream Relay)'

def clean_wikisource_html(raw_html):
    """Очищает HTML Викитеки от метаданных, навигационных таблиц и служебных плашек."""
    if not raw_html:
        return ""
    text = re.sub(r'<(script|style|noscript)[^>]*>.*?</\1>', '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<table[^>]*class="[^"]*(ws-noexport|headertemplate|navbox|license)[^"]*"[^>]*>.*?</table>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<div[^>]*class="[^"]*(ws-noexport|headertemplate|navbox|license)[^"]*"[^>]*>.*?</div>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<div id="headertemplate"[^>]*>.*?</div>', '', text, flags=re.DOTALL | re.IGNORECASE)
    return text

def parse_paragraphs_from_html(html_fragment):
    """Извлекает чистый текст абзацев из фрагмента HTML."""
    paragraphs = []
    p_tags = re.findall(r'<p[^>]*>(.*?)</p>', html_fragment, flags=re.DOTALL | re.IGNORECASE)
    for p in p_tags:
        clean_p = re.sub(r'<[^>]+>', '', p)
        clean_p = html.unescape(clean_p).strip()
        # Игнорируем сноски и служебные маркеры
        if len(clean_p) > 15 and not clean_p.startswith('↑'):
            paragraphs.append(clean_p)
            
    if not paragraphs:
        clean_all = re.sub(r'<br\s*/?>', '\n', html_fragment)
        clean_all = re.sub(r'<[^>]+>', ' ', clean_all)
        clean_all = html.unescape(clean_all)
        for b in clean_all.split('\n'):
            b_str = b.strip()
            if len(b_str) > 25 and not b_str.startswith('↑'):
                paragraphs.append(b_str)
                
    return paragraphs

def split_html_into_chapters(html_content, default_title="Глава"):
    """
    Разделяет HTML книги на отдельные главы по заголовкам h2, h3, h4,
    mw-headline, римским цифрам в центрированных div или смысловым разделителям.
    """
    cleaned = clean_wikisource_html(html_content)
    
    # 1. Поиск разделителей: заголовки, mw-headline, центрированные римские цифры / главы
    pattern = r'(<(?:h[2-4]|div[^>]*style="[^"]*text-align:\s*center[^"]*")[^>]*>(?:\s*<span[^>]*class="mw-headline"[^>]*>)?\s*(?:[IVXLCDM]+\.?|ГЛАВА\s+[^<]+|ЧАСТЬ\s+[^<]+|Том\s+[^<]+|.*?)\s*(?:</span>)?\s*</(?:h[2-4]|div)>|<span[^>]*class="mw-headline"[^>]*>.*?</span>)'
    splits = re.split(pattern, cleaned, flags=re.DOTALL | re.IGNORECASE)
    
    chapters = []
    if len(splits) > 2:
        intro_paras = parse_paragraphs_from_html(splits[0])
        if intro_paras:
            chapters.append({
                "title": "Вступление / Предисловие",
                "content": "\n\n".join(intro_paras)
            })
            
        i = 1
        while i < len(splits):
            header_html = splits[i]
            body_html = splits[i+1] if (i+1) < len(splits) else ""
            
            raw_title = re.sub(r'<[^>]+>', '', header_html)
            raw_title = html.unescape(raw_title).strip()
            
            # Если название чисто римская цифра, оформляем красиво: "Глава I"
            if re.match(r'^[IVXLCDM]+\.?$', raw_title):
                raw_title = f"Глава {raw_title}"
            
            if raw_title and len(raw_title) < 120 and not any(skip in raw_title.lower() for skip in ['примечания', 'сноски', 'навигация', 'ссылки', 'литература', 'содержание']):
                paras = parse_paragraphs_from_html(body_html)
                if paras:
                    # Если глава слишком большая (> 40 абзацев), разобьем ее на части
                    if len(paras) > 35:
                        chunk_size = 25
                        for sub_idx in range(0, len(paras), chunk_size):
                            sub_chunk = paras[sub_idx : sub_idx + chunk_size]
                            part_num = (sub_idx // chunk_size) + 1
                            chapters.append({
                                "title": f"{raw_title} (Часть {part_num})",
                                "content": "\n\n".join(sub_chunk)
                            })
                    else:
                        chapters.append({
                            "title": raw_title,
                            "content": "\n\n".join(paras)
                        })
            i += 2
            
    # 2. Если разделителей мало или глава всего 1 огромная, разбиваем на равномерные главы
    if len(chapters) <= 1:
        chapters = []
        all_paras = parse_paragraphs_from_html(cleaned)
        if all_paras:
            chunk_size = 18
            for idx in range(0, len(all_paras), chunk_size):
                chunk = all_paras[idx : idx + chunk_size]
                c_num = (idx // chunk_size) + 1
                chapters.append({
                    "title": f"{default_title} {c_num}",
                    "content": "\n\n".join(chunk)
                })
                
    return chapters

import time

def fetch_wikisource_page(page_title, lang='ru', retries=2):
    """Выполняет запрос к API Викитеки с обработкой повторных попыток."""
    url = f"https://{lang}.wikisource.org/w/api.php?action=parse&page={urllib.parse.quote(page_title)}&prop=text|links|sections&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=12) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('parse', {})
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries:
                time.sleep(0.5 * (attempt + 1))
                continue
            print(f"[Relay] Ошибка запроса к Викитеке '{page_title}' ({lang}): {e}")
            return {}
        except Exception as e:
            print(f"[Relay] Ошибка запроса к Викитеке '{page_title}' ({lang}): {e}")
            return {}
    return {}

def stream_wikisource_book(page_title, lang='ru', max_subchapters=18):
    """
    Ретранслирует книгу из Викитеки:
    - Для многостраничных произведений подкачивает главы параллельно
    - Для одностраничных разбивает на главы по подзаголовкам
    - Возвращает чистый JSON с массивом глав
    """
    parse_data = fetch_wikisource_page(page_title, lang)
    if not parse_data:
        return None
        
    title = parse_data.get('title', page_title).replace('_', ' ')
    raw_html = parse_data.get('text', {}).get('*', '')
    links = [l.get('*', '') for l in parse_data.get('links', []) if '*' in l]
    
    # Поиск ссылок на подстраницы глав
    prefix = page_title.replace('_', ' ')
    subchapter_links = []
    for l in links:
        # Принимаем только реальные подстраницы текущего произведения
        if l.startswith(prefix + '/') and not l.startswith('Файл:'):
            if l not in subchapter_links:
                subchapter_links.append(l)
                
    chapters = []
    
    # ВАРИАНТ 1: Есть отдельные подстраницы глав
    if len(subchapter_links) >= 2:
        target_links = subchapter_links[:max_subchapters]
        print(f"[Relay] Потоковая ретрансляция {len(target_links)} глав из Викитеки для '{title}'...")
        
        def fetch_sub(sub_title):
            time.sleep(0.05)
            sub_parse = fetch_wikisource_page(sub_title, lang)
            sub_raw = sub_parse.get('text', {}).get('*', '')
            internal_chapters = split_html_into_chapters(sub_raw, default_title=sub_title.replace(prefix + '/', ''))
            if internal_chapters and len(internal_chapters) > 1:
                return internal_chapters
            
            sub_html = clean_wikisource_html(sub_raw)
            sub_paras = parse_paragraphs_from_html(sub_html)
            short_title = sub_title.replace(prefix + '/', '')
            return [{
                "title": short_title,
                "content": "\n\n".join(sub_paras) if sub_paras else "Глава ретранслируется..."
            }]
            
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_to_link = {executor.submit(fetch_sub, l): l for l in target_links}
            link_results = {}
            for future in concurrent.futures.as_completed(future_to_link):
                l = future_to_link[future]
                try:
                    res = future.result()
                    link_results[l] = res
                except Exception as e:
                    link_results[l] = [{"title": l, "content": f"Ошибка связи с сервером: {e}"}]
            
            for l in target_links:
                if l in link_results:
                    for ch in link_results[l]:
                        if ch.get('content') and len(ch['content']) > 40:
                            chapters.append(ch)
                            
    # ВАРИАНТ 2: Единый текст на странице, разбиваем на главы
    if not chapters and raw_html:
        chapters = split_html_into_chapters(raw_html, default_title="Глава")
        
    source_url = f"https://{lang}.wikisource.org/wiki/{urllib.parse.quote(page_title)}"
    return {
        "success": True,
        "title": title,
        "provider": "wikisource",
        "lang": lang,
        "sourceName": f"Викитека — Свободная библиотека ({lang}.wikisource.org)",
        "sourceUrl": source_url,
        "chaptersCount": len(chapters),
        "chapters": chapters
    }

def stream_archive_book(identifier):
    """Потоковая ретрансляция книг из Internet Archive (archive.org)."""
    url = f"https://archive.org/stream/{identifier}/{identifier}_djvu.txt"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as resp:
            text = resp.read().decode('utf-8', errors='ignore')
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            chapters = []
            current_title = "Глава I"
            current_paras = []
            
            for line in lines[:2500]:
                if re.match(r'^(CHAPTER|ГЛАВА|ACT|BOOK|PART)\s+[IVXLCDM0-9]+', line, re.IGNORECASE):
                    if current_paras:
                        chapters.append({
                            "title": current_title,
                            "content": "\n\n".join(current_paras)
                        })
                        current_paras = []
                    current_title = line
                else:
                    if len(line) > 30 and not line.isdigit():
                        current_paras.append(line)
                        
            if current_paras:
                chapters.append({
                    "title": current_title,
                    "content": "\n\n".join(current_paras)
                })
                
            return {
                "success": True,
                "title": identifier.replace('_', ' '),
                "provider": "archive",
                "sourceName": "Internet Archive (archive.org)",
                "sourceUrl": f"https://archive.org/details/{identifier}",
                "chaptersCount": len(chapters),
                "chapters": chapters
            }
    except Exception as e:
        print(f"[Relay] Ошибка связи с Archive.org '{identifier}': {e}")
        return None

def search_live_books(query, lang='ru'):
    """
    Живой сквозной поиск по мировым открытым библиотекам (Wikisource + Open Library).
    Возвращает готовые к ретрансляции карточки книг без локального хранения.
    """
    results = []
    
    # 1. Поиск по Викитеке (Wikisource OpenSearch)
    try:
        wiki_url = f"https://{lang}.wikisource.org/w/api.php?action=opensearch&search={urllib.parse.quote(query)}&limit=10&format=json"
        req = urllib.request.Request(wiki_url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            titles = data[1] if len(data) > 1 else []
            urls = data[3] if len(data) > 3 else []
            
            for t, u in zip(titles, urls):
                if ':' in t and not t.startswith('Сборник'):
                    continue
                results.append({
                    "id": f"relay_wiki_{hash(t) & 0xffffffff}",
                    "title": t,
                    "author": "Мировая классика",
                    "year": 1900,
                    "genre": "Классическая литература",
                    "tags": ["ретро", "классика", "оригинал", "ретрансляция", "викитека"],
                    "rarity": "epic",
                    "rarityLabel": "ЭПИЧЕСКИЙ РЕТРАНСЛЯТОР",
                    "format": "Фолиант",
                    "difficulty": "Средняя",
                    "status": "Завершено",
                    "lengthPages": 320,
                    "wordsCount": 95000,
                    "rating": 4.90,
                    "ratingCount": 420,
                    "popularity": 75000,
                    "coverImage": "https://covers.openlibrary.org/b/id/12818862-L.jpg",
                    "coverStyle": "linear-gradient(135deg, #0d1b2a, #1b263b)",
                    "quote": "«Слово, сохранившееся сквозь века в открытом доступе.»",
                    "synopsis": f"Подлинный текст произведения «{t}», ретранслируемый в реальном времени из открытой электронной библиотеки Викитека ({lang}.wikisource.org).",
                    "relaySource": {
                        "provider": "wikisource",
                        "page": t.replace(' ', '_'),
                        "lang": lang
                    }
                })
    except Exception as e:
        print(f"[Relay] Ошибка поиска Викитеки: {e}")
        
    # 2. Поиск по Open Library
    try:
        ol_url = f"https://openlibrary.org/search.json?q={urllib.parse.quote(query)}&limit=10"
        req = urllib.request.Request(ol_url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=6) as resp:
            ol_data = json.loads(resp.read().decode('utf-8'))
            docs = ol_data.get('docs', [])
            for doc in docs:
                cover_id = doc.get('cover_i')
                cover_img = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg" if cover_id else "https://covers.openlibrary.org/b/id/12818862-L.jpg"
                num_pages = doc.get('number_of_pages_median', 250)
                ia_list = doc.get('ia', [])
                ia_id = ia_list[0] if ia_list else None
                
                relay_cfg = {
                    "provider": "archive" if ia_id else "wikisource",
                    "identifier": ia_id,
                    "page": doc.get('title', '').replace(' ', '_'),
                    "lang": "en" if not re.search(r'[а-яА-Я]', doc.get('title', '')) else "ru"
                }
                
                doc_title = doc.get('title', 'Без названия')
                author = doc.get('author_name', ['Мировой классик'])[0]
                
                results.append({
                    "id": f"relay_ol_{doc.get('key', '').replace('/works/', '')}",
                    "title": doc_title,
                    "author": author,
                    "year": doc.get('first_publish_year', 1920),
                    "genre": (doc.get('subject') and doc.get('subject')[0]) or "Мировая литература",
                    "tags": (doc.get('subject') or [])[:5] + ["мировая классика", "open library"],
                    "rarity": "legendary" if num_pages > 500 else "epic",
                    "rarityLabel": "ЛЕГЕНДАРНЫЙ ФОЛИАНТ" if num_pages > 500 else "ЭПИЧЕСКОЕ ТВОРЕНИЕ",
                    "format": "Фолиант" if num_pages > 500 else "Роман",
                    "difficulty": "Хардкор" if num_pages > 500 else "Средняя",
                    "status": "Завершено",
                    "lengthPages": num_pages,
                    "wordsCount": num_pages * 270,
                    "rating": 4.88,
                    "ratingCount": 680,
                    "popularity": 82000,
                    "coverImage": cover_img,
                    "coverStyle": "linear-gradient(135deg, #141e30, #243b55)",
                    "quote": f"«Великое наследие: {doc_title}»",
                    "synopsis": (doc.get('first_sentence') and doc.get('first_sentence')[0]) or f"Мировое литературное достояние из международного каталога Open Library.",
                    "relaySource": relay_cfg
                })
    except Exception as e:
        print(f"[Relay] Ошибка поиска Open Library: {e}")
        
    return results

if __name__ == '__main__':
    print("Testing relay engine stream:")
    data = stream_wikisource_book('Преступление_и_наказание_(Достоевский)', 'ru')
    if data:
        print(f"Success! Provider={data['provider']}, Chapters={data['chaptersCount']}")
        for c in data['chapters'][:5]:
            print(f" - {c['title']} ({len(c['content'])} chars)")

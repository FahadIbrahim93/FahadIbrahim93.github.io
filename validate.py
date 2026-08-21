#!/usr/bin/env python3
"""Portfolio structural validator — run after ANY bulk edit to HTML files.
Exit 0 = all pass. Exit 1 = failures listed."""
import os, re, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

REQUIRED = ["<html", "</html>", "<head>", "</head>", "<body", "</body>", "<title>", 'name="viewport"', 'name="description"']
failures = []

import glob
html_files = sorted(glob.glob("*.html") + glob.glob("*/*.html"))
for f in html_files:
    with open(f, encoding="utf-8") as fh:
        c = fh.read()

    # 1. Required tags present
    for tag in REQUIRED:
        if tag not in c and not (tag == 'name="description"' and "404" in f):
            failures.append(f"{f}: missing {tag}")

    # 2. Exactly one h1
    h1 = len(re.findall(r"<h1[\s>]", c))
    if h1 != 1:
        failures.append(f"{f}: {h1} <h1> tags (must be exactly 1)")

    # 3. No HTML tags inside <style>
    in_style = False
    for i, line in enumerate(c.split("\n"), 1):
        if "<style>" in line: in_style = True; continue
        if "</style>" in line: in_style = False; continue
        if in_style and ("<link" in line or "<meta" in line):
            failures.append(f"{f}:{i}: HTML tag inside <style>: {line.strip()[:60]}")

    # 4. All local href/src targets exist on disk (absolute AND relative)
    for m in re.findall(r'(?:href|src|srcset)="([^"]+)"', c):
        for part in m.split(","):
            url = part.strip().split(" ")[0]
            # Skip external, scheme links, anchors, fonts, and any URL with a query string
            if url.startswith(("http", "mailto:", "#", "data:", "tel:", "sms:", "//")):
                continue
            if "family=" in m or "?" in url or "%20" in url:
                continue
            # Strip fragment for file resolution
            url_path = url.split("#")[0]
            if not url_path:
                continue  # pure fragment like /#contact resolves to homepage
            if url_path.startswith("/"):
                path = url_path.lstrip("/") or "index.html"
                candidates = [path, path + ".html", os.path.join(path, "index.html")]
            else:
                path = url_path
                candidates = [path, os.path.join(path, "index.html")]
            if not any(os.path.exists(p) for p in candidates):
                failures.append(f"{f}: broken local ref: {url}")

    # 5. Images have alt
    for img in re.findall(r"<img[^>]*>", c):
        if "alt=" not in img:
            failures.append(f"{f}: <img> missing alt: {img[:60]}")

if failures:
    print(f"FAIL ({len(failures)} issues):")
    for x in failures:
        print(f"  {x}")
    sys.exit(1)
else:
    print("ALL CHECKS PASS ✓")

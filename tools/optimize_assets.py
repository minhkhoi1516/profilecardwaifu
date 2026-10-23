"""Resize + re-compress visual assets and keep file extensions truthful.

Rules
- avatar_*  -> true PNG, max 900px, alpha preserved            -> .png
- banner_*  -> max 1920px (PC) / 1200px (phone)
               alpha present -> PNG, otherwise JPEG q85        -> .png / .jpg

Usage:  python tools/optimize_assets.py
"""
import os
import glob
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(BASE, "assets")


def target_width(name):
    if name.startswith("avatar_"):
        return 900
    if "phone" in name:
        return 1200
    return 1920


report = []
for path in sorted(glob.glob(os.path.join(ASSETS, "*"))):
    name = os.path.basename(path)
    if not name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        continue

    before = os.path.getsize(path)
    im = Image.open(path)
    src_fmt = im.format
    w, h = im.size
    limit = target_width(name)
    if w > limit:
        im = im.resize((limit, round(h * limit / w)), Image.LANCZOS)

    has_alpha = im.mode in ("RGBA", "LA") and im.getchannel("A").getextrema()[0] < 255

    if name.startswith("avatar_"):
        ext, fmt = ".png", "PNG"
    elif has_alpha:
        ext, fmt = ".png", "PNG"
    else:
        ext, fmt = ".jpg", "JPEG"

    dest = os.path.splitext(path)[0] + ext
    if fmt == "PNG":
        im.save(dest, "PNG", optimize=True)
    else:
        im.convert("RGB").save(dest, "JPEG", quality=85, optimize=True, progressive=True)

    if os.path.abspath(dest) != os.path.abspath(path):
        os.remove(path)

    after = os.path.getsize(dest)
    report.append((os.path.basename(dest), src_fmt, fmt, f"{w}x{h}", f"{im.size[0]}x{im.size[1]}", before, after))

for r in report:
    print(f"{r[0]:34} {r[1]:5}->{r[2]:5} {r[3]:>11} -> {r[4]:>10}  {r[5]/1024:8.0f}KB -> {r[6]/1024:8.0f}KB")
print("TOTAL", sum(r[5] for r in report) // 1024 // 1024, "MB ->", sum(r[6] for r in report) // 1024 // 1024, "MB")

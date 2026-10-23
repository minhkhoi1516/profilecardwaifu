"""Compute MP3 durations without external deps (frame walking, handles VBR)."""
import os
import glob
import json

BITRATES = {
    (1, 1): [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    (1, 2): [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0],
    (1, 3): [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    (2, 1): [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0],
    (2, 2): [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
    (2, 3): [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
}
SR = {1: [44100, 48000, 32000, 0], 2: [22050, 24000, 16000, 0], 25: [11025, 12000, 8000, 0]}
SAMPLES = {(1, 3): 1152, (2, 3): 576, (1, 2): 1152, (2, 2): 1152, (1, 1): 384, (2, 1): 384}


def skip_id3(data):
    if data[:3] == b"ID3" and len(data) > 10:
        size = (data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]
        return 10 + size
    return 0


def duration(path):
    data = open(path, "rb").read()
    pos = skip_id3(data)
    total = 0.0
    frames = 0
    n = len(data)
    while pos + 4 <= n:
        b1, b2, b3 = data[pos], data[pos + 1], data[pos + 2]
        if b1 != 0xFF or (b2 & 0xE0) != 0xE0:
            pos += 1
            continue
        ver_bits = (b2 >> 3) & 0x03
        layer_bits = (b2 >> 1) & 0x03
        if ver_bits == 1 or layer_bits == 0:
            pos += 1
            continue
        version = {0: 25, 2: 2, 3: 1}[ver_bits]
        layer = {3: 1, 2: 2, 1: 3}[layer_bits]
        br_idx = (b3 >> 4) & 0x0F
        sr_idx = (b3 >> 2) & 0x03
        pad = (b3 >> 1) & 0x01
        br = BITRATES[(1 if version == 1 else 2, layer)][br_idx]
        sr = SR[version][sr_idx]
        if not br or not sr:
            pos += 1
            continue
        spf = SAMPLES[(1 if version == 1 else 2, layer)]
        if layer == 1:
            length = (12 * br * 1000 // sr + pad) * 4
        else:
            length = (spf // 8) * br * 1000 // sr + pad
        if length <= 0:
            pos += 1
            continue
        total += spf / sr
        frames += 1
        pos += length
    return total if frames else 0.0


def fmt(sec):
    return f"{int(sec // 60)}:{int(sec % 60):02d}"


if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = {}
    for p in sorted(glob.glob(os.path.join(base, "music", "*.mp3"))):
        d = duration(p)
        out[os.path.basename(p)] = round(d, 1)
        print(f"{os.path.basename(p):40} {fmt(d)}  ({d:.0f}s)")
    with open(os.path.join(base, "tools", "durations.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print("total", fmt(sum(out.values())))

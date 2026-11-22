"""Download rohitg00/ai-engineering-from-scratch README and parse every phase and lesson into JSON.

Usage: python3 scripts/parse_readme.py scripts/data/aefs.json
"""
import json
import re
import sys
import urllib.request

URL = "https://raw.githubusercontent.com/rohitg00/ai-engineering-from-scratch/main/README.md"
text = urllib.request.urlopen(URL, timeout=60).read().decode("utf-8").splitlines()
start = next(i for i, l in enumerate(text) if l.startswith("## Contents"))
end = next(i for i, l in enumerate(text) if l.startswith("## Books and certifications"))

phases, cur = [], None
for line in text[start:end]:
    m = re.search(r"Phase (\d+)\s*[—:]\s*([^<`]+?)\s*(?:</b>|`|$)", line)
    if (line.startswith("###") or "<summary>" in line) and m:
        tag = re.search(r"<em>(.*?)</em>", line)
        cur = {"phase": int(m.group(1)), "title": m.group(2).strip(), "tagline": tag.group(1) if tag else "", "lessons": []}
        phases.append(cur)
        continue
    m = re.match(r"^\|\s*(\d+)\s*\|(.+)$", line)
    if m and cur:
        cells = [c.strip() for c in m.group(2).split("|")]
        link = re.search(r"\]\(([^)]+)\)", cells[0])
        cur["lessons"].append({
            "n": int(m.group(1)),
            "title": re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cells[0]),
            "type": cells[1] if len(cells) > 1 else "",
            "lang": cells[2] if len(cells) > 2 else "",
            "path": link.group(1) if link else "",
        })

json.dump(phases, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
print(len(phases), "phases,", sum(len(p["lessons"]) for p in phases), "lessons")

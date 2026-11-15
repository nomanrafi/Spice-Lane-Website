#!/usr/bin/env python3
"""Update PROGRESS.md QUICK STATE. Usage: qs.py "last action" "next action" [old_plan_text new_plan_text]"""
import sys, re, datetime
p = "Spice Lane Website Progress Save/PROGRESS.md"
s = open(p).read()
s = re.sub(r"- Last action:.*\n", lambda m: f"- Last action: {sys.argv[1]}\n", s, count=1)
s = re.sub(r"- NEXT ACTION:.*\n", lambda m: f"- NEXT ACTION: {sys.argv[2]}\n", s, count=1)
t = (datetime.datetime.utcnow() + datetime.timedelta(hours=6)).strftime("%Y-%m-%d %H:%M")
s = re.sub(r"- Last updated:.*\n", lambda m: f"- Last updated: {t} (Asia/Dhaka) by Session #12\n", s, count=1)
if len(sys.argv) > 4: s = s.replace(sys.argv[3], sys.argv[4])
open(p, "w").write(s)

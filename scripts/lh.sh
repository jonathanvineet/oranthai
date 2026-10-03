#!/bin/sh
# usage: scripts/lh.sh <url> <out.json>  -> prints scores and key metrics (mobile, simulated throttling)
npx -y lighthouse@12 "$1" --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,seo,best-practices --output=json --output-path="$2" >/dev/null 2>&1
python3 - "$2" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
print(" ".join(f"{k}={round(v['score']*100)}" for k,v in r["categories"].items()))
A=r["audits"]
print(" ".join(f"{a.split('-')[0][:5]}..={A[a]['displayValue']}" for a in ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"]))
PY

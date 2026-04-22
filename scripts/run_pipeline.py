from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    steps = [
        ["python3", "scripts/download_sources.py"],
        ["python3", "scripts/extract_bills.py"],
        ["python3", "scripts/normalize_crosswalk.py"],
        ["python3", "scripts/generate_synthetic.py"],
    ]
    for step in steps:
        print(f"running={' '.join(step)}")
        subprocess.run(step, cwd=ROOT, check=True)
    print("pipeline_complete")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(f"pipeline_failed step={exc.cmd} code={exc.returncode}", file=sys.stderr)
        raise

from __future__ import annotations

import csv
import hashlib
import json
import re
import shlex
import ssl
import subprocess
import tempfile
import unicodedata
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
RAW_PDF_DIR = DATA_DIR / "raw_pdfs"
EXTRACTED_JSON_DIR = DATA_DIR / "extracted_json"
SYNTHETIC_JSON_DIR = DATA_DIR / "synthetic_json"
INDEX_DIR = DATA_DIR / "index"
HTML_RENDER_DIR = SYNTHETIC_JSON_DIR / "html_renders"
SOURCE_LIST_PATH = INDEX_DIR / "sources.json"
INDEX_CSV_PATH = INDEX_DIR / "index.csv"
PROVENANCE_PATH = INDEX_DIR / "provenance.json"
FIELD_CROSSWALK_PATH = INDEX_DIR / "field_crosswalk.json"
PROVIDER_SCHEMA_PATH = INDEX_DIR / "provider_specific_schema.json"
CANONICAL_SCHEMA_PATH = INDEX_DIR / "provider_agnostic_schema.json"

INDEX_COLUMNS = [
    "id",
    "provider",
    "utility_type",
    "audience",
    "title",
    "url",
    "filename",
    "downloaded_at",
    "content_type",
    "notes",
    "status",
    "sha256",
    "page_count",
]

CANONICAL_FIELD_KEYS = [
    "supplier_name",
    "supplier_vat",
    "customer_name",
    "customer_company_name",
    "customer_vat",
    "customer_tax_code",
    "invoice_number",
    "issue_date",
    "billing_period_start",
    "billing_period_end",
    "due_date",
    "currency",
    "total_amount_due",
    "pod",
    "pdr",
    "contract_account_id",
    "tariff_name",
    "supply_voltage",
    "committed_power_kw",
    "available_power_kw",
    "consumption_kwh",
    "consumption_smc",
    "reading_type",
    "cost_energy_or_materia",
    "cost_transport_meter",
    "cost_system_charges",
    "cost_taxes",
    "vat_amount",
    "payment_method",
    "address_supply",
    "address_billing",
]

FIELD_CROSSWALK = {
    "total_amount_due": [
        "Totale da pagare",
        "Importo complessivo",
        "Importo da pagare",
        "Totale fattura",
        "Totale bolletta",
        "Totale documento",
    ],
    "cost_energy_or_materia": [
        "Spesa per la materia energia",
        "Spesa materia energia",
        "Spesa per la vendita di energia elettrica",
        "Spesa per la vendita di gas naturale",
        "Spesa per la materia gas naturale",
        "Materia prima gas",
    ],
    "cost_transport_meter": [
        "Spesa per il trasporto e la gestione del contatore",
        "Trasporto e gestione contatore",
        "Spesa per il trasporto, gestione contatore e oneri di sistema",
        "Trasporto, gestione contatore",
    ],
    "cost_system_charges": [
        "Oneri di sistema",
        "Spesa per oneri di sistema",
        "Costi di sistema",
        "Oneri generali di sistema",
    ],
    "cost_taxes": [
        "Imposte",
        "Accisa",
        "Accise",
        "Addizionale regionale",
        "Totale imposte",
    ],
    "vat_amount": [
        "IVA",
        "Iva",
        "Importo IVA",
        "Totale IVA",
    ],
    "invoice_number": [
        "Numero fattura",
        "N. fattura",
        "Fattura n.",
        "Numero documento",
    ],
    "issue_date": [
        "Data emissione",
        "Data fattura",
        "Data documento",
        "Emessa il",
    ],
    "due_date": [
        "Scadenza",
        "Data di scadenza",
        "Scade il",
    ],
    "contract_account_id": [
        "Numero cliente",
        "Codice cliente",
        "Numero fornitura",
        "Codice contratto",
        "Numero contratto",
        "Codice utente",
    ],
    "tariff_name": [
        "Offerta",
        "Nome offerta",
        "Tariffa",
        "Tipologia offerta",
    ],
    "supply_voltage": [
        "Tensione di fornitura",
        "Tensione",
    ],
    "committed_power_kw": [
        "Potenza impegnata",
        "Potenza contrattualmente impegnata",
    ],
    "available_power_kw": [
        "Potenza disponibile",
        "Potenza resa disponibile",
    ],
}


def ensure_dirs() -> None:
    for path in [
        RAW_PDF_DIR,
        EXTRACTED_JSON_DIR,
        SYNTHETIC_JSON_DIR,
        INDEX_DIR,
        HTML_RENDER_DIR,
    ]:
        path.mkdir(parents=True, exist_ok=True)


def load_sources() -> list[dict[str, Any]]:
    payload = json.loads(SOURCE_LIST_PATH.read_text(encoding="utf-8"))
    return payload["sources"]


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.strip().lower())
    return slug.strip("-") or "unknown"


def stable_pdf_filename(source: dict[str, Any]) -> str:
    return (
        f"{slugify(source['provider'])}__{source['utility_type']}__"
        f"{source['audience']}__{slugify(source['shortname'])}.pdf"
    )


def compute_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(65536)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def run_command(args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        check=check,
        capture_output=True,
        text=True,
    )


def download_bytes(url: str) -> tuple[bytes, dict[str, str]]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; bollettai-dataset-builder/1.0)",
            "Accept": "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8",
        },
    )
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(request, timeout=45, context=context) as response:
        headers = {key.lower(): value for key, value in response.headers.items()}
        return response.read(), headers


def pdfinfo_page_count(pdf_path: Path) -> int | None:
    try:
        result = run_command(["pdfinfo", str(pdf_path)], check=True)
    except Exception:
        return None
    match = re.search(r"^Pages:\s+(\d+)$", result.stdout, flags=re.MULTILINE)
    return int(match.group(1)) if match else None


def pdftotext_page(pdf_path: Path, page_number: int) -> str:
    result = run_command(
        [
            "pdftotext",
            "-f",
            str(page_number),
            "-l",
            str(page_number),
            "-layout",
            str(pdf_path),
            "-",
        ],
        check=True,
    )
    return result.stdout.strip()


def available_tesseract_languages() -> set[str]:
    try:
        result = run_command(["tesseract", "--list-langs"], check=True)
    except Exception:
        return {"eng"}
    langs = set()
    for line in result.stdout.splitlines():
        line = line.strip()
        if line and not line.lower().startswith("list of available"):
            langs.add(line)
    return langs or {"eng"}


def ocr_page(pdf_path: Path, page_number: int) -> str:
    languages = available_tesseract_languages()
    lang = "ita+eng" if {"ita", "eng"}.issubset(languages) else "eng"
    with tempfile.TemporaryDirectory() as tmpdir_name:
        prefix = Path(tmpdir_name) / "page"
        run_command(
            [
                "pdftoppm",
                "-f",
                str(page_number),
                "-l",
                str(page_number),
                "-r",
                "170",
                "-png",
                str(pdf_path),
                str(prefix),
            ],
            check=True,
        )
        image_paths = sorted(Path(tmpdir_name).glob("page-*.png"))
        if not image_paths:
            return ""
        result = run_command(
            [
                "tesseract",
                str(image_paths[0]),
                "stdout",
                "-l",
                lang,
                "--psm",
                "6",
            ],
            check=True,
        )
    return result.stdout.strip()


def extract_text_by_page(pdf_path: Path) -> tuple[list[str], list[int]]:
    page_count = pdfinfo_page_count(pdf_path) or 0
    page_texts: list[str] = []
    ocr_pages: list[int] = []
    for page_number in range(1, page_count + 1):
        text = ""
        try:
            text = pdftotext_page(pdf_path, page_number)
        except Exception:
            text = ""
        if len(text.strip()) < 120:
            try:
                text = ocr_page(pdf_path, page_number)
                if text:
                    ocr_pages.append(page_number)
            except Exception:
                pass
        page_texts.append(text.strip())
    return page_texts, ocr_pages


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_italian_amount(raw_value: str | None) -> float | None:
    if not raw_value:
        return None
    cleaned = (
        raw_value.replace("EUR", "")
        .replace("euro", "")
        .replace("€", "")
        .replace(".", "")
        .replace(" ", "")
        .replace(",", ".")
        .strip()
    )
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return None


def iso_date(raw_value: str | None) -> str:
    if not raw_value:
        return ""
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(raw_value, fmt).date().isoformat()
        except ValueError:
            continue
    return ""


def csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, Any]], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in columns})


def find_label_value(text: str, labels: list[str], value_pattern: str) -> tuple[str, str] | None:
    for label in labels:
        pattern = rf"(?i){re.escape(label)}\s*[:\-]?\s*({value_pattern})"
        match = re.search(pattern, text)
        if match:
            return label, normalize_whitespace(match.group(1))
    return None


def collect_crosswalk_hits(text: str) -> dict[str, list[str]]:
    hits: dict[str, list[str]] = {}
    lowered = text.lower()
    for canonical, aliases in FIELD_CROSSWALK.items():
        found = [alias for alias in aliases if alias.lower() in lowered]
        if found:
            hits[canonical] = found
    return hits


def command_preview(args: list[str]) -> str:
    return " ".join(shlex.quote(arg) for arg in args)

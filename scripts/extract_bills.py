from __future__ import annotations

import re
from pathlib import Path

from bill_pipeline_lib import (
    CANONICAL_FIELD_KEYS,
    EXTRACTED_JSON_DIR,
    INDEX_CSV_PATH,
    PROVENANCE_PATH,
    collect_crosswalk_hits,
    csv_rows,
    ensure_dirs,
    extract_text_by_page,
    find_label_value,
    iso_date,
    load_sources,
    normalize_whitespace,
    parse_italian_amount,
    read_json,
    write_json,
)

DATE_PATTERN = r"\d{2}[\/\.-]\d{2}[\/\.-]\d{4}"
AMOUNT_PATTERN = r"(?:\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})"
TEXT_PATTERN = r"[A-Z0-9][A-Z0-9À-ÿ\.\-\/\s]{2,60}"


def blank_fields() -> dict[str, object]:
    fields: dict[str, object] = {}
    for key in CANONICAL_FIELD_KEYS:
        if key in {
            "total_amount_due",
            "committed_power_kw",
            "available_power_kw",
            "consumption_kwh",
            "consumption_smc",
            "cost_energy_or_materia",
            "cost_transport_meter",
            "cost_system_charges",
            "cost_taxes",
            "vat_amount",
        }:
            fields[key] = None
        elif key == "currency":
            fields[key] = "EUR"
        else:
            fields[key] = ""
    return fields


def assign_field(
    fields: dict[str, object],
    confidence: dict[str, dict[str, str]],
    field_name: str,
    value: object,
    level: str,
    source_label: str,
) -> None:
    if value in (None, "", []):
        return
    fields[field_name] = value
    confidence[field_name] = {
        "level": level,
        "source": source_label,
    }


def extract_period(text: str) -> tuple[str, str, str]:
    patterns = [
        r"(?i)periodo(?:\s+di)?(?:\s+fatturazione|\s+di\s+riferimento|\s+consumi)?\s*[:\-]?\s*(" + DATE_PATTERN + r")\s*(?:al|\-|a)\s*(" + DATE_PATTERN + r")",
        r"(?i)consumi\s+dal\s*(" + DATE_PATTERN + r")\s*(?:al|\-|a)\s*(" + DATE_PATTERN + r")",
        r"(?i)dal\s*(" + DATE_PATTERN + r")\s*(?:al|\-|a)\s*(" + DATE_PATTERN + r")",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return iso_date(match.group(1)), iso_date(match.group(2)), match.group(0)
    return "", "", ""


def extract_amount_after_labels(text: str, labels: list[str]) -> tuple[float | None, str]:
    result = find_label_value(text, labels, AMOUNT_PATTERN)
    if result:
        label, raw_value = result
        return parse_italian_amount(raw_value), label
    return None, ""


def extract_text_after_labels(text: str, labels: list[str], pattern: str = TEXT_PATTERN) -> tuple[str, str]:
    result = find_label_value(text, labels, pattern)
    if result:
        label, raw_value = result
        return normalize_whitespace(raw_value), label
    return "", ""


def extract_identifier(text: str, pattern: str) -> str:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return normalize_whitespace(match.group(1)) if match else ""


def extract_numeric_near_label(text: str, labels: list[str]) -> tuple[float | None, str]:
    for label in labels:
        pattern = (
            rf"(?i){re.escape(label)}\s*[:\-]?\s*"
            rf"({AMOUNT_PATTERN}|\d+(?:,\d+)?)\s*(?:kW|kw|SMC|smc|kWh|kwh)?"
        )
        match = re.search(pattern, text)
        if match:
            return parse_italian_amount(match.group(1)), label
    return None, ""


def guess_reading_type(text: str) -> tuple[str, str]:
    lowered = text.lower()
    if "conguaglio" in lowered or "ricalcolo" in lowered:
        return "conguaglio", "keyword:conguaglio"
    if "stimata" in lowered or "stima" in lowered:
        return "estimated", "keyword:stimata"
    if "autolettura" in lowered:
        return "self_read", "keyword:autolettura"
    if "rilevata" in lowered or "lettura effettiva" in lowered:
        return "actual", "keyword:rilevata"
    return "", ""


def validate_breakdown(fields: dict[str, object]) -> dict[str, object]:
    parts = [
        fields.get("cost_energy_or_materia"),
        fields.get("cost_transport_meter"),
        fields.get("cost_system_charges"),
        fields.get("cost_taxes"),
        fields.get("vat_amount"),
    ]
    present_parts = [part for part in parts if isinstance(part, (int, float))]
    total = fields.get("total_amount_due")
    if not isinstance(total, (int, float)) or len(present_parts) < 2:
        return {"total_consistency": "not_enough_data", "delta": None}
    delta = round(total - sum(present_parts), 2)
    status = "ok" if abs(delta) <= 1.0 else "warning"
    return {"total_consistency": status, "delta": delta}


def main() -> None:
    ensure_dirs()
    sources = {item["id"]: item for item in load_sources()}
    provenance = read_json(PROVENANCE_PATH)
    rows = [row for row in csv_rows(INDEX_CSV_PATH) if row["status"] == "downloaded"]

    for row in rows:
        source = sources[row["id"]]
        pdf_path = Path("data/raw_pdfs") / row["filename"]
        page_texts, ocr_pages = extract_text_by_page(pdf_path)
        full_text = "\n\n".join(text for text in page_texts if text)
        excerpt = normalize_whitespace(full_text[:1600])

        fields = blank_fields()
        confidence: dict[str, dict[str, str]] = {}
        crosswalk_hits = collect_crosswalk_hits(full_text)

        assign_field(
            fields,
            confidence,
            "supplier_name",
            source.get("provider_display", source["provider"]),
            "medium",
            "source_manifest.provider_display",
        )

        supplier_vat, label = extract_text_after_labels(
            full_text,
            ["Partita IVA venditore", "P.IVA venditore", "Partita IVA"],
            r"\d{11}",
        )
        assign_field(fields, confidence, "supplier_vat", supplier_vat, "medium", label)

        for field_name, labels in {
            "customer_company_name": ["Ragione sociale", "Società", "Ditta"],
            "customer_name": ["Cliente", "Intestatario", "Nome e cognome"],
            "customer_vat": ["Partita IVA cliente", "P.IVA cliente", "Partita IVA"],
            "customer_tax_code": ["Codice fiscale", "C.F."],
            "invoice_number": ["Numero fattura", "N. fattura", "Fattura n.", "Numero documento"],
            "issue_date": ["Data emissione", "Data fattura", "Data documento", "Emessa il"],
            "due_date": ["Data di scadenza", "Scadenza", "Scade il"],
            "contract_account_id": [
                "Numero cliente",
                "Codice cliente",
                "Numero fornitura",
                "Codice contratto",
                "Numero contratto",
            ],
            "tariff_name": ["Nome offerta", "Offerta", "Tariffa", "Tipologia offerta"],
            "supply_voltage": ["Tensione di fornitura", "Tensione"],
            "payment_method": ["Modalità di pagamento", "Pagamento"],
            "address_supply": ["Indirizzo di fornitura", "Indirizzo fornitura"],
            "address_billing": ["Indirizzo di recapito", "Indirizzo di fatturazione", "Indirizzo cliente"],
        }.items():
            if field_name in {"issue_date", "due_date"}:
                raw_value, label = extract_text_after_labels(full_text, labels, DATE_PATTERN)
                assign_field(fields, confidence, field_name, iso_date(raw_value), "high", label)
            elif field_name in {"customer_vat"}:
                raw_value, label = extract_text_after_labels(full_text, labels, r"\d{11}")
                assign_field(fields, confidence, field_name, raw_value, "high", label)
            elif field_name in {"customer_tax_code"}:
                raw_value, label = extract_text_after_labels(full_text, labels, r"[A-Z0-9]{11,16}")
                assign_field(fields, confidence, field_name, raw_value, "high", label)
            elif field_name in {"invoice_number"}:
                raw_value, label = extract_text_after_labels(full_text, labels, r"[A-Z0-9\/\.\-]{3,40}")
                assign_field(fields, confidence, field_name, raw_value, "high", label)
            else:
                raw_value, label = extract_text_after_labels(full_text, labels)
                assign_field(fields, confidence, field_name, raw_value, "medium", label)

        period_start, period_end, period_label = extract_period(full_text)
        assign_field(fields, confidence, "billing_period_start", period_start, "high", period_label)
        assign_field(fields, confidence, "billing_period_end", period_end, "high", period_label)

        for field_name, labels in {
            "total_amount_due": [
                "Totale da pagare",
                "Importo complessivo",
                "Importo da pagare",
                "Totale fattura",
                "Totale bolletta",
            ],
            "cost_energy_or_materia": [
                "Spesa per la materia energia",
                "Spesa per la vendita di energia elettrica",
                "Spesa per la vendita di gas naturale",
                "Materia prima gas",
            ],
            "cost_transport_meter": [
                "Spesa per il trasporto e la gestione del contatore",
                "Trasporto e gestione contatore",
            ],
            "cost_system_charges": [
                "Oneri di sistema",
                "Spesa per oneri di sistema",
                "Oneri generali di sistema",
            ],
            "cost_taxes": ["Imposte", "Accisa", "Accise", "Totale imposte"],
            "vat_amount": ["IVA", "Iva", "Totale IVA", "Importo IVA"],
        }.items():
            amount_value, label = extract_amount_after_labels(full_text, labels)
            assign_field(fields, confidence, field_name, amount_value, "high", label)

        for field_name, labels in {
            "committed_power_kw": ["Potenza impegnata", "Potenza contrattualmente impegnata"],
            "available_power_kw": ["Potenza disponibile", "Potenza resa disponibile"],
            "consumption_kwh": ["Consumo fatturato", "Totale kWh", "Energia attiva", "Consumi fatturati"],
            "consumption_smc": ["Consumo Smc", "Smc fatturati", "Totale Smc", "Consumi fatturati Smc"],
        }.items():
            numeric_value, label = extract_numeric_near_label(full_text, labels)
            assign_field(fields, confidence, field_name, numeric_value, "medium", label)

        pod = extract_identifier(full_text, r"\bPOD\s*[:\-]?\s*([A-Z0-9]{10,20})")
        pdr = extract_identifier(full_text, r"\bPDR\s*[:\-]?\s*([0-9]{10,18})")
        assign_field(fields, confidence, "pod", pod, "high", "regex:POD")
        assign_field(fields, confidence, "pdr", pdr, "high", "regex:PDR")

        reading_type, reading_source = guess_reading_type(full_text)
        assign_field(fields, confidence, "reading_type", reading_type, "medium", reading_source)

        validation = validate_breakdown(fields)

        payload = {
            "source_id": source["id"],
            "provider": source["provider"],
            "utility_type": source["utility_type"],
            "audience": source["audience"],
            "language": "it",
            "document_kind": source.get("document_kind", "guide"),
            "fields": fields,
            "field_confidence": confidence,
            "crosswalk_hits": crosswalk_hits,
            "raw_text_excerpt": excerpt,
            "raw_text_by_page": page_texts,
            "page_count": len(page_texts),
            "source_url": source["url"],
            "ocr_used_pages": ocr_pages,
            "validation": validation,
            "provenance": provenance.get(source["id"], {}),
        }
        write_json(EXTRACTED_JSON_DIR / f"{source['id']}.json", payload)

    print(f"extracted={len(rows)} output_dir={EXTRACTED_JSON_DIR}")


if __name__ == "__main__":
    main()

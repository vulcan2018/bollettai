from __future__ import annotations

import json
import random
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

from bill_pipeline_lib import (
    EXTRACTED_JSON_DIR,
    HTML_RENDER_DIR,
    SYNTHETIC_JSON_DIR,
    ensure_dirs,
    read_json,
    slugify,
    write_json,
)

SEED = 20260422
VAT_RATE = 0.22

BUSINESS_ARCHETYPES = {
    "studio professionale": {"power": (3, 6), "elec_year": (3500, 9000), "gas_year": (300, 1200)},
    "negozio": {"power": (6, 10), "elec_year": (5000, 16000), "gas_year": (500, 2000)},
    "bar": {"power": (10, 15), "elec_year": (8000, 22000), "gas_year": (1200, 3500)},
    "ristorante piccolo": {"power": (10, 15), "elec_year": (12000, 25000), "gas_year": (1800, 5000)},
    "magazzino": {"power": (6, 12), "elec_year": (4000, 14000), "gas_year": (200, 800)},
    "laboratorio artigianale": {"power": (10, 20), "elec_year": (12000, 28000), "gas_year": (700, 2400)},
    "ufficio": {"power": (3, 10), "elec_year": (4000, 12000), "gas_year": (300, 1000)},
    "officina": {"power": (10, 20), "elec_year": (13000, 28000), "gas_year": (400, 1600)},
}

ITALIAN_SURNAMES = [
    "Rossi", "Bianchi", "Romano", "Gallo", "Costa", "Fontana", "Greco", "Marino", "Conti", "De Luca"
]
ITALIAN_NAMES = ["Luca", "Giulia", "Paolo", "Marta", "Andrea", "Chiara", "Marco", "Elena", "Davide", "Sara"]
STREET_NAMES = [
    "Via Roma", "Via Garibaldi", "Via Manzoni", "Corso Italia", "Via Verdi",
    "Via Torino", "Viale Europa", "Piazza Dante", "Via Cavour", "Via delle Industrie"
]
CITIES = [
    ("Milano", "20100"), ("Roma", "00100"), ("Torino", "10100"), ("Bologna", "40100"),
    ("Firenze", "50100"), ("Padova", "35100"), ("Bari", "70100"), ("Verona", "37100"),
    ("Parma", "43100"), ("Modena", "41100")
]

MIX = [
    ("electricity", "domestic", 140),
    ("gas", "domestic", 110),
    ("dual", "domestic", 75),
    ("electricity", "business", 105),
    ("gas", "business", 40),
    ("dual", "business", 30),
]


def random_vat(rng: random.Random) -> str:
    return "".join(str(rng.randint(0, 9)) for _ in range(11))


def random_tax_code(rng: random.Random) -> str:
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    tail = "".join(str(rng.randint(0, 9)) for _ in range(7))
    return "".join(rng.choice(alphabet) for _ in range(6)) + tail + rng.choice(alphabet) + str(rng.randint(0, 9)) + rng.choice(alphabet)


def random_pod(rng: random.Random) -> str:
    return "IT001E" + "".join(str(rng.randint(0, 9)) for _ in range(8))


def random_pdr(rng: random.Random) -> str:
    return "".join(str(rng.randint(0, 9)) for _ in range(14))


def random_address(rng: random.Random) -> str:
    city, postal = rng.choice(CITIES)
    street = rng.choice(STREET_NAMES)
    return f"{street}, {rng.randint(1, 150)}, {postal} {city}"


def seasonal_factor(month: int, utility_type: str, audience: str) -> float:
    if utility_type == "gas":
        return {1: 1.8, 2: 1.6, 3: 1.3, 4: 0.9, 5: 0.5, 6: 0.25, 7: 0.2, 8: 0.2, 9: 0.35, 10: 0.8, 11: 1.2, 12: 1.7}[month]
    if utility_type == "electricity" and audience == "business":
        return {1: 0.95, 2: 0.95, 3: 1.0, 4: 1.0, 5: 1.05, 6: 1.15, 7: 1.2, 8: 1.15, 9: 1.05, 10: 1.0, 11: 0.95, 12: 0.95}[month]
    return {1: 0.9, 2: 0.9, 3: 0.95, 4: 1.0, 5: 1.05, 6: 1.15, 7: 1.25, 8: 1.2, 9: 1.05, 10: 0.95, 11: 0.9, 12: 0.9}[month]


def pick_template(records: list[dict], utility_type: str, audience: str, rng: random.Random) -> dict:
    matching = [
        record for record in records
        if record["utility_type"] == utility_type and record["audience"] in {audience, "unknown"}
    ]
    if not matching:
        matching = [record for record in records if record["utility_type"] == utility_type]
    if not matching:
        matching = records
    return rng.choice(matching)


def build_party(rng: random.Random, audience: str) -> tuple[str, str, str, str]:
    if audience == "domestic":
        full_name = f"{rng.choice(ITALIAN_NAMES)} {rng.choice(ITALIAN_SURNAMES)}"
        return full_name, "", random_tax_code(rng), random_address(rng)
    archetype = rng.choice(list(BUSINESS_ARCHETYPES.keys()))
    prefix = rng.choice(["Studio", "Officina", "Laboratorio", "Bar", "Negozio", "Magazzino", "Ufficio"])
    company = f"{prefix} {rng.choice(['Aurora', 'Quadrifoglio', 'Centro', 'Delta', 'Mercurio', 'Lombarda'])} {rng.choice(['SRL', 'SNC', 'SAS'])}"
    return "", company if archetype != "studio professionale" else f"Studio {rng.choice(ITALIAN_SURNAMES)} & Associati", random_vat(rng), random_address(rng)


def issue_dates(rng: random.Random) -> tuple[date, date, date]:
    end = date(2026, rng.randint(1, 4), rng.randint(1, 28))
    days = rng.randint(28, 61)
    start = end - timedelta(days=days)
    due = end + timedelta(days=rng.randint(12, 25))
    return start, end, due


def derive_consumption(
    rng: random.Random,
    utility_type: str,
    audience: str,
    period_end: date,
) -> tuple[float | None, float | None, float | None]:
    power_kw = None
    kwh = None
    smc = None
    if audience == "domestic":
        if utility_type in {"electricity", "dual"}:
            annual = rng.uniform(1200, 4500)
            kwh = round((annual / 12.0) * seasonal_factor(period_end.month, "electricity", audience), 0)
            power_kw = rng.choice([3.0, 4.5, 6.0])
        if utility_type in {"gas", "dual"}:
            annual = rng.uniform(500, 1800)
            smc = round((annual / 12.0) * seasonal_factor(period_end.month, "gas", audience), 0)
    else:
        archetype = rng.choice(list(BUSINESS_ARCHETYPES.values()))
        power_kw = round(rng.uniform(*archetype["power"]), 1)
        if utility_type in {"electricity", "dual"}:
            annual = rng.uniform(*archetype["elec_year"])
            kwh = round((annual / 12.0) * seasonal_factor(period_end.month, "electricity", audience), 0)
        if utility_type in {"gas", "dual"}:
            annual = rng.uniform(*archetype["gas_year"])
            smc = round((annual / 12.0) * seasonal_factor(period_end.month, "gas", audience), 0)
    return power_kw, kwh, smc


def cost_breakdown(
    rng: random.Random,
    utility_type: str,
    audience: str,
    kwh: float | None,
    smc: float | None,
    power_kw: float | None,
) -> tuple[float, float, float, float, float]:
    energy = 0.0
    transport = 0.0
    system = 0.0
    taxes = 0.0
    if utility_type in {"electricity", "dual"} and kwh is not None:
        energy += kwh * rng.uniform(0.14, 0.24)
        transport += 12 + kwh * rng.uniform(0.025, 0.045)
        system += 8 + kwh * rng.uniform(0.018, 0.035)
        if power_kw:
            transport += power_kw * rng.uniform(1.8, 3.2)
    if utility_type in {"gas", "dual"} and smc is not None:
        energy += smc * rng.uniform(0.42, 0.78)
        transport += 10 + smc * rng.uniform(0.05, 0.09)
        system += 7 + smc * rng.uniform(0.015, 0.05)
    taxes = round((energy + transport + system) * (0.08 if audience == "domestic" else 0.1), 2)
    vat = round((energy + transport + system + taxes) * VAT_RATE, 2)
    return round(energy, 2), round(transport, 2), round(system, 2), taxes, vat


def make_invoice_number(rng: random.Random, provider: str, record_index: int) -> str:
    return f"{provider.upper()}/{date.today().year}/{record_index:05d}"


def quality_check(record: dict) -> list[str]:
    issues = []
    fields = record["fields"]
    for required in ["issue_date", "billing_period_start", "billing_period_end", "due_date"]:
        if not fields.get(required):
            issues.append(f"missing_{required}")
    if fields["billing_period_start"] and fields["billing_period_end"] and fields["billing_period_start"] > fields["billing_period_end"]:
        issues.append("period_order_invalid")
    total = fields.get("total_amount_due")
    subtotal = sum(
        value for value in [
            fields.get("cost_energy_or_materia"),
            fields.get("cost_transport_meter"),
            fields.get("cost_system_charges"),
            fields.get("cost_taxes"),
            fields.get("vat_amount"),
        ]
        if isinstance(value, (int, float))
    )
    if isinstance(total, (int, float)) and round(abs(total - subtotal), 2) > 0.05:
        issues.append("total_mismatch")
    return issues


def render_html(record: dict) -> str:
    fields = record["fields"]
    summary_rows = [
        ("Fornitore", record["provider"].title()),
        ("Tipo utenza", record["audience"]),
        ("Numero fattura", fields["invoice_number"]),
        ("Periodo", f"{fields['billing_period_start']} -> {fields['billing_period_end']}"),
        ("Scadenza", fields["due_date"]),
        ("Totale da pagare", f"EUR {fields['total_amount_due']:.2f}"),
        ("POD", fields.get("pod", "")),
        ("PDR", fields.get("pdr", "")),
    ]
    breakdown_rows = [
        ("Spesa energia/materia", fields["cost_energy_or_materia"]),
        ("Trasporto e contatore", fields["cost_transport_meter"]),
        ("Oneri di sistema", fields["cost_system_charges"]),
        ("Imposte", fields["cost_taxes"]),
        ("IVA", fields["vat_amount"]),
    ]
    customer = fields.get("customer_company_name") or fields.get("customer_name")
    rows_html = "\n".join(
        f"<tr><th>{label}</th><td>{value}</td></tr>"
        for label, value in summary_rows
        if value not in ("", None)
    )
    breakdown_html = "\n".join(
        f"<tr><th>{label}</th><td>EUR {value:.2f}</td></tr>"
        for label, value in breakdown_rows
        if isinstance(value, (int, float))
    )
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{record['source_id']}</title>
  <style>
    :root {{
      --paper: #fffdf7;
      --ink: #16202a;
      --accent: #d25b39;
      --muted: #6c737a;
      --line: #ded7cb;
      --wash: linear-gradient(135deg, #fffdf7 0%, #f7f1e7 100%);
    }}
    body {{
      margin: 0;
      font-family: "Georgia", "Times New Roman", serif;
      background: radial-gradient(circle at top right, rgba(210,91,57,0.08), transparent 32%), #efe8db;
      color: var(--ink);
    }}
    .sheet {{
      max-width: 860px;
      margin: 32px auto;
      padding: 28px;
      background: var(--wash);
      box-shadow: 0 24px 80px rgba(22, 32, 42, 0.14);
      border: 1px solid rgba(22, 32, 42, 0.08);
      position: relative;
      overflow: hidden;
    }}
    .watermark {{
      position: absolute;
      top: 22px;
      right: -70px;
      transform: rotate(18deg);
      background: rgba(210,91,57,0.14);
      color: var(--accent);
      padding: 8px 96px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-size: 13px;
    }}
    h1 {{
      margin: 0 0 6px;
      font-size: 34px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }}
    p {{
      color: var(--muted);
      margin: 0 0 18px;
    }}
    .grid {{
      display: grid;
      gap: 22px;
      grid-template-columns: 2fr 1fr;
    }}
    .panel {{
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.6);
      padding: 18px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }}
    th, td {{
      padding: 9px 0;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }}
    .hero {{
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 20px;
    }}
    .total {{
      text-align: right;
    }}
    .total strong {{
      display: block;
      font-size: 14px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}
    .total span {{
      font-size: 42px;
      color: var(--accent);
      font-weight: 700;
    }}
    @media (max-width: 740px) {{
      .sheet {{
        margin: 0;
        min-height: 100vh;
      }}
      .grid {{
        grid-template-columns: 1fr;
      }}
      .hero {{
        flex-direction: column;
        align-items: flex-start;
      }}
      .total {{
        text-align: left;
      }}
    }}
  </style>
</head>
<body>
  <main class="sheet">
    <div class="watermark">FACSIMILE / DATI SINTETICI</div>
    <section class="hero">
      <div>
        <h1>Bolletta sintetica</h1>
        <p>Documento sintetico generato da struttura pubblica, con dati integralmente inventati.</p>
        <p><strong>Cliente:</strong> {customer}<br><strong>Indirizzo fornitura:</strong> {fields['address_supply']}</p>
      </div>
      <div class="total">
        <strong>Totale da pagare</strong>
        <span>EUR {fields['total_amount_due']:.2f}</span>
      </div>
    </section>
    <section class="grid">
      <div class="panel">
        <h2>Riepilogo</h2>
        <table>{rows_html}</table>
      </div>
      <div class="panel">
        <h2>Costi</h2>
        <table>{breakdown_html}</table>
      </div>
    </section>
  </main>
</body>
</html>"""


def main() -> None:
    ensure_dirs()
    rng = random.Random(SEED)
    extracted = [read_json(path) for path in sorted(EXTRACTED_JSON_DIR.glob("*.json"))]

    synthetic_records = []
    counts = Counter()

    record_index = 1
    for utility_type, audience, count in MIX:
        for _ in range(count):
            template = pick_template(extracted, utility_type, audience, rng)
            start, end, due = issue_dates(rng)
            power_kw, kwh, smc = derive_consumption(rng, utility_type, audience, end)
            energy, transport, system, taxes, vat = cost_breakdown(rng, utility_type, audience, kwh, smc, power_kw)
            total = round(energy + transport + system + taxes + vat, 2)
            customer_name, customer_company, vat_or_tax, address = build_party(rng, audience)
            provider = template["provider"]
            invoice_number = make_invoice_number(rng, provider, record_index)
            reading_type = rng.choices(
                ["actual", "estimated", "conguaglio"],
                weights=[0.55, 0.25, 0.20],
            )[0]
            record = {
                "source_id": f"synthetic-{record_index:04d}",
                "provider": provider,
                "utility_type": utility_type,
                "audience": audience if rng.random() > 0.2 else ("non_domestic" if audience == "business" else audience),
                "language": "it",
                "document_kind": "sample_bill",
                "fields": {
                    "supplier_name": template["fields"].get("supplier_name") or provider.title(),
                    "supplier_vat": random_vat(rng),
                    "customer_name": customer_name,
                    "customer_company_name": customer_company,
                    "customer_vat": vat_or_tax if audience != "domestic" else "",
                    "customer_tax_code": vat_or_tax if audience == "domestic" else random_tax_code(rng),
                    "invoice_number": invoice_number,
                    "issue_date": end.isoformat(),
                    "billing_period_start": start.isoformat(),
                    "billing_period_end": end.isoformat(),
                    "due_date": due.isoformat(),
                    "currency": "EUR",
                    "total_amount_due": total,
                    "pod": random_pod(rng) if utility_type in {"electricity", "dual"} else "",
                    "pdr": random_pdr(rng) if utility_type in {"gas", "dual"} else "",
                    "contract_account_id": f"CLI{rng.randint(1000000, 9999999)}",
                    "tariff_name": template["fields"].get("tariff_name") or rng.choice(["Prezzo Fisso", "Indicizzata", "PLacet", "Business Mono"]),
                    "supply_voltage": "BT" if utility_type in {"electricity", "dual"} else "",
                    "committed_power_kw": power_kw if utility_type in {"electricity", "dual"} else None,
                    "available_power_kw": round(power_kw * 1.1, 1) if power_kw and utility_type in {"electricity", "dual"} else None,
                    "consumption_kwh": kwh if utility_type in {"electricity", "dual"} else None,
                    "consumption_smc": smc if utility_type in {"gas", "dual"} else None,
                    "reading_type": reading_type,
                    "cost_energy_or_materia": energy,
                    "cost_transport_meter": transport,
                    "cost_system_charges": system,
                    "cost_taxes": taxes,
                    "vat_amount": vat,
                    "payment_method": rng.choice(["Addebito diretto SDD", "Bollettino pagoPA", "Bonifico", "Carta di credito"]),
                    "address_supply": address,
                    "address_billing": address if rng.random() > 0.3 else random_address(rng),
                },
                "raw_text_excerpt": f"FACSIMILE / DATI SINTETICI {provider} {utility_type} {invoice_number}",
                "page_count": rng.randint(3, 6),
                "source_url": f"synthetic://template/{template['source_id']}",
                "template_source_id": template["source_id"],
                "einvoice_metadata": None,
            }
            if audience == "business" and rng.random() < 0.45:
                record["einvoice_metadata"] = {
                    "cedente_prestatore": {
                        "denominazione": record["fields"]["supplier_name"],
                        "id_fiscale_iva": record["fields"]["supplier_vat"],
                    },
                    "cessionario_committente": {
                        "denominazione": record["fields"]["customer_company_name"],
                        "id_fiscale_iva": record["fields"]["customer_vat"],
                    },
                    "dati_generali_documento": {
                        "numero": invoice_number,
                        "data": end.isoformat(),
                        "importo_totale_documento": total,
                        "aliquota_iva": 22,
                    },
                }

            issues = quality_check(record)
            if issues:
                raise RuntimeError(f"synthetic quality failure for {record['source_id']}: {issues}")
            synthetic_records.append(record)
            counts[(utility_type, audience)] += 1
            record_index += 1

    write_json(SYNTHETIC_JSON_DIR / "synthetic_bills.json", synthetic_records)
    ndjson_path = SYNTHETIC_JSON_DIR / "synthetic_bills.ndjson"
    ndjson_path.write_text(
        "\n".join(json.dumps(record, ensure_ascii=False) for record in synthetic_records),
        encoding="utf-8",
    )

    rendered = synthetic_records[:100]
    gallery_items = []
    for record in rendered:
        filename = f"{slugify(record['source_id'])}.html"
        path = HTML_RENDER_DIR / filename
        path.write_text(render_html(record), encoding="utf-8")
        gallery_items.append((record["source_id"], filename, record["provider"], record["utility_type"], record["audience"]))

    gallery = [
        "<!doctype html><html lang='it'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>",
        "<title>Gallery facsimili sintetici</title>",
        "<style>body{font-family:Georgia,serif;background:#f5efe7;color:#17212a;padding:24px}h1{margin-top:0}ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;list-style:none;padding:0}li{background:#fff;border:1px solid #ddd6c6;padding:16px}a{color:#b5482a;text-decoration:none;font-weight:700}</style></head><body>",
        "<h1>Gallery facsimili sintetici</h1><p>Tutti i documenti mostrano il watermark FACSIMILE / DATI SINTETICI.</p><ul>",
    ]
    for source_id, filename, provider, utility_type, audience in gallery_items:
        gallery.append(
            f"<li><a href='./{filename}'>{source_id}</a><br>{provider} / {utility_type} / {audience}</li>"
        )
    gallery.append("</ul></body></html>")
    (HTML_RENDER_DIR / "index.html").write_text("".join(gallery), encoding="utf-8")

    summary = {
        "seed": SEED,
        "record_count": len(synthetic_records),
        "html_render_count": len(rendered),
        "mix": {f"{utility}__{audience}": count for (utility, audience), count in sorted(counts.items())},
    }
    write_json(SYNTHETIC_JSON_DIR / "synthetic_summary.json", summary)
    print(
        f"synthetic_records={len(synthetic_records)} html_renders={len(rendered)} "
        f"output_dir={SYNTHETIC_JSON_DIR}"
    )


if __name__ == "__main__":
    main()

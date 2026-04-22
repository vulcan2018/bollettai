# BollettAI

AI-powered energy bill analysis for Italian SMEs, plus a local pipeline for building a provenance-preserving corpus of public Italian utility-bill references and a derived synthetic dataset.

## App Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Dataset Pipeline

The repository now includes a Python-only pipeline under `scripts/` that:

1. downloads public reference PDFs from official supplier, ARERA, and Agenzia Entrate domains
2. writes `data/index/index.csv` with provenance, content type, hash, and verification status
3. extracts structured fields into normalized JSON with raw text by page and OCR fallback when native PDF text is sparse
4. emits a field crosswalk and provider-specific label summary
5. generates 500 synthetic JSON bills and 100 HTML facsimiles watermarked `FACSIMILE / DATI SINTETICI`

### Folder Layout

```text
data/raw_pdfs
data/extracted_json
data/synthetic_json
data/index
scripts
```

### Requirements

- Python 3.10+
- `pdftotext`
- `pdfinfo`
- `pdftoppm`
- `tesseract`

These tools are used directly by the extractor; no extra Python packages are required.

### Run The Full Pipeline

```bash
python3 scripts/run_pipeline.py
```

Or run step-by-step:

```bash
python3 scripts/download_sources.py
python3 scripts/extract_bills.py
python3 scripts/normalize_crosswalk.py
python3 scripts/generate_synthetic.py
```

## Deliverables Produced

- `data/index/sources.json`
- `data/index/index.csv`
- `data/index/provenance.json`
- `data/index/field_crosswalk.json`
- `data/index/provider_agnostic_schema.json`
- `data/index/provider_specific_schema.json`
- `data/raw_pdfs/*.pdf`
- `data/extracted_json/*.json`
- `data/synthetic_json/synthetic_bills.json`
- `data/synthetic_json/synthetic_bills.ndjson`
- `data/synthetic_json/synthetic_summary.json`
- `data/synthetic_json/html_renders/*.html`

## Provenance And Safety Notes

- The downloader keeps source URL, provider, utility type, audience, content type, download timestamp, and SHA-256 hash.
- Failed or stale public links remain visible in `index.csv` with error notes so the corpus is auditable.
- Synthetic records never reuse real names, VAT numbers, tax IDs, addresses, PODs, PDRs, or invoice numbers from the downloaded references.
- HTML renders are illustrative only and intentionally marked `FACSIMILE / DATI SINTETICI`.
- The extractor is heuristic: public PDFs include guides, glossaries, facsimiles, and regulatory references, so field completeness varies by source.

## Existing Product Features

- Upload energy bills (PDF or image)
- AI extracts and analyzes all data
- Identifies errors and overcharges
- Suggests optimization opportunities
- Estimates potential savings

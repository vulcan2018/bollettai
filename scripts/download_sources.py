from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from bill_pipeline_lib import (
    INDEX_COLUMNS,
    INDEX_CSV_PATH,
    PROVENANCE_PATH,
    RAW_PDF_DIR,
    compute_sha256,
    download_bytes,
    ensure_dirs,
    load_sources,
    pdfinfo_page_count,
    stable_pdf_filename,
    write_csv,
    write_json,
)


def main() -> None:
    ensure_dirs()
    sources = load_sources()
    rows = []
    provenance: dict[str, dict[str, str | int | None]] = {}
    seen_hashes: dict[str, str] = {}

    for source in sources:
        filename = stable_pdf_filename(source)
        target_path = RAW_PDF_DIR / filename
        downloaded_at = datetime.now(timezone.utc).isoformat()
        notes = source.get("notes", "")
        content_type = ""
        status = "failed"
        sha256 = ""
        page_count = ""

        try:
            payload, headers = download_bytes(source["url"])
            content_type = headers.get("content-type", "")
            target_path.write_bytes(payload)
            sha256 = compute_sha256(target_path)
            duplicate_filename = seen_hashes.get(sha256)
            if duplicate_filename:
                target_path.unlink(missing_ok=True)
                filename = duplicate_filename
                target_path = RAW_PDF_DIR / filename
                status = "duplicate"
                notes = f"{notes} | duplicate_of={duplicate_filename}".strip(" |")
            else:
                if target_path.suffix.lower() != ".pdf":
                    raise ValueError("downloaded file does not have .pdf suffix")
                page_count_value = pdfinfo_page_count(target_path)
                if page_count_value is None:
                    raise ValueError("pdfinfo could not read the downloaded document")
                page_count = str(page_count_value)
                seen_hashes[sha256] = filename
                status = "downloaded"
                notes = f"{notes} | verified_pdf=true".strip(" |")
        except Exception as exc:
            target_path.unlink(missing_ok=True)
            notes = f"{notes} | download_error={type(exc).__name__}:{exc}".strip(" |")

        rows.append(
            {
                "id": source["id"],
                "provider": source["provider"],
                "utility_type": source["utility_type"],
                "audience": source["audience"],
                "title": source["title"],
                "url": source["url"],
                "filename": filename if status in {"downloaded", "duplicate"} else "",
                "downloaded_at": downloaded_at,
                "content_type": content_type,
                "notes": notes,
                "status": status,
                "sha256": sha256,
                "page_count": page_count,
            }
        )

        provenance[source["id"]] = {
            "source_url": source["url"],
            "filename": filename if status in {"downloaded", "duplicate"} else None,
            "sha256": sha256 or None,
            "status": status,
            "downloaded_at": downloaded_at,
            "document_kind": source.get("document_kind"),
            "page_count": int(page_count) if page_count else None,
        }

    write_csv(INDEX_CSV_PATH, rows, INDEX_COLUMNS)
    write_json(PROVENANCE_PATH, provenance)
    downloaded = sum(1 for row in rows if row["status"] == "downloaded")
    duplicates = sum(1 for row in rows if row["status"] == "duplicate")
    failed = sum(1 for row in rows if row["status"] == "failed")
    print(
        f"downloaded={downloaded} duplicate={duplicates} failed={failed} "
        f"index={INDEX_CSV_PATH}"
    )


if __name__ == "__main__":
    main()

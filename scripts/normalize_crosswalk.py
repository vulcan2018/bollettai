from __future__ import annotations

from collections import defaultdict
from pathlib import Path

from bill_pipeline_lib import (
    CANONICAL_FIELD_KEYS,
    CANONICAL_SCHEMA_PATH,
    EXTRACTED_JSON_DIR,
    FIELD_CROSSWALK,
    FIELD_CROSSWALK_PATH,
    PROVIDER_SCHEMA_PATH,
    read_json,
    write_json,
)


def main() -> None:
    extracted_files = sorted(EXTRACTED_JSON_DIR.glob("*.json"))
    provider_summary: dict[str, dict[str, object]] = defaultdict(
        lambda: {"source_ids": [], "documents": 0, "labels_found": defaultdict(int)}
    )

    for path in extracted_files:
        payload = read_json(path)
        provider = payload["provider"]
        summary = provider_summary[provider]
        summary["documents"] = int(summary["documents"]) + 1
        summary["source_ids"].append(payload["source_id"])
        labels_found = summary["labels_found"]
        assert isinstance(labels_found, defaultdict)
        for canonical, labels in payload.get("crosswalk_hits", {}).items():
            for label in labels:
                labels_found[f"{canonical}::{label}"] += 1

    crosswalk_payload = {
        "canonical_fields": CANONICAL_FIELD_KEYS,
        "crosswalk": FIELD_CROSSWALK,
    }
    write_json(FIELD_CROSSWALK_PATH, crosswalk_payload)

    provider_specific = {}
    for provider, summary in provider_summary.items():
        labels_found = summary["labels_found"]
        provider_specific[provider] = {
            "documents": summary["documents"],
            "source_ids": sorted(summary["source_ids"]),
            "labels_found": dict(sorted(labels_found.items())),
        }
    write_json(PROVIDER_SCHEMA_PATH, provider_specific)

    canonical_schema = {
        "type": "object",
        "description": "Provider-agnostic normalized Italian utility bill schema used by the extractor and synthetic generator.",
        "required": [
            "source_id",
            "provider",
            "utility_type",
            "audience",
            "language",
            "document_kind",
            "fields",
            "source_url",
        ],
        "properties": {
            "source_id": {"type": "string"},
            "provider": {"type": "string"},
            "utility_type": {"type": "string", "enum": ["electricity", "gas", "dual", "other"]},
            "audience": {"type": "string", "enum": ["domestic", "business", "non_domestic", "unknown"]},
            "language": {"type": "string"},
            "document_kind": {"type": "string"},
            "fields": {
                "type": "object",
                "properties": {
                    key: {"type": ["string", "number", "null"]} for key in CANONICAL_FIELD_KEYS
                },
            },
            "field_confidence": {"type": "object"},
            "crosswalk_hits": {"type": "object"},
            "raw_text_excerpt": {"type": "string"},
            "raw_text_by_page": {"type": "array"},
            "page_count": {"type": ["integer", "null"]},
            "source_url": {"type": "string"},
        },
    }
    write_json(CANONICAL_SCHEMA_PATH, canonical_schema)

    print(
        f"crosswalk={FIELD_CROSSWALK_PATH} "
        f"provider_schema={PROVIDER_SCHEMA_PATH} "
        f"canonical_schema={CANONICAL_SCHEMA_PATH}"
    )


if __name__ == "__main__":
    main()

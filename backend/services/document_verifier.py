"""
YojnaSetu — AI-assisted Government Document Verifier
----------------------------------------------------
This module performs PRELIMINARY document validation.

It does NOT prove that a document is officially authentic.
It:
1. extracts text from PDF/image documents,
2. runs format checks for common government IDs,
3. extracts useful fields,
4. compares extracted fields with the citizen profile where possible,
5. returns a structured verification result.

OCR is powered by Tesseract through pytesseract.
"""

from __future__ import annotations

import io
import re
from typing import Any, Dict, List, Optional

from PIL import Image, ImageOps
import pytesseract
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def _configure_tesseract() -> None:
    """Find the Tesseract executable on Windows/Linux automatically."""
    import os
    import shutil

    # First use PATH, which is the normal installation method.
    detected = shutil.which("tesseract")
    if detected:
        pytesseract.pytesseract.tesseract_cmd = detected
        return

    # Common Windows installation locations.
    if os.name == "nt":
        candidates = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(
                r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"
            ),
        ]

        for candidate in candidates:
            if os.path.exists(candidate):
                pytesseract.pytesseract.tesseract_cmd = candidate
                return


_configure_tesseract()


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

SUPPORTED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
}


def _normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _normalize_name(value: Any) -> str:
    value = _normalize_text(value).lower()
    return re.sub(r"[^a-z0-9 ]+", "", value)


def _name_matches(profile_name: str, extracted_name: str) -> bool:
    p = _normalize_name(profile_name)
    e = _normalize_name(extracted_name)

    if not p or not e:
        return False

    if p == e:
        return True

    p_tokens = set(p.split())
    e_tokens = set(e.split())

    if not p_tokens or not e_tokens:
        return False

    overlap = len(p_tokens & e_tokens) / max(len(p_tokens), len(e_tokens))
    return overlap >= 0.5


def _ocr_image(image: Image.Image) -> str:
    image = image.convert("RGB")

    # Lightweight preprocessing for cleaner OCR.
    gray = ImageOps.grayscale(image)
    gray = ImageOps.autocontrast(gray)

    # Upscale small documents.
    if gray.width < 1400:
        scale = 1400 / max(gray.width, 1)
        gray = gray.resize(
            (int(gray.width * scale), int(gray.height * scale))
        )

    try:
        return pytesseract.image_to_string(gray, config="--psm 6")
    except pytesseract.pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR is not installed or is not available in PATH. "
            "Install Tesseract OCR and restart the backend."
        ) from exc


def _extract_text_from_bytes(
    content: bytes,
    content_type: str,
) -> Dict[str, Any]:
    if content_type == "application/pdf":
        if fitz is None:
            raise RuntimeError(
                "PDF support is not installed. Please install PyMuPDF."
            )

        doc = fitz.open(stream=content, filetype="pdf")
        try:
            page_text = []

            for page in doc:
                text = page.get_text("text") or ""

                # If a page contains little/no text, OCR the rendered page.
                if len(text.strip()) < 40:
                    pix = page.get_pixmap(
                        matrix=fitz.Matrix(2, 2),
                        alpha=False,
                    )
                    image = Image.open(io.BytesIO(pix.tobytes("png")))
                    text = _ocr_image(image)

                page_text.append(text)

            return {
                "text": "\n".join(page_text),
                "page_count": len(doc),
            }
        finally:
            doc.close()

    image = Image.open(io.BytesIO(content))
    return {
        "text": _ocr_image(image),
        "page_count": 1,
    }



def detect_document_type(text: str) -> Dict[str, Any]:
    """
    Detect the likely government-document type from OCR text.

    This is a preliminary classifier, not an official document-authenticity
    service. It returns the best matching type plus a confidence score.
    """
    clean = _normalize_text(text).lower()

    scores = {
        "Aadhaar": 0,
        "PAN": 0,
        "Income Certificate": 0,
        "Caste Certificate": 0,
        "Domicile Certificate": 0,
        "Bank Account": 0,
        "Ration Card": 0,
        "Disability Certificate": 0,
        "Land Records": 0,
        "Birth Certificate": 0,
        "Education Certificate": 0,
    }

    keyword_weights = {
        "Aadhaar": [
            ("aadhaar", 6),
            ("uidai", 5),
            ("unique identification", 4),
        ],
        "PAN": [
            ("income tax department", 4),
            ("permanent account number", 6),
            ("pan", 3),
        ],
        "Income Certificate": [
            ("income certificate", 7),
            ("annual income", 3),
            ("income", 1),
        ],
        "Caste Certificate": [
            ("caste certificate", 7),
            ("scheduled caste", 4),
            ("scheduled tribe", 4),
            ("other backward class", 4),
            ("social category", 2),
        ],
        "Domicile Certificate": [
            ("domicile certificate", 7),
            ("residence certificate", 5),
            ("resident of", 2),
        ],
        "Bank Account": [
            ("bank account", 5),
            ("account number", 4),
            ("ifsc", 5),
            ("micr", 4),
            ("savings account", 3),
        ],
        "Ration Card": [
            ("ration card", 7),
            ("food and civil supplies", 4),
            ("fair price shop", 4),
        ],
        "Disability Certificate": [
            ("disability certificate", 7),
            ("benchmark disability", 5),
            ("person with disability", 5),
            ("disability percentage", 4),
        ],
        "Land Records": [
            ("land record", 6),
            ("survey number", 5),
            ("7/12", 7),
            ("seven twelve", 5),
            ("khasra", 5),
            ("property card", 4),
        ],
        "Birth Certificate": [
            ("birth certificate", 7),
            ("date of birth", 3),
            ("registrar of births", 5),
        ],
        "Education Certificate": [
            ("marksheet", 6),
            ("mark sheet", 6),
            ("certificate", 1),
            ("university", 3),
            ("board examination", 4),
            ("school", 2),
            ("college", 2),
        ],
    }

    for doc_type, keywords in keyword_weights.items():
        for keyword, weight in keywords:
            if keyword in clean:
                scores[doc_type] += weight

    # Strong format signals.
    compact = clean.upper().replace(" ", "")
    if re.search(r"(?<![A-Z0-9])[A-Z]{5}\d{4}[A-Z](?![A-Z0-9])", compact):
        scores["PAN"] += 8

    if re.search(r"(?<!\d)\d{4}\d{4}\d{4}(?!\d)", compact):
        scores["Aadhaar"] += 8

    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]
    sorted_scores = sorted(scores.values(), reverse=True)

    if best_score <= 0:
        return {
            "detected_type": "Unknown",
            "confidence": 0,
            "scores": scores,
        }

    second_score = sorted_scores[1] if len(sorted_scores) > 1 else 0

    # Higher confidence when the top signal clearly beats the runner-up.
    confidence = min(
        98,
        max(
            45,
            int(
                min(1.0, best_score / 12.0) * 70
                + min(1.0, (best_score - second_score) / 8.0) * 28
            ),
        ),
    )

    return {
        "detected_type": best_type,
        "confidence": confidence,
        "scores": scores,
    }


def _extract_fields(document_type: str, text: str) -> Dict[str, Any]:
    clean = _normalize_text(text)

    fields: Dict[str, Any] = {
        "document_number": None,
        "name": None,
        "date_of_birth": None,
        "pincode": None,
    }

    # Aadhaar: 12 digits, usually written as 4-4-4.
    aadhaar = re.search(
        r"(?<!\d)(\d{4}\s?\d{4}\s?\d{4})(?!\d)",
        clean,
    )

    # PAN: five letters + four digits + one letter.
    pan = re.search(
        r"(?<![A-Z0-9])([A-Z]{5}\d{4}[A-Z])(?![A-Z0-9])",
        clean.upper(),
    )

    pincode = re.search(r"(?<!\d)(\d{6})(?!\d)", clean)

    dob = re.search(
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
        clean,
    )

    if document_type.lower() == "aadhaar" and aadhaar:
        fields["document_number"] = re.sub(r"\s+", "", aadhaar.group(1))
    elif document_type.lower() == "pan" and pan:
        fields["document_number"] = pan.group(1)

    if dob:
        fields["date_of_birth"] = dob.group(1)

    if pincode:
        fields["pincode"] = pincode.group(1)

    # Heuristic name extraction from common labels.
    name_match = re.search(
        r"(?:name|full name)\s*[:\-]?\s*"
        r"([A-Za-z][A-Za-z .]{2,60})",
        clean,
        flags=re.IGNORECASE,
    )

    if name_match:
        candidate = name_match.group(1).strip()
        candidate = re.split(
            r"\b(?:dob|date|birth|gender|male|female|address)\b",
            candidate,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0].strip()
        fields["name"] = candidate

    return fields


def _run_checks(
    document_type: str,
    fields: Dict[str, Any],
    profile: Dict[str, Any],
    text: str,
) -> Dict[str, Any]:
    checks: List[Dict[str, Any]] = []
    dtype = document_type.lower()

    document_number = fields.get("document_number")

    if dtype == "aadhaar":
        valid_format = bool(
            document_number and re.fullmatch(r"\d{12}", document_number)
        )
        checks.append(
            {
                "check": "Aadhaar number format",
                "status": "passed" if valid_format else "failed",
                "message": (
                    "12-digit Aadhaar-like number detected."
                    if valid_format
                    else "A 12-digit Aadhaar-like number was not detected."
                ),
            }
        )

    elif dtype == "pan":
        valid_format = bool(
            document_number
            and re.fullmatch(r"[A-Z]{5}\d{4}[A-Z]", document_number)
        )
        checks.append(
            {
                "check": "PAN format",
                "status": "passed" if valid_format else "failed",
                "message": (
                    "PAN-like alphanumeric format detected."
                    if valid_format
                    else "A PAN-like number was not detected."
                ),
            }
        )

    else:
        checks.append(
            {
                "check": "Document text extraction",
                "status": "passed" if text.strip() else "failed",
                "message": (
                    "Readable text was extracted from the document."
                    if text.strip()
                    else "No readable text was extracted."
                ),
            }
        )

    extracted_name = fields.get("name")
    profile_name = profile.get("name")

    if extracted_name and profile_name:
        matched = _name_matches(profile_name, extracted_name)
        checks.append(
            {
                "check": "Name vs citizen profile",
                "status": "passed" if matched else "warning",
                "message": (
                    "The extracted name is consistent with the profile name."
                    if matched
                    else (
                        "The extracted name does not clearly match the "
                        "profile name."
                    )
                ),
            }
        )
    else:
        checks.append(
            {
                "check": "Name vs citizen profile",
                "status": "warning",
                "message": "A reliable name comparison could not be completed.",
            }
        )

    if fields.get("date_of_birth"):
        checks.append(
            {
                "check": "Date of birth extraction",
                "status": "passed",
                "message": f"Date-like value detected: {fields['date_of_birth']}.",
            }
        )

    if fields.get("pincode"):
        checks.append(
            {
                "check": "PIN code extraction",
                "status": "passed",
                "message": f"PIN-like value detected: {fields['pincode']}.",
            }
        )

    return {
        "checks": checks,
    }


def verify_document(
    *,
    filename: str,
    content: bytes,
    content_type: str,
    document_type: str,
    profile: Dict[str, Any],
) -> Dict[str, Any]:
    if len(content) > MAX_FILE_SIZE:
        raise ValueError("File is too large. Maximum allowed size is 10 MB.")

    if content_type not in SUPPORTED_TYPES:
        raise ValueError("Only JPG, PNG and PDF files are supported.")

    extracted = _extract_text_from_bytes(content, content_type)
    text = extracted["text"]

    if not text.strip():
        return {
            "status": "NEEDS_REVIEW",
            "confidence": 0,
            "document_type": document_type,
            "filename": filename,
            "extracted_fields": {},
            "checks": [
                {
                    "check": "OCR text extraction",
                    "status": "failed",
                    "message": (
                        "No readable text was detected. "
                        "Please upload a clearer document image."
                    ),
                }
            ],
            "warning": (
                "This is a preliminary AI-assisted check, not an official "
                "government authenticity verification."
            ),
            "ocr_text_preview": "",
        }

    detected = detect_document_type(text)

    if detected["detected_type"] != "Unknown":
        fields_document_type = detected["detected_type"]
    else:
        fields_document_type = document_type

    fields = _extract_fields(fields_document_type, text)
    check_result = _run_checks(
        fields_document_type,
        fields,
        profile,
        text,
    )

    checks = check_result["checks"]

    # Compare the user's selected type against the type detected from OCR.
    declared = _normalize_text(document_type).lower()
    detected_type = _normalize_text(detected["detected_type"]).lower()

    type_matches = (
        detected["detected_type"] == "Unknown"
        or declared == detected_type
    )

    if detected["detected_type"] != "Unknown":
        checks.append(
            {
                "check": "Selected type vs detected type",
                "status": "passed" if type_matches else "failed",
                "message": (
                    f"Document appears to be {detected['detected_type']}."
                    if type_matches
                    else (
                        f"You selected {document_type}, but OCR signals "
                        f"suggest {detected['detected_type']}."
                    )
                ),
            }
        )
    else:
        checks.append(
            {
                "check": "Selected type vs detected type",
                "status": "warning",
                "message": (
                    "The document type could not be detected confidently."
                ),
            }
        )

    failed = sum(item["status"] == "failed" for item in checks)
    warnings = sum(item["status"] == "warning" for item in checks)
    passed = sum(item["status"] == "passed" for item in checks)

    if failed >= 1:
        status = "INVALID_OR_MISMATCH"
    elif warnings >= 1:
        status = "NEEDS_REVIEW"
    else:
        status = "VALID_LOOKING"

    total = max(len(checks), 1)
    confidence = round((passed / total) * 100)

    return {
        "status": status,
        "confidence": confidence,
        "selected_document_type": document_type,
        "detected_document_type": detected["detected_type"],
        "detection_confidence": detected["confidence"],
        "document_type": fields_document_type,
        "filename": filename,
        "page_count": extracted["page_count"],
        "extracted_fields": fields,
        "checks": checks,
        "warning": (
            "This result indicates document consistency/format only. "
            "It does not establish official authenticity or validity."
        ),
        "ocr_text_preview": text[:1200],
    }

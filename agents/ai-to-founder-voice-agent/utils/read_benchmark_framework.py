"""Utilities to read the Benchmarking Framework PDF from the repository assets.

This module locates `assets/Benchmarking_Framework.pdf` by walking up from this
file's directory and extracts text. It returns a single string containing the
extracted textual content or None on failure.
"""
from pathlib import Path
from typing import Optional


def _find_assets_file(filename: str = "Benchmarking_Framework.pdf") -> Optional[Path]:
	"""Search this file's directory and parent directories for assets/<filename>.

	Returns the Path if found, otherwise None.
	"""
	here = Path(__file__).resolve()
	for p in [here] + list(here.parents):
		candidate = p / "assets" / filename
		if candidate.is_file():
			return candidate
	return None


def read_benchmark_framework_text() -> Optional[str]:
	"""Locate and extract text from `assets/Benchmarking_Framework.pdf`.

	Returns:
		str: Extracted text if successful.
		None: if the file is missing or text extraction fails.
	"""
	pdf_path = _find_assets_file()
	if not pdf_path:
		return None

	# Use PyMuPDF (fitz) for extraction. Requirements include PyMuPDF.
	try:
		import fitz  # PyMuPDF

		text_parts = []
		with fitz.open(str(pdf_path)) as doc:
			for page in doc:
				try:
					page_text = page.get_text("text") or ""
				except Exception:
					page_text = ""
				if page_text:
					text_parts.append(page_text)

		return "\n\n".join(text_parts) if text_parts else None
	except Exception:
		# No fallback: surface failure as None
		return None


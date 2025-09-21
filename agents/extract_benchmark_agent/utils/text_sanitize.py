"""
    Some extracted content from web URLs contains non printable / garbled characters. This helper is to sanitize such texts.

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""
import re
import unicodedata

PRINTABLE_ASCII_RE = re.compile(r'[^\x20-\x7E]+')   # non-printable/basic-ascii
# 4+ repeated word chars -> collapse
REPEAT_CHARS_RE = re.compile(r'(\w)\1{3,}')
# 11+ any-char repeats -> collapse
REPEAT_ANY_RE = re.compile(r'(.)\1{10,}')


def remove_control_chars(s: str) -> str:
    # Remove unicode control categories (C*) and non-printable ASCII
    return ''.join(ch for ch in s if unicodedata.category(ch)[0] != 'C')


def collapse_repeats(s: str) -> str:
    # collapse runs of the same letter (e.g., 'aaaaa' -> 'aa') and very long any-char runs
    # keep at most 2 repeats for word chars
    s = REPEAT_CHARS_RE.sub(r'\1\1', s)
    # keep at most 2 repeats for any char
    s = REPEAT_ANY_RE.sub(r'\1\1', s)
    return s


def sanitize_text(s: str, max_len: int = 1200) -> str:
    if not s:
        return ""
    # 1) normalize and remove control chars
    s = remove_control_chars(s)
    # 2) replace non-printable ASCII if desired (optional)
    s = PRINTABLE_ASCII_RE.sub(' ', s)
    # 3) collapse repeated characters
    s = collapse_repeats(s)
    # 4) collapse multiple whitespace and trim
    s = re.sub(r'\s+', ' ', s).strip()
    # 5) truncate
    if len(s) > max_len:
        s = s[:max_len].rsplit(' ', 1)[0] + "..."
    return s

"""Compatibility entrypoint.

Use ``uvicorn app:app`` (preferred) or ``uvicorn main:app``.
"""

from app import app

__all__ = ["app"]

from __future__ import annotations

import math
from typing import Sequence


def euclidean_distance(a: Sequence[float], b: Sequence[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Descriptor length mismatch")
    return math.sqrt(sum((float(x) - float(y)) ** 2 for x, y in zip(a, b, strict=True)))


def is_face_match(
    live: Sequence[float],
    stored: Sequence[float],
    threshold: float,
) -> tuple[bool, float]:
    distance = euclidean_distance(live, stored)
    return distance <= threshold, distance


def validate_descriptor(descriptor: list[float], expected_size: int = 128) -> list[float]:
    if len(descriptor) != expected_size:
        raise ValueError(f"Expected {expected_size}-d face descriptor, got {len(descriptor)}")
    return [float(x) for x in descriptor]

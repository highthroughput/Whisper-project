#!/usr/bin/env python3
"""Transcribe an audio file to text using faster-whisper (large-v3-turbo, CPU).

Usage:
    python3 transcribe.py path/to/audio.mp3

Writes path/to/audio.txt next to the input file.
"""

import argparse
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def transcribe(audio_path: Path) -> Path:
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(audio_path))

    output_path = audio_path.with_suffix(".txt")
    with open(output_path, "w", encoding="utf-8") as f:
        for segment in segments:
            f.write(segment.text.strip() + "\n")

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Transcribe an audio file with faster-whisper.")
    parser.add_argument("audio_path", type=Path, help="Path to the audio file to transcribe")
    args = parser.parse_args()

    if not args.audio_path.is_file():
        sys.exit(f"Error: file not found: {args.audio_path}")

    output_path = transcribe(args.audio_path)
    print(f"Transcript saved to {output_path}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Package a Claude skill into a distributable zip file.

Usage:
    python package_skill.py path/to/skill
    python package_skill.py path/to/skill --output dist/
"""

import argparse
import subprocess
import sys
import zipfile
from pathlib import Path


def validate_skill(skill_path: Path) -> bool:
    """Run validation before packaging."""
    print(f"🔍 Validating skill...")

    validator_script = Path(__file__).parent / "validate_skill.py"

    if not validator_script.exists():
        print("⚠️  Validator script not found, skipping validation")
        return True

    result = subprocess.run(
        [sys.executable, str(validator_script), str(skill_path)],
        capture_output=True,
        text=True
    )

    print(result.stdout)

    if result.returncode != 0:
        print("❌ Validation failed. Fix errors before packaging.")
        return False

    return True


def package_skill(skill_path: Path, output_dir: Path) -> Path:
    """Create a zip file of the skill."""
    skill_name = skill_path.name
    output_file = output_dir / f"{skill_name}.zip"

    print(f"📦 Packaging skill: {skill_name}")

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Create zip file
    with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in skill_path.rglob("*"):
            if file_path.is_file():
                # Skip hidden files and common temporary files
                if any(part.startswith(".") for part in file_path.parts):
                    continue
                if file_path.name.endswith((".pyc", ".pyo", ".swp", "~")):
                    continue
                if file_path.name in ("__pycache__", ".DS_Store"):
                    continue

                # Add file to zip with relative path
                arcname = file_path.relative_to(skill_path.parent)
                zipf.write(file_path, arcname)
                print(f"  + {arcname}")

    return output_file


def main():
    parser = argparse.ArgumentParser(
        description="Package a Claude skill into a distributable zip file"
    )
    parser.add_argument(
        "skill_path",
        type=Path,
        help="Path to skill directory"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("dist"),
        help="Output directory for zip file (default: dist/)"
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip validation before packaging"
    )

    args = parser.parse_args()

    # Validate path
    if not args.skill_path.exists():
        print(f"❌ Error: Skill directory does not exist: {args.skill_path}")
        sys.exit(1)

    if not args.skill_path.is_dir():
        print(f"❌ Error: Path is not a directory: {args.skill_path}")
        sys.exit(1)

    # Check for SKILL.md
    if not (args.skill_path / "SKILL.md").exists():
        print(f"❌ Error: SKILL.md not found in {args.skill_path}")
        sys.exit(1)

    # Validate skill
    if not args.skip_validation:
        if not validate_skill(args.skill_path):
            sys.exit(1)

    # Package skill
    output_file = package_skill(args.skill_path, args.output)

    # Print success
    file_size = output_file.stat().st_size
    size_kb = file_size / 1024

    print(f"\n✅ Skill packaged successfully!")
    print(f"   File: {output_file}")
    print(f"   Size: {size_kb:.1f} KB")
    print(f"\n📤 Upload to Claude.ai: Settings > Features > Skills > Upload")


if __name__ == "__main__":
    main()

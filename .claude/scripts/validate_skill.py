#!/usr/bin/env python3
"""
Validate a Claude skill directory structure and content.

Usage:
    python validate_skill.py path/to/skill
    python validate_skill.py .claude/skills/database-patterns
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple


class SkillValidator:
    def __init__(self, skill_path: Path):
        self.skill_path = skill_path
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def error(self, msg: str):
        self.errors.append(f"❌ {msg}")

    def warning(self, msg: str):
        self.warnings.append(f"⚠️  {msg}")

    def validate_directory(self) -> bool:
        """Check that the skill directory exists."""
        if not self.skill_path.exists():
            self.error(f"Skill directory does not exist: {self.skill_path}")
            return False

        if not self.skill_path.is_dir():
            self.error(f"Path is not a directory: {self.skill_path}")
            return False

        return True

    def validate_skill_md(self) -> bool:
        """Validate SKILL.md exists and has proper structure."""
        skill_md = self.skill_path / "SKILL.md"

        if not skill_md.exists():
            self.error("SKILL.md file not found")
            return False

        content = skill_md.read_text()

        # Check for YAML frontmatter
        if not content.startswith("---\n"):
            self.error("SKILL.md must start with YAML frontmatter (---)")
            return False

        # Extract frontmatter
        parts = content.split("---\n", 2)
        if len(parts) < 3:
            self.error("SKILL.md has malformed YAML frontmatter")
            return False

        frontmatter = parts[1]
        body = parts[2]

        # Validate required fields
        if "name:" not in frontmatter:
            self.error("SKILL.md frontmatter missing 'name' field")
            return False

        if "description:" not in frontmatter:
            self.error("SKILL.md frontmatter missing 'description' field")
            return False

        # Extract name
        name_match = re.search(r"name:\s*(.+)", frontmatter)
        if name_match:
            name = name_match.group(1).strip()

            # Validate name format
            if not re.match(r"^[a-z0-9-]+$", name):
                self.error(f"Skill name must be lowercase kebab-case: '{name}'")

            # Check name matches directory
            if name != self.skill_path.name:
                self.warning(
                    f"Skill name '{name}' doesn't match directory name '{self.skill_path.name}'"
                )

            # Check name length
            if len(name) > 64:
                self.error(f"Skill name too long (max 64 chars): {len(name)}")

        # Extract description
        desc_match = re.search(r"description:\s*(.+?)(?=\n[a-z]+:|$)", frontmatter, re.DOTALL)
        if desc_match:
            description = desc_match.group(1).strip()

            # Check description length
            if len(description) > 1024:
                self.error(f"Description too long (max 1024 chars): {len(description)}")

            if len(description) < 20:
                self.warning("Description is very short (consider adding more detail)")

            # Check for "when to use" guidance
            if "when" not in description.lower() and "use" not in description.lower():
                self.warning("Consider adding 'when to use' guidance to description")

        # Check body content
        if len(body.strip()) < 100:
            self.warning("SKILL.md body is very short")

        # Check for TODO placeholders
        if "TODO" in body or "[Add your" in body or "[Provide" in body:
            self.warning("SKILL.md contains TODO placeholders")

        return True

    def validate_references(self) -> bool:
        """Check references directory and files."""
        references_dir = self.skill_path / "references"

        if references_dir.exists():
            md_files = list(references_dir.glob("*.md"))

            if not md_files:
                self.warning("references/ directory exists but is empty")

            # Check for references in SKILL.md
            skill_md = self.skill_path / "SKILL.md"
            if skill_md.exists():
                skill_content = skill_md.read_text()

                for md_file in md_files:
                    if md_file.name not in skill_content:
                        self.warning(
                            f"Reference file '{md_file.name}' not mentioned in SKILL.md"
                        )

        return True

    def validate_scripts(self) -> bool:
        """Check scripts directory and files."""
        scripts_dir = self.skill_path / "scripts"

        if scripts_dir.exists():
            script_files = list(scripts_dir.glob("*.py")) + list(scripts_dir.glob("*.sh"))

            if not script_files:
                self.warning("scripts/ directory exists but is empty")

            for script_file in script_files:
                # Check if executable
                if not script_file.stat().st_mode & 0o111:
                    self.warning(f"Script is not executable: {script_file.name}")

                # Check for shebang
                first_line = script_file.read_text().split("\n")[0]
                if not first_line.startswith("#!"):
                    self.warning(f"Script missing shebang: {script_file.name}")

        return True

    def validate_assets(self) -> bool:
        """Check assets directory."""
        assets_dir = self.skill_path / "assets"

        if assets_dir.exists():
            asset_files = list(assets_dir.glob("*"))

            if not asset_files:
                self.warning("assets/ directory exists but is empty")

        return True

    def validate_all(self) -> bool:
        """Run all validations."""
        if not self.validate_directory():
            return False

        self.validate_skill_md()
        self.validate_references()
        self.validate_scripts()
        self.validate_assets()

        return len(self.errors) == 0

    def print_report(self):
        """Print validation results."""
        print(f"\n📋 Validating skill: {self.skill_path.name}")
        print("=" * 60)

        if self.errors:
            print("\n❌ Errors:")
            for error in self.errors:
                print(f"  {error}")

        if self.warnings:
            print("\n⚠️  Warnings:")
            for warning in self.warnings:
                print(f"  {warning}")

        if not self.errors and not self.warnings:
            print("\n✅ Skill is valid!")
        elif not self.errors:
            print("\n✅ Skill is valid (with warnings)")
        else:
            print(f"\n❌ Skill validation failed with {len(self.errors)} error(s)")


def main():
    parser = argparse.ArgumentParser(
        description="Validate a Claude skill directory"
    )
    parser.add_argument(
        "skill_path",
        type=Path,
        help="Path to skill directory"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as errors"
    )

    args = parser.parse_args()

    validator = SkillValidator(args.skill_path)
    is_valid = validator.validate_all()
    validator.print_report()

    if not is_valid:
        sys.exit(1)

    if args.strict and validator.warnings:
        print("\n❌ Failed in strict mode due to warnings")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()

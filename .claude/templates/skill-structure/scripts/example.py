#!/usr/bin/env python3
"""
Example script showing structure and best practices.

This script demonstrates:
- Proper shebang for executability
- Clear docstring with usage
- Error handling
- Meaningful output

Usage:
    python example.py [--option value]

Example:
    python example.py --verbose
"""

import argparse
import sys


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Example script")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    try:
        # Script logic here
        if args.verbose:
            print("Running in verbose mode...")

        result = perform_operation()

        print(f"✅ Success: {result}")
        return 0

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


def perform_operation():
    """Perform the main operation."""
    # Replace with actual logic
    return "Operation completed"


if __name__ == "__main__":
    sys.exit(main())

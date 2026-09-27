#!/usr/bin/env bash
set -e

# Configures Git to use the version-controlled .githooks directory
HOOKS_DIR="$(git rev-parse --show-toplevel 2>/dev/null)/.githooks"

if [ -d "$HOOKS_DIR" ]; then
  git config core.hooksPath .githooks
  chmod +x .githooks/*
  echo "✓ Git hooks configured successfully! (core.hooksPath = .githooks)"
else
  echo "✗ Error: .githooks directory not found."
  exit 1
fi

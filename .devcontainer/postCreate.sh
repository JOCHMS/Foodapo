#!/usr/bin/env bash
set -euo pipefail

echo "▶ Detecting project type and installing deps…"

# Python - pip/reqs
if [[ -f "requirements.txt" ]]; then
  echo "• Installing Python requirements.txt"
  pip install -r requirements.txt
fi

# Python - pyproject/poetry
if [[ -f "pyproject.toml" ]]; then
  if grep -q "\[tool.poetry\]" pyproject.toml; then
    echo "• Poetry project detected"
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
    poetry config virtualenvs.create false
    poetry install --no-interaction --no-ansi
  else
    echo "• PEP 621 project detected (pyproject.toml) -> pip install ."
    pip install -e .
  fi
fi

# Conda (optional)
if [[ -f "environment.yml" ]]; then
  echo "• Conda env detected"
  conda env update -n base -f environment.yml
fi

# Node / TypeScript
if [[ -f "package-lock.json" ]]; then
  echo "• npm project detected"
  npm ci || npm install
elif [[ -f "yarn.lock" ]]; then
  echo "• yarn project detected"
  corepack enable || true
  yarn install --frozen-lockfile || yarn install
elif [[ -f "pnpm-lock.yaml" ]]; then
  echo "• pnpm project detected"
  corepack enable || true
  pnpm install --frozen-lockfile || pnpm install
elif [[ -f "package.json" ]]; then
  echo "• package.json found (no lock) -> npm install"
  npm install
fi

# Pre-commit hooks (optional)
if [[ -f ".pre-commit-config.yaml" ]]; then
  pip install pre-commit
  pre-commit install
fi

echo "✅ Post-create complete."

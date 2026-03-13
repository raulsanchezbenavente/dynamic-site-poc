#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node build-launcher-and-run.js
echo ""
echo "Done. Closing in 5 seconds..."
sleep 5

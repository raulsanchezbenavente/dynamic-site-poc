#!/bin/zsh
cd "$(dirname "$0")"
node build-launcher-and-run.js
status=$?
echo ""
if [ "$status" -eq 0 ]; then
  echo "Done. Press any key to close..."
else
  echo "Failed (exit code $status). Press any key to close..."
fi
read -k 1
exit $status

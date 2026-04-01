#!/bin/zsh
cd "$(dirname "$0")"
node build-launcher-and-run.js
exit_code=$?
if [ "$exit_code" -eq 0 ]; then
  echo ""
  echo "Done. Exiting in 5 seconds..."
  sleep 5
  exit 0
fi

echo ""
echo "Failed (exit code $exit_code). Press any key to close..."
read -k 1
exit $exit_code

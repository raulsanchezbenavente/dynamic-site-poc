#!/bin/zsh
cd "$(dirname "$0")"
node build-launcher-and-run.js
status=$?
if [ "$status" -eq 0 ]; then
  echo ""
  echo "Done. Exiting in 10 seconds..."
  sleep 10
  exit 0
fi

echo ""
echo "Failed (exit code $status). Press any key to close..."
read -k 1
exit $status

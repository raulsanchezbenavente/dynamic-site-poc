#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This helper is only needed on Linux."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node was not found in PATH."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to grant permission for port 443."
  exit 1
fi

if ! command -v setcap >/dev/null 2>&1; then
  echo "setcap is required. Install libcap2-bin (Debian/Ubuntu) or libcap (RHEL/Fedora)."
  exit 1
fi

node_bin="$(readlink -f "$(command -v node)")"
existing_caps="$(getcap "$node_bin" 2>/dev/null || true)"

if [[ "$existing_caps" == *"cap_net_bind_service=ep"* ]] || [[ "$existing_caps" == *"cap_net_bind_service+ep"* ]]; then
  echo "Port 443 permission is already configured for $node_bin"
  exit 0
fi

echo "Granting permission to bind privileged ports to: $node_bin"
sudo setcap 'cap_net_bind_service=+ep' "$node_bin"
echo "Done. Current capabilities:"
getcap "$node_bin"
echo "You can now run npm start without sudo and keep HTTPS on port 443."

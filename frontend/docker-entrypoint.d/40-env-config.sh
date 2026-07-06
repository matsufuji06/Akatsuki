#!/bin/sh
set -eu

API_BASE_URL="${API_BASE_URL:-/api/v1}"
API_BASE_URL="${API_BASE_URL%/}"

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.apiBaseUrl = "${API_BASE_URL}";
EOF

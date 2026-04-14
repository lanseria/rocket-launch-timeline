#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

INSTALL_CMD=(pnpm install)
VERIFY_CMD=(pnpm dev)

echo "==> 当前目录: $PWD"
echo "==> 同步依赖"
"${INSTALL_CMD[@]}"

echo "==> 启动命令: pnpm dev"
echo "==> 展示页面: http://localhost:3005/"
echo "==> 控制面板: http://localhost:3005/control"

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> 启动应用"
  exec "${VERIFY_CMD[@]}"
fi

echo "如果希望 init.sh 直接启动应用，请设置 RUN_START_COMMAND=1。"

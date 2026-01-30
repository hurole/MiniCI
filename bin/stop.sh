#!/bin/bash
set -e
echo "Stopping Frontend"
nginx -s stop
echo "Stopping Backend"
pm2 stop MiniCI
echo "Stopped successfully"

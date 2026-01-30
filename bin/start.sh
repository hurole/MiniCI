#!/bin/bash
set -e
echo "Starting Frontend"
nginx -c /Users/zf-server1/Desktop/MiniCi/apps/web/nginx.conf
echo "starting Backend"
pm2 start apps/server/dist/app.js --name "MiniCI"
echo "Started successfully"

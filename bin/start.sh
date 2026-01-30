#!/bin/bash
set -e
echo "Starting Frontend"
nginx -c /Users/zf-server1/Desktop/MiniCi/apps/web/nginx.conf
echo "starting Backend"
(cd apps/server && pm2 start dist/app.js --name "MiniCI")
echo "Started successfully"

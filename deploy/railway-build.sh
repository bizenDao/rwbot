#!/bin/bash

echo "Building for Railway deployment..."

# TypeScriptコンパイル
echo "Compiling TypeScript..."
npx tsc --project tsconfig.railway.json

# 環境変数ファイルのコピー（本番環境ではRailwayの環境変数を使用）
if [ -f ".env.railway" ]; then
    echo "Found .env.railway file (for local testing only)"
fi

echo "Build completed successfully!"
echo "Start command: node dist/index-railway.js"
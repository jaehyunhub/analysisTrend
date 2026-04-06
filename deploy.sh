#!/bin/bash
# deploy.sh — 서버에서 한 번만 실행하면 됨
set -e

echo "=== SyukaUniverse 배포 스크립트 ==="

# 1) 최신 코드 pull
git pull origin main

# 2) 이미지 재빌드 + 컨테이너 재시작
#    DOMAIN 환경변수는 .env 파일에서 읽어옴
docker compose down
docker compose build --no-cache
docker compose up -d

echo ""
echo "=== 배포 완료 ==="
docker compose ps

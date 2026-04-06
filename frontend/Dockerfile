# 1. 의존성 설치 및 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time 환경변수 (docker-compose build args로 전달)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ANALYSIS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ANALYSIS_URL=$NEXT_PUBLIC_ANALYSIS_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 단계
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]

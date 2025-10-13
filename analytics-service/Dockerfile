FROM node:18-alpine

WORKDIR /app

COPY analytics-service/package*.json ./

RUN npm ci --only=production

COPY analytics-service/src/ ./src/
COPY file-db.js ./
COPY simple-db.json ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "src/server.js"]
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl-dev

WORKDIR /app

COPY package.json ./

RUN npm install --no-audit --no-fund

RUN npm install -D typescript

COPY src/prisma ./src/prisma/

RUN npx prisma generate

COPY . .

RUN npx tsc -b || npx tsc --project tsconfig.json

FROM node:18-alpine AS production

ENV NODE_ENV=production

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/package.json /app/

COPY --from=builder /app/src/prisma /app/src/prisma/

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/.bin /app/node_modules/.bin
COPY --from=builder /app/dist /app/dist

RUN npm install --omit=dev --no-audit --no-fund

RUN find /app/node_modules/.prisma/client -mindepth 1 -maxdepth 1 -type d ! -name "*$(node -e 'console.log(process.platform)')*" -exec rm -rf {} +

RUN npm cache clean --force && \
    rm -rf /root/.npm /root/.node-gyp /tmp/*

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
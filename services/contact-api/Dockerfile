FROM node:22.23.4
ENV NODE_ENV=production DATA_DIR=/data
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY app.js index.js ./
RUN mkdir /data && chown node:node /data
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "index.js"]

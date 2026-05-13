FROM node:20-alpine
WORKDIR /app/services/ms-reportes
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
COPY shared/ /app/shared/
COPY services/ms-reportes/package*.json ./
RUN npm install --omit=dev
COPY services/ms-reportes/src/ ./src/
EXPOSE 3006
CMD ["node", "src/index.js"]

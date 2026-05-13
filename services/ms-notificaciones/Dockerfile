FROM node:20-alpine
WORKDIR /app/services/ms-notificaciones
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
COPY shared/ /app/shared/
COPY services/ms-notificaciones/package*.json ./
RUN npm install --omit=dev
COPY services/ms-notificaciones/src/ ./src/
EXPOSE 3005
CMD ["node", "src/index.js"]

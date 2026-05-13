FROM node:20-alpine
WORKDIR /app/services/ms-reasignacion
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
COPY shared/ /app/shared/
COPY services/ms-reasignacion/package*.json ./
RUN npm install --omit=dev
COPY services/ms-reasignacion/src/ ./src/
EXPOSE 3002
CMD ["node", "src/index.js"]

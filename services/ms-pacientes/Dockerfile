FROM node:20-alpine
WORKDIR /app/services/ms-pacientes
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
COPY shared/ /app/shared/
COPY services/ms-pacientes/package*.json ./
RUN npm install --omit=dev
COPY services/ms-pacientes/src/ ./src/
EXPOSE 3003
CMD ["node", "src/index.js"]

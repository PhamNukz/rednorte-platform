FROM node:20-alpine
WORKDIR /app/services/ms-agenda-medica
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
COPY shared/ /app/shared/
COPY services/ms-agenda-medica/package*.json ./
RUN npm install --omit=dev
COPY services/ms-agenda-medica/src/ ./src/
EXPOSE 3004
CMD ["node", "src/index.js"]

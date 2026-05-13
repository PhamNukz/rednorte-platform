FROM node:20-alpine
WORKDIR /app/services/ms-lista-espera
# Instalar dependencias del módulo compartido
COPY shared/package.json /app/shared/
RUN cd /app/shared && npm install --omit=dev
# Copiar código compartido
COPY shared/ /app/shared/
# Instalar dependencias del servicio
COPY services/ms-lista-espera/package*.json ./
RUN npm install --omit=dev
# Copiar código del servicio
COPY services/ms-lista-espera/src/ ./src/
EXPOSE 3001
CMD ["node", "src/index.js"]

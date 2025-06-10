FROM node:22.14.0


WORKDIR /app


COPY package*.json ./


RUN npm install --omit=dev

# Copiar el resto del código
COPY . .


EXPOSE 8080

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]

#------------------------------------------------------------------#
# Dockerfile para redis-ws-bridge
FROM node:18

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el contenido del bridge (código + package.json)
COPY . .

# Instalar dependencias de Node.js
RUN npm install

# Comando de arranque
CMD ["npm", "start"]
#------------------------------------------------------------------#

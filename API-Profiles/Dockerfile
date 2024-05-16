# Utiliza la imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el código fuente de la API de logs
COPY . .

# Instala las dependencias
RUN npm install

# CMD para ejecutar la aplicación de logs
CMD ["node", "./API-Profiles/routes.js"]
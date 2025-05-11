// Importación de las dependencias necesarias
const express = require('express');  // Framework web para Node.js
const { connectDB } = require('./config/dbconnect'); // Importar la función de conexión a Couchbase
const app = express(); // Crear una instancia de Express
const router = require('./routes/index'); // Importar las rutas definidas

// Middleware para procesar JSON en las peticiones
app.use(express.json());

// Función asíncrona para iniciar el servidor
const startServer = async () => {
  try {
    // Primero nos conectamos a la base de datos Couchbase
    await connectDB();
    
    // Configuramos las rutas de la aplicación
    app.use('/', router);

    // Iniciamos el servidor en el puerto 3001
    const port = 3001;
    app.listen(port, () => {
      console.log(`El servidor está en el puerto ${port}`);
    });
  } catch (error) {
    // Si hay algún error durante el inicio, lo mostramos y terminamos la aplicación
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

// Iniciamos el servidor llamando a la función startServer
startServer();
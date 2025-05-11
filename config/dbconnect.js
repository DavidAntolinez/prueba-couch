// Importación del SDK de Couchbase
const couchbase = require('couchbase');

// Variables globales para mantener las conexiones activas
// Estas variables se comparten entre todas las partes de la aplicación
let cluster;  // Conexión al cluster de Couchbase
let bucket;   // Referencia al bucket específico
let collection; // Referencia a la colección específica

// Función asíncrona para establecer la conexión con Couchbase
const connectDB = async () => {
  try {
    // Establecer conexión con el cluster de Couchbase
    // 'couchbase://localhost' es la URL del servidor
    cluster = await couchbase.connect('couchbase://localhost', {
      username: 'usuario',
      password: 'password'
    });

    // Obtener una referencia al bucket 'test-bucket'
    bucket = cluster.bucket('test-bucket');

    // Obtener una referencia a la colección específica dentro del scope
    collection = bucket.scope('test-scope').collection('test-collection');

    console.log('Couchbase conectado exitosamente');
    return { cluster, bucket, collection };
  } catch (error) {
    // Si hay un error en la conexión, lo mostramos y propagamos
    console.error('Error al conectar a Couchbase:', error);
    throw error;
  }
};

// Exportamos las funciones y getters necesarios
module.exports = { 
  connectDB,  // Función para conectar a la base de datos
  getCollection: () => collection,  // Getter para obtener la colección
  getCluster: () => cluster,        // Getter para obtener el cluster
  getBucket: () => bucket           // Getter para obtener el bucket
};



// Importación de las dependencias necesarias
const express = require('express');
const router = express.Router();
const { getCluster, getCollection } = require('../config/dbconnect');
const { DurabilityLevel } = require('couchbase');
const crypto = require('crypto');

// Ruta GET para obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    // Consulta N1QL para obtener todos los documentos de la colección
    const query = `
    SELECT * FROM \`test-bucket\`.\`test-scope\`.\`test-collection\`
    `;
    let result = await getCluster().query(query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Hubo un problema al obtener los usuarios.' });
  }
});

// Ruta POST para crear un nuevo usuario
router.post("/crear", async (req, res) => {
  try {
    // Validación del cuerpo de la petición
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: 'El cuerpo de la petición está vacío',
        mensaje: 'Debes enviar un objeto JSON con firstName, lastName y email'
      });
    }

    const { firstName, lastName, email } = req.body;

    // Validación de campos requeridos
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        mensaje: 'Todos los campos (firstName, lastName, email) son obligatorios'
      });
    }

    // Generar un ID único para el documento
    const docId = crypto.randomUUID();
    // Insertar el nuevo usuario en la colección
    const result = await getCollection().insert(docId, {docId, firstName, lastName, email });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Hubo un problema al crear el usuario.' });
  }
});

// Ruta PUT para actualizar un usuario existente
router.put("/actualizar", async (req, res) => {
  // Validación del cuerpo de la petición
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: 'El cuerpo de la petición está vacío',
      mensaje: 'Debes enviar un objeto JSON con docId, firstName, lastName y email'
    });
  }

  const { docId, firstName, lastName, email } = req.body;

  // Validación de campos requeridos
  if (!docId || !firstName || !lastName || !email) {
    return res.status(400).json({
      error: 'Faltan campos requeridos',
      mensaje: 'Todos los campos (docId, firstName, lastName, email) son obligatorios'
    });
  }

  try {
    // Obtener el usuario existente
    const result = await getCollection().get(docId);

    // Actualizar los campos del usuario
    const user = result.content;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    // Opciones para la operación de reemplazo
    const replaceOpts = {
      expiry: 0, // Sin expiración
      durabilityLevel: DurabilityLevel.None // Sin requisitos de durabilidad
    };

    // Reemplazar el documento en la colección
    const usuarioActualizado = await getCollection().replace(docId, user, replaceOpts);
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    // Manejo específico para documento no encontrado
    if( error = 'DocumentNotFoundError'){
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Hubo un problema al actualizar el usuario.' });
  }
});

// Ruta DELETE para eliminar un usuario
router.delete("/eliminar", async (req, res) => {
  const { docId } = req.body;

  // Validación del ID del documento
  if (!docId) {
    return res.status(400).json({ error: 'El campo "docId" es obligatorio.' });
  }

  try {
    // Verificar si el documento existe
    await getCollection().get(docId);

    // Eliminar el documento
    const eliminarUsuario = await getCollection().remove(docId);
    res.status(200).json(eliminarUsuario);
  } catch (error) {
    // Manejo específico para documento no encontrado
    if( error = 'DocumentNotFoundError'){
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Hubo un problema al eliminar el usuario.' });
  }
});

module.exports = router;
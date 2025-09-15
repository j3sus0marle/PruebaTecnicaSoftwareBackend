// routes/inventario.ts
import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

export default (connection: mysql.Connection) => {
  // Obtener todo el inventario
  router.get('/', async (req: express.Request, res: express.Response) => {
    try {
      const [results] = await connection.query('SELECT id, nombre, categoria, cantidad, ubicacion FROM inventario');
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener inventario' });
    }
  });

  // Agregar item
  router.post('/', async (req: express.Request, res: express.Response) => {
    const { nombre, categoria, cantidad, ubicacion } = req.body;
    if (!nombre || !categoria || !cantidad || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    try {
      const [result] = await connection.query(
        'INSERT INTO inventario (nombre, categoria, cantidad, ubicacion) VALUES (?, ?, ?, ?)',
        [nombre, categoria, cantidad, ubicacion]
      );
      const id = (result as any).insertId;
      res.status(201).json({ message: 'Item agregado correctamente', id });
    } catch (err) {
      res.status(500).json({ error: 'Error al agregar item al inventario' });
    }
  });

  // Eliminar item
  router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Falta el id del producto' });
    }
    try {
      const [result] = await connection.query('DELETE FROM inventario WHERE id = ?', [id]);
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  });

  // Actualizar item
  router.put('/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { nombre, categoria, cantidad, ubicacion } = req.body;
    if (!id || !nombre || !categoria || cantidad === undefined || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    try {
      const [result] = await connection.query(
        'UPDATE inventario SET nombre = ?, categoria = ?, cantidad = ?, ubicacion = ? WHERE id = ?',
        [nombre, categoria, cantidad, ubicacion, id]
      );
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  });

  return router;
};
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
const app = express();
const port = 3001;

app.use(express.json()); // Para recibir JSON en el body

// Habilitar CORS para todas las rutas
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

let connection;
(async () => {
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'pruebaTecnica'
    });
    console.log('Conectado a MySQL');
  } catch (err) {
    console.error('Error de conexión:', err);
  }
})();

// Método GET para obtener todo el inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const [results] = await connection.query('SELECT id, nombre, categoria, cantidad, ubicacion FROM inventario');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Método POST para agregar item al inventario
app.post('/api/inventario', async (req, res) => {
  const { nombre, categoria, cantidad, ubicacion } = req.body;
  if (!nombre || !categoria || !cantidad || !ubicacion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const [result] = await connection.query(
      'INSERT INTO inventario (nombre, categoria, cantidad, ubicacion) VALUES (?, ?, ?, ?)',
      [nombre, categoria, cantidad, ubicacion]
    );
    const id = result.insertId;
    res.status(201).json({ message: 'Item agregado correctamente', id });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar item al inventario' });
  }
});

// Eliminar item del inventario por nombre
// Eliminar item del inventario por id
app.delete('/api/inventario/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Falta el id del producto' });
  }
  try {
    const [result] = await connection.query('DELETE FROM inventario WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Actualizar item del inventario por nombre
// Actualizar item del inventario por id
app.put('/api/inventario/:id', async (req, res) => {
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
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

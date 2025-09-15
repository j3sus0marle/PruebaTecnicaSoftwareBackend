import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import inventarioRouter from './routes/inventario.ts';

const app = express();
const port = 3001;

app.use(express.json()); // Para recibir JSON en el body
app.use(cors()); // Habilitar CORS para todas las rutas

app.get('/', (req, res) => {
  res.send('Hello World!');
});

let connection: mysql.Connection;

(async () => {
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'pruebaTecnica'
    });
    console.log('Conectado a MySQL');

    // Usa el router para /api/inventario
    app.use('/api/inventario', inventarioRouter(connection));

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error de conexión:', err);
  }
})();

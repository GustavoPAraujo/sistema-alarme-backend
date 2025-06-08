import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente (como a DATABASE_URL)
dotenv.config();

// Cria uma nova instância do Pool de conexões
// O construtor do Pool lê automaticamente a variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Mensagem para confirmar que a conexão foi estabelecida (opcional)
pool.on('connect', () => {
  console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
});

// Exporta o pool para que outros arquivos possam usá-lo para fazer queries
export default pool;
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3001;

app.use(express.json());


app.post('/usuarios', async (req: Request, res: Response) => {
  try {
    const { nome, celular } = req.body;
    if (!nome || !celular) {
      return res.status(400).json({ error: 'Nome e celular são obrigatórios.' });
    }
    
    const newUser = await pool.query(
      "INSERT INTO usuarios (nome, celular) VALUES ($1, $2) RETURNING *",
      [nome, celular]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
        console.error("Erro ao criar usuário:", err.message);
    } else {
        console.error("Ocorreu um erro desconhecido:", err);
    }
    res.status(500).json({ error: 'Erro no servidor ao criar usuário' });
  }
});

app.get('/usuarios', async (req: Request, res: Response) => {
  try {
    const allUsers = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    res.status(200).json(allUsers.rows);
  } catch (err) {
    if (err instanceof Error) {
        console.error("Erro ao buscar usuários:", err.message);
    } else {
        console.error("Ocorreu um erro desconhecido:", err);
    }
    res.status(500).json({ error: 'Erro no servidor ao buscar usuários' });
  }
});

app.get('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(user.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
        console.error("Erro ao buscar usuário por ID:", err.message);
    } else {
        console.error("Ocorreu um erro desconhecido:", err);
    }
    res.status(500).json({ error: 'Erro no servidor ao buscar usuário' });
  }
});

app.put('/usuarios/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, celular } = req.body;

        if (!nome || !celular) {
            return res.status(400).json({ error: 'Nome e celular são obrigatórios para atualização.' });
        }

        const updatedUser = await pool.query(
            "UPDATE usuarios SET nome = $1, celular = $2 WHERE id = $3 RETURNING *",
            [nome, celular, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado para atualização.' });
        }

        res.status(200).json(updatedUser.rows[0]);
    } catch (err) {
        if (err instanceof Error) {
            console.error("Erro ao atualizar usuário:", err.message);
        } else {
            console.error("Ocorreu um erro desconhecido:", err);
        }
        res.status(500).json({ error: 'Erro no servidor ao atualizar usuário' });
    }
});

app.delete('/usuarios/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado para exclusão.' });
        }

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (err) {
        if (err instanceof Error) {
            console.error("Erro ao deletar usuário:", err.message);
        } else {
            console.error("Ocorreu um erro desconhecido:", err);
        }
        res.status(500).json({ error: 'Erro no servidor ao deletar usuário' });
    }
});

app.listen(port, () => {
  console.log(`Serviço de Usuários rodando na porta ${port}`);
});
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from './db';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3002;
const userServiceUrl = process.env.USER_SERVICE_URL;

app.use(express.json());

// Criar um novo alarme
app.post('/alarmes', async (req: Request, res: Response) => {
    try {
        const { nome, localizacao } = req.body;
        const newAlarm = await pool.query(
            "INSERT INTO alarmes (nome, localizacao) VALUES ($1, $2) RETURNING *",
            [nome, localizacao]
        );
        res.status(201).json(newAlarm.rows[0]);
    } catch (err) {
        if (err instanceof Error) console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor ao criar alarme' });
    }
});

// Associar um usuário a um alarme
app.post('/alarmes/:id/usuarios', async (req: Request, res: Response) => {
    const { id: id_alarme } = req.params;
    const { id_usuario } = req.body;

    try {
        await axios.get(`${userServiceUrl}/usuarios/${id_usuario}`);
        
        const newAssociation = await pool.query(
            "INSERT INTO usuarios_alarmes (id_usuario, id_alarme) VALUES ($1, $2) RETURNING *",
            [id_usuario, id_alarme]
        );
        res.status(201).json(newAssociation.rows[0]);

    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            return res.status(404).json({ error: `Usuário com ID ${id_usuario} não encontrado.` });
        }
        
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            return res.status(409).json({ error: 'Este usuário já está associado a este alarme.' });
        }

        if (err instanceof Error) console.error(err.message);
        res.status(500).json({ error: 'Erro interno no servidor ao associar usuário' });
    }
});

// Listar IDs dos usuários de um alarme
app.get('/alarmes/:id/usuarios', async (req: Request, res: Response) => {
    try {
        const { id: id_alarme } = req.params;
        const users = await pool.query(
            `SELECT id_usuario FROM usuarios_alarmes WHERE id_alarme = $1`,
            [id_alarme]
        );
        res.json(users.rows);
    } catch (err) {
        if (err instanceof Error) console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor ao listar usuários do alarme' });
    }
});

app.listen(port, () => {
    console.log(`🚨 Serviço de Alarmes rodando na porta ${port}`);
});
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3006;

app.use(express.json());


app.post('/logs', async (req: Request, res: Response) => {
    try {
        const { evento, id_alarme, id_usuario, descricao } = req.body;

        if (!evento || !id_alarme) {
            return res.status(400).json({ error: 'Os campos "evento" e "id_alarme" são obrigatórios.' });
        }

        const newLog = await pool.query(
            "INSERT INTO logs (evento, id_alarme, id_usuario, descricao) VALUES ($1, $2, $3, $4) RETURNING *",
            [evento, id_alarme, id_usuario, descricao]
        );

        res.status(201).json(newLog.rows[0]);

    } catch (err) {
        if (err instanceof Error) console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor ao criar log' });
    }
});

app.get('/logs', async (req: Request, res: Response) => {
    try {
        const { id_alarme } = req.query;

        let query = "SELECT * FROM logs";
        const queryParams = [];

        if (id_alarme) {
            query += " WHERE id_alarme = $1";
            queryParams.push(id_alarme);
        }

        query += " ORDER BY timestamp DESC";

        const logs = await pool.query(query, queryParams);
        res.status(200).json(logs.rows);

    } catch (err) {
        if (err instanceof Error) console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor ao buscar logs' });
    }
});


app.listen(port, () => {
    console.log(`Serviço de Logging rodando na porta ${port}`);
});
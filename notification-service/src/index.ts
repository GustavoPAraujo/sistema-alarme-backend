import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3005;
const userServiceUrl = process.env.USER_SERVICE_URL;

app.use(express.json());


app.post('/notificar', async (req: Request, res: Response) => {
    try {
        const { id_usuario, mensagem } = req.body;

        if (!id_usuario || !mensagem) {
            return res.status(400).json({ error: 'Os campos "id_usuario" e "mensagem" são obrigatórios.' });
        }

        const userResponse = await axios.get(`${userServiceUrl}/usuarios/${id_usuario}`);
        const celular = userResponse.data.celular;

        if (!celular) {
            return res.status(404).json({ error: 'Celular do usuário não encontrado.' });
        }
        
        console.log('-------------------------------------------');
        console.log('--- SIMULANDO ENVIO DE NOTIFICAÇÃO (SMS) ---');
        console.log(`--- Destinatário: ${userResponse.data.nome} `);
        console.log(`--- Celular: ${celular} `);
        console.log(`--- Mensagem: "${mensagem}"`);
        console.log('-------------------------------------------');

        res.status(200).json({ success: true, message: `Notificação simulada para o usuário ${id_usuario}` });

    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            return res.status(404).json({ error: `Usuário com ID ${req.body.id_usuario} não encontrado.` });
        }
        
        if (err instanceof Error) {
            console.error("Erro no serviço de notificação:", err.message);
        }
        res.status(500).json({ error: 'Erro interno no serviço de notificação' });
    }
});

app.listen(port, () => {
    console.log(`Serviço de Notificação rodando na porta ${port}`);
});
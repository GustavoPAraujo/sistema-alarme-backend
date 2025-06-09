import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3004;

const alarmServiceUrl = process.env.ALARM_SERVICE_URL;
const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

app.use(express.json());

app.post('/disparar', async (req: Request, res: Response) => {
    const { id_alarme, id_ponto } = req.body;

    if (!id_alarme) {
        return res.status(400).json({ error: 'O id_alarme é obrigatório.' });
    }

    try {
        const logPromise = axios.post(`${loggingServiceUrl}/logs`, {
            evento: 'DISPARO',
            id_alarme: id_alarme,
            id_usuario: null,
            descricao: `Alarme disparado no ponto ${id_ponto || 'desconhecido'}.`
        });

        const usersResponse = await axios.get(`${alarmServiceUrl}/alarmes/${id_alarme}/usuarios`);
        const permittedUsers: { id_usuario: number }[] = usersResponse.data;

        const notificationPromises = permittedUsers.map(user => {
            return axios.post(`${notificationServiceUrl}/notificar`, {
                id_usuario: user.id_usuario,
                mensagem: `ALERTA! O alarme (ID: ${id_alarme}) foi DISPARADO! Disparado no ponto ${id_ponto}`
            });
        });

        await Promise.all([logPromise, ...notificationPromises]);
        
        res.status(200).json({ success: true, message: 'Alarme disparado e notificações enviadas.' });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Erro de comunicação Axios:', error.message);
        } else if (error instanceof Error) {
            console.error(`Erro ao tentar disparar o alarme:`, error.message);
        }
        res.status(500).json({ error: 'Erro interno ao processar o disparo do alarme.' });
    }
});


app.listen(port, () => {
    console.log(`Serviço de Controle de Disparo rodando na porta ${port}`);
});
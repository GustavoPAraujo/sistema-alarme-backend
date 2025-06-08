import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3003;

const alarmServiceUrl = process.env.ALARM_SERVICE_URL;
const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

app.use(express.json());

const handleArmDisarm = async (req: Request, res: Response, action: 'arm' | 'disarm') => {
    const { id_alarme, id_usuario } = req.body;
    const actionText = action === 'arm' ? 'armado' : 'desarmado';
    const eventType = action === 'arm' ? 'ACIONAMENTO' : 'DESARME';

    if (!id_alarme || !id_usuario) {
        return res.status(400).json({ error: 'id_alarme e id_usuario são obrigatórios.' });
    }

    try {
        const usersResponse = await axios.get(`${alarmServiceUrl}/alarmes/${id_alarme}/usuarios`);
        const permittedUsers: { id_usuario: number }[] = usersResponse.data;
        const isPermitted = permittedUsers.some(user => user.id_usuario === id_usuario);

        if (!isPermitted) {
            return res.status(403).json({ error: 'Usuário não tem permissão para este alarme.' });
        }

        await axios.post(`${loggingServiceUrl}/logs`, {
            evento: eventType,
            id_alarme: id_alarme,
            id_usuario: id_usuario,
            descricao: `Alarme ${actionText} pelo usuário ${id_usuario}.`
        });

        await axios.post(`${notificationServiceUrl}/notificar`, {
            id_usuario: id_usuario,
            mensagem: `O alarme foi ${actionText} por você.`
        });

        res.status(200).json({ success: true, message: `Alarme ${actionText} com sucesso.` });

    } catch (error) {
        console.error(`Erro ao tentar ${actionText} o alarme:`, error);
        res.status(500).json({ error: `Erro interno ao ${actionText} o alarme.` });
    }
};

app.post('/acionar', (req, res) => handleArmDisarm(req, res, 'arm'));

app.post('/desarmar', (req, res) => handleArmDisarm(req, res, 'disarm'));

app.listen(port, () => {
    console.log(`Serviço de Controle de Acionamento rodando na porta ${port}`);
});
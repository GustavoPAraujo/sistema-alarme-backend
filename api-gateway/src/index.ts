
import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Pega a porta do .env ou usa 3000 como padrão
const port = process.env.API_PORT || 3000;

// Middleware para permitir que o gateway entenda JSON no corpo das requisições
app.use(express.json());

// Função simples para logar as requisições que chegam no gateway
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Gateway] Recebida ${req.method} para ${req.originalUrl}`);
  next();
};
app.use(logRequest);


// --- Definição das Rotas de Proxy ---
// Cada rota principal é redirecionada para o microsserviço correspondente

const userServiceUrl = process.env.USER_SERVICE_URL;
const alarmServiceUrl = process.env.ALARM_SERVICE_URL;
const triggerControlServiceUrl = process.env.TRIGGER_CONTROL_SERVICE_URL;
const dispatchControlServiceUrl = process.env.DISPATCH_CONTROL_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;

// Proxy para o Serviço de Usuários
// Qualquer chamada para /usuarios (ex: GET /usuarios, POST /usuarios, GET /usuarios/123)
// será redirecionada para http://localhost:3001
if (userServiceUrl) {
  app.use('/usuarios', proxy(userServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}

// Proxy para o Serviço de Alarmes
if (alarmServiceUrl) {
  app.use('/alarmes', proxy(alarmServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}

// Proxy para o Serviço de Controle de Acionamento
if (triggerControlServiceUrl) {
  app.use('/acionar', proxy(triggerControlServiceUrl));
  app.use('/desarmar', proxy(triggerControlServiceUrl));
}

// Proxy para o Serviço de Controle de Disparo
if (dispatchControlServiceUrl) {
  app.use('/disparar', proxy(dispatchControlServiceUrl));
}

// Proxy para o Serviço de Notificação
if (notificationServiceUrl) {
  app.use('/notificar', proxy(notificationServiceUrl));
}

// Proxy para o Serviço de Logging
if (loggingServiceUrl) {
  app.use('/logs', proxy(loggingServiceUrl));
}


// Rota de status para verificar se o gateway está online
app.get('/status', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'Running',
  });
});


app.listen(port, () => {
  console.log(`🚀 API Gateway rodando na porta ${port}`);
});
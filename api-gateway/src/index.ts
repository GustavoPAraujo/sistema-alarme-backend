
import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const port = process.env.API_PORT || 3000;

app.use(express.json());

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Gateway] Recebida ${req.method} para ${req.originalUrl}`);
  next();
};
app.use(logRequest);



const userServiceUrl = process.env.USER_SERVICE_URL;
const alarmServiceUrl = process.env.ALARM_SERVICE_URL;
const triggerControlServiceUrl = process.env.TRIGGER_CONTROL_SERVICE_URL;
const dispatchControlServiceUrl = process.env.DISPATCH_CONTROL_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;


if (userServiceUrl) {
  app.use('/usuarios', proxy(userServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}


if (alarmServiceUrl) {
  app.use('/alarmes', proxy(alarmServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}


if (triggerControlServiceUrl) {
  app.use('/acionar', proxy(triggerControlServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
  app.use('/desarmar', proxy(triggerControlServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}


if (dispatchControlServiceUrl) {
  app.use('/disparar', proxy(dispatchControlServiceUrl));
}


if (notificationServiceUrl) {
  app.use('/notificar', proxy(notificationServiceUrl, {
    proxyReqPathResolver: function (req) {
      return '/notificar';
    }
  }));
}


if (loggingServiceUrl) {
  app.use('/logs', proxy(loggingServiceUrl, {
    proxyReqPathResolver: function (req) {
      return req.originalUrl;
    }
  }));
}



app.get('/status', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'Running',
  });
});


app.listen(port, () => {
  console.log(`API Gateway rodando na porta ${port}`);
});
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { serverGateways } from 'vizhub-server-gateways';
import { apiController } from 'datavis-tech-controllers';
import { serveFrontend } from './serveFrontend';
//import { serveShareDB } from './serveShareDB';
import { auth } from './auth';

const expressApp = express();
expressApp.use(compression());
expressApp.use(bodyParser.json());
expressApp.use(cookieParser());

auth(expressApp);
serveFrontend(expressApp);

const server = http.createServer(expressApp);

//serveShareDB(server);
//const share = serveShareDB(server);
//const connection = share.connect();

const gateways = serverGateways();
apiController(expressApp, gateways);

const port = 4000;
server.listen(port);
console.log(`Listening at http://localhost:${port}`);

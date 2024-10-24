import express from 'express';
import { juegosFileRouter } from './juegos.file.router.js';  

const router = express.Router();

export function routerTasks(app){
app.use("/api/v1", router);

   router.use("/file/juegos", juegosFileRouter);
}

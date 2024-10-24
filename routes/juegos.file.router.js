import express from 'express';
import { read, write } from '../leito/elMasBonito/files.js';
import dayjs from 'dayjs';
import fs from 'fs';

export const juegosFileRouter = express.Router();


// Middleware para agregar IP y timestamp
const addMetadata = (req, res, next) => {
    const currentDate = dayjs().format('HH:mm DD-MM-YYYY');
    const clientIp = req.ip || req.connection.remoteAddress;
  
    if (req.method === 'POST') {
      // Si es una creación
      req.body.created_at = currentDate;
    } else if (req.method === 'PUT') {
      // Si es una actualización
      req.body.updated_at = currentDate;
    }
  
    req.body.ip = clientIp; // Agregar la IP del remitente
    next();
  };
// Middleware para loggear las requests
  const logRequests = (req, res, next) => {
    const currentTime = dayjs().format('HH:mm DD-MM-YYYY');
    const method = req.method;
    const path = req.originalUrl;
    const headers = JSON.stringify(req.headers);
    const log = `${currentTime} [${method}] [${path}] [${headers}]\n`;
  
    // Escribir el log en el archivo 'access_log.txt'
    fs.appendFile('access_log.txt', log, (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de log', err);
      }
    });
  
    next(); // Pasar al siguiente middleware
  };

juegosFileRouter.get("/", logRequests, (req, res) => {
  const juegos = read();
  const { alquilado, Juego, limit } = req.query;
  let filteredJuegos = juegos;

  if (alquilado !== undefined) {
    const doneBool = alquilado === 'true';
    filteredJuegos = filteredJuegos.filter(juego => juego.alquilado === doneBool);
  }

  if (Juego !== undefined) {
    filteredJuegos = filteredJuegos.filter(juego => juego.Juego.includes(Juego));
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      filteredJuegos = filteredJuegos.slice(0, limitNum);
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(filteredJuegos);
});

  juegosFileRouter.post('/', logRequests,
    (req,res,next) =>{
        console.log(addMetadata);
        next();
      },
      addMetadata,
    (req,res, next) =>{
      const juegos = read();
      const juego = {
          ...req.body, //spread operator
          id: juegos.length +1
      }
      juegos.push(juego);
      write(juegos);
      //Codigo HTTP 201 Created
      res.status(201).json(juegos);
  })

  juegosFileRouter.get('/:id', logRequests, (req, res) =>{
    const juegos = read();
    const juego = juegos.find(juego => juego.id === parseInt(req.params.id));
    if (juego) {
      res.json(juego);
    } else {
        res.status(404).end();
    }
  })

  juegosFileRouter.put('/:id', addMetadata, logRequests, (req,res)=>{
    const juegos = read();
    let juego = juegos.find(juego => juego.id === parseInt(req.params.id));
    if (juego){
      juego = {
        ...juego,
        ...req.body
      }
      //actualizar juegos en el array
      juegos[
        juegos.findIndex(juego => juego.id === parseInt(req.params.id))
      ] = juego;
      write(juegos);
      res.json(juego)
    } else{
      res.status(404).end();
    }
  })

  juegosFileRouter.delete('/:id', logRequests, (req,res) => {
    const juegos = read();
    const juego = juegos.find(juego => juego.id === parseInt(req.params.id));
    if (juego){
      //Eliminar juego
      juegos.splice(
        juegos.findIndex(juego => juego.id === parseInt(req.params.id)),
        1
      );
      write(juegos);
      res.json(juego);
    } else{
      res.status(404).end();
    }
  })
  


  juegosFileRouter.put('/', logRequests, (req, res) => {
    const { field } = req.params;
    const { value } = req.body;
    const currentDate = dayjs().format('HH:mm DD-MM-YYYY');
    const juegos = read();

    juegos.forEach(juego => {
      juego[field] = value;
      juego.updated_at = currentDate;
    });

    write(juegos);
    res.json(juegos);
  });

  
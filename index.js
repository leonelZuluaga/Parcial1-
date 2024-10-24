import express from 'express';
import { routerTasks } from './routes/index.js';

const app = express();

app.use(express.json());

//crear Middleware

routerTasks(app);

app.listen(3000, () => {
  console.log(`Server is running on port 3000`)
})
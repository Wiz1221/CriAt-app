// import session from 'express-session';
// import bodyParser from 'body-parser';
import Debug from 'debug';
import express from 'express';
import logger from 'morgan';

// /* import routes to make them available to app */
import { getAllData } from './controller/data';

const app = express();

const debug = Debug('CriAT-backend:app');

app.use(logger('dev'));

const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/api/data', getAllData);
app.get('/api/data/:id', (req, res) => {
    let id = req.params.id;
    res.json(allData[id]);
});

export default app;
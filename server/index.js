import express from 'express';
import compression from 'compression';
import page from './routes/page';
import imgur from './routes/imgur';
import reddit from './routes/reddit';

const app = express();

app.use('/public', express.static('dist'));
app.use(compression());
app.use(page);
app.use(imgur);
app.use(reddit);

const port = process.env.PORT;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
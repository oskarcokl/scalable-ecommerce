import dotenv from 'dotenv';
import express from 'express';
import routes from './routes';

// Maybe the server should be a service? Or be inside the routes directory
const app = express();
// Middle ware to parse JSON bodies.
app.use(express.json());
// TODO: move to ENV variable, SERVER_PORT

dotenv.config({
    path: '.env.development',
});

app.use('/api', routes);

// NOTE: When it comes to static files I think that the product-catalog-service
// should also take care of storing and serving them. This will mean that the
// endpoint needs to be publicly accessible. Maybe I can just have an API
// gateway of sorts for serving these files and the service just needs to take
// care of storing and linking products to them correctly.
const port = process.env.SERVER_PORT ?? 3000;
app.listen(port, () => {
    console.log('Product catalog service listening on port', port);
});

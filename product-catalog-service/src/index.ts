import express from 'express';
import routes from './routes';

// Maybe the server should be a service? Or be inside the routes directory
const app = express();
// TODO: move to ENV variable, SERVER_PORT

app.use('/api', routes);

// NOTE: When it comes to static files I think that the product-catalog-service
// should also take care of storing and serving them. This will mean that the
// endpoint needs to be publicly accessible. Maybe I can just have an API
// gateway of sorts for serving these files and the service just needs to take
// care of storing and linking products to them correctly.
const port = 3400;
app.listen(port, () => {
    console.log('Product catalog service listening on port', port);
});

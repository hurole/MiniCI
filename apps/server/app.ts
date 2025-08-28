import Koa from 'koa';
import { registerMiddlewares } from './middlewares/index.ts';

const app = new Koa();

registerMiddlewares(app);

app.listen(3000, () => {
  console.log('server started at http://localhost:3000');
});

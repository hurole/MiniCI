import Koa from 'koa';
import { initMiddlewares } from './middlewares/index.ts';

const app = new Koa();

initMiddlewares(app);

app.listen(3000, () => {
  console.log('server started at http://localhost:3000');
});

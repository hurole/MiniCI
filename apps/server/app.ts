import Koa from 'koa';
import { initMiddlewares } from './middlewares/index.ts';
import { log } from './libs/logger.ts';

const app = new Koa();

initMiddlewares(app);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  log.info('APP', 'Server started at port %d', PORT);
});

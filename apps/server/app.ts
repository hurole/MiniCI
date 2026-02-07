import Koa from 'koa';
import { ExecutionQueue } from './libs/execution-queue.ts';
import { log } from './libs/logger.ts';
import { initMiddlewares } from './middlewares/index.ts';

// 初始化应用
async function initializeApp() {
  // 初始化执行队列
  const executionQueue = ExecutionQueue.getInstance();
  await executionQueue.initialize();

  const app = new Koa();

  initMiddlewares(app);

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    log.info('APP', 'Server started at port %d', PORT);
    log.info('QUEUE', 'Execution queue initialized');
  });
}

// 启动应用
initializeApp().catch((error) => {
  log.error('APP', 'Failed to start application:', error);
  process.exit(1);
});

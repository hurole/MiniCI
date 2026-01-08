import pino from 'pino';

class Logger {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
      level: 'debug',
    });
  }

  debug(tag: string, message: string, ...args: unknown[]) {
    if (args.length > 0) {
      this.logger.debug({ TAG: tag }, message, ...(args as []));
    } else {
      this.logger.debug({ TAG: tag }, message);
    }
  }

  info(tag: string, message: string, ...args: unknown[]) {
    this.logger.info({ TAG: tag }, message, ...(args as []));
  }

  error(tag: string, message: string, ...args: unknown[]) {
    this.logger.error({ TAG: tag }, message, ...(args as []));
  }
}

export const log = new Logger();

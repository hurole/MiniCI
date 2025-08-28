import { PrismaClient } from '../generated/prisma/index.js'

const prismaClientSingleton = () => {
  return new PrismaClient();
};

export default prismaClientSingleton();

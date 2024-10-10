import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';

class Account {
  static instance = null;
  constructor(prisma) {
    if (Account.instance) {
      return Account.instance;
    }

    this.prisma = prisma;
    Account.instance = this;
  }

  async createAccount(accountId, password, uuid) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await prisma.accounts.create({
      data: { accountId: accountId, password: hashedPassword, uuid: uuid },
    });
    return account;
  }

  async findAccount(accountId) {
    const account = await prisma.accounts.findUnique({
      where: { accountId },
    });

    return account;
  }
}

// const account = new Account(prisma);
// export default account;

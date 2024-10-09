// import { prisma } from '../utils/prisma/index.js';

class Account {
  static instance = null;
  constructor(prisma) {
    if (Account.instance) {
      return Account.instance;
    }

    this.prisma = prisma;
    Account.instance = this;
  }

  async createAccount(id, hashedPassword, uuid) {
    const account = await prisma.accounts.create({
      data: { id: id, password: hashedPassword, uuid: uuid },
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

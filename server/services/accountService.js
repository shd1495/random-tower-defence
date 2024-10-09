// server/services/accountService.js
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

  // HIGHLIGHT: 계정 추가 부분 uuid (name을 uuid로 해야 하나?)
  async createAccount(accountId, password, uuid) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await prisma.accounts.create({
      data: { id: accountId, password: hashedPassword, name: uuid },
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

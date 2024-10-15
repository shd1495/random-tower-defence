import { prisma } from '../utils/prisma/index.js';

class Account {
  static instance = null;
  constructor(prisma) {
    if (Account.instance) {
      return Account.instance;
    }

    this.prisma = prisma;
    Account.instance = this;
  }

  /**
   * 계정 및 점수 생성
   * @param {String} accountId
   * @param {String} password
   * @param {String} uuid
   * @returns {Object} account
   */
  async createAccount(accountId, password, uuid) {
    const account = await prisma.accounts.create({
      data: {
        accountId: accountId,
        password: password,
        uuid: uuid,
      },
    });

    const scoreData = await prisma.score.create({
      data: {
        accountId: accountId,
      },
    });
    return account;
  }

  /**
   * 회원 아이디로 계정 정보 조회
   * @param {String} accountId
   * @returns {Object || null}
   */
  async findAccount(accountId) {
    const account = await prisma.accounts.findUnique({
      where: { accountId: accountId },
    });

    return account;
  }

  /**
   * Primary key로 계정 정보 조회
   * @param {Int} id
   * @returns {Object || null} account
   */
  async findAccountById(id) {
    const account = await prisma.accounts.findFirst({
      where: { id: id },
    });

    return account;
  }
}

const account = new Account(prisma);
export default account;

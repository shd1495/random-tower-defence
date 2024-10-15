import { prisma } from '../utils/prisma/index.js';

class Score {
  static instance = null;
  constructor(prisma) {
    if (Score.instance) {
      return Score.instance;
    }

    this.prisma = prisma;
    Score.instance = this;
  }

  /**
   * 유저의 최고 기록 조회
   * @param {String} uuid
   * @returns {Int} highScore
   */
  async getHighScore(uuid) {
    const accountWithScore = await prisma.accounts.findUnique({
      where: { uuid },
      include: {
        scores: true,
      },
    });
    const score = accountWithScore?.scores?.[0];

    return score.highScore;
  }

  /**
   * 유저의 최고 기록 갱신
   * @param {String} uuid
   * @param {Int} score
   * @param {Int} timestamp
   */
  async updateHighScore(uuid, score, timestamp) {
    const time = timestamp;
    const date = new Date(time);

    const account = await prisma.accounts.findUnique({
      where: { uuid },
    });
    await prisma.score.update({
      where: { accountId: account.accountId },
      data: {
        highScore: score,
        playAt: date,
      },
    });
  }

  /**
   * 유저들의 최고 기록 조회
   * @param {Int} page
   * @param {Int} limit
   * @returns {Object}
   */
  async getRanking(page, limit) {
    const skip = (page - 1) * limit;

    const totalRankings = await prisma.score.count();

    const rankings = await prisma.score.findMany({
      orderBy: {
        highScore: 'desc',
      },
      skip: skip,
      take: limit,
      include: {
        account: {
          select: {
            accountId: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalRankings / limit);

    return {
      currentPage: page,
      totalPages: totalPages,
      rankings: rankings.map((rank, index) => ({
        rank: skip + index + 1,
        accountId: rank.account.accountId,
        highScore: rank.highScore,
        playAt: rank.playAt,
      })),
    };
  }
}

const score = new Score(prisma);
export default score;

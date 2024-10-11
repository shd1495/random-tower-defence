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
}

const score = new Score(prisma);
export default score;

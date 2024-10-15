import { getUserGold, updateSlowEffectCount, updateUserGold } from '../models/gameModel.js';

export const useSlowEffect = async (uuid, payload) => {
  const { cost, usageCount } = payload;

  try {
    const currentCost = await getUserGold(uuid);
    if (currentCost < cost) {
      return {
        status: 'error',
        message: 'Not enough gold',
      };
    }

    await updateUserGold(uuid, -cost);
    await updateSlowEffectCount(uuid, usageCount);

    const updatedGold = await getUserGold(uuid);

    return {
      status: 'success',
      type: 'slowEffectUsed',
      result: {
        userGold: updatedGold,
        slowEffectCount: usageCount,
      },
    };
  } catch (error) {
    console.error('error in slowEffect: ', error);
    return { status: 'error', message: 'server error' };
  }
};

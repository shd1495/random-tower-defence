import { getUserGold, updateSlowEffectCount, updateUserGold } from '../models/gameModel.js';

export const useSlowEffect = async (uuid, payload) => {
  const { cost, usageCount } = payload;

  try {
    const currentCost = await getUserGold(uuid);
    if (!currentCost) return { status: 'fail', message: 'slowEffect cost not found' };
    if (currentCost < cost) return { status: 'fail', message: 'Not enough gold' };

    await updateUserGold(uuid, -cost);
    await updateSlowEffectCount(uuid, usageCount);

    const updatedGold = await getUserGold(uuid);
    if (!updatedGold) return { status: 'fail', message: 'userGold not found' };

    return {
      status: 'success',
      type: 'slowEffectUsed',
      result: {
        userGold: updatedGold,
        slowEffectCount: usageCount,
      },
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', message: error.message };
  }
};

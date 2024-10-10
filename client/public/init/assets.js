import monsterAssetData from '../assets/dataTables/monster.json' with { type: 'json' };
import towerAssetData from '../assets/dataTables/tower.json' with { type: 'json' };
import userAssetData from '../assets/dataTables/user.json' with { type: 'json' };
import waveLevelAssetData from '../assets/dataTables/waveLevel.json' with { type: 'json' };

const gameAssets = { monsterAssetData, towerAssetData, userAssetData, waveLevelAssetData };

export const getGameAssets = () => {
  return gameAssets;
};

import monsterAssetData from '../assets/dataTables/monster.json' with { type: 'json' };
import towerAssetData from '../assets/dataTables/towers.json' with { type: 'json' };
import gameAssetData from '../assets/dataTables/game.json' with { type: 'json' };
import waveLevelAssetData from '../assets/dataTables/waveLevel.json' with { type: 'json' };

const gameAssets = { monsterAssetData, towerAssetData, gameAssetData, waveLevelAssetData };

export const getGameAssets = () => {
  return gameAssets;
};

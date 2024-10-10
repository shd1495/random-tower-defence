import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../client/public/assets/dataTables');

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAssets = async () => {
  try {
    const [monsters, towers, game, waveLevel] = await Promise.all([
      readFileAsync('monster.json'),
      readFileAsync('towers.json'),
      readFileAsync('game.json'),
      readFileAsync('waveLevel.json'),
    ]);

    gameAssets = { monsters, towers, game, waveLevel };
    return gameAssets;
  } catch (error) {
    throw new Error('assets 파일 로드에 실패했습니다.' + error.message);
  }
};

let gameAssets = {};

export const getGameAssets = () => {
  return gameAssets;
};

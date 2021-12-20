import { createXlsx, xlsxToJson } from "./xlsx";
import { getTempleList } from "./searchList";
import * as fs from 'fs';
import * as path from 'path';
import { fileToBase64, sleep, updateTempleImages } from "./updateTempleImages";

const main = async () => {
  const area = JSON.parse(fs.readFileSync(path.join(__dirname, './area.json'), {encoding: "utf8"}));
  for (const provinceInfo of area) {
    const province = provinceInfo.label;
    for (const regionInfo of provinceInfo.children || []) {
      const region = regionInfo.label;
      const key = `${province}-${region}`;

      const succArea: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, './succArea.json'), {encoding: "utf8"}));
      if (succArea.includes(key)) continue;


      const list = await getTempleList(region);
      if (list.length) {
        list.length && createXlsx(`../outPath/${province}-${region}-【${list.length}】家寺庙.xlsx`, list);
        fs.writeFileSync(path.join(__dirname, './succArea.json'), JSON.stringify([...succArea, key]));
      }
    }
  }

  await sleep(5 * 1000);

  await main();
};

const one = async () => {
  const province = '广东省';
  const region = '江门市';
  const list = await getTempleList(region);
  list.length && createXlsx(`../outPath/${province}-${region}-【${list.length}】家寺庙.xlsx`, list);
};

const updateImage = () => {
  updateTempleImages('../xlsx/广东省-河源市-【66】家寺庙.xlsx', '广东省', '河源市').then();
};

main();

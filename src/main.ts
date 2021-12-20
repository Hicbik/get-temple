import { createXlsx } from "./xlsx";
import { getTempleList } from "./searchList";
import * as fs from 'fs';
import * as path from 'path';
import { sleep } from "./updateTempleImages";

console.log('正在开始运行');
/**
 * 查找全国的寺庙
 */
const main = async () => {
  const area = JSON.parse(fs.readFileSync(path.join(__dirname, './area.json'), {encoding: "utf8"}));
  for (const provinceInfo of area) {
    const province = provinceInfo.label;

    console.log(`正在获取【${province}】...`);

    for (const regionInfo of provinceInfo.children || []) {
      const region = regionInfo.label;
      const key = `${province}-${region}`;

      const xlsxList = fs.readdirSync(path.join(__dirname, '../outPath'));
      if (xlsxList.find((item) => /xlsx/.test(item) && new RegExp(key).test(item))) {
        console.log(`【${key}】已存在！`);
        console.log('--------------------------------');
        continue;
      }

      const list = await getTempleList(region);
      list.length && createXlsx(`../outPath/${province}-${region}-【${list.length}】家寺庙.xlsx`, list);
    }
  }

  await sleep(5 * 1000);

  await main();
};

main().then();

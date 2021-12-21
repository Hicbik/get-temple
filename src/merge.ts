import * as path from 'path';
import * as fs from 'fs';
import { createXlsx, xlsxToJson } from "./tool/xlsx";
import { TempleItem } from "./type";

const main = async () => {
  const gdFileList = fs.readdirSync(path.join(__dirname, '../outPath-gd'));
  const baiduFileList = fs.readdirSync(path.join(__dirname, '../outPath-baidu'));

  let count = 0;

  const area = JSON.parse(fs.readFileSync(path.join(__dirname, './json/area.json'), {encoding: "utf8"}));
  for (const provinceInfo of area) {
    const province = provinceInfo.label;
    for (const regionInfo of provinceInfo.children || []) {
      const region = regionInfo.label;
      const key = `${province}-${region}`;

      const gdFileName = gdFileList.find((item) => /xlsx/.test(item) && new RegExp(key).test(item));
      const baiduFileName = baiduFileList.find((item) => /xlsx/.test(item) && new RegExp(key).test(item));

      const gdList = xlsxToJson(`../../outPath-gd/${gdFileName}`);
      const baiduList = xlsxToJson(`../../outPath-baidu/${baiduFileName}`);
      const togetherList = [...gdList, ...baiduList];

      const templeConf = {};
      const templeList: TempleItem[] = [];

      for (const item of togetherList) {
        if (templeConf[item.placeName]) continue;

        templeConf[item.placeName] = 1;
        templeList.push(item);
      }

      console.log(key);
      console.log(`高德地图：${gdList.length}`);
      console.log(`百度地图：${baiduList.length}`);
      console.log(`合并：${templeList.length}`);
      count += templeList.length;

      if (templeList.length) {
        await createXlsx(`../../merge/${key}-共【${templeList.length}】家.xlsx`, templeList);
      }

      console.log('------------------------------');
    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>');
  }
  console.log(count);
};

main().then();

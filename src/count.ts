import * as fs from 'fs';
import { xlsxToJson } from './tool/xlsx';
import * as path from "path";
import xlsx from "node-xlsx";
import { ColNameStyleList } from "./type";

const main = async () => {
  const area = JSON.parse(fs.readFileSync(path.join(__dirname, './json/area.json'), {encoding: "utf8"}));
  const files = fs.readdirSync(path.join(__dirname, '../merge'));

  let count = 0;

  const workSheets: Array<{ name: string, data: any[] }> = [{name: '1', data: []}];

  for (const provinceInfo of area) {
    const province = provinceInfo.label;

    for (const regionInfo of provinceInfo.children || []) {
      const region = regionInfo.label;

      const fileName = files.find((name) => new RegExp(`${province}-${region}`).test(name));

      if (!fileName) {
        continue;
      }

      const list = xlsxToJson('../../merge/' + fileName);
      console.log(`${province}-${region}：${list.length}`);
      workSheets[0].data.push([province, region, list.length]);
      count += list.length;
    }
  }

  const options = {'!cols': ColNameStyleList};
  const buffer: any = xlsx.build(workSheets, options);
  fs.writeFileSync(path.join(__dirname, `../全国寺庙共【${count}】家.xlsx`), buffer, {'flag': 'w'});
};

main().then();

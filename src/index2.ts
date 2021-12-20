import * as fs from 'fs';
import { createXlsx, xlsxToJson } from './xlsx';
import * as path from "path";
import { getTempleList } from "./searchList";
import xlsx from "node-xlsx";
import { ColNameStyleList } from "./type";

const main = async () => {
  const area = JSON.parse(fs.readFileSync(path.join(__dirname, './area.json'), {encoding: "utf8"}));
  const files = fs.readdirSync(path.join(__dirname, '../1'));

  let count = 0;
  let data = [];

  const workSheets: Array<{ name: string, data: any[] }> = [{name: '1', data: []}];

  for (const provinceInfo of area) {
    const province = provinceInfo.label;

    for (const regionInfo of provinceInfo.children || []) {
      const region = regionInfo.label;

      const fileName = files.find((name) => new RegExp(`${province}-${region}`).test(name));

      // console.log(`${province}-${region}`);
      // console.log(fileName);
      // console.log('------------');

      if (!fileName) {
        continue;
      }

      let list = xlsxToJson('../1/' + fileName);
      list = list.filter((item) => /寺|庵/.test(item.placeName));
      console.log(`${province}-${region}：${list.length}`);
      workSheets[0].data.push([province, region, list.length]);
      count += list.length;
    }
  }

  const options = {'!cols': ColNameStyleList};
  const buffer: any = xlsx.build(workSheets, options);
  fs.writeFileSync(path.join(__dirname, '../demo.xlsx'), buffer, {'flag': 'w'});

  console.log(count);

};

main();

import xlsx from 'node-xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ColNameList, ColNameStyleList, TempleItem } from "../type";

export const createXlsx = (filePath, data: TempleItem[]) => {
  const workSheets: Array<{ name: string, data: any[] }> = [];
  data.forEach((item) => {
    const list = templeItemToXlsxItem(item);
    const index = workSheets.findIndex(({name}) => name === item.area);
    if (index !== -1) {
      workSheets[index].data.push(list);
      return;
    }
    workSheets.push({name: item.area, data: [ColNameList, list]});
  });

  const options = {'!cols': ColNameStyleList};

  const buffer: any = xlsx.build(workSheets, options);

  const outPath = path.join(__dirname, filePath);
  ensureDirectoryExistence(outPath);
  fs.writeFileSync(outPath, buffer, {'flag': 'w'});
};

export const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

export const templeItemToXlsxItem = (item: TempleItem): any[] => {
  const orgPlaceName = item.placeName.replace(item.area, '');
  const address = new RegExp(orgPlaceName, 'g').test(item.address) ? item.address : item.address + orgPlaceName;
  // const address = item.address;
  return [
    '佛教',
    '汉语系',
    item.placeName,
    item.province,
    item.city,
    item.area,
    address,
    item.personCharge || '',
    item.contacts || '',
    `${item.position.latitude}#${item.position.longitude}`,
    item.tag,
    item.picture.length > 0 ? '有' : ''
  ];
};

export const xlsxToJson = (xlsxPath): TempleItem[] => {
  try {
    const sheets: any = xlsx.parse(fs.readFileSync(path.join(__dirname, xlsxPath)));

    const list: TempleItem[] = [];
    sheets.forEach((sheet) => {
      for (const rowId in sheet['data']) {
        let row = sheet['data'][rowId];
        if (row.length < 2) return;

        if (rowId !== '0') {
          const position = row[9].split('#');
          list.push({
            address: row[6],
            area: row[5],
            city: row[4],
            contacts: row[8],
            picture: row[11] === '有' ? ['todo'] : [],
            position: {latitude: position[0], longitude: position[1]},
            province: row[3],
            tag: row[10],
            placeName: row[2],
            personCharge: row[7]
          });
        }
      }
    });
    return list;
  } catch (e) {
    return [];
  }
};

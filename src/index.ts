import { getCrmTempleList, updateTempleImages } from "./tool/updateTempleImages";
import * as fs from "fs";
import * as path from "path";
import { createXlsx, xlsxToJson } from "./tool/xlsx";
import { TempleItem } from "./type";

const updateImage = async () => {
  const list = [
    ["安徽省", "安庆市"],
    ["安徽省", "池州市"],
    ["福建省", "龙岩市"],
    ["福建省", "漳州市"],
    ["河南省", "南阳市"],
    ["河南省", "信阳市"],
    ["湖北省", "黄冈市"],
    ["湖北省", "武汉市"],
    ["湖北省", "孝感市"],
    ["湖南省", "衡阳市"],
    ["湖南省", "邵阳市"],
    ["江苏省", "常州市"],
    ["江苏省", "南通市"],
    ["江苏省", "苏州市"],
    ["江西省", "抚州市"],
    ["江西省", "上饶市"],
    ["陕西省", "宝鸡市"],
    ["陕西省", "汉中市"],
    ["陕西省", "西安市"],
    ["四川省", "广安市"],
    ["四川省", "南充市"],
  ];

  const fileList = fs.readdirSync(path.join(__dirname, '../update'));

  for (const item of list) {
    const province = item[0];
    const city = item[1];
    const key = `${province}-${city}`;

    const fileName = fileList.find((name) => /xlsx/.test(name) && new RegExp(key).test(name));
    await updateTempleImages(`../../update/${fileName}`, province, city);
  }
};

const getContacts = async () => {
  const fileList = fs.readdirSync(path.join(__dirname, '../update'));

  const province = '江西省';
  const city = '抚州市';
  const key = `${province}-${city}`;

  const crmList = await getCrmTempleList(province, city, {positionStatus: 0, state: 0});

  const fileName = fileList.find((name) => /xlsx/.test(name) && new RegExp(key).test(name));
  const list = xlsxToJson('../../update/' + fileName);

  const newList: TempleItem[] = [];

  for (const temple of list) {
    const find = crmList.find((item) => {
      return item.area === temple.area && new RegExp(temple.placeName).test(item.placeName);
    });
    newList.push({
      ...temple,
      personCharge: find?.personCharge ?? temple.personCharge
    });
  }

  createXlsx(`../../personCharge/${key}.xlsx`, newList);
};

getContacts().then();

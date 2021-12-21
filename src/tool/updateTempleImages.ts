import { templeItemToXlsxItem, xlsxToJson } from "./xlsx";
import axios from "axios";
import * as fs from 'fs';
import * as path from 'path';

const URL = 'http://test.server.tmp.heychen.com.cn';
const COOKIES = 'MANAGE_SESS=77e3141dd34024a864d0d43fffbdf1d1; MANAGE_SESS.sig=XNfBHwTWQz3702FWt5w6qIN1x351BUDgXRCEcrDwoXE';
const GROUP_ID = '61396fd1ea2d09631b808830';

// const URL = 'http://prod.server.tmp.heychen.cn';
// const COOKIES = 'SameSite=None; SameSite.sig=vM6MaQ_p2VuipSq0vWf6qV23bmWTYDJwEFhXwyj01HY; MANAGE_SESS=f405cc8055e8976158311a7642d2030d; MANAGE_SESS.sig=FX1xisfcpzs4SZy4Rg8bNyhsTi9XiX1eyVc2NwOpHYk';
// const GROUP_ID = '6194f28001503050113b1619';

export const updateTempleImages = async (xlsxPath, province, city) => {
  const crmTempleList = await getCrmTempleList(province, city);

  const list = xlsxToJson(xlsxPath);
  for (const templeItem of list) {
    const data = templeItemToXlsxItem(templeItem);
    if (!/有/.test(data[11])) continue;

    const find = crmTempleList.find((item) => item.placeName === data[2] && item.address === data[6]);
    if (!find) continue;
    if (find.picture.length > 0) continue;
    const imageFilePath = `../../outPath/${find.province}/${find.city}/${find.area}/${find.placeName}`;
    const prefix = `${find.placeName}`;
    await sleep(1000);
    const picture = await uploadAttach(path.join(__dirname, imageFilePath), prefix);
    const param = {
      religionId: find.religionId,
      picture
    };

    const updateTempleInfoResult = await updateTempleInfo({
      "apiKey": "crm_mgrReligionInfo",
      "data": param,
      "power": {"shopId": "", "menuId": "571gpprqE_TP-qi2kFd", "source": "manage"},
      "timestamp": Date.now()
    });
    console.log(find.placeName);
    console.log(updateTempleInfoResult.data);
    console.log('--------------');
    await sleep(1000 * 2);
  }
};

export const getCrmTempleList = async (province, city) => {
  const crmTempleResult: any = await axios.post(`${URL}/api/comm/getList_crm_mgrReligionInfo`, {
    "apiKey": "crm_mgrReligionInfo",
    "data": {
      "religionName": "",
      "placeName": "",
      "address": "",
      "state": "",
      "positionStatus": 2,
      "faction": "",
      "personCharge": "",
      "tag": "",
      province,
      city,
      "area": ""
    },
    "page": 1,
    "size": 999,
    "power": {"shopId": "", "menuId": "571gpprqE_TP-qi2kFd", "source": "manage"},
    "timestamp": Date.now()
  }, {
    headers: {
      Cookie: COOKIES
    }
  });

  return crmTempleResult?.data?.data?.list ?? [];
};

export const updateTempleInfo = async (param) => {
  return await axios.post(`${URL}/api/comm/modifyInfo_crm_mgrReligionInfo`, param, {
    headers: {
      Cookie: COOKIES
    }
  });
};

export const uploadAttach = async (imagePath, prefix) => {
  const imageFiles = fs.readdirSync(imagePath);

  const files: { name: string, base64: string }[] = [];

  let num = 0;
  for (const file of imageFiles) {
    if (num >= 6) continue;
    files.push({
      base64: fileToBase64(`${imagePath}/${file}`),
      name: prefix + file
    });
    num += 1;
  }

  const res: any = await axios.post(`${URL}/api/comm/insertInfo_system_attachFile`, {
    apiKey: "system_attachFile",
    data: {
      files,
      groupId: GROUP_ID,
      type: "image",
      upload: "local",
    },
    power: {
      menuId: "tS7v46z6MS_WZRiRGZA9N",
      shopId: "",
      source: "manage"
    },
    timestamp: Date.now()
  }, {
    headers: {
      Cookie: COOKIES
    }
  });
  if (res.data && res.data.data) {
    return res.data.data.map((item) => item.url);
  }
  return [];
};

export function fileToBase64(path: string): string {
  const fileData = fs.readFileSync(path);
  return new Buffer(fileData).toString('base64');
}

export async function sleep(time) {
  return await new Promise(resolve => {
    setTimeout(() => resolve(true), time);
  });
}

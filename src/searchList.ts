import axios from "axios";
import { SearchItem, TempleItem } from "./type";
import * as request from "request";
import * as path from "path";
import * as fs from "fs";
import { ensureDirectoryExistence } from "./xlsx";
import { sleep } from "./updateTempleImages";

const AK = 'nNRTn5Rof4b2odABsYr31Zy1FOGIiDeY';

export const getSearchList = async (region, query = '寺庙'): Promise<SearchItem[]> => {
  let list: any[] = [];

  const fn = async (page = 0) => {
    const result: any = await axios.get('https://api.map.baidu.com/place/v2/search', {
      params: {
        query,
        output: 'json',
        ak: AK,
        region,
        scope: 2,
        page_size: 20,
        page_num: page,
        coord_type: 2,
        ret_coordtype: 'gcj02ll',
        tag: '旅游景点、寺庙、文物古迹',
      }
    });
    const data = result?.data?.results ?? [];
    list = [...list, ...data];
    if (list.length < result.data.total) await fn(page + 1);
  };

  await fn(0);
  return list;
};

const getPhotos = async (data: SearchItem, placeName: string) => {
  const result: any = await axios.get('https://map.baidu.com/', {
    params: {
      uid: data.uid,
      info_merge: 1,
      isBizPoi: false,
      ugc_type: 3,
      ugc_ver: 1,
      qt: 'detailConInfo',
      device_ratio: 1,
      compat: 1,
    }
  });
  const photos: string[] = [];
  const comments = result?.data?.content?.ext?.detail_info?.comments ?? [];
  for (const item of comments) {
    const list = item?.comment_photo ?? [];

    const promiseList: any[] = [];
    for (let i = 0; i < list.length; i++) {
      const url = list[i].pic_url;
      photos.push(url);
      promiseList.push(
        downloadImg(url, `../outPath/${data.province}/${data.city}/${data.area}/${placeName}/${i + 1}.jpg`)
      );
    }
    await Promise.all(promiseList);

  }
  return photos;
};

export const downloadImg = async (url, filePath) => {
  const outPath = path.join(__dirname, filePath);
  ensureDirectoryExistence(outPath);
  return await new Promise((resolve, _reject) => {
    request
      .get(url)
      .on('error', () => {
        resolve(false);
      })
      .pipe(fs.createWriteStream(outPath))
      .on('finish', () => {
        resolve(true);
      });
  });

};

export const getTempleList = async (region): Promise<TempleItem[]> => {
  let orgTempList: any[] = [];
  let searchList: any[] = [];

  for (let i = 0; i < 5; i++) {
    const searchList1 = await getSearchList(region, '寺庙');
    await sleep(2 * 1000);
    const searchList2 = await getSearchList(region, '庵');
    await sleep(2 * 1000);

    orgTempList = [...orgTempList, ...searchList1, ...searchList2];
  }

  let templeCof = {};

  for (const item of orgTempList) {
    if (!templeCof[item.name]) {
      templeCof[item.name] = 1;
      searchList.push(item);
    }
  }

  console.log(`【${region}】共找到【${searchList.length}】条信息`);

  const tempList: any[] = [];
  for (const searchItem of searchList) {
    try {
      if (!/寺|庵/.test(searchItem.name)) continue;
      if (/社区|号楼|村委会|药店|茶室/.test(searchItem.name)) continue;
      tempList.push({
        placeName: searchItem.area + searchItem.name,
        position: {
          latitude: searchItem.location.lat,
          longitude: searchItem.location.lng,
        },
        address: searchItem.address,
        province: searchItem.province,
        city: searchItem.city,
        area: searchItem.area,
        contacts: searchItem.telephone,
        picture: searchItem.detail_info.comment_num ? await getPhotos(searchItem, searchItem.area + searchItem.name) : [],
        tag: '无照片'
      });
    } catch (e) {
      console.log(searchItem);
    }
  }

  console.log(`【${region}】共找到【${tempList.length}】家寺庙`);
  console.log('--------------------------------');

  return tempList;
};




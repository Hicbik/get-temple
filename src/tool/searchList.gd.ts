import axios from "axios";
import { SearchItem } from "../type";
import { sleep } from "./updateTempleImages";

const key = 'fb0b112c73bc2082639f745f98ff64bd';

export const getSearchList = async (region, query = '寺庙'): Promise<SearchItem[]> => {
  let list: any[] = [];

  const fn = async (page = 0) => {
    const result: any = await axios.get('https://restapi.amap.com/v5/place/text?parameters', {
      params: {
        keywords: query,
        key,
        region,
        city_limit: true,
        page_size: 25,
        page_num: page + 1,
        output: 'json',
        show_fields: 'photos,business',
        types: '寺庙道观'
      }
    });

    const data = result?.data?.pois ?? [];

    list = [...list, ...data];
    await sleep(1000);
    if (data.length === 25) await fn(page + 1);
  };

  await fn(0);
  list = list.map((item) => ({
    name: item.name,
    location: {lat: item.location.split(',')[1], lng: item.location.split(',')[0]},
    province: item.pname,
    city: item.cityname,
    area: item.adname,
    telephone: item.business?.tel,
    detail: '',
    uid: '',
    detail_info: {
      comment_num: item.photos?.length ?? 0,
      photos: item?.photos
    },
    address: item.address
  }));
  return list;
};

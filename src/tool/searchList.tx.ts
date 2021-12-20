import axios from "axios";
import { SearchItem } from "../type";
import { sleep } from "./updateTempleImages";

const key = 'QUIBZ-V7MCX-3JN47-ZQS5P-JE453-MBBPQ';

export const getSearchList = async (region, query = '寺庙'): Promise<SearchItem[]> => {
  let list: any[] = [];

  const fn = async (page = 0) => {
    const result: any = await axios.get('https://apis.map.qq.com/ws/place/v1/search', {
      params: {
        keyword: query,
        key,
        boundary: `region(${region},0)`,
        filter: 'category=旅游景点',
        page_size: 20,
        page_index: page + 1,
        output: 'json',
        sig: 'GxBPIEme2RihLbcK6GFG4mrdujX74f'
      }
    });

    const data = result?.data?.data ?? [];

    list = [...list, ...data];
    await sleep(1000);
    if (list.length < result.data.count) await fn(page + 1);
  };

  await fn(0);
  list = list.map((item)=>({
    name: item.title,
    location: { lat: item.location.lat, lng: item.location.lng },
    province: item.ad_info.province,
    city: item.ad_info.city,
    area: item.ad_info.district,
    telephone: item.tel,
    detail: '',
    uid: '',
    detail_info: {
      comment_num: 0
    },
    address: item.address
  }))
  return list;
};





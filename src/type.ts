export interface SearchItem {
  name: string;
  location: { lat: number; lng: number };
  province: string;
  city: string;
  area: string;
  telephone: string;
  detail: number;
  uid: string;
  detail_info: {
    comment_num?: string
    photos?: string[]
  };
  address: string;
}

export interface TempleItem {
  placeName: string;
  position: {
    latitude: number;
    longitude: number;
  },
  address: string;
  province: string;
  city: string;
  area: string;
  contacts: string;
  picture: string[];
  tag: string;
}

export const ColNameList = [
  '宗教', '派别', '场所名称', '省份', '城市', '区县', '地址', '负责人', '联系电话', '位置信息', '备注', '是否有照片'
];

export const ColNameStyleList = [
  {wch: 7},
  {wch: 7},
  {wch: 20},
  {wch: 8},
  {wch: 8},
  {wch: 8},
  {wch: 60},
  {wch: 10},
  {wch: 20},
  {wch: 30},
  {wch: 13},
  {wch: 13},
];

import { createXlsx } from "./tool/xlsx";
import { getTempleList } from "./tool/searchList";

const one = async () => {
  const province = '广东省';
  const region = '江门市';
  const list = await getTempleList(region);
  list.length && createXlsx(`../outPath/${province}-${region}-【${list.length}】家寺庙.xlsx`, list);
};

one().then()

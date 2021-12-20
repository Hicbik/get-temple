import { createXlsx } from "./xlsx";
import { getTempleList } from "./searchList";

const one = async () => {
  const province = '广东省';
  const region = '江门市';
  const list = await getTempleList(region);
  list.length && createXlsx(`../outPath/${province}-${region}-【${list.length}】家寺庙.xlsx`, list);
};

one().then()

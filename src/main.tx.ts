import { getSearchList } from "./tool/searchList.tx";

const main = async () => {
  let list = await getSearchList('北京市');
  list = list.filter((item) => {
    if (!/[寺庵]/.test(item.title)) return false;
    return !/社区|号楼|村委会|药店|茶室/.test(item.title);
  });
  console.log(list.map((item)=>item.title));
  console.log(list.length);
};

main().then();

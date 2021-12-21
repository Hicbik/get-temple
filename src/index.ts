import { updateTempleImages } from "./tool/updateTempleImages";

const updateImage = () => {
  updateTempleImages('../../merge/江西省-赣州市-共【416】家.xlsx', '江西省', '赣州市').then();
};

updateImage()

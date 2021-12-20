import { updateTempleImages } from "./tool/updateTempleImages";

const updateImage = () => {
  updateTempleImages('../xlsx/广东省-河源市-【66】家寺庙.xlsx', '广东省', '河源市').then();
};

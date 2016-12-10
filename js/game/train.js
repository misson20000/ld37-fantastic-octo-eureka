import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Train = () => {
  let self = {
    initialize(state) {
      self.state = state;
    },
    x: -100,
    y: -200,
    w: 500,
    h: 200,
    parallax: 1,
    type: "train",
    draw(shapes) {
      shapes.drawColoredRect(colors.trainBody, 0, 0, 500, 180, 0.1);
    }
  };
  return self
};

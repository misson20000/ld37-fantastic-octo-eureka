import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Ground = () => {
  let self = {
    initialize(state) {
      self.state = state;
    },
    x: 0,
    y: 0,
    w: 3000,
    h: 1000,
    noDebug: true,
    parallax: 1,
    type: "ground",
    draw(shapes) {
      shapes.drawColoredRect(Colors.WHITE, -self.w/2, 0, self.w/2, 30, 0.2);
      shapes.drawColoredRect(colors.ground, -self.w/2, 30, self.w/2, self.h, 0.2);
    }
  };
  return self
};

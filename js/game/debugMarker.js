import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let DebugMarker = (x, y, parallax) => {
  if(parallax == undefined) {
    parallax = 1;
  }
  let self = {
    initialize(state) {
      self.state = state;
    },
    x,
    y,
    parallax,
    w: 0,
    h: 0,
    noDebug: true,
    type: "debug marker",
    draw(shapes) {
      shapes.drawColoredRect(colors.debugBox, -1, -10, 1, 10, 1);
      shapes.drawColoredRect(colors.debugBox, -10, -1, 10, 1, 1);
      self.state.drawDebugInfoBox(["(" + x + ", " + y + ") parallax " + parallax]);
    },
  };
  return self
};

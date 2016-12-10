import {Colors, Color, ColorUtils} from "./gfxutils.js";

export let colors = {
  bg: Color(0.1, 0.05, 0.1, 1),
  debugBox: Color(0, 0, 0, 0.5),
  snow: Colors.WHITE,
  bgWall: {
    stripeA: Color(0.04, 0.04, 0.04, 1),
    stripeB: Color(0.07, 0.07, 0.08, 1)
  },
  carpet: Color("#171513"),
  window: ColorUtils.pma(Color(0.4, 0.4, 0.5, 0.2)),
  trim: Color(0.75, 0.75, 0.75, 1),
  trimShadow: Color(0.2, 0.2, 0.2, 1)
};

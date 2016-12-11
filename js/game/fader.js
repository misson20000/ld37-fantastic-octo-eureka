import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Fader = () => {
  let self = {
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    parallax: 0,
    type: "fader",
    fadeColor: Color(0, 0, 0, 0.5),
    fadeAmount: 1.0,
    fadeTarget: 1.0,
    initialize(state) {
      self.state = state;
    },
    unfade() {
      self.fadeTarget = 0;
    },
    tick(delta) {
      if(self.fadeAmount > self.fadeTarget) {
        self.fadeAmount-= delta/500.0;
        if(self.fadeAmount < self.fadeTarget) {
          self.fadeAmount = self.fadeTarget;
        }
      }
      if(self.fadeAmount < self.fadeTarget) {
        self.fadeAmount+= delta/500.0;
        if(self.fadeAmount > self.fadeTarget) {
          self.fadeAmount = self.fadeTarget;
        }
      }
    },
    draw(shapes, font, matrix, opMatrix) {
      self.fadeColor.a = self.fadeAmount;
      shapes.flush();
      shapes.drawColoredRect(self.fadeColor, 0, 0, self.w, self.h, 0);
    }
  };
  return self;
};

import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";

export let Player = () => {
  let self = {
    initialize(state) {
      self.state = state;
    },
    x: 100,
    y: -100,
    w: 30,
    h: 30,
    parallax: 1,
    type: "Player",
    draw(shapes) {
      shapes.drawColoredRect(Colors.WHITE, 0, 0, self.w, self.h, 0.5);
    },
    step() {
      if(self.state.binds.left.isPressed()) {
        self.x-= 2;
      }
      if(self.state.binds.right.isPressed()) {
        self.x+= 2;
      }
      if(self.state.binds.up.isPressed()) {
        self.y-= 2;
      }
      if(self.state.binds.down.isPressed()) {
        self.y+= 2;
      }
    }
  };
  return self
};

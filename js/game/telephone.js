import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Telephone = () => {
  let matStack = Mat4Stack.create();

  let font;
  let state;
  let iconMaterial;
  
  let self = {
    x: 1180,
    y: 30,
    w: 80,
    h: 80,
    parallax: 0,
    initialize(lstate) {
      state = lstate;
      iconMaterial = state.game.render.createMaterial(AssetManager.getAsset("base.shader.flat.textured"), {
        matrix: state.game.render.pixelMatrix,
        tex: AssetManager.getAsset("game.image.telephone")
      });
    },
    draw(shapes, retrofont, opMatrix, matrix) {
      shapes.useMaterial(iconMaterial, () => {
        console.log("HEY!");
        shapes.drawTexturedRect(0, 0, self.w, self.h*0.7, 0, 0, 1, 0.7, 0);
      });
    }
  };
  return self;
};

import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Office = () => {
  let drawStriped = (shapes, x1, y1, x2, y2) => {
    let stripeWidth = 10;
    let gradient = x1 % (stripeWidth*2);

    let stripe = gradient < stripeWidth;
    
    shapes.drawColoredRect(stripe ? colors.bgWall.stripeA : colors.bgWall.stripeB,
                           x1, y1, x1 + stripeWidth - (gradient/2), y2, 0);

    for(let x = x1 + stripeWidth - (gradient/2); x < x2; x+= stripeWidth) {
      stripe = !stripe;
      shapes.drawColoredRect(stripe ? colors.bgWall.stripeA : colors.bgWall.stripeB,
                             x, y1, Math.min(x + stripeWidth, x2), y2, 0.9);
    }
  };
  
  let self = {
    initialize(state) {
      self.state = state;
    },
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    parallax: 1,
    type: "office",
    draw(shapes) {
      drawStriped(shapes, 0, 0, 100, 720);
      drawStriped(shapes, 680, 0, 1280, 720);
      drawStriped(shapes, 100, 0, 680, 160);
      drawStriped(shapes, 100, 590, 680, 720);

      shapes.drawColoredRect(colors.window, 100, 160, 680, 590, 0);
//      shapes.drawColoredRect(colors.trim, 75, 137, 705, 160, 0);
 //     shapes.drawColoredRect(colors.trimShadow, 75, 157, 705, 160, 0);
  //    shapes.drawColoredRect(colors.trim, 100, 160, 75, 590, 0);
      
      shapes.drawColoredRect(colors.carpet, 0, 640, 1280, 720, 0); // carpet
    }
  };
  return self
};

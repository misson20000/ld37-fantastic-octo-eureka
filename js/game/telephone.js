import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";
import {lerp} from "../states/play.js";

export let Telephone = () => {
  let matStack = Mat4Stack.create();

  let font;
  let state;
  let iconMaterial;
  let textColor = Color(0, 0, 0, 1);
  
  let self = {
    x: 1180,
    y: 30,
    w: 80,
    h: 80,
    bgRect: {
    },
    calls: [
    ],
    callMap: {
    },
    parallax: 0,
    transition: 0,
    target: 0,
    initialize(lstate) {
      state = lstate;
      iconMaterial = state.game.render.createMaterial(AssetManager.getAsset("base.shader.flat.textured"), {
        matrix: state.game.render.pixelMatrix,
        tex: AssetManager.getAsset("game.image.telephone")
      });
      font = state.game.render.createFontRenderer(
        AssetManager.getAsset("game.font.gunny"),
        AssetManager.getAsset("base.shader.flat.texcolor"));

//      self.addCall({
//        link: "foo",
//        title: "Hello, WOrld!",
//        id: "foo"
//      });
    },
    addCall(call) {
      if(!self.callMap[call.id]) {
        self.calls.push(call);
        self.callMap[call.id] = call;
      }
    },
    modCall(newCall) {
      let i = self.calls.indexOf(self.callMap[newCall.id]);
      self.calls[i] = newCall;
      self.callMap[newCall.id] = newCall;
    },
    mx() {
      return state.mouse.x - self.x;
    },
    my() {
      return state.mouse.y - self.y;
    },
    bx() {
      return self.mx() - self.bgRect.x;
    },
    by() {
      return self.my() - self.bgRect.y;
    },
    enabled: true,
    tick(delta) {
      if(self.textbox.hidden && self.enabled && self.bx() > 0 && self.bx() < self.bgRect.w && self.by() > 0 && self.by() < self.bgRect.h) {
        self.target = 1;
      } else {
        self.target = 0;
      }
      let i = 0;
      let bgRect = self.bgRect;
      self.hovered = -1;
      for(let y = 80; y -bgRect.y < bgRect.h; y+= 40) {
        let by = Math.min(y+40, bgRect.h + bgRect.y);
        if(i >= self.calls.length) {
          break;
        }
        if(self.bx() > 0 && self.bx() < self.bgRect.w &&
           self.my() > y && self.my() < by) {
          self.hovered = i;
          break;
        }
        i++;
      }
      if(self.textbox.hidden && self.enabled && state.game.mouse.justClicked() && self.hovered >= 0) {
        state.dialogue.begin(self.calls[self.hovered].link).then(() => {
          self.textbox.hide();
        });
      }
    },
    step() {
      self.transition+= (self.target-self.transition)*0.1;
      let bgRect = self.bgRect;
      bgRect.x = lerp(0, -300, self.transition);
      bgRect.y = 0;
      bgRect.w = lerp(80, 380, self.transition);
      bgRect.h = Math.max(80, lerp(-50, 440, self.transition));
    },
    draw(shapes, retrofont, matrix, opMatrix) {
      textColor.a = self.transition;
      let bgRect = self.bgRect;
      shapes.drawColoredRect(Colors.WHITE, bgRect.x, bgRect.y, bgRect.x + bgRect.w, bgRect.y + bgRect.h, 0);
      let stripe = true;
      let i = 0;
      for(let y = 80; y -bgRect.y < bgRect.h; y+= 40) {
        let by = Math.min(y+40, bgRect.h + bgRect.y);
        shapes.drawColoredRect(stripe ?
                               (self.hovered == i ? colors.contacts.hoveredA : colors.contacts.stripeA) :
                               (self.hovered == i ? colors.contacts.hoveredB : colors.contacts.stripeB),
                               bgRect.x, y, bgRect.x + bgRect.w, by, 0);
        stripe = !stripe;
        i++;
      }
      shapes.flush();
      font.useMatrix(matrix);
      font.draw(textColor, lerp(0, bgRect.x + 10, self.transition), 20, 0, "Contacts:");

      let y = 80;
      for(i = 0; i < self.calls.length; i++) {
        font.draw(textColor, lerp(100, bgRect.x + 10, self.transition), y, 0, self.calls[i].title);
        y+= 40;
      }
      font.flush();

      shapes.useMaterial(iconMaterial, () => {
        shapes.drawTexturedRect(3, 18, self.w-3, 12+self.h*0.7, 0, 0, 1, 0.7, 0);
      });
    }
  };
  return self;
};

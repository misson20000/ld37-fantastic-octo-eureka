import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let TextBox = () => {
  let font;
  let self = {
    x: 50,
    y: 470,
    w: 1180,
    h: 200,
    parallax: 0,
    type: "textbox",
    displayCutoff: 0,
    characterAdvanceTimer: 0,
    blipTimer: 0,
    textPromise: null,
    nodPromise: null,
    nodding: false,
    initialize(state) {
      self.state = state;
      font = state.font;
      self.clear();
    },
    display(text, updatePromises=true) {
      if(self.textPromise && !self.textPromise.resolved && updatePromises) {
        self.textPromise.reject("interrupted");
      }
      text = self.text + text;
      self.text = text;
      self.characterAdvanceTimer = 30;
      self.nodding = false;
      let lines = [];
      let lastBreak = 0;
      let lastI = 0;
      let i = text.indexOf(" ");
      while(i < text.length && i >= 0) {
        if(font.computeWidth(text.slice(lastBreak, i)) > (self.w/3)-40) {
          lines.push(text.slice(lastBreak, lastI));
          lastBreak = lastI+1;
        }
        lastI = i;
        i = text.indexOf(" ", i+1);
      }

      if(font.computeWidth(text.slice(lastBreak)) > (self.w/3)-40) {
        lines.push(text.slice(lastBreak, lastI));
        lastBreak = lastI+1;
      }
      
      lines.push(text.slice(lastBreak));
      self.lines = lines;

      if(updatePromises) {
        return new Promise((resolve, reject) => {
          self.textPromise = {
            resolve, reject, resolved: false
          };
        });
      }
    },
    clear() {
      self.text = "";
      self.lines = [];
      self.nodding = false;
      self.displayCutoff = 0;
    },
    nod() {
      console.log("nod");
      this.nodding = true;
      return new Promise((resolve, reject) => {
        self.nodPromise = {
          resolve, reject, resolved: false
        };
      });
    },
    draw(shapes, font, matrix, opMatrix) {
      shapes.drawColoredRect(Colors.BLACK, 0, 0, 1180, 200, 0);
      shapes.flush();
      opMatrix.load.scale(3, 3, 1);
      matrix.multiply(opMatrix);
      let y = 4;
      let cut = self.displayCutoff;
      for(let i = 0; i < self.lines.length; i++) {
        if(cut > 0) {
          font.draw(Colors.WHITE, 5, y, 0, self.lines[i].slice(0, cut));
        }
        cut-= self.lines[i].length + 1;
        if((i == self.lines.length - 1) && self.nodding) {
          let w = font.computeWidth(self.lines[i]) + 5;
          shapes.drawColoredRect(Colors.WHITE,
                                 w, y,
                                 w + 5,
                                 y + font.height - 1, 0);
        }
        y+= font.height + 4;
      }
      font.flush();
    },
    tick(delta) {
      if(self.nodding && self.state.binds.nod.justPressed()) {
        self.display(" ", false);
        self.nodding = false;
        self.nodPromise.resolve();
      }
    },
    step() {
      self.characterAdvanceTimer-=
        (self.state.binds.fasterText.isPressed() ||
         self.state.binds.nod.isPressed()) ? 3 : 1;
      while(self.characterAdvanceTimer <= 0 && self.displayCutoff < self.text.length) {
        self.displayCutoff++;
        let chr = self.text[self.displayCutoff];
        switch(chr) {
        case " ":
          break;
        default:
          self.characterAdvanceTimer+= 20;
        }
        chr = self.text[self.displayCutoff - 1];
        if(chr && chr.match("[a-zA-Z\\.,\!]")) {
          if(self.blip) {
            self.blip.stop();
          }
          self.blip = self.state.game.sound.playSound(AssetManager.getAsset("game.sfx.textblip.default"));
        }
        if(self.displayCutoff >= self.text.length && self.textPromise) {
          self.displayCutoff = self.text.length;
          self.textPromise.resolve();
          self.textPromise.resolved = true;
        }
      }
    }
  };
  return self;
};

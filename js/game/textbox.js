import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let TextBox = () => {
  let font;

  let blipmap = {
    Avery: "male",
    Andrea: "female",
    Lina: "female",
    Hale: "hale",
    Telephone: "nobody"
  };

  let blipFor = (person) => {
    if(person && blipmap[person] != undefined) {
      return blipmap[person];
    } else {
      return "default";
    }
  };
  
  let self = {
    x: 50,
    y: 500,
    w: 1180,
    h: 200,
    parallax: 0,
    type: "textbox",
    displayCutoff: 0,
    characterAdvanceTimer: 0,
    blipTimer: 0,
    textPromise: null,
    nodPromise: null,
    choicePromise: null,
    nodding: false,
    skippingEnabled: true,
    choicesCooldown: 0,
    mode: "text",
    initialize(state) {
      self.state = state;
      font = state.font;
      self.clear();
    },
    skippable() {
      self.skippingEnabled = true;
    },
    unskippable() {
      self.skippingEnabled = false;
    },
    display(text, updatePromises=true, updateColor=true) {
      self.hidden = false;
      self.mode = "text";
      if(self.textPromise && !self.textPromise.resolved && updatePromises) {
        self.textPromise.resolve();
//        self.textPromise.reject("interrupted");
      }
      text = self.text + text;
      self.text = text;
      self.characterAdvanceTimer = 30;
      self.nodding = false;
      if(updateColor) {
        self.color = Colors.WHITE;
      }
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
    soliloquy(text) {
      let p = self.display(text);
      self.color = colors.soliloquyText;
      return p;
    },
    hide() {
      self.hidden = true;
      self.clear();
    },
    unhide() {
      self.hidden = false;
    },
    setPerson(person) {
      self.person = person;
      self.setVoice(blipFor(person));
    },
    setVoice(voice) {
      if(voice == "nobody") {
        self.voice = null;
      } else {
        self.voice = AssetManager.getAsset("game.sfx.textblip." + voice);
      }
      return self.voice;
    },
    choices(choices) {
      self.hidden = false;
      self.choiceList = choices;
      self.mode = "choices";
      self.selectedChoice = 0;
      self.choicesCooldown = 20;
      return new Promise((resolve, reject) => {
        self.choicePromise = {
          resolve, reject, resolved: false
        };
      });
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
      if(self.hidden) {
        return;
      }
      shapes.drawColoredTriangle(colors.textbox.trim,
                                 150, -31,
                                 180, -1,
                                 150, -1, 0);
      shapes.drawColoredTriangle(colors.textbox.bg,
                                 150, -30,
                                 180, 0,
                                 150, 0, 0);
      shapes.drawColoredRect(colors.textbox.trim, -1, -1, 1182, 202, 0);
      shapes.drawColoredRect(colors.textbox.trim, -1, -31, 150, 0, 0);
      shapes.drawColoredRect(colors.textbox.bg, 0, -30, 150, -1, 0);
      shapes.drawColoredRect(colors.textbox.bg, 0, 0, 1180, 200, 0);
      shapes.flush();

      opMatrix.load.scale(2, 2, 1);
      matrix.multiply(opMatrix);
      if(self.person) {
        font.draw(Colors.WHITE, 5, -12, 0, self.person);
      }
      
      opMatrix.load.scale(3/2, 3/2, 1);
      matrix.multiply(opMatrix);
      
      let y = 4;
      switch(self.mode) {
      case "text":
        let cut = self.displayCutoff;
        for(let i = 0; i < self.lines.length; i++) {
          if(cut > 0) {
            font.draw(self.color, 5, y, 0, self.lines[i].slice(0, cut));
          }
          cut-= self.lines[i].length + 1;
          if((i == self.lines.length - 1) && self.nodding) {
            let w = font.computeWidth(self.lines[i]) + 5;
            shapes.drawColoredRect(self.color,
                                   w, y,
                                   w + 5,
                                   y + font.height - 1, 0);
          }
          y+= font.height + 4;
        }
        break;
      case "choices":
        for(let i = 0; i < self.choiceList.length; i++) {
          if(i == self.selectedChoice) {
            font.draw(Colors.WHITE, 5, y, 0, ">");
          }
          font.draw(self.choiceList[i].visited ? colors.textbox.visited : Colors.WHITE, 15, y, 0, self.choiceList[i].content);
          y+= font.height + 4;
        }
        break;
      default:
        font.draw(Colors.WHITE, 0, 0, 0, "invalid state '" + self.mode + "'");
      }
      font.flush();
    },
    tick(delta) {
      if(self.nodding && self.state.binds.nod.justPressed()) {
        self.display(" ", false);
        self.nodding = false;
        self.nodPromise.resolve();
      }
      if(self.mode == "choices") {
        if(self.state.binds.down.justPressed() ||
           self.state.binds.left.justPressed()) {
          self.selectedChoice++;
          self.selectedChoice%= self.choiceList.length;

          self.state.game.sound.playSound(AssetManager.getAsset("game.sfx.select"));
        }
        if(self.state.binds.up.justPressed() ||
           self.state.binds.right.justPressed()) {
          if(self.selectedChoice <= 0) {
            self.selectedChoice = self.choiceList.length;
          }
          self.selectedChoice--;

          self.state.game.sound.playSound(AssetManager.getAsset("game.sfx.select"));
        }
        self.choicesCooldown--;
        if(self.state.binds.nod.justPressed() && self.choicesCooldown <= 0) {
          self.state.game.sound.playSound(AssetManager.getAsset("game.sfx.confirm"));
          self.clear();
          self.choicePromise.resolve(self.choiceList[self.selectedChoice].callback());
        }
      }
      if(self.mode == "text") {
        if(self.state.binds.nod.justPressed() || self.state.binds.fasterText.justPressed()) {
          self.characterAdvanceTimer-= 10;
        }
      }
    },
    speed: 1,
    step() {
      self.characterAdvanceTimer-=
        (self.skippingEnabled && (self.state.binds.fasterText.isPressed() ||
                                  self.state.binds.nod.isPressed()) ? 3 : 1) * self.speed;
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
        if(chr && chr.match("[a-zA-Z0-9\\.,\!\?\-]")) {
          self.blip = self.state.game.sound.playSound(self.voice);
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

import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {colors} from "../palette.js";

export let Notepad = () => {
  let matStack = Mat4Stack.create();

  let font;
  let textColor = Color(0, 0, 0, 1);
  let hoveredColor = Color(0.5, 0.5, 0.7, 1);
  let linesPerPage = 12;
  
  let self = {
    x: 50,
    y: 30,
    w: 350,
    h: 430,
    scale: 0.15,
    scaleTgt: 1.0,
    notes: [
    ],
    noteMap: {
    },
    pages: [
    ],
    page: 0,
    hoveredNote: 1,
    evidencePromise: null,
    pickingEvidence: false,
    initialize(state) {
      self.state = state;
      font = state.game.render.createFontRenderer(
        AssetManager.getAsset("game.font.gunny"),
        AssetManager.getAsset("base.shader.flat.texcolor"));
      self.computeLinewrap();
    },
    pickEvidence() {
      return new Promise((resolve, reject) => {
        self.pickingEvidence = true;
        self.evidencePromise = {resolve, reject};
      });
    },
    computeLinewrap() {
      let pages = [];
      let page = [];
      for(let n = 0; n < self.notes.length; n++) {
        let lines = [];
        let text = self.notes[n].content;
        let lastBreak = 0;
        let lastI = 0;
        let i = text.indexOf(" ");
        while(i < text.length && i >= 0) {
          if(font.computeWidth(text.slice(lastBreak, i)) > (self.w)-20) {
            lines.push({content: text.slice(lastBreak, lastI), note: self.notes[n]});
            lastBreak = lastI+1;
          }
          lastI = i;
          i = text.indexOf(" ", i+1);
        }
        
        if(font.computeWidth(text.slice(lastBreak)) > (self.w)-20) {
          lines.push({content: text.slice(lastBreak, lastI), note: self.notes[n]});
          lastBreak = lastI+1;
        }
      
        lines.push({content: text.slice(lastBreak), note: self.notes[n]});
        if(page.length + lines.length > linesPerPage) {
          pages.push(page);
          page = lines;
        } else {
          page = page.concat(lines);
        }
      }

      pages.push(page);
      self.pages = pages;
    },
    addNote(note) {
      self.noteMap[note.id] = note;
      self.notes.push(note);
      self.computeLinewrap();
    },
    step() {
      self.scale+= (self.scaleTgt-self.scale)*0.1;
    },
    tick(delta) {
      if(self.pickingEvidence ||
         self.state.mouse.x > self.x &&
         self.state.mouse.y > self.y &&
         self.state.mouse.x - self.x < self.w*self.scale &&
         self.state.mouse.y - self.y < self.h*self.scale) {
        self.scaleTgt = 1.0;
      } else {
        self.scaleTgt = 0.15;
      }

      if(self.isHovering(self.leftArrow) && self.page > 0 && self.state.game.mouse.justClicked()) {
        self.page--;
      }

      if(self.isHovering(self.rightArrow) && self.page+1 < self.pages.length && self.state.game.mouse.justClicked()) {
        self.page++;
      }

      self.hoveredNote = null;
      if(self.mx() > self.x && self.mx() < self.x+self.w) {
        let lines = self.pages[self.page];
        let y = 68;
        for(let i = 0; i < lines.length; i++) {
          if(self.my() > y && self.my() < y+30 && self.mx() < font.computeWidth(lines[i].content) + 20) {
            self.hoveredNote = lines[i].note;
            if(self.state.game.mouse.justClicked() && self.pickingEvidence) {
              self.evidencePromise.resolve(self.hoveredNote);
              self.pickingEvidence = false;
            }
            break;
          }
          y+= 30;
        }
      }
    },
    leftArrow: {
      x: 350-10-25-10-25,
      w: 25,
      h: 25,
      y: 430-10-15-2
    },
    rightArrow: {
      x: 350-10-25,
      w: 25,
      h: 25,
      y: 430-10-15-2
    },
    mx() {
      return (self.state.mouse.x - self.x) * self.scale;
    },
    my() {
      return (self.state.mouse.y - self.y) * self.scale;
    },
    isHovering(arrow) {
      return self.mx() > arrow.x && self.my() > arrow.y && self.mx() < arrow.x + arrow.w && self.my() < arrow.y + arrow.h;
    },
    draw(shapes, retrofont, matrix, opMatrix) {
      opMatrix.load.scale(self.scale, self.scale, 1);
      matrix.multiply(opMatrix);
      shapes.drawColoredRect(colors.notepad, 0, 0, self.w, self.h, 0);
      shapes.flush();
      
      for(let y = 70; y < self.h; y+= 30) {
        shapes.drawColoredRect(colors.notepadLines, 0, y, self.w, y+1, 0);
        shapes.drawColoredRect(textColor, 8, y+16.5, 12, y+20.5, 0);
      }

      if(self.page > 0) {
        matStack.push(matrix);
        opMatrix.load.translate(self.leftArrow.x, self.leftArrow.y, 0);
        matrix.multiply(opMatrix);
        opMatrix.load.scale(self.leftArrow.w, self.leftArrow.h, 0);
        matrix.multiply(opMatrix);
        let color = self.isHovering(self.leftArrow) ? Colors.WHITE : colors.notepadLines;
        shapes.drawColoredRect(color, 1/2, 1/3, 1, 2/3, 0);
        shapes.drawColoredTriangle(color,
                                   0, 1/2,
                                   1/2, 0,
                                   1/2, 1, 0);
        matStack.pop(matrix);
      }

      if(self.page + 1 < self.pages.length) {
        matStack.push(matrix);
        opMatrix.load.translate(self.rightArrow.x + self.rightArrow.w, self.rightArrow.y, 0);
        matrix.multiply(opMatrix);
        opMatrix.load.scale(-self.rightArrow.w, self.rightArrow.h, 0);
        matrix.multiply(opMatrix);
        let color = self.isHovering(self.rightArrow) ? Colors.WHITE : colors.notepadLines;
        shapes.drawColoredRect(color, 1/2, 1/3, 1, 2/3, 0);
        shapes.drawColoredTriangle(color,
                                   0, 1/2,
                                   1/2, 0,
                                   1/2, 1, 0);
        matStack.pop(matrix);
      }
      
      shapes.flush();

      textColor.a = self.scale;
      hoveredColor.a = self.scale;
      font.useMatrix(matrix);
      font.draw(textColor, 5, 75-font.height, 0, "Smith Manor Case");

      let y = 70;
      let lines = self.pages[self.page];
      for(let i = 0; i < lines.length; i++) {
        font.draw(self.pickingEvidence && self.hoveredNote == lines[i].note ? hoveredColor : textColor, 17, y-2, 0, lines[i].content);

        y+= 30;
      }

      font.flush();
    }
  };
  return self;
};

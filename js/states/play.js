import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {Keyboard} from "../keyboard.js";
import {colors} from "../palette.js";
import * as box2d from "box2d-html5";
import * as obj from "../game/objects.js";
import {DialogueInterpreter} from "../game/dialogue.js";

let lerp = (a, b, x) => {
  return a + x * (b-a);
};

let modulo = (a, b) => {
  return (a % b + b) % b;
};

export let PlayState = (game, transition) => {
  let time = 0;

  let objects = [];
  
  let render = game.render;
  let shapesMaterial = render.createMaterial(AssetManager.getAsset("base.shader.flat.color"), {
    matrix: render.pixelMatrix
  });
  let font = render.createFontRenderer(AssetManager.getAsset("base.font.coders_crux"),
                                       AssetManager.getAsset("base.shader.flat.texcolor"));
  let fb = render.createFramebuffer(100); // 100 pixels of padding
  let postMatrix = Mat4.create();
  let post = render.createMaterial(AssetManager.getAsset("game.shader.reflection"), {
    framebuffer: fb.getTexture(),
    perlin: AssetManager.getAsset("game.noise.perlin"),
    matrix: postMatrix,
    time: () => {
      return time;
    },
    pixwidth: render.fbwidth,
    pixheight: render.fbheight,
    refY: () => {
      return fb.ytoc(0);
    }
  });
  let dialogue = DialogueInterpreter();
  dialogue.loadTree(AssetManager.getAsset("game.dialogue"));
  
  let shapes = render.createShapeDrawer();

  let opMatrix = Mat4.create();
  let matStack = Mat4Stack.create();
  let matrix = Mat4.create();
  shapes.useMatrix(matrix);
  shapes.useMaterial(shapesMaterial);
  font.useMatrix(matrix);
    
  let kb = Keyboard.create();
  let uniformTimer = 0;

  let snow = [];
  let snowAngle = -100 * 180.0 / (2 * Math.PI);
  let snowDepth = 0.1;
  for(let i = 0; i < 700; i++) {
    snow.push({x: Math.random(), y: Math.random(), speed: Math.random()});
  }

  let width = 1280;
  let height = 720;
  
  let self = {
    game,
    font,
    debugMode: false,
    camera: {
      x: 0,
      y: 0,
      follow: null
    },
    binds: {
      left: kb.createKeybind("ArrowLeft", "a"),
      right: kb.createKeybind("ArrowRight", "d"),
      up: kb.createKeybind("ArrowUp", "w"),
      down: kb.createKeybind("ArrowDown", "s"),
      fasterText: kb.createKeybind("z"),
      nod: kb.createKeybind("x")
    },
    addObject(obj) {
      obj.id = objects.length;
      objects.push(obj);
      if(obj.initialize) {
        obj.initialize(self);
      }
    },
    initialize() {
      console.log("initialize play state");
      //self.addObject(obj.Office());
      self.addObject(self.textBox = obj.TextBox());
      dialogue.linkTextbox(self.textBox);
      dialogue.begin("andrea.entry");
    },
    drawScene() {
      render.clearBuffers();
      render.clear(Colors.BLACK);
      matrix.load.identity();

      let factor = Math.min(render.width()/width, render.height()/height);
      let tgtW = width * factor;
      let tgtH = height * factor;
      opMatrix.load.translate((render.width()-tgtW)/2,
                              (render.height()-tgtH)/2, 0);
      matrix.multiply(opMatrix);
      opMatrix.load.scale(factor, factor, 1);
      matrix.multiply(opMatrix);

      render.drawStencil();
      shapes.drawColoredRect(Colors.WHITE,
                             0, 0, width, height, 0.5);
      shapes.flush();
      render.drawColor();
      render.setStencil(true);

      shapes.drawColoredRect(colors.bg, 0, 0, width, height, 0);
      
      for(let i = 0; i < snow.length; i++) {
        let sz = lerp(1.5, 2.5, snow[i].speed);
        shapes.drawColoredRect(colors.snow,
                               modulo(snow[i].x * width - self.camera.x, width),
                               modulo(snow[i].y * height - self.camera.y, height),
                               modulo(snow[i].x * width - self.camera.x, width) + sz,
                               modulo(snow[i].y * height - self.camera.y, height) + sz,
                               snowDepth);
      }
      
//      opMatrix.load.translate(Math.floor(width/2), Math.floor(height/2), 0);
//      matrix.multiply(opMatrix);
      
      for(let i = 0; i < objects.length; i++) {
        matStack.push(matrix);
        self.drawObject(objects[i]);
        matStack.pop(matrix);
      }

      shapes.flush();

//      render.setStencil(false);
    },
    debugInfo(object) {
      let info = [];
      info.push("(" + object.x + ", " + object.y + ") " + object.type + " #" + object.id);
      info.push("parallax: " + object.parallax);
      return info;
    },
    drawDebugInfoBox(info) {
      let y = 0;
      for(let i = 0; i < info.length; i++) {
        shapes.drawColoredRect(colors.debugBox, 0, y, font.computeWidth(info[i]), font.height + y, 0.999);
        font.draw(Colors.WHITE, 0, y, 1, info[i]);
        y+= font.height;
      }
    },
    drawObject(object) {
      let parallax = object.parallax;
      if(parallax == undefined) {
        parallax = 1;
      }
      opMatrix.load.translateFloor(-self.camera.x * parallax, -self.camera.y * parallax, 0);
      matrix.multiply(opMatrix);
      opMatrix.load.translate(object.x, object.y, 0);
      matrix.multiply(opMatrix);
      matStack.push(matrix);
      object.draw(shapes, font, matrix, opMatrix);
      matStack.pop(matrix);

      if(self.debugMode && !object.noDebug) {
        shapes.drawColoredRect(Colors.RED, 0, 0, 2, object.h, 0.999);
        shapes.drawColoredRect(Colors.RED, 0, 0, object.w, 2, 0.999);
        shapes.drawColoredRect(Colors.RED, object.w, 0, object.w-2, object.h, 0.999);
        shapes.drawColoredRect(Colors.RED, 0, object.h-2, object.w, object.h, 0.999);

        let info = self.debugInfo(object);
        self.drawDebugInfoBox(info);
      }
      shapes.flush();
      font.flush();
    },
    step() {
      for(let i = 0; i < snow.length; i++) {
        snow[i].x+= lerp(0.0001, 0.0008, snow[i].speed) * Math.sin(snowAngle + Math.sin(time/1000.0)*lerp(0.7, 1, snow[i].speed)/6.0);
        snow[i].y+= lerp(0.0001, 0.0008, snow[i].speed) * Math.cos(snowAngle + Math.sin(time/1000.0)*lerp(0.7, 1, snow[i].speed)/6.0);
        snow[i].x%= 1;
        snow[i].y%= 1;
      }
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].step) {
          objects[i].step();
        }
      }
    },
    tick(delta) {
      uniformTimer+= delta;
      while(uniformTimer > 5) {
        self.step();
        uniformTimer-= 5;
      }
      
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].tick) {
          objects[i].tick();
        }
      }

      if(self.camera.follow) {
        self.camera.x = self.camera.follow.x;
        self.camera.y = self.camera.follow.y;
      }

      self.drawScene();
      matrix.load.identity();
      self.drawDebugInfoBox([
        "camera: (" + self.camera.x + ", " + self.camera.y + ")",
        "camera follow: " + (self.camera.follow ? "#" + self.camera.follow.id : "null")
      ]);
      shapes.flush();
      font.flush();
      
      transition.draw(delta);
      time+= delta;
    },
    getKeyboard() {
      return kb;
    }
  };
  return self;
};

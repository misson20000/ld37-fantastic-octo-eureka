/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _webgl = __webpack_require__(1);
	
	var _preloader = __webpack_require__(9);
	
	var _assetmgr = __webpack_require__(7);
	
	var _sound = __webpack_require__(28);
	
	var _dialogue = __webpack_require__(27);
	
	var game = {};
	window.theGame = game;
	
	window.onload = function () {
	  var clickState = false;
	  var lastClickState = false;
	
	  try {
	    var canvas = document.getElementById("gamecanvas");
	    game.render = (0, _webgl.WebGLRenderer)(game, canvas, canvas.getContext("webgl", {
	      alpha: false,
	      stencil: true
	    }) || canvas.getContext("experimental-webgl", {
	      alpha: false,
	      stencil: true
	    }));
	    game.sound = (0, _sound.SoundEngine)(game);
	    game.mouse = {
	      x: 0, y: 0,
	      justClicked: function justClicked() {
	        return clickState && !lastClickState;
	      }
	    };
	
	    game.switchState = function (newstate) {
	      if (game.state && game.state.destroy) {
	        game.state.destroy();
	      }
	      game.state = newstate;
	      if (newstate.initialize) {
	        newstate.initialize();
	      }
	    };
	
	    game.switchState((0, _preloader.PreloaderState)(game));
	
	    _assetmgr.AssetManager.addAssetLoader(game.render.createAssetLoader());
	    _assetmgr.AssetManager.addAssetLoader(game.sound.createAssetLoader());
	    _assetmgr.AssetManager.addAssetLoader((0, _dialogue.DialogueLoader)());
	  } catch (err) {
	    document.write(err);
	    return;
	  }
	
	  var lastTick = performance.now();
	  game.tick = function (timestamp) {
	    var delta = timestamp - lastTick;
	    lastTick = timestamp;
	
	    game.render.manageSize();
	    game.render.initMatrices();
	    game.render.clearBuffers();
	
	    if (game.state && game.state.tick) {
	      game.state.tick(delta);
	    }
	
	    if (game.state && game.state.getKeyboard) {
	      game.state.getKeyboard().update();
	    }
	
	    lastClickState = clickState;
	
	    window.requestAnimationFrame(game.tick);
	  };
	  window.requestAnimationFrame(game.tick);
	
	  document.addEventListener("keydown", function (evt) {
	    if (game.state && game.state.getKeyboard) {
	      game.state.getKeyboard().keyDown(evt);
	    }
	  });
	
	  document.addEventListener("keyup", function (evt) {
	    if (game.state && game.state.getKeyboard) {
	      game.state.getKeyboard().keyUp(evt);
	    }
	  });
	
	  document.addEventListener("mousemove", function (evt) {
	    game.mouse.x = evt.clientX;
	    game.mouse.y = evt.clientY;
	  });
	
	  document.addEventListener("mousedown", function (evt) {
	    clickState = true;
	  });
	  document.addEventListener("mouseup", function (evt) {
	    clickState = false;
	  });
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.WebGLRenderer = undefined;
	
	var _blobUtil = __webpack_require__(2);
	
	var BlobUtil = _interopRequireWildcard(_blobUtil);
	
	var _assetmgr = __webpack_require__(7);
	
	var _math = __webpack_require__(8);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var WebGLRenderer = exports.WebGLRenderer = function WebGLRenderer(game, canvas, gl) {
	  if (!gl) {
	    if (!canvas.getContext("webgl")) {
	      throw "Could not open any WebGL context";
	    }
	    if (!canvas.getContext("webgl", { alpha: false })) {
	      throw "Could not open WebGL context {alpha: false}";
	    }
	    if (!canvas.getContext("webgl", { stencil: true })) {
	      throw "Could not open WebGL context with stencil";
	    }
	    if (!canvas.getContext("webgl", { alpha: false, stencil: true })) {
	      throw "Could not open WebGL context with no alpha and with stencil";
	    }
	    throw "Could not open WebGL context";
	  }
	  gl.enable(gl.BLEND);
	  //gl.enable(gl.DEPTH_TEST);
	  gl.clearDepth(0);
	  gl.depthFunc(gl.GEQUAL);
	  gl.disable(gl.STENCIL_TEST);
	  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	  gl.stencilFunc(gl.ALWAYS, 0, 0xFF); // fill stencil buffer with ones
	  gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
	  gl.stencilMask(0);
	
	  var workingMatrix = _math.Mat4.create();
	  var currentFb = null;
	
	  var render = {
	    manageSize: function manageSize() {
	      if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
	        canvas.width = window.innerWidth;
	        canvas.height = window.innerHeight;
	
	        gl.viewport(0, 0, canvas.width, canvas.height);
	
	        if (game.state && game.state.updateSize) {
	          game.state.updateSize(canvas.width, canvas.height);
	        }
	      }
	    },
	    initMatrices: function initMatrices() {
	      render.pixelMatrix.load.identity();
	      render.pixelCenteredMatrix.load.identity();
	      workingMatrix.load.scale(2 / render.fbwidth(), -2 / render.fbheight(), 1); // scale down to pixels and flip
	      render.pixelMatrix.multiply(workingMatrix);
	      render.pixelCenteredMatrix.multiply(workingMatrix);
	      workingMatrix.load.translate(-render.fbwidth() / 2, -render.fbheight() / 2, 0);
	      render.pixelMatrix.multiply(workingMatrix);
	    },
	    clearBuffers: function clearBuffers() {
	      gl.clearColor(0, 0, 0, 1);
	      gl.clearStencil(0);
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	    },
	    clear: function clear(color) {
	      gl.clearColor(color.r, color.g, color.b, color.a);
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	    },
	    drawStencil: function drawStencil() {
	      gl.stencilMask(0xFF);
	      gl.stencilFunc(gl.ALWAYS, 1, 0xFF); // write ones to stencil buffer
	      gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
	      gl.colorMask(0, 0, 0, 0);
	    },
	    drawColor: function drawColor() {
	      gl.stencilMask(0x00); // disable writing to stencil buffer
	      gl.stencilFunc(gl.EQUAL, 1, 0xFF);
	      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
	      gl.colorMask(1, 1, 1, 1);
	    },
	    setStencil: function setStencil(enabled) {
	      if (enabled) {
	        gl.enable(gl.STENCIL_TEST);
	      } else {
	        gl.disable(gl.STENCIL_TEST);
	      }
	    },
	
	
	    // padding is extra space beyond the edges of the canvas that is guarenteed to be there
	    // margin space is not guarenteed to be there; it serves only to make resizing smoother
	    //  margin defaults to 50 pixels
	    createFramebuffer: function createFramebuffer(padding, margin) {
	      if (margin === undefined) {
	        margin = 50;
	      }
	
	      var fb = gl.createFramebuffer();
	      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	
	      var width = render.width() + 2 * padding + 2 * margin;
	      var height = render.height() + 2 * padding + 2 * margin;
	
	      var tex = gl.createTexture();
	      gl.bindTexture(gl.TEXTURE_2D, tex);
	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	      var depthrb = gl.createRenderbuffer();
	      gl.bindRenderbuffer(gl.RENDERBUFFER, depthrb);
	      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
	      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthrb);
	      // Unfortunately, no stencilling in framebuffers cause we can't have the depth and stencil
	      // buffers be seperate renderbufferes and there's no way to have them both in the same
	      // renderbuffer until WebGL2.
	      //      let stencilrb = gl.createRenderbuffer();
	      //      gl.bindRenderbuffer(gl.RENDERBUFFER, stencilrb);
	      //      gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
	      //      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencilrb);
	
	      switch (gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
	        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
	          throw "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
	        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
	          throw "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
	        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
	          throw "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
	        case gl.FRAMEBUFFER_UNSUPPORTED:
	          throw "FRAMEBUFFER_UNSUPPORTED";
	        case gl.FRAMEBUFFER_COMPLETE:
	          break;
	        default:
	          throw "WTF?";
	      }
	
	      gl.bindTexture(gl.TEXTURE_2D, null);
	      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	      var texObj = {
	        glTex: tex,
	        width: width,
	        height: height
	      };
	
	      var attributes = [];
	
	      var pixmat = _math.Mat4.create();
	      var pixcentmat = _math.Mat4.create();
	
	      var self = {
	        bind: function bind() {
	          if (render.width() + 2 * padding > width || render.height() + 2 * padding > height) {
	            width = render.width() + 2 * padding + 2 * margin;
	            height = render.height() + 2 * padding + 2 * margin;
	            texObj.width = width;
	            texObj.height = height;
	            gl.bindTexture(gl.TEXTURE_2D, tex);
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	            gl.bindRenderbuffer(gl.RENDERBUFFER, depthrb);
	            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	            gl.bindTexture(gl.TEXTURE_2D, null);
	            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	          }
	
	          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	          currentFb = texObj;
	
	          pixmat.load.from(render.pixelMatrix);
	          pixcentmat.load.from(render.pixelCenteredMatrix);
	          render.initMatrices();
	
	          workingMatrix.load.translate((width - render.width()) / 2, (height - render.height()) / 2, 0);
	          render.pixelMatrix.multiply(workingMatrix);
	          render.pixelCenteredMatrix.multiply(workingMatrix);
	          gl.viewport(0, 0, width, height);
	        },
	        unbind: function unbind() {
	          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	          currentFb = null;
	          render.pixelMatrix.load.from(pixmat);
	          render.pixelCenteredMatrix.load.from(pixcentmat);
	          gl.viewport(0, 0, canvas.width, canvas.height);
	        },
	        getTexture: function getTexture() {
	          return texObj;
	        },
	        getAttributes: function getAttributes() {
	          var i = 0;
	          var x = (width - render.width()) / (2 * width);
	          var y = (height - render.height()) / (2 * height);
	          var z = 0.9;
	          attributes[i++] = 0;
	          attributes[i++] = 0;
	          attributes[i++] = z;
	          attributes[i++] = x;
	          attributes[i++] = 1 - y;
	
	          attributes[i++] = render.width();
	          attributes[i++] = 0;
	          attributes[i++] = z;
	          attributes[i++] = 1 - x;
	          attributes[i++] = 1 - y;
	
	          attributes[i++] = 0;
	          attributes[i++] = render.height();
	          attributes[i++] = z;
	          attributes[i++] = x;
	          attributes[i++] = y;
	
	          attributes[i++] = render.width();
	          attributes[i++] = render.height();
	          attributes[i++] = z;
	          attributes[i++] = 1 - x;
	          attributes[i++] = y;
	          return attributes;
	        },
	        xtoc: function xtoc(x) {
	          return (2 * x + width - render.width()) / (2 * width);
	        },
	        ytoc: function ytoc(y) {
	          return 1.0 - (2 * y + height - render.height()) / (2 * height);
	        }
	      };
	      return self;
	    },
	    width: function width() {
	      return canvas.width;
	    },
	    height: function height() {
	      return canvas.height;
	    },
	    fbwidth: function fbwidth() {
	      // including padding and margin
	      return currentFb === null ? canvas.width : currentFb.width;
	    },
	    fbheight: function fbheight() {
	      // including padding and margin
	      return currentFb === null ? canvas.height : currentFb.height;
	    },
	    createAssetLoader: function createAssetLoader() {
	      var loaders = {
	        "font": function font(placeholder) {
	          return _assetmgr.AssetManager.getFile(placeholder.spec.xml).then(function (blob) {
	            /*            return new Promise((resolve, reject) => {
	                          let xhr = new XMLHttpRequest();
	                          
	                          xhr.onload = () => {
	                            if(xhr.status != 200) {
	                              throw xhr.statusText;
	                            } else {
	                              resolve(xhr.responseXML);
	                            }
	                          };
	            
	                          xhr.onerror = reject;
	                          
	                          xhr.responseType = "document";
	                          
	                          xhr.open("GET", URL.createObjectURL(blob));
	                          xhr.send();
	                          });*/
	            return BlobUtil.blobToBinaryString(blob).then(function (str) {
	              return new DOMParser().parseFromString(str, "application/xml");
	            });
	          }).then(function (doc) {
	            var root = doc.firstChild;
	            if (root.nodeName != "Font") {
	              throw "Bad font descriptor file (root element is <" + root.nodeName + ">)";
	            }
	
	            var font = {
	              height: parseInt(root.getAttribute("height")),
	              glyphs: {}
	            };
	
	            for (var i = 0; i < root.children.length; i++) {
	              var ch = root.children[i];
	              var glyph = {};
	
	              var offset = ch.getAttribute("offset").split(" ");
	              glyph.offsetx = parseInt(offset[0]);
	              glyph.offsety = parseInt(offset[1]);
	
	              var rect = ch.getAttribute("rect").split(" ").map(function (str) {
	                return parseInt(str);
	              });
	              glyph.rectx = rect[0];
	              glyph.recty = rect[1];
	              glyph.rectw = rect[2];
	              glyph.recth = rect[3];
	
	              glyph.width = parseInt(ch.getAttribute("width"));
	
	              font.glyphs[ch.getAttribute("code")] = glyph;
	            }
	            return placeholder.depend(placeholder.spec.texture).then(function (tex) {
	              font.texture = tex;
	              return font;
	            });
	          });
	        },
	        "texture": function texture(placeholder) {
	          return _assetmgr.AssetManager.getFile(placeholder.spec.src).then(function (blob) {
	            return new Promise(function (resolve, reject) {
	              var image = new Image();
	              image.onload = function () {
	                resolve(image);
	              };
	              image.onerror = function (evt) {
	                reject(evt.type);
	              };
	              image.src = URL.createObjectURL(blob);
	            });
	          }).then(function (img) {
	            var texture = gl.createTexture();
	            gl.bindTexture(gl.TEXTURE_2D, texture);
	            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	            //            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	            gl.generateMipmap(gl.TEXTURE_2D);
	            gl.bindTexture(gl.TEXTURE_2D, null);
	            return {
	              glTex: texture,
	              width: img.width,
	              height: img.height
	            };
	          });
	        },
	        "shader": function shader(placeholder) {
	          if (placeholder.spec.shadertype == "fragment" || placeholder.spec.shadertype == "vertex") {
	            return _assetmgr.AssetManager.getFile(placeholder.spec.src).then(function (blob) {
	              return BlobUtil.blobToBinaryString(blob);
	            }).then(function (src) {
	              var shader = gl.createShader({ fragment: gl.FRAGMENT_SHADER, vertex: gl.VERTEX_SHADER }[placeholder.spec.shadertype]);
	              gl.shaderSource(shader, src);
	              gl.compileShader(shader);
	              if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	                var log = gl.getShaderInfoLog(shader);
	                gl.deleteShader(shader);
	                throw "Could not compile shader: " + log;
	              }
	
	              return shader;
	            });
	          }
	          if (placeholder.spec.shadertype == "program") {
	            var promises = placeholder.spec.shaders.map(function (id) {
	              return placeholder.depend(id);
	            });
	            return Promise.all(promises).then(function (shaders) {
	              var program = gl.createProgram();
	              for (var i = 0; i < shaders.length; i++) {
	                gl.attachShader(program, shaders[i]);
	              }
	              gl.linkProgram(program);
	
	              if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	                throw "Could not link program: " + gl.getProgramInfoLog(program);
	              }
	
	              var runtime = {
	                stride: 0,
	                numComponents: 0
	              };
	
	              var attribOffset = 0;
	              var attributes = placeholder.spec.attributes.map(function (attrib) {
	                var loc = gl.getAttribLocation(program, attrib.name);
	                if (loc == -1) {
	                  throw "Could not find attribute '" + attrib.name + "'";
	                }
	                runtime.stride += attrib.components * 4; // 4 bytes / float
	                runtime.numComponents += attrib.components;
	
	                attrib.location = loc;
	                attrib.runtime = {};
	                attrib.runtime.components = [];
	                attrib.runtime.offset = attribOffset;
	                attribOffset += attrib.components * 4; // 4 bytes / float
	                attrib.runtime.loadData = function (args, i) {
	                  switch (attrib.datatype) {
	                    case "color":
	                      var arg = args[i++];
	                      attrib.runtime.components[0] = arg.r;
	                      attrib.runtime.components[1] = arg.g;
	                      attrib.runtime.components[2] = arg.b;
	                      attrib.runtime.components[3] = arg.a;
	                      break;
	                    case "vec":
	                      for (var j = 0; j < attrib.components; j++) {
	                        attrib.runtime.components[j] = args[i++];
	                      }
	                      break;
	                    default:
	                      throw "bad attribute data type '" + attrib.datatype + "'";
	                  }
	
	                  return i;
	                };
	
	                return attrib;
	              });
	
	              var uniforms = placeholder.spec.uniforms.map(function (uniform) {
	                var loc = gl.getUniformLocation(program, uniform.name);
	                if (loc == -1) {
	                  throw "Could not find uniform '" + uniform.name + "'";
	                }
	
	                uniform.location = loc;
	
	                return uniform;
	              });
	
	              return {
	                program: program,
	                attributes: attributes,
	                uniforms: uniforms,
	                runtime: runtime
	              };
	            });
	          }
	          throw "bad shadertype: " + placeholder.spec.shadertype;
	        }
	      };
	
	      return {
	        canLoad: function canLoad(placeholder) {
	          return loaders[placeholder.spec.type] != undefined;
	        },
	        load: function load(placeholder) {
	          return loaders[placeholder.spec.type](placeholder);
	        }
	      };
	    },
	    createFontRenderer: function createFontRenderer(font, shader) {
	      var material = render.createMaterial(shader, {
	        matrix: render.pixelMatrix,
	        tex: font.texture
	      });
	
	      var rects = render.createShapeDrawer();
	      rects.useMaterial(material);
	
	      var self = {
	        height: font.height,
	        draw: function draw(color, x, y, z, string) {
	          for (var i = 0; i < string.length; i++) {
	            var glyph = font.glyphs[string[i]];
	
	            rects.drawTexturedAndColoredRect(color, x + glyph.offsetx, y + glyph.offsety, x + glyph.offsetx + glyph.rectw, y + glyph.offsety + glyph.recth, glyph.rectx / font.texture.width, glyph.recty / font.texture.height, (glyph.rectx + glyph.rectw) / font.texture.width, (glyph.recty + glyph.recth) / font.texture.height, z);
	
	            x += glyph.width;
	          }
	        },
	        useMatrix: function useMatrix(mat) {
	          rects.useMatrix(mat);
	        },
	        computeWidth: function computeWidth(string) {
	          var x = 0;
	
	          for (var i = 0; i < string.length; i++) {
	            var glyph = font.glyphs[string[i]];
	            x += glyph.width;
	          }
	
	          return x;
	        },
	        drawCentered: function drawCentered(color, x, y, z, string) {
	          self.draw(color, x - self.computeWidth(string) / 2, y, z, string);
	        },
	        flush: function flush() {
	          rects.flush();
	        }
	      };
	
	      return self;
	    },
	    createShapeDrawer: function createShapeDrawer() {
	      // trades flexibility for lack of allocations
	      var params = [];
	      var material = void 0;
	      var tform = _math.MatrixTransformer.create();
	
	      var self = {
	        useMaterial: function useMaterial(mat, block) {
	          var lastMaterial = material;
	          if (material) {
	            material.flush();
	          }
	          material = mat;
	          if (block) {
	            block();
	            material.flush();
	            material = lastMaterial;
	          }
	        },
	        useMatrix: function useMatrix(mat) {
	          tform.useMatrix(mat);
	        },
	        drawColoredRect: function drawColoredRect(color, x1, y1, x2, y2, z) {
	          if (z === undefined) {
	            z = 0;
	          }
	          var i = 0;
	          params[i++] = color;
	          i = tform.into(params, i, x1, y1, z);
	          i = tform.into(params, i, x2, y1, z);
	          i = tform.into(params, i, x1, y2, z);
	          i = tform.into(params, i, x2, y2, z);
	          material.drawQuad(params);
	        },
	        drawColoredTriangle: function drawColoredTriangle(color, x1, y1, x2, y2, x3, y3, z) {
	          if (z === undefined) {
	            z = 0;
	          }
	          var i = 0;
	          params[i++] = color;
	          i = tform.into(params, i, x1, y1, z);
	          i = tform.into(params, i, x2, y2, z);
	          i = tform.into(params, i, x3, y3, z);
	          material.drawTri(params);
	        },
	        drawTexturedRect: function drawTexturedRect(x1, y1, x2, y2, tx1, ty1, tx2, ty2, z) {
	          if (z === undefined) {
	            z = 0;
	          }
	          var i = 0;
	          i = tform.into(params, i, x1, y1, z);
	          params[i++] = tx1;
	          params[i++] = ty1;
	          i = tform.into(params, i, x2, y1, z);
	          params[i++] = tx2;
	          params[i++] = ty1;
	          i = tform.into(params, i, x1, y2, z);
	          params[i++] = tx1;
	          params[i++] = ty2;
	          i = tform.into(params, i, x2, y2, z);
	          params[i++] = tx2;
	          params[i++] = ty2;
	          material.drawQuad(params);
	        },
	        drawTexturedAndColoredRect: function drawTexturedAndColoredRect(c, x1, y1, x2, y2, tx1, ty1, tx2, ty2, z) {
	          if (z === undefined) {
	            z = 0;
	          }
	          var i = 0;
	          params[i++] = c;
	          i = tform.into(params, i, x1, y1, z);
	          params[i++] = tx1;
	          params[i++] = ty1;
	          i = tform.into(params, i, x2, y1, z);
	          params[i++] = tx2;
	          params[i++] = ty1;
	          i = tform.into(params, i, x1, y2, z);
	          params[i++] = tx1;
	          params[i++] = ty2;
	          i = tform.into(params, i, x2, y2, z);
	          params[i++] = tx2;
	          params[i++] = ty2;
	          material.drawQuad(params);
	        },
	        flush: function flush() {
	          material.flush();
	        }
	      };
	      return self;
	    },
	
	
	    pixelMatrix: _math.Mat4.create(),
	    pixelCenteredMatrix: _math.Mat4.create(),
	
	    createMaterial: function createMaterial(shader, uniforms) {
	      var triangles = 2048;
	
	      var vertBuffer = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	
	      var perVertex = [];
	      var perShape = [];
	      for (var i = 0; i < shader.attributes.length; i++) {
	        var attrib = shader.attributes[i];
	
	        switch (attrib.type) {
	          case "per-vertex":
	            perVertex.push(attrib);
	            break;
	          case "per-shape":
	            perShape.push(attrib);
	            break;
	          default:
	            throw "Bad attribute type '" + attrib.type + "' on " + attrib.name;
	        }
	      }
	
	      var buffer = new Float32Array(triangles * 3 // 3 vertices per triangle
	      * shader.runtime.numComponents);
	      var bp = 0; // buffer pos
	      var numTris = 0;
	
	      gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
	
	      var bufferFromAttributes = function bufferFromAttributes() {
	        for (var _i = 0; _i < shader.attributes.length; _i++) {
	          var _attrib = shader.attributes[_i];
	          for (var j = 0; j < _attrib.components; j++) {
	            buffer[bp++] = _attrib.runtime.components[j];
	          }
	        }
	      };
	
	      var self = {
	        drawQuad: function drawQuad(args) {
	          if (numTris + 2 > triangles) {
	            self.flush();
	          }
	
	          var argI = 0;
	          for (var _i2 = 0; _i2 < perShape.length; _i2++) {
	            argI = perShape[_i2].runtime.loadData(args, argI);
	          }
	
	          for (var _i3 = 0; _i3 < perVertex.length; _i3++) {
	            argI = perVertex[_i3].runtime.loadData(args, argI);
	          }
	          bufferFromAttributes();
	          var tri2argI = argI;
	          for (var h = 0; h < 2; h++) {
	            for (var _i4 = 0; _i4 < perVertex.length; _i4++) {
	              argI = perVertex[_i4].runtime.loadData(args, argI);
	            }
	            bufferFromAttributes();
	          }
	          argI = tri2argI; //rewind argument iterator to where it was after the first vertex was read
	          for (var _h = 0; _h < 3; _h++) {
	            for (var _i5 = 0; _i5 < perVertex.length; _i5++) {
	              argI = perVertex[_i5].runtime.loadData(args, argI);
	            }
	            bufferFromAttributes();
	          }
	
	          numTris += 2;
	        },
	        drawTri: function drawTri(args) {
	          if (numTris + 1 > triangles) {
	            self.flush();
	          }
	
	          var argI = 0;
	          for (var _i6 = 0; _i6 < perShape.length; _i6++) {
	            argI = perShape[_i6].runtime.loadData(args, argI);
	          }
	          for (var _i7 = 0; _i7 < 3; _i7++) {
	            for (var j = 0; j < perVertex.length; j++) {
	              argI = perVertex[j].runtime.loadData(args, argI);
	            }
	            bufferFromAttributes();
	          }
	
	          numTris++;
	        },
	
	
	        flush: function flush() {
	          gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	          gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
	
	          gl.useProgram(shader.program);
	
	          for (var _i8 = 0; _i8 < shader.attributes.length; _i8++) {
	            var _attrib2 = shader.attributes[_i8];
	            gl.enableVertexAttribArray(_attrib2.location);
	            gl.vertexAttribPointer(_attrib2.location, _attrib2.components, gl.FLOAT, false, shader.runtime.stride, _attrib2.runtime.offset);
	          }
	
	          var texunit = 0;
	          for (var _i9 = 0; _i9 < shader.uniforms.length; _i9++) {
	            var uniform = shader.uniforms[_i9];
	
	            var value = uniforms[uniform.name];
	            if (shader.uniforms[_i9].callback) {
	              value = value();
	            }
	
	            switch (shader.uniforms[_i9].datatype) {
	              case "mat4":
	                gl.uniformMatrix4fv(uniform.location, false, value.toGL());
	                break;
	              case "tex2d":
	                gl.activeTexture(gl.TEXTURE0 + texunit);
	                gl.bindTexture(gl.TEXTURE_2D, value.glTex);
	                gl.uniform1i(uniform.location, texunit);
	                texunit++;
	                break;
	              case "float":
	                gl.uniform1f(uniform.location, value);
	            }
	          }
	
	          gl.drawArrays(gl.TRIANGLES, 0, numTris * 3);
	
	          for (var _i10 = 0; _i10 < shader.attributes.length; _i10++) {
	            gl.disableVertexAttribArray(shader.attributes[_i10].location);
	          }
	
	          bp = 0;
	          numTris = 0;
	        }
	      };
	
	      return self;
	    }
	  };
	  return render;
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/* jshint -W079 */
	var Blob = __webpack_require__(3);
	var Promise = __webpack_require__(4);
	
	//
	// PRIVATE
	//
	
	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)
	function binaryStringToArrayBuffer(binary) {
	  var length = binary.length;
	  var buf = new ArrayBuffer(length);
	  var arr = new Uint8Array(buf);
	  var i = -1;
	  while (++i < length) {
	    arr[i] = binary.charCodeAt(i);
	  }
	  return buf;
	}
	
	// Can't find original post, but this is close
	// http://stackoverflow.com/questions/6965107/ (continues on next line)
	// converting-between-strings-and-arraybuffers
	function arrayBufferToBinaryString(buffer) {
	  var binary = '';
	  var bytes = new Uint8Array(buffer);
	  var length = bytes.byteLength;
	  var i = -1;
	  while (++i < length) {
	    binary += String.fromCharCode(bytes[i]);
	  }
	  return binary;
	}
	
	// doesn't download the image more than once, because
	// browsers aren't dumb. uses the cache
	function loadImage(src, crossOrigin) {
	  return new Promise(function (resolve, reject) {
	    var img = new Image();
	    if (crossOrigin) {
	      img.crossOrigin = crossOrigin;
	    }
	    img.onload = function () {
	      resolve(img);
	    };
	    img.onerror = reject;
	    img.src = src;
	  });
	}
	
	function imgToCanvas(img) {
	  var canvas = document.createElement('canvas');
	
	  canvas.width = img.width;
	  canvas.height = img.height;
	
	  // copy the image contents to the canvas
	  var context = canvas.getContext('2d');
	  context.drawImage(
	    img,
	    0, 0,
	    img.width, img.height,
	    0, 0,
	    img.width, img.height);
	
	  return canvas;
	}
	
	//
	// PUBLIC
	//
	
	/**
	 * Shim for
	 * [new Blob()]{@link https://developer.mozilla.org/en-US/docs/Web/API/Blob.Blob}
	 * to support
	 * [older browsers that use the deprecated <code>BlobBuilder</code> API]{@link http://caniuse.com/blob}.
	 *
	 * @param {Array} parts - content of the <code>Blob</code>
	 * @param {Object} options - usually just <code>{type: myContentType}</code>
	 * @returns {Blob}
	 */
	function createBlob(parts, options) {
	  options = options || {};
	  if (typeof options === 'string') {
	    options = {type: options}; // do you a solid here
	  }
	  return new Blob(parts, options);
	}
	
	/**
	 * Shim for
	 * [URL.createObjectURL()]{@link https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL}
	 * to support browsers that only have the prefixed
	 * <code>webkitURL</code> (e.g. Android <4.4).
	 * @param {Blob} blob
	 * @returns {string} url
	 */
	function createObjectURL(blob) {
	  return (window.URL || window.webkitURL).createObjectURL(blob);
	}
	
	/**
	 * Shim for
	 * [URL.revokeObjectURL()]{@link https://developer.mozilla.org/en-US/docs/Web/API/URL.revokeObjectURL}
	 * to support browsers that only have the prefixed
	 * <code>webkitURL</code> (e.g. Android <4.4).
	 * @param {string} url
	 */
	function revokeObjectURL(url) {
	  return (window.URL || window.webkitURL).revokeObjectURL(url);
	}
	
	/**
	 * Convert a <code>Blob</code> to a binary string. Returns a Promise.
	 *
	 * @param {Blob} blob
	 * @returns {Promise} Promise that resolves with the binary string
	 */
	function blobToBinaryString(blob) {
	  return new Promise(function (resolve, reject) {
	    var reader = new FileReader();
	    var hasBinaryString = typeof reader.readAsBinaryString === 'function';
	    reader.onloadend = function (e) {
	      var result = e.target.result || '';
	      if (hasBinaryString) {
	        return resolve(result);
	      }
	      resolve(arrayBufferToBinaryString(result));
	    };
	    reader.onerror = reject;
	    if (hasBinaryString) {
	      reader.readAsBinaryString(blob);
	    } else {
	      reader.readAsArrayBuffer(blob);
	    }
	  });
	}
	
	/**
	 * Convert a base64-encoded string to a <code>Blob</code>. Returns a Promise.
	 * @param {string} base64
	 * @param {string|undefined} type - the content type (optional)
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function base64StringToBlob(base64, type) {
	  return Promise.resolve().then(function () {
	    var parts = [binaryStringToArrayBuffer(atob(base64))];
	    return type ? createBlob(parts, {type: type}) : createBlob(parts);
	  });
	}
	
	/**
	 * Convert a binary string to a <code>Blob</code>. Returns a Promise.
	 * @param {string} binary
	 * @param {string|undefined} type - the content type (optional)
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function binaryStringToBlob(binary, type) {
	  return Promise.resolve().then(function () {
	    return base64StringToBlob(btoa(binary), type);
	  });
	}
	
	/**
	 * Convert a <code>Blob</code> to a binary string. Returns a Promise.
	 * @param {Blob} blob
	 * @returns {Promise} Promise that resolves with the binary string
	 */
	function blobToBase64String(blob) {
	  return blobToBinaryString(blob).then(function (binary) {
	    return btoa(binary);
	  });
	}
	
	/**
	 * Convert a data URL string
	 * (e.g. <code>'data:image/png;base64,iVBORw0KG...'</code>)
	 * to a <code>Blob</code>. Returns a Promise.
	 * @param {string} dataURL
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function dataURLToBlob(dataURL) {
	  return Promise.resolve().then(function () {
	    var type = dataURL.match(/data:([^;]+)/)[1];
	    var base64 = dataURL.replace(/^[^,]+,/, '');
	
	    var buff = binaryStringToArrayBuffer(atob(base64));
	    return createBlob([buff], {type: type});
	  });
	}
	
	/**
	 * Convert an image's <code>src</code> URL to a data URL by loading the image and painting
	 * it to a <code>canvas</code>. Returns a Promise.
	 *
	 * <p/>Note: this will coerce the image to the desired content type, and it
	 * will only paint the first frame of an animated GIF.
	 *
	 * @param {string} src
	 * @param {string|undefined} type - the content type (optional, defaults to 'image/png')
	 * @param {string|undefined} crossOrigin - for CORS-enabled images, set this to
	 *                                         'Anonymous' to avoid "tainted canvas" errors
	 * @param {number|undefined} quality - a number between 0 and 1 indicating image quality
	 *                                     if the requested type is 'image/jpeg' or 'image/webp'
	 * @returns {Promise} Promise that resolves with the data URL string
	 */
	function imgSrcToDataURL(src, type, crossOrigin, quality) {
	  type = type || 'image/png';
	
	  return loadImage(src, crossOrigin).then(function (img) {
	    return imgToCanvas(img);
	  }).then(function (canvas) {
	    return canvas.toDataURL(type, quality);
	  });
	}
	
	/**
	 * Convert a <code>canvas</code> to a <code>Blob</code>. Returns a Promise.
	 * @param {string} canvas
	 * @param {string|undefined} type - the content type (optional, defaults to 'image/png')
	 * @param {number|undefined} quality - a number between 0 and 1 indicating image quality
	 *                                     if the requested type is 'image/jpeg' or 'image/webp'
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function canvasToBlob(canvas, type, quality) {
	  return Promise.resolve().then(function () {
	    if (typeof canvas.toBlob === 'function') {
	      return new Promise(function (resolve) {
	        canvas.toBlob(resolve, type, quality);
	      });
	    }
	    return dataURLToBlob(canvas.toDataURL(type, quality));
	  });
	}
	
	/**
	 * Convert an image's <code>src</code> URL to a <code>Blob</code> by loading the image and painting
	 * it to a <code>canvas</code>. Returns a Promise.
	 *
	 * <p/>Note: this will coerce the image to the desired content type, and it
	 * will only paint the first frame of an animated GIF.
	 *
	 * @param {string} src
	 * @param {string|undefined} type - the content type (optional, defaults to 'image/png')
	 * @param {string|undefined} crossOrigin - for CORS-enabled images, set this to
	 *                                         'Anonymous' to avoid "tainted canvas" errors
	 * @param {number|undefined} quality - a number between 0 and 1 indicating image quality
	 *                                     if the requested type is 'image/jpeg' or 'image/webp'
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function imgSrcToBlob(src, type, crossOrigin, quality) {
	  type = type || 'image/png';
	
	  return loadImage(src, crossOrigin).then(function (img) {
	    return imgToCanvas(img);
	  }).then(function (canvas) {
	    return canvasToBlob(canvas, type, quality);
	  });
	}
	
	/**
	 * Convert an <code>ArrayBuffer</code> to a <code>Blob</code>. Returns a Promise.
	 *
	 * @param {ArrayBuffer} buffer
	 * @param {string|undefined} type - the content type (optional)
	 * @returns {Promise} Promise that resolves with the <code>Blob</code>
	 */
	function arrayBufferToBlob(buffer, type) {
	  return Promise.resolve().then(function () {
	    return createBlob([buffer], type);
	  });
	}
	
	/**
	 * Convert a <code>Blob</code> to an <code>ArrayBuffer</code>. Returns a Promise.
	 * @param {Blob} blob
	 * @returns {Promise} Promise that resolves with the <code>ArrayBuffer</code>
	 */
	function blobToArrayBuffer(blob) {
	  return new Promise(function (resolve, reject) {
	    var reader = new FileReader();
	    reader.onloadend = function (e) {
	      var result = e.target.result || new ArrayBuffer(0);
	      resolve(result);
	    };
	    reader.onerror = reject;
	    reader.readAsArrayBuffer(blob);
	  });
	}
	
	module.exports = {
	  createBlob         : createBlob,
	  createObjectURL    : createObjectURL,
	  revokeObjectURL    : revokeObjectURL,
	  imgSrcToBlob       : imgSrcToBlob,
	  imgSrcToDataURL    : imgSrcToDataURL,
	  canvasToBlob       : canvasToBlob,
	  dataURLToBlob      : dataURLToBlob,
	  blobToBase64String : blobToBase64String,
	  base64StringToBlob : base64StringToBlob,
	  binaryStringToBlob : binaryStringToBlob,
	  blobToBinaryString : blobToBinaryString,
	  arrayBufferToBlob  : arrayBufferToBlob,
	  blobToArrayBuffer  : blobToArrayBuffer
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Create a blob builder even when vendor prefixes exist
	 */
	
	var BlobBuilder = global.BlobBuilder
	  || global.WebKitBlobBuilder
	  || global.MSBlobBuilder
	  || global.MozBlobBuilder;
	
	/**
	 * Check if Blob constructor is supported
	 */
	
	var blobSupported = (function() {
	  try {
	    var a = new Blob(['hi']);
	    return a.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();
	
	/**
	 * Check if Blob constructor supports ArrayBufferViews
	 * Fails in Safari 6, so we need to map to ArrayBuffers there.
	 */
	
	var blobSupportsArrayBufferView = blobSupported && (function() {
	  try {
	    var b = new Blob([new Uint8Array([1,2])]);
	    return b.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();
	
	/**
	 * Check if BlobBuilder is supported
	 */
	
	var blobBuilderSupported = BlobBuilder
	  && BlobBuilder.prototype.append
	  && BlobBuilder.prototype.getBlob;
	
	/**
	 * Helper function that maps ArrayBufferViews to ArrayBuffers
	 * Used by BlobBuilder constructor and old browsers that didn't
	 * support it in the Blob constructor.
	 */
	
	function mapArrayBufferViews(ary) {
	  for (var i = 0; i < ary.length; i++) {
	    var chunk = ary[i];
	    if (chunk.buffer instanceof ArrayBuffer) {
	      var buf = chunk.buffer;
	
	      // if this is a subarray, make a copy so we only
	      // include the subarray region from the underlying buffer
	      if (chunk.byteLength !== buf.byteLength) {
	        var copy = new Uint8Array(chunk.byteLength);
	        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
	        buf = copy.buffer;
	      }
	
	      ary[i] = buf;
	    }
	  }
	}
	
	function BlobBuilderConstructor(ary, options) {
	  options = options || {};
	
	  var bb = new BlobBuilder();
	  mapArrayBufferViews(ary);
	
	  for (var i = 0; i < ary.length; i++) {
	    bb.append(ary[i]);
	  }
	
	  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
	};
	
	function BlobConstructor(ary, options) {
	  mapArrayBufferViews(ary);
	  return new Blob(ary, options || {});
	};
	
	module.exports = (function() {
	  if (blobSupported) {
	    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
	  } else if (blobBuilderSupported) {
	    return BlobBuilderConstructor;
	  } else {
	    return undefined;
	  }
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = typeof Promise === 'function' ? Promise : __webpack_require__(5);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var immediate = __webpack_require__(6);
	
	/* istanbul ignore next */
	function INTERNAL() {}
	
	var handlers = {};
	
	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];
	
	module.exports = Promise;
	
	function Promise(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}
	
	Promise.prototype["catch"] = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }
	
	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};
	
	function unwrap(promise, func, value) {
	  immediate(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}
	
	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;
	
	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};
	
	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && typeof obj === 'object' && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}
	
	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }
	
	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }
	
	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }
	
	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}
	
	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}
	
	Promise.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}
	
	Promise.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}
	
	Promise.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }
	
	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }
	
	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);
	
	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}
	
	Promise.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }
	
	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }
	
	  var i = -1;
	  var promise = new this(INTERNAL);
	
	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	var Mutation = global.MutationObserver || global.WebKitMutationObserver;
	
	var scheduleDrain;
	
	{
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = global.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
	    var channel = new global.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
	    scheduleDrain = function () {
	
	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = global.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();
	
	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      global.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	}
	
	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}
	
	module.exports = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.AssetManager = undefined;
	
	var _blobUtil = __webpack_require__(2);
	
	var BlobUtil = _interopRequireWildcard(_blobUtil);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var fileProviders = [];
	var assetLoaders = [];
	var assets = {};
	var placeholders = {};
	
	var AssetPlaceholder = function AssetPlaceholder(spec) {
	  var self = { spec: spec, id: spec.id };
	
	  var state = {};
	
	  self.state = "unbound";
	
	  self.promise = new Promise(function (resolve, reject) {
	    state.resolve = resolve;
	    state.reject = reject;
	  });
	
	  self.promise.then(function (value) {
	    self.state = "loaded";
	    self.value = value;
	  }, function (err) {
	    self.state = "error";
	    self.error = err;
	  });
	
	  self.bind = function (promise) {
	    self.state = "loading";
	    promise.then(state.resolve, state.reject);
	    return self.promise;
	  };
	
	  self.dependencies = [];
	  self.dependants = [];
	
	  self.depend = function (id) {
	    var ph = AssetManager.getPlaceholder(id);
	    if (!ph) {
	      throw "No such asset '" + id + "' has been discovered";
	    }
	    var verifyDepTree = function verifyDepTree(node) {
	      if (node.id == self.id) {
	        return [self.id];
	      }
	
	      for (var i = 0; i < node.dependencies.length; i++) {
	        var _loop = verifyDepTree(i);
	        if (_loop) {
	          return _loop.push(node.id);
	        }
	      }
	    };
	    var loop = verifyDepTree(ph);
	    if (!loop) {
	      self.dependencies.push(ph);
	      ph.dependants.push(self);
	      return ph.promise;
	    } else {
	      throw "Dependency loop: " + loop.join(" -> ");
	    }
	  };
	
	  return self;
	};
	
	var AssetManager = exports.AssetManager = {
	  GroupDownloadState: {
	    DISCOVERING: {
	      description: "Discovering assets"
	    },
	    DOWNLOADING: {
	      description: "Downloading assets"
	    }
	  },
	
	  getFile: function getFile(file, linkType) {
	    var errors = [];
	    var attempt = function attempt(i) {
	      var provider = fileProviders[i];
	      return provider.getFile(file, linkType).catch(function (error) {
	        errors.push(error);
	        if (i < fileProviders.length - 1) {
	          return attempt(i + 1);
	        } else {
	          throw errors;
	        }
	      });
	    };
	    return attempt(0);
	  },
	  getURL: function getURL(file) {
	    var errors = [];
	    var attempt = function attempt(i) {
	      try {
	        return fileProviders[i].getURL(file, linkType);
	      } catch (error) {
	        errors.push(error);
	        if (i < fileProviders.length - 1) {
	          return attempt(i + 1);
	        } else {
	          throw errors;
	        }
	      }
	    };
	    return attempt(0);
	  },
	  getPlaceholder: function getPlaceholder(id) {
	    if (!placeholders[id]) {
	      throw "No such asset '" + id + "' has been discovered";
	    }
	    return placeholders[id];
	  },
	  getAsset: function getAsset(id) {
	    if (!placeholders[id]) {
	      throw "No such asset '" + id + "' has been discovered";
	    }
	    if (!placeholders[id].value) {
	      throw "Asset '" + id + "' has not yet been loaded";
	    }
	    return placeholders[id].value;
	  },
	  downloadAssetGroup: function downloadAssetGroup(name) {
	    var promise = this.getFile(name + ".asgroup").then(function (blob) {
	      return BlobUtil.blobToBinaryString(blob);
	    }, function (err) {
	      throw err + " while discovering assets in group " + name;
	    }).then(function (string) {
	      return JSON.parse(string);
	    }).then(function (json) {
	      var loadingQueue = [];
	      for (var i = 0; i < json.length; i++) {
	        var spec = json[i];
	        loadingQueue.push(placeholders[spec.id] = AssetPlaceholder(spec));
	      }
	
	      var promises = [];
	
	      var _loop2 = function _loop2(_i) {
	        var placeholder = loadingQueue[_i];
	
	        var foundLoader = false;
	        for (var j = 0; j < assetLoaders.length; j++) {
	          if (assetLoaders[j].canLoad(placeholder)) {
	            foundLoader = true;
	            promises.push(placeholder.bind(assetLoaders[j].load(placeholder)).catch(function (err) {
	              throw err + " while loading " + placeholder.spec.id;
	            }));
	            break;
	          }
	        }
	
	        if (!foundLoader) {
	          throw "No loader found for spec " + JSON.stringify(placeholder.spec);
	        }
	      };
	
	      for (var _i = 0; _i < loadingQueue.length; _i++) {
	        _loop2(_i);
	      }
	
	      return Promise.all(promises);
	    });
	
	    promise.dlState = this.GroupDownloadState.DISCOVERING;
	    return promise;
	  },
	  addFileProvider: function addFileProvider(provider) {
	    fileProviders.push(provider);
	    fileProviders.sort(function (a, b) {
	      return Math.sign(b.priority - a.priority);
	    });
	  },
	  addAssetLoader: function addAssetLoader(loader) {
	    assetLoaders.push(loader);
	  }
	};
	
	AssetManager.addFileProvider({ // download over the network
	  priority: -1000,
	  getFile: function getFile(name, linkType) {
	    if (linkType && linkType != "assets") {
	      return Promise.reject("bad link type: " + linkType);
	    }
	    return fetch("assets/" + name.replace(" ", "%20")).then(function (response) {
	      if (!response.ok) {
	        throw "HTTP " + response.status + " " + response.statusText + " while downloading assets/" + name.replace(" ", "%20");
	      }
	      return response.blob();
	    });
	  },
	  getURL: function getURL(file, linkType) {
	    if (linkType && linkType != "assets") {
	      throw "bad link type d: " + linkType;
	    }
	    return "assets/" + file;
	  }
	});
	
	AssetManager.addFileProvider({
	  priority: 0,
	  getFile: function getFile(name, linkType) {
	    if (linkType != "remote") {
	      return Promise.reject("bad link type b: " + linkType + " on " + name);
	    }
	    return fetch(name).then(function (response) {
	      if (!response.ok) {
	        throw "HTTP " + response.status + " " + response.statusText + " while downloading assets/" + name.replace(" ", "%20");
	      }
	      return response.blob();
	    });
	  },
	  getURL: function getURL(file, linkType) {
	    if (linkType != "remote") {
	      throw "bad link type c: " + linkType;
	    }
	    return file;
	  }
	});

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Mat4 = exports.Mat4 = {
	  create: function create() {
	    var multBuffer = [[], [], [], []];
	
	    var gl = new Float32Array(16);
	
	    var self = {
	      val: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
	
	      toGL: function toGL() {
	        for (var i = 0; i < 4; i++) {
	          for (var j = 0; j < 4; j++) {
	            gl[i * 4 + j] = self.val[i][j];
	          }
	        }
	
	        return gl;
	      },
	
	
	      load: {
	        identity: function identity() {
	          self.load.from(Mat4.identity);
	        },
	        from: function from(src) {
	          for (var i = 0; i < 4; i++) {
	            for (var j = 0; j < 4; j++) {
	              self.val[i][j] = src.val[i][j];
	            }
	          }
	        },
	        translateFloor: function translateFloor(x, y, z) {
	          self.load.translate(Math.floor(x), Math.floor(y), Math.floor(z));
	        },
	        translate: function translate(x, y, z) {
	          self.load.identity();
	          self.val[3][0] = x;
	          self.val[3][1] = y;
	          self.val[3][2] = z;
	        },
	        scale: function scale(x, y, z) {
	          self.load.identity();
	          self.val[0][0] = x;
	          self.val[1][1] = y;
	          self.val[2][2] = z;
	        },
	        rotate: function rotate(rad) {
	          self.load.identity();
	          self.val[0][0] = Math.cos(rad);
	          self.val[1][0] = -Math.sin(rad);
	          self.val[0][1] = Math.sin(rad);
	          self.val[1][1] = Math.cos(rad);
	        }
	      },
	
	      multiply: function multiply(bMat) {
	        var b = self.val;
	        var a = bMat.val;
	
	        for (var i = 0; i < 4; i++) {
	          for (var j = 0; j < 4; j++) {
	            multBuffer[i][j] = 0;
	            for (var k = 0; k < 4; k++) {
	              multBuffer[i][j] += a[i][k] * b[k][j];
	            }
	          }
	        }
	
	        for (var _i = 0; _i < 4; _i++) {
	          for (var _j = 0; _j < 4; _j++) {
	            self.val[_i][_j] = multBuffer[_i][_j];
	          }
	        }
	      }
	    };
	
	    return self;
	  }
	};
	
	Mat4.identity = Mat4.create();
	
	var Mat4Stack = exports.Mat4Stack = {
	  create: function create() {
	    var stack = [];
	    for (var i = 0; i < 16; i++) {
	      stack[i] = Mat4.create();
	    }
	
	    var head = 0;
	
	    var self = {
	      reset: function reset() {
	        head = 0;
	      },
	      push: function push(matrix) {
	        if (head + 1 >= stack.length) {
	          stack[head + 1] = Mat4.create();
	        }
	        head++;
	        stack[head].load.from(matrix);
	      },
	      pop: function pop(matrix) {
	        matrix.load.from(stack[head--]);
	      },
	      peek: function peek(matrix) {
	        matrix.load.from(stack[head]);
	      }
	    };
	
	    return self;
	  }
	};
	
	var MatrixTransformer = exports.MatrixTransformer = {
	  create: function create() {
	    var matrix = void 0;
	
	    var apply = function apply(x, y, z, c) {
	      return matrix.val[0][c] * x + matrix.val[1][c] * y + matrix.val[2][c] * z + matrix.val[3][c] * 1;
	    };
	
	    var self = {
	      x: function x(_x, y, z) {
	        return apply(_x, y, z, 0);
	      },
	      y: function y(x, _y, z) {
	        return apply(x, _y, z, 1);
	      },
	      z: function z(x, y, _z) {
	        return apply(x, y, _z, 2);
	      },
	      into: function into(params, i, x, y, z) {
	        params[i++] = apply(x, y, z, 0);
	        params[i++] = apply(x, y, z, 1);
	        params[i++] = apply(x, y, z, 2);
	        return i;
	      },
	      useMatrix: function useMatrix(mat) {
	        matrix = mat;
	      }
	    };
	
	    return self;
	  }
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.PreloaderState = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _loader = __webpack_require__(11);
	
	var PreloaderState = exports.PreloaderState = function PreloaderState(game) {
	  var render = game.render;
	
	  var time = 0;
	  var uniformTickTimer = 0;
	
	  var promise = void 0;
	
	  return {
	    initialize: function initialize() {
	      promise = _assetmgr.AssetManager.downloadAssetGroup("base");
	      promise.then(function () {
	        game.switchState((0, _loader.LoaderState)(game));
	      }, function (err) {
	        console.log("failed to load assets: " + err);
	      });
	    },
	    uniformTick: function uniformTick() {// 200hz
	    },
	    tick: function tick(delta) {
	      // variable framerate
	      time += delta;
	      uniformTickTimer += delta;
	
	      if (uniformTickTimer > 5) {
	        uniformTickTimer -= 5;
	        this.uniformTick();
	      }
	
	      render.clear(_gfxutils.Colors.BLACK);
	    }
	  };
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Color = exports.Color = function Color(r, g, b, a) {
	  if (typeof r == "string") {
	    return {
	      r: parseInt(r.slice(1, 3), 16) / 255.0,
	      g: parseInt(r.slice(3, 5), 16) / 255.0,
	      b: parseInt(r.slice(5, 7), 16) / 255.0,
	      a: r.length == 7 ? 1 : parseInt(r.slice(7, 9)) / 255.0
	    };
	  }
	  return {
	    r: r, g: g, b: b, a: a
	  };
	};
	
	var Colors = exports.Colors = {
	  BLACK: Color(0, 0, 0, 1),
	  WHITE: Color(1, 1, 1, 1),
	  RED: Color(1, 0, 0, 1),
	  GREEN: Color(0, 1, 0, 1),
	  BLUE: Color(0, 0, 1, 1)
	};
	
	var ColorUtils = exports.ColorUtils = {
	  multRGB: function multRGB(color, fac) {
	    color.r *= fac;
	    color.g *= fac;
	    color.b *= fac;
	    return color;
	  },
	  pma: function pma(color) {
	    return ColorUtils.multRGB(color, color.a);
	  }
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.LoaderState = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _transitions = __webpack_require__(12);
	
	var _play = __webpack_require__(13);
	
	var LoaderState = exports.LoaderState = function LoaderState(game) {
	  var render = game.render;
	  var color = render.createMaterial(_assetmgr.AssetManager.getAsset("base.shader.flat.color"), {
	    matrix: render.pixelMatrix
	  });
	  var font = render.createFontRenderer(_assetmgr.AssetManager.getAsset("base.font.open_sans"), _assetmgr.AssetManager.getAsset("base.shader.flat.texcolor"), render.pixelMatrix);
	  var smallfont = render.createFontRenderer(_assetmgr.AssetManager.getAsset("base.font.coders_crux"), _assetmgr.AssetManager.getAsset("base.shader.flat.texcolor"), render.pixelMatrix);
	  var rects = render.createShapeDrawer();
	  var opMatrix = _math.Mat4.create();
	  var matrix = _math.Mat4.create();
	  var matStack = _math.Mat4Stack.create();
	
	  var time = 0;
	
	  var backgroundColor = (0, _gfxutils.Color)("#422D24");
	  var foregroundColor = (0, _gfxutils.Color)("#241711");
	
	  var transition = (0, _transitions.DiamondTransition)(game, "left");
	
	  var error = void 0;
	  var errored = false;
	
	  return {
	    initialize: function initialize() {
	      _assetmgr.AssetManager.downloadAssetGroup("game").then(function () {
	        transition.to((0, _play.PlayState)(game, transition), 500, 100);
	      }, function (err) {
	        console.log("failed to load assets: " + err);
	        errored = true;
	        error = err;
	      });
	    },
	    tick: function tick(delta) {
	      render.clear(backgroundColor);
	
	      matStack.reset();
	      matrix.load.identity();
	      matStack.push(matrix);
	
	      //rects.useMatrix(matrix);
	      //rects.useMaterial(color);
	      //rects.flush();
	
	      opMatrix.load.translate(render.width() / 2, render.height() / 2, 0);
	      matrix.multiply(opMatrix);
	
	      opMatrix.load.translate(render.width() % 2 / 2, render.height() % 2 / 2, 0); //pixel aign
	      matrix.multiply(opMatrix);
	
	      font.useMatrix(matrix);
	      smallfont.useMatrix(matrix);
	      if (!errored) {
	        font.drawCentered(foregroundColor, 0, -318, 0.5, "Downloading Resources...");
	      } else {
	        font.drawCentered(foregroundColor, 0, -318, 0.5, "Error While Downloading Assets:");
	        smallfont.drawCentered(foregroundColor, 0, -316 + font.height, 0.5, error);
	        smallfont.flush();
	      }
	      font.flush();
	
	      transition.draw(delta);
	    }
	  };
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.DiamondTransition = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var DiamondTransition = exports.DiamondTransition = function DiamondTransition(game, dir) {
	  var render = game.render;
	
	  var time = 0;
	  var target = 0;
	  var state = void 0;
	  var pause = void 0;
	
	  var material = render.createMaterial(_assetmgr.AssetManager.getAsset("base.shader.flat.color"), {
	    matrix: render.pixelCenteredMatrix
	  });
	
	  var switched = false;
	
	  var self = {
	    to: function to(state2, duration, pause2) {
	      time = 0;
	      target = duration;
	      state = state2;
	      pause = pause2;
	      switched = false;
	    },
	    draw: function draw(delta) {
	      if (target <= 0) {
	        return;
	      }
	      time += delta;
	      if (time > target && !switched) {
	        switched = true;
	        game.switchState(state);
	      }
	
	      var progress = time / target;
	
	      if (progress < 2) {
	        var params = [];
	        var color = _gfxutils.Colors.BLACK;
	
	        var size = 20;
	
	        var _dir = progress < 1 ? 1 : -1;
	
	        var pg = progress;
	
	        if (progress > 1) {
	          if (pause > 0) {
	            pause -= delta;
	            time -= delta;
	            progress = 1;
	          }
	          pg = 1 - (progress - 1);
	        }
	
	        for (var x = -render.width() / 2; x <= render.width() / 2 + size; x += size * 2) {
	          for (var y = -render.height() / 2; y <= render.height() / 2 + size; y += size * 2) {
	            var i = 0;
	            var sz = size * (pg * 3 - _dir * (x / render.width()) - 0.5);
	
	            if (sz > 0) {
	              params[i++] = color;
	
	              params[i++] = x - sz;
	              params[i++] = y;
	              params[i++] = 1;
	
	              params[i++] = x;
	              params[i++] = y - sz;
	              params[i++] = 1;
	
	              params[i++] = x;
	              params[i++] = y + sz;
	              params[i++] = 1;
	
	              params[i++] = x + sz;
	              params[i++] = y;
	              params[i++] = 1;
	              material.drawQuad(params);
	            }
	          }
	        }
	
	        material.flush();
	      }
	    }
	  };
	  return self;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.PlayState = exports.lerp = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _keyboard = __webpack_require__(14);
	
	var _palette = __webpack_require__(15);
	
	var _box2dHtml = __webpack_require__(16);
	
	var box2d = _interopRequireWildcard(_box2dHtml);
	
	var _objects = __webpack_require__(17);
	
	var obj = _interopRequireWildcard(_objects);
	
	var _dialogue = __webpack_require__(27);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var lerp = exports.lerp = function lerp(a, b, x) {
	  return a + x * (b - a);
	};
	
	var modulo = function modulo(a, b) {
	  return (a % b + b) % b;
	};
	
	var PlayState = exports.PlayState = function PlayState(game, transition) {
	  var _time = 0;
	
	  var objects = [];
	
	  var render = game.render;
	  var shapesMaterial = render.createMaterial(_assetmgr.AssetManager.getAsset("base.shader.flat.color"), {
	    matrix: render.pixelMatrix
	  });
	  var font = render.createFontRenderer(_assetmgr.AssetManager.getAsset("base.font.coders_crux"), _assetmgr.AssetManager.getAsset("base.shader.flat.texcolor"));
	  var fb = render.createFramebuffer(100); // 100 pixels of padding
	  var postMatrix = _math.Mat4.create();
	  var post = render.createMaterial(_assetmgr.AssetManager.getAsset("game.shader.reflection"), {
	    framebuffer: fb.getTexture(),
	    perlin: _assetmgr.AssetManager.getAsset("game.noise.perlin"),
	    matrix: postMatrix,
	    time: function time() {
	      return _time;
	    },
	    pixwidth: render.fbwidth,
	    pixheight: render.fbheight,
	    refY: function refY() {
	      return fb.ytoc(0);
	    }
	  });
	  var dialogue = (0, _dialogue.DialogueInterpreter)();
	  dialogue.loadTree(_assetmgr.AssetManager.getAsset("game.dialogue"));
	
	  var shapes = render.createShapeDrawer();
	
	  var opMatrix = _math.Mat4.create();
	  var matStack = _math.Mat4Stack.create();
	  var matrix = _math.Mat4.create();
	  shapes.useMatrix(matrix);
	  shapes.useMaterial(shapesMaterial);
	  font.useMatrix(matrix);
	
	  var kb = _keyboard.Keyboard.create();
	  var uniformTimer = 0;
	
	  var snow = [];
	  var snowAngle = -100 * 180.0 / (2 * Math.PI);
	  var snowDepth = 0.1;
	  for (var i = 0; i < 700; i++) {
	    snow.push({ x: Math.random(), y: Math.random(), speed: Math.random() });
	  }
	
	  var width = 1280;
	  var height = 720;
	
	  var self = {
	    game: game,
	    font: font,
	    dialogue: dialogue,
	    debugMode: false,
	    availableCalls: {},
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
	    addObject: function addObject(obj) {
	      obj.id = objects.length;
	      objects.push(obj);
	      if (obj.initialize) {
	        obj.initialize(self);
	      }
	    },
	    initialize: function initialize() {
	      console.log("initialize play state");
	      self.addObject(obj.Office());
	      self.addObject(self.notepad = obj.Notepad());
	      self.addObject(self.telephone = obj.Telephone());
	      self.addObject(self.fader = obj.Fader());
	      self.addObject(self.textBox = obj.TextBox());
	      self.telephone.textbox = self.textBox;
	      dialogue.linkTextbox(self.textBox);
	      dialogue.linkNotepad(self.notepad);
	      dialogue.addCommand("unfade", function (params) {
	        self.fader.unfade();
	        return Promise.resolve();
	      });
	      dialogue.addCommand("sfx", function (elem) {
	        game.sound.playSound(_assetmgr.AssetManager.getAsset(elem.textContent.trim()));
	        return Promise.resolve();
	      });
	      dialogue.addCommand("notepad", function (elem) {
	        self.notepad.addNote({
	          id: elem.getAttribute("id"),
	          content: elem.textContent.trim()
	        });
	        return Promise.resolve();
	      });
	      dialogue.addCommand("notebook", function (elem) {
	        self.notepad.addNote({
	          id: elem.getAttribute("id"),
	          content: elem.textContent.trim()
	        });
	        return Promise.resolve();
	      });
	      dialogue.addCommand("delNote", function (elem) {
	        self.notepad.delNote(elem.textContent.trim());
	      });
	      dialogue.addCommand("addCall", function (elem) {
	        self.telephone.addCall({
	          link: elem.getAttribute("link"),
	          title: elem.textContent.trim(),
	          id: elem.getAttribute("id")
	        });
	        return Promise.resolve();
	      });
	      dialogue.addCommand("modCall", function (elem) {
	        self.telephone.modCall({
	          id: elem.getAttribute("id"),
	          link: elem.getAttribute("link"),
	          title: elem.textContent.trim()
	        });
	        return Promise.resolve();
	      });
	      dialogue.addCommand("enableCalling", function (elem) {
	        self.telephone.enabled = true;
	        return Promise.resolve();
	      });
	      dialogue.addCommand("disableCalling", function (elem) {
	        self.telephone.enabled = false;
	        return Promise.resolve();
	      });
	      dialogue.begin("misc.debugmenu").then(function () {
	        self.textBox.hide();
	        self.fader.unfade();
	      });
	    },
	    drawScene: function drawScene() {
	      render.clearBuffers();
	      render.clear(_gfxutils.Colors.BLACK);
	      matrix.load.identity();
	
	      var factor = Math.min(render.width() / width, render.height() / height);
	      var tgtW = width * factor;
	      var tgtH = height * factor;
	      opMatrix.load.translate((render.width() - tgtW) / 2, (render.height() - tgtH) / 2, 0);
	      matrix.multiply(opMatrix);
	      opMatrix.load.scale(factor, factor, 1);
	      matrix.multiply(opMatrix);
	
	      render.drawStencil();
	      shapes.drawColoredRect(_gfxutils.Colors.WHITE, 0, 0, width, height, 0.5);
	      shapes.flush();
	      render.drawColor();
	      render.setStencil(true);
	
	      shapes.drawColoredRect(_palette.colors.bg, 0, 0, width, height, 0);
	
	      for (var _i = 0; _i < snow.length; _i++) {
	        var sz = lerp(1.5, 2.5, snow[_i].speed);
	        shapes.drawColoredRect(_palette.colors.snow, modulo(snow[_i].x * width - self.camera.x, width), modulo(snow[_i].y * height - self.camera.y, height), modulo(snow[_i].x * width - self.camera.x, width) + sz, modulo(snow[_i].y * height - self.camera.y, height) + sz, snowDepth);
	      }
	
	      //      opMatrix.load.translate(Math.floor(width/2), Math.floor(height/2), 0);
	      //      matrix.multiply(opMatrix);
	
	      for (var _i2 = 0; _i2 < objects.length; _i2++) {
	        matStack.push(matrix);
	        self.drawObject(objects[_i2]);
	        matStack.pop(matrix);
	      }
	
	      shapes.flush();
	
	      //      render.setStencil(false);
	    },
	    debugInfo: function debugInfo(object) {
	      var info = [];
	      info.push("(" + object.x + ", " + object.y + ") " + object.type + " #" + object.id);
	      info.push("parallax: " + object.parallax);
	      return info;
	    },
	    drawDebugInfoBox: function drawDebugInfoBox(info) {
	      var y = 0;
	      for (var _i3 = 0; _i3 < info.length; _i3++) {
	        shapes.drawColoredRect(_palette.colors.debugBox, 0, y, font.computeWidth(info[_i3]), font.height + y, 0.999);
	        font.draw(_gfxutils.Colors.WHITE, 0, y, 1, info[_i3]);
	        y += font.height;
	      }
	    },
	    drawObject: function drawObject(object) {
	      var parallax = object.parallax;
	      if (parallax == undefined) {
	        parallax = 1;
	      }
	      opMatrix.load.translateFloor(-self.camera.x * parallax, -self.camera.y * parallax, 0);
	      matrix.multiply(opMatrix);
	      opMatrix.load.translate(object.x, object.y, 0);
	      matrix.multiply(opMatrix);
	      matStack.push(matrix);
	      object.draw(shapes, font, matrix, opMatrix);
	      matStack.pop(matrix);
	
	      if (self.debugMode && !object.noDebug) {
	        shapes.drawColoredRect(_gfxutils.Colors.RED, 0, 0, 2, object.h, 0.999);
	        shapes.drawColoredRect(_gfxutils.Colors.RED, 0, 0, object.w, 2, 0.999);
	        shapes.drawColoredRect(_gfxutils.Colors.RED, object.w, 0, object.w - 2, object.h, 0.999);
	        shapes.drawColoredRect(_gfxutils.Colors.RED, 0, object.h - 2, object.w, object.h, 0.999);
	
	        var info = self.debugInfo(object);
	        self.drawDebugInfoBox(info);
	      }
	      shapes.flush();
	      font.flush();
	    },
	    step: function step() {
	      for (var _i4 = 0; _i4 < snow.length; _i4++) {
	        snow[_i4].x += lerp(0.0001, 0.0008, snow[_i4].speed) * Math.sin(snowAngle + Math.sin(_time / 1000.0) * lerp(0.7, 1, snow[_i4].speed) / 6.0);
	        snow[_i4].y += lerp(0.0001, 0.0008, snow[_i4].speed) * Math.cos(snowAngle + Math.sin(_time / 1000.0) * lerp(0.7, 1, snow[_i4].speed) / 6.0);
	        snow[_i4].x %= 1;
	        snow[_i4].y %= 1;
	      }
	      for (var _i5 = 0; _i5 < objects.length; _i5++) {
	        if (objects[_i5].step) {
	          objects[_i5].step();
	        }
	      }
	    },
	
	    mouse: {},
	    tick: function tick(delta) {
	      var factor = Math.min(render.width() / width, render.height() / height);
	      var tgtW = width * factor;
	      var tgtH = height * factor;
	      self.mouse.x = (game.mouse.x - (render.width() - tgtW) / 2) / factor;
	      self.mouse.y = (game.mouse.y - (render.height() - tgtH) / 2) / factor;
	
	      uniformTimer += delta;
	      while (uniformTimer > 5) {
	        self.step();
	        uniformTimer -= 5;
	      }
	
	      for (var _i6 = 0; _i6 < objects.length; _i6++) {
	        if (objects[_i6].tick) {
	          objects[_i6].tick(delta);
	        }
	      }
	
	      if (self.camera.follow) {
	        self.camera.x = self.camera.follow.x;
	        self.camera.y = self.camera.follow.y;
	      }
	
	      self.drawScene();
	      shapes.flush();
	      font.flush();
	
	      transition.draw(delta);
	      _time += delta;
	    },
	    getKeyboard: function getKeyboard() {
	      return kb;
	    }
	  };
	  return self;
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Keyboard = exports.Keyboard = {
	  create: function create() {
	    var bindMap = {};
	    var bindings = [];
	
	    var self = {
	      createKeybind: function createKeybind() {
	        var lastState = false;
	        var state = false;
	
	        var pressCBs = [];
	        var releaseCBs = [];
	
	        var bind = {
	          press: function press() {
	            state = true;
	          },
	          release: function release() {
	            state = false;
	          },
	          justPressed: function justPressed() {
	            return state && !lastState;
	          },
	          justReleased: function justReleased() {
	            return !state && lastState;
	          },
	          isPressed: function isPressed() {
	            return state;
	          },
	          update: function update() {
	            if (bind.justPressed()) {
	              for (var i = 0; i < pressCBs.length; i++) {
	                pressCBs[i]();
	              }
	            }
	            if (bind.justReleased()) {
	              for (var _i = 0; _i < releaseCBs.length; _i++) {
	                releaseCBs[_i]();
	              }
	            }
	
	            lastState = state;
	          },
	          addPressCallback: function addPressCallback(cb) {
	            pressCBs.push(cb);
	          },
	          addReleaseCallback: function addReleaseCallback(cb) {
	            releaseCBs.push(cb);
	          }
	        };
	
	        for (var i = 0; i < arguments.length; i++) {
	          if (!bindMap[arguments[i]]) {
	            bindMap[arguments[i]] = [];
	          }
	          bindMap[arguments[i]].push(bind);
	        }
	
	        bindings.push(bind);
	
	        return bind;
	      },
	      update: function update() {
	        for (var i = 0; i < bindings.length; i++) {
	          bindings[i].update();
	        }
	      },
	      keyDown: function keyDown(evt) {
	        if (bindMap[evt.key]) {
	          for (var i = 0; i < bindMap[evt.key].length; i++) {
	            bindMap[evt.key][i].press();
	          }
	        }
	      },
	      keyUp: function keyUp(evt) {
	        if (bindMap[evt.key]) {
	          for (var i = 0; i < bindMap[evt.key].length; i++) {
	            bindMap[evt.key][i].release();
	          }
	        }
	      }
	    };
	
	    return self;
	  }
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.colors = undefined;
	
	var _gfxutils = __webpack_require__(10);
	
	var colors = exports.colors = {
	  bg: (0, _gfxutils.Color)(0.1, 0.05, 0.1, 1),
	  debugBox: (0, _gfxutils.Color)(0, 0, 0, 0.5),
	  snow: _gfxutils.Colors.WHITE,
	  bgWall: {
	    stripeA: (0, _gfxutils.Color)(0.04, 0.04, 0.04, 1),
	    stripeB: (0, _gfxutils.Color)(0.07, 0.07, 0.08, 1)
	  },
	  carpet: (0, _gfxutils.Color)("#171513"),
	  window: _gfxutils.ColorUtils.pma((0, _gfxutils.Color)(0.4, 0.4, 0.5, 0.2)),
	  trim: (0, _gfxutils.Color)(0.75, 0.75, 0.75, 1),
	  trimShadow: (0, _gfxutils.Color)(0.2, 0.2, 0.2, 1),
	  textbox: {
	    bg: (0, _gfxutils.Color)(0.07, 0.07, 0.05, 1),
	    trim: (0, _gfxutils.Color)("#8CB856"),
	    visited: (0, _gfxutils.Color)(0.5, 0.5, 0.51, 1)
	  },
	  soliloquyText: (0, _gfxutils.Color)(0.5, 0.5, 1, 1),
	  notepad: (0, _gfxutils.Color)("#fffc7a"),
	  notepadLines: (0, _gfxutils.Color)("#c6c6ba"),
	  contacts: {
	    stripeA: (0, _gfxutils.Color)(0.6, 0.6, 0.6, 1),
	    stripeB: (0, _gfxutils.Color)(0.8, 0.8, 0.8, 1),
	    hoveredA: (0, _gfxutils.Color)(0.6, 0.6, 0.7, 1),
	    hoveredB: (0, _gfxutils.Color)(0.8, 0.8, 0.9, 1)
	  }
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	https://github.com/mvasilkov/box2d-html5
	*/!function(){{var t,e=function(){var t=!1,e=e||{};return e.global=this,e.global.CLOSURE_DEFINES,e.exportPath_=function(t,o,i){var n=t.split("."),s=i||e.global;n[0]in s||!s.execScript||s.execScript("var "+n[0]);for(var r;n.length&&(r=n.shift());)n.length||void 0===o?s=s[r]?s[r]:s[r]={}:s[r]=o},e.define=function(o,i){var n=i;t||e.global.CLOSURE_DEFINES&&Object.prototype.hasOwnProperty.call(e.global.CLOSURE_DEFINES,o)&&(n=e.global.CLOSURE_DEFINES[o]),e.exportPath_(o,n)},e.DEBUG=!0,e.define("goog.LOCALE","en"),e.define("goog.TRUSTED_SITE",!0),e.provide=function(o){if(!t){if(e.isProvided_(o))throw Error('Namespace "'+o+'" already declared.');delete e.implicitNamespaces_[o];for(var i=o;(i=i.substring(0,i.lastIndexOf(".")))&&!e.getObjectByName(i);)e.implicitNamespaces_[i]=!0}e.exportPath_(o)},e.setTestOnly=function(o){if(t&&!e.DEBUG)throw o=o||"",Error(": "+o)},t||(e.isProvided_=function(t){return!e.implicitNamespaces_[t]&&!!e.getObjectByName(t)},e.implicitNamespaces_={}),e.getObjectByName=function(t,o){for(var i,n=t.split("."),s=o||e.global;i=n.shift();){if(!e.isDefAndNotNull(s[i]))return null;s=s[i]}return s},e.globalize=function(t,o){var i=o||e.global;for(var n in t)i[n]=t[n]},e.addDependency=function(t,o,i){if(e.DEPENDENCIES_ENABLED){for(var n,s,r=t.replace(/\\/g,"/"),a=e.dependencies_,l=0;n=o[l];l++)a.nameToPath[n]=r,r in a.pathToNames||(a.pathToNames[r]={}),a.pathToNames[r][n]=!0;for(var p=0;s=i[p];p++)r in a.requires||(a.requires[r]={}),a.requires[r][s]=!0}},e.define("goog.ENABLE_DEBUG_LOADER",!0),e.require=function(o){if(!t){if(e.isProvided_(o))return;if(e.ENABLE_DEBUG_LOADER){var i=e.getPathFromDeps_(o);if(i)return e.included_[i]=!0,e.writeScripts_(),void 0}var n="goog.require could not find: "+o;throw e.global.console&&e.global.console.error(n),Error(n)}},e.basePath="",e.global.CLOSURE_BASE_PATH,e.global.CLOSURE_NO_DEPS,e.global.CLOSURE_IMPORT_SCRIPT,e.nullFunction=function(){},e.identityFunction=function(t){return t},e.abstractMethod=function(){throw Error("unimplemented abstract method")},e.addSingletonGetter=function(t){t.getInstance=function(){return t.instance_?t.instance_:(e.DEBUG&&(e.instantiatedSingletons_[e.instantiatedSingletons_.length]=t),t.instance_=new t)}},e.instantiatedSingletons_=[],e.DEPENDENCIES_ENABLED=!t&&e.ENABLE_DEBUG_LOADER,e.DEPENDENCIES_ENABLED&&(e.included_={},e.dependencies_={pathToNames:{},nameToPath:{},requires:{},visited:{},written:{}},e.inHtmlDocument_=function(){var t=e.global.document;return"undefined"!=typeof t&&"write"in t},e.findBasePath_=function(){if(e.global.CLOSURE_BASE_PATH)return e.basePath=e.global.CLOSURE_BASE_PATH,void 0;if(e.inHtmlDocument_())for(var t=e.global.document,o=t.getElementsByTagName("script"),i=o.length-1;i>=0;--i){var n=o[i].src,s=n.lastIndexOf("?"),r=-1==s?n.length:s;if("base.js"==n.substr(r-7,7))return e.basePath=n.substr(0,r-7),void 0}},e.importScript_=function(t){var o=e.global.CLOSURE_IMPORT_SCRIPT||e.writeScriptTag_;!e.dependencies_.written[t]&&o(t)&&(e.dependencies_.written[t]=!0)},e.writeScriptTag_=function(t){if(e.inHtmlDocument_()){var o=e.global.document;if("complete"==o.readyState){var i=/\bdeps.js$/.test(t);if(i)return!1;throw Error('Cannot write "'+t+'" after document load')}return o.write('<script type="text/javascript" src="'+t+'"></script>'),!0}return!1},e.writeScripts_=function(){function t(s){if(!(s in n.written)){if(s in n.visited)return s in i||(i[s]=!0,o.push(s)),void 0;if(n.visited[s]=!0,s in n.requires)for(var r in n.requires[s])if(!e.isProvided_(r)){if(!(r in n.nameToPath))throw Error("Undefined nameToPath for "+r);t(n.nameToPath[r])}s in i||(i[s]=!0,o.push(s))}}var o=[],i={},n=e.dependencies_;for(var s in e.included_)n.written[s]||t(s);for(var r=0;r<o.length;r++){if(!o[r])throw Error("Undefined script input");e.importScript_(e.basePath+o[r])}},e.getPathFromDeps_=function(t){return t in e.dependencies_.nameToPath?e.dependencies_.nameToPath[t]:null},e.findBasePath_(),e.global.CLOSURE_NO_DEPS||e.importScript_(e.basePath+"deps.js")),e.typeOf=function(t){var e=typeof t;if("object"==e){if(!t)return"null";if(t instanceof Array)return"array";if(t instanceof Object)return e;var o=Object.prototype.toString.call(t);if("[object Window]"==o)return"object";if("[object Array]"==o||"number"==typeof t.length&&"undefined"!=typeof t.splice&&"undefined"!=typeof t.propertyIsEnumerable&&!t.propertyIsEnumerable("splice"))return"array";if("[object Function]"==o||"undefined"!=typeof t.call&&"undefined"!=typeof t.propertyIsEnumerable&&!t.propertyIsEnumerable("call"))return"function"}else if("function"==e&&"undefined"==typeof t.call)return"object";return e},e.isDef=function(t){return void 0!==t},e.isNull=function(t){return null===t},e.isDefAndNotNull=function(t){return null!=t},e.isArray=function(t){return"array"==e.typeOf(t)},e.isArrayLike=function(t){var o=e.typeOf(t);return"array"==o||"object"==o&&"number"==typeof t.length},e.isDateLike=function(t){return e.isObject(t)&&"function"==typeof t.getFullYear},e.isString=function(t){return"string"==typeof t},e.isBoolean=function(t){return"boolean"==typeof t},e.isNumber=function(t){return"number"==typeof t},e.isFunction=function(t){return"function"==e.typeOf(t)},e.isObject=function(t){var e=typeof t;return"object"==e&&null!=t||"function"==e},e.getUid=function(t){return t[e.UID_PROPERTY_]||(t[e.UID_PROPERTY_]=++e.uidCounter_)},e.hasUid=function(t){return!!t[e.UID_PROPERTY_]},e.removeUid=function(t){"removeAttribute"in t&&t.removeAttribute(e.UID_PROPERTY_);try{delete t[e.UID_PROPERTY_]}catch(o){}},e.UID_PROPERTY_="closure_uid_"+(1e9*Math.random()>>>0),e.uidCounter_=0,e.getHashCode=e.getUid,e.removeHashCode=e.removeUid,e.cloneObject=function(t){var o=e.typeOf(t);if("object"==o||"array"==o){if(t.clone)return t.clone();var i="array"==o?[]:{};for(var n in t)i[n]=e.cloneObject(t[n]);return i}return t},e.bindNative_=function(t){return t.call.apply(t.bind,arguments)},e.bindJs_=function(t,e){if(!t)throw new Error;if(arguments.length>2){var o=Array.prototype.slice.call(arguments,2);return function(){var i=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(i,o),t.apply(e,i)}}return function(){return t.apply(e,arguments)}},e.bind=function(){return e.bind=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?e.bindNative_:e.bindJs_,e.bind.apply(null,arguments)},e.partial=function(t){var e=Array.prototype.slice.call(arguments,1);return function(){var o=e.slice();return o.push.apply(o,arguments),t.apply(this,o)}},e.mixin=function(t,e){for(var o in e)t[o]=e[o]},e.now=e.TRUSTED_SITE&&Date.now||function(){return+new Date},e.globalEval=function(t){if(e.global.execScript)e.global.execScript(t,"JavaScript");else{if(!e.global.eval)throw Error("goog.globalEval not available");if(null==e.evalWorksForGlobals_&&(e.global.eval("var _et_ = 1;"),"undefined"!=typeof e.global._et_?(delete e.global._et_,e.evalWorksForGlobals_=!0):e.evalWorksForGlobals_=!1),e.evalWorksForGlobals_)e.global.eval(t);else{var o=e.global.document,i=o.createElement("script");i.type="text/javascript",i.defer=!1,i.appendChild(o.createTextNode(t)),o.body.appendChild(i),o.body.removeChild(i)}}},e.evalWorksForGlobals_=null,e.cssNameMapping_,e.cssNameMappingStyle_,e.getCssName=function(t,o){var i,n=function(t){return e.cssNameMapping_[t]||t},s=function(t){for(var e=t.split("-"),o=[],i=0;i<e.length;i++)o.push(n(e[i]));return o.join("-")};return i=e.cssNameMapping_?"BY_WHOLE"==e.cssNameMappingStyle_?n:s:function(t){return t},o?t+"-"+i(o):i(t)},e.setCssNameMapping=function(t,o){e.cssNameMapping_=t,e.cssNameMappingStyle_=o},e.global.CLOSURE_CSS_NAME_MAPPING,!t&&e.global.CLOSURE_CSS_NAME_MAPPING&&(e.cssNameMapping_=e.global.CLOSURE_CSS_NAME_MAPPING),e.getMsg=function(t,e){var o=e||{};for(var i in o){var n=(""+o[i]).replace(/\$/g,"$$$$");t=t.replace(new RegExp("\\{\\$"+i+"\\}","gi"),n)}return t},e.getMsgWithFallback=function(t){return t},e.exportSymbol=function(t,o,i){e.exportPath_(t,o,i)},e.exportProperty=function(t,e,o){t[e]=o},e.inherits=function(t,e){function o(){}o.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new o,t.prototype.constructor=t},e.base=function(t,o){var i=arguments.callee.caller;if(e.DEBUG&&!i)throw Error("arguments.caller not defined.  goog.base() expects not to be running in strict mode. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");if(i.superClass_)return i.superClass_.constructor.apply(t,Array.prototype.slice.call(arguments,1));for(var n=Array.prototype.slice.call(arguments,2),s=!1,r=t.constructor;r;r=r.superClass_&&r.superClass_.constructor)if(r.prototype[o]===i)s=!0;else if(s)return r.prototype[o].apply(t,n);if(t[o]===i)return t.constructor.prototype[o].apply(t,n);throw Error("goog.base called from a method of one name to a method of a different name")},e.scope=function(t){t.call(e.global)},e}(),o=function(e){return"undefined"==typeof t&&(t={}),"undefined"==typeof t.b2Settings&&(t.b2Settings={}),Object.defineProperty||(Object.defineProperty=function(t,e,o){Object.__defineGetter__&&("get"in o?t.__defineGetter__(e,o.get):"value"in o&&t.__defineGetter__(e,o.value)),Object.__defineSetter__&&("set"in o?t.__defineSetter__(e,o.set):"value"in o&&t.__defineSetter__(e,o.value))}),t.DEBUG=!0,t.ENABLE_ASSERTS=t.DEBUG,t.b2Assert=function(e){t.DEBUG},t.b2_maxFloat=1e37,t.b2_epsilon=1e-5,t.b2_epsilon_sq=t.b2_epsilon*t.b2_epsilon,t.b2_pi=Math.PI,t.b2_maxManifoldPoints=2,t.b2_maxPolygonVertices=8,t.b2_aabbExtension=.1,t.b2_aabbMultiplier=2,t.b2_linearSlop=.008,t.b2_angularSlop=2/180*t.b2_pi,t.b2_polygonRadius=2*t.b2_linearSlop,t.b2_maxSubSteps=8,t.b2_maxTOIContacts=32,t.b2_velocityThreshold=1,t.b2_maxLinearCorrection=.2,t.b2_maxAngularCorrection=8/180*t.b2_pi,t.b2_maxTranslation=2,t.b2_maxTranslationSquared=t.b2_maxTranslation*t.b2_maxTranslation,t.b2_maxRotation=.5*t.b2_pi,t.b2_maxRotationSquared=t.b2_maxRotation*t.b2_maxRotation,t.b2_baumgarte=.2,t.b2_toiBaumgarte=.75,t.b2_timeToSleep=.5,t.b2_linearSleepTolerance=.01,t.b2_angularSleepTolerance=2/180*t.b2_pi,t.b2Alloc=function(){return null},t.b2Free=function(){},t.b2Log=function(){e.global.console.log.apply(null,arguments)},t.b2Version=function(t,e,o){this.major=t||0,this.minor=e||0,this.revision=o||0},t.b2Version.prototype.major=0,t.b2Version.prototype.minor=0,t.b2Version.prototype.revision=0,t.b2Version.prototype.toString=function(){return this.major+"."+this.minor+"."+this.revision},t.b2_version=new t.b2Version(2,3,0),t.b2_changelist=278,t.b2ParseInt=function(t){return parseInt(t,10)},t.b2ParseUInt=function(e){return t.b2Abs(parseInt(e,10))},t.b2MakeArray=function(t,e){void 0===t&&(t=0);var o=new Array(t);if(void 0!==e)for(var i=0;t>i;++i)o[i]=e(i);return o},t.b2MakeNumberArray=function(e){return t.b2MakeArray(e,function(){return 0})},t}(e),i=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Math&&(e.b2Math={}),e.b2_pi_over_180=e.b2_pi/180,e.b2_180_over_pi=180/e.b2_pi,e.b2_two_pi=2*e.b2_pi,e.b2Abs=function(t){return 0>t?-t:t},e.b2Min=function(t,e){return e>t?t:e},e.b2Max=function(t,e){return t>e?t:e},e.b2Clamp=function(t,e,o){return e>t?e:t>o?o:t},e.b2Swap=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(!1);var i=t[0];t[0]=o[0],o[0]=i},e.b2IsValid=function(t){return isFinite(t)},e.b2Sq=function(t){return t*t},e.b2InvSqrt=function(t){return 1/Math.sqrt(t)},e.b2Sqrt=function(t){return Math.sqrt(t)},e.b2Pow=function(t,e){return Math.pow(t,e)},e.b2DegToRad=function(t){return t*e.b2_pi_over_180},e.b2RadToDeg=function(t){return t*e.b2_180_over_pi},e.b2Cos=function(t){return Math.cos(t)},e.b2Sin=function(t){return Math.sin(t)},e.b2Acos=function(t){return Math.acos(t)},e.b2Asin=function(t){return Math.asin(t)},e.b2Atan2=function(t,e){return Math.atan2(t,e)},e.b2NextPowerOfTwo=function(t){return t|=t>>1&2147483647,t|=t>>2&1073741823,t|=t>>4&268435455,t|=t>>8&16777215,t|=t>>16&65535,t+1},e.b2IsPowerOfTwo=function(t){return t>0&&0==(t&t-1)},e.b2Random=function(){return 2*Math.random()-1},e.b2RandomRange=function(t,e){return(e-t)*Math.random()+t},e.b2Vec2=function(t,e){this.x=t||0,this.y=e||0},e.b2Vec2.prototype.x=0,e.b2Vec2.prototype.y=0,e.b2Vec2_zero=new e.b2Vec2,e.b2Vec2.ZERO=new e.b2Vec2,e.b2Vec2.UNITX=new e.b2Vec2(1,0),e.b2Vec2.UNITY=new e.b2Vec2(0,1),e.b2Vec2.s_t0=new e.b2Vec2,e.b2Vec2.s_t1=new e.b2Vec2,e.b2Vec2.s_t2=new e.b2Vec2,e.b2Vec2.s_t3=new e.b2Vec2,e.b2Vec2.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2Vec2})},e.b2Vec2.prototype.Clone=function(){return new e.b2Vec2(this.x,this.y)},e.b2Vec2.prototype.SetZero=function(){return this.x=0,this.y=0,this},e.b2Vec2.prototype.Set=function(t,e){return this.x=t,this.y=e,this},e.b2Vec2.prototype.Copy=function(t){return this.x=t.x,this.y=t.y,this},e.b2Vec2.prototype.SelfAdd=function(t){return this.x+=t.x,this.y+=t.y,this},e.b2Vec2.prototype.SelfAddXY=function(t,e){return this.x+=t,this.y+=e,this},e.b2Vec2.prototype.SelfSub=function(t){return this.x-=t.x,this.y-=t.y,this},e.b2Vec2.prototype.SelfSubXY=function(t,e){return this.x-=t,this.y-=e,this},e.b2Vec2.prototype.SelfMul=function(t){return this.x*=t,this.y*=t,this},e.b2Vec2.prototype.SelfMulAdd=function(t,e){return this.x+=t*e.x,this.y+=t*e.y,this},e.b2Vec2.prototype.SelfMulSub=function(t,e){return this.x-=t*e.x,this.y-=t*e.y,this},e.b2Vec2.prototype.Dot=function(t){return this.x*t.x+this.y*t.y},e.b2Vec2.prototype.Cross=function(t){return this.x*t.y-this.y*t.x},e.b2Vec2.prototype.Length=function(){var t=this.x,e=this.y;return Math.sqrt(t*t+e*e)},e.b2Vec2.prototype.GetLength=e.b2Vec2.prototype.Length,e.b2Vec2.prototype.LengthSquared=function(){var t=this.x,e=this.y;return t*t+e*e},e.b2Vec2.prototype.GetLengthSquared=e.b2Vec2.prototype.LengthSquared,e.b2Vec2.prototype.Normalize=function(){var t=this.GetLength();if(t>=e.b2_epsilon){var o=1/t;this.x*=o,this.y*=o}return t},e.b2Vec2.prototype.SelfNormalize=function(){var t=this.GetLength();if(t>=e.b2_epsilon){var o=1/t;this.x*=o,this.y*=o}return this},e.b2Vec2.prototype.SelfRotate=function(t,e){var o=this.x,i=this.y;return this.x=t*o-e*i,this.y=e*o+t*i,this},e.b2Vec2.prototype.SelfRotateRadians=function(t){return this.SelfRotate(Math.cos(t),Math.sin(t))},e.b2Vec2.prototype.SelfRotateDegrees=function(t){return this.SelfRotateRadians(e.b2DegToRad(t))},e.b2Vec2.prototype.IsValid=function(){return isFinite(this.x)&&isFinite(this.y)},e.b2Vec2.prototype.SelfCrossVS=function(t){var e=this.x;return this.x=t*this.y,this.y=-t*e,this},e.b2Vec2.prototype.SelfCrossSV=function(t){var e=this.x;return this.x=-t*this.y,this.y=t*e,this},e.b2Vec2.prototype.SelfMinV=function(t){return this.x=e.b2Min(this.x,t.x),this.y=e.b2Min(this.y,t.y),this},e.b2Vec2.prototype.SelfMaxV=function(t){return this.x=e.b2Max(this.x,t.x),this.y=e.b2Max(this.y,t.y),this},e.b2Vec2.prototype.SelfAbs=function(){return this.x=e.b2Abs(this.x),this.y=e.b2Abs(this.y),this},e.b2Vec2.prototype.SelfNeg=function(){return this.x=-this.x,this.y=-this.y,this},e.b2Vec2.prototype.SelfSkew=function(){var t=this.x;return this.x=-this.y,this.y=t,this},e.b2AbsV=function(t,o){return o.x=e.b2Abs(t.x),o.y=e.b2Abs(t.y),o},e.b2MinV=function(t,o,i){return i.x=e.b2Min(t.x,o.x),i.y=e.b2Min(t.y,o.y),i},e.b2MaxV=function(t,o,i){return i.x=e.b2Max(t.x,o.x),i.y=e.b2Max(t.y,o.y),i},e.b2ClampV=function(t,o,i,n){return n.x=e.b2Clamp(t.x,o.x,i.x),n.y=e.b2Clamp(t.y,o.y,i.y),n},e.b2RotateV=function(t,e,o,i){var n=t.x,s=t.y;return i.x=e*n-o*s,i.y=o*n+e*s,i},e.b2RotateRadiansV=function(t,o,i){return e.b2RotateV(t,Math.cos(o),Math.sin(o),i)},e.b2RotateDegreesV=function(t,o,i){return e.b2RotateRadiansV(t,e.b2DegToRad(o),i)},e.b2DotVV=function(t,e){return t.x*e.x+t.y*e.y},e.b2CrossVV=function(t,e){return t.x*e.y-t.y*e.x},e.b2CrossVS=function(t,e,o){var i=t.x;return o.x=e*t.y,o.y=-e*i,o},e.b2CrossVOne=function(t,e){var o=t.x;return e.x=t.y,e.y=-o,e},e.b2CrossSV=function(t,e,o){var i=e.x;return o.x=-t*e.y,o.y=t*i,o},e.b2CrossOneV=function(t,e){var o=t.x;return e.x=-t.y,e.y=o,e},e.b2AddVV=function(t,e,o){return o.x=t.x+e.x,o.y=t.y+e.y,o},e.b2SubVV=function(t,e,o){return o.x=t.x-e.x,o.y=t.y-e.y,o},e.b2MulSV=function(t,e,o){return o.x=e.x*t,o.y=e.y*t,o},e.b2AddVMulSV=function(t,e,o,i){return i.x=t.x+e*o.x,i.y=t.y+e*o.y,i},e.b2SubVMulSV=function(t,e,o,i){return i.x=t.x-e*o.x,i.y=t.y-e*o.y,i},e.b2AddVCrossSV=function(t,e,o,i){var n=o.x;return i.x=t.x-e*o.y,i.y=t.y+e*n,i},e.b2MidVV=function(t,e,o){return o.x=.5*(t.x+e.x),o.y=.5*(t.y+e.y),o},e.b2ExtVV=function(t,e,o){return o.x=.5*(e.x-t.x),o.y=.5*(e.y-t.y),o},e.b2IsEqualToV=function(t,e){return t.x==e.x&&t.y==e.y},e.b2DistanceVV=function(t,e){var o=t.x-e.x,i=t.y-e.y;return Math.sqrt(o*o+i*i)},e.b2DistanceSquaredVV=function(t,e){var o=t.x-e.x,i=t.y-e.y;return o*o+i*i},e.b2NegV=function(t,e){return e.x=-t.x,e.y=-t.y,e},e.b2Vec3=function(t,e,o){this.x=t||0,this.y=e||0,this.z=o||0},e.b2Vec3.prototype.x=0,e.b2Vec3.prototype.y=0,e.b2Vec3.prototype.z=0,e.b2Vec3.ZERO=new e.b2Vec3,e.b2Vec3.s_t0=new e.b2Vec3,e.b2Vec3.prototype.Clone=function(){return new e.b2Vec3(this.x,this.y,this.z)},e.b2Vec3.prototype.SetZero=function(){return this.x=0,this.y=0,this.z=0,this},e.b2Vec3.prototype.Set=function(t,e,o){return this.x=t,this.y=e,this.z=o,this},e.b2Vec3.prototype.Copy=function(t){return this.x=t.x,this.y=t.y,this.z=t.z,this},e.b2Vec3.prototype.SelfNeg=function(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this},e.b2Vec3.prototype.SelfAdd=function(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this},e.b2Vec3.prototype.SelfAddXYZ=function(t,e,o){return this.x+=t,this.y+=e,this.z+=o,this},e.b2Vec3.prototype.SelfSub=function(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this},e.b2Vec3.prototype.SelfSubXYZ=function(t,e,o){return this.x-=t,this.y-=e,this.z-=o,this},e.b2Vec3.prototype.SelfMul=function(t){return this.x*=t,this.y*=t,this.z*=t,this},e.b2DotV3V3=function(t,e){return t.x*e.x+t.y*e.y+t.z*e.z},e.b2CrossV3V3=function(t,e,o){var i=t.x,n=t.y,s=t.z,r=e.x,a=e.y,l=e.z;return o.x=n*l-s*a,o.y=s*r-i*l,o.z=i*a-n*r,o},e.b2Mat22=function(){this.ex=new e.b2Vec2(1,0),this.ey=new e.b2Vec2(0,1)},e.b2Mat22.prototype.ex=null,e.b2Mat22.prototype.ey=null,e.b2Mat22.IDENTITY=new e.b2Mat22,e.b2Mat22.prototype.Clone=function(){return(new e.b2Mat22).Copy(this)},e.b2Mat22.FromVV=function(t,o){return(new e.b2Mat22).SetVV(t,o)},e.b2Mat22.FromSSSS=function(t,o,i,n){return(new e.b2Mat22).SetSSSS(t,o,i,n)},e.b2Mat22.FromAngleRadians=function(t){return(new e.b2Mat22).SetAngleRadians(t)},e.b2Mat22.prototype.SetSSSS=function(t,e,o,i){return this.ex.Set(t,o),this.ey.Set(e,i),this},e.b2Mat22.prototype.SetVV=function(t,e){return this.ex.Copy(t),this.ey.Copy(e),this},e.b2Mat22.prototype.SetAngle=function(t){var e=Math.cos(t),o=Math.sin(t);return this.ex.Set(e,o),this.ey.Set(-o,e),this},e.b2Mat22.prototype.SetAngleRadians=e.b2Mat22.prototype.SetAngle,e.b2Mat22.prototype.SetAngleDegrees=function(t){return this.SetAngle(e.b2DegToRad(t))},e.b2Mat22.prototype.Copy=function(t){return this.ex.Copy(t.ex),this.ey.Copy(t.ey),this},e.b2Mat22.prototype.SetIdentity=function(){return this.ex.Set(1,0),this.ey.Set(0,1),this},e.b2Mat22.prototype.SetZero=function(){return this.ex.SetZero(),this.ey.SetZero(),this},e.b2Mat22.prototype.GetAngle=function(){return Math.atan2(this.ex.y,this.ex.x)},e.b2Mat22.prototype.GetAngleRadians=e.b2Mat22.prototype.GetAngle,e.b2Mat22.prototype.GetInverse=function(t){var e=this.ex.x,o=this.ey.x,i=this.ex.y,n=this.ey.y,s=e*n-o*i;return 0!=s&&(s=1/s),t.ex.x=s*n,t.ey.x=-s*o,t.ex.y=-s*i,t.ey.y=s*e,t},e.b2Mat22.prototype.Solve=function(t,e,o){var i=this.ex.x,n=this.ey.x,s=this.ex.y,r=this.ey.y,a=i*r-n*s;return 0!=a&&(a=1/a),o.x=a*(r*t-n*e),o.y=a*(i*e-s*t),o},e.b2Mat22.prototype.SelfAbs=function(){return this.ex.SelfAbs(),this.ey.SelfAbs(),this},e.b2Mat22.prototype.SelfInv=function(){return this.GetInverse(this)},e.b2Mat22.prototype.SelfAddM=function(t){return this.ex.SelfAdd(t.ex),this.ey.SelfAdd(t.ey),this},e.b2Mat22.prototype.SelfSubM=function(t){return this.ex.SelfSub(t.ex),this.ey.SelfSub(t.ey),this},e.b2AbsM=function(t,o){var i=t.ex,n=t.ey;return o.ex.x=e.b2Abs(i.x),o.ex.y=e.b2Abs(i.y),o.ey.x=e.b2Abs(n.x),o.ey.y=e.b2Abs(n.y),o},e.b2MulMV=function(t,e,o){var i=t.ex,n=t.ey,s=e.x,r=e.y;return o.x=i.x*s+n.x*r,o.y=i.y*s+n.y*r,o},e.b2MulTMV=function(t,e,o){var i=t.ex,n=t.ey,s=e.x,r=e.y;return o.x=i.x*s+i.y*r,o.y=n.x*s+n.y*r,o},e.b2AddMM=function(t,e,o){var i=t.ex,n=t.ey,s=e.ex,r=e.ey;return o.ex.x=i.x+s.x,o.ex.y=i.y+s.y,o.ey.x=n.x+r.x,o.ey.y=n.y+r.y,o},e.b2MulMM=function(t,e,o){var i=t.ex.x,n=t.ex.y,s=t.ey.x,r=t.ey.y,a=e.ex.x,l=e.ex.y,p=e.ey.x,m=e.ey.y;return o.ex.x=i*a+s*l,o.ex.y=n*a+r*l,o.ey.x=i*p+s*m,o.ey.y=n*p+r*m,o},e.b2MulTMM=function(t,e,o){var i=t.ex.x,n=t.ex.y,s=t.ey.x,r=t.ey.y,a=e.ex.x,l=e.ex.y,p=e.ey.x,m=e.ey.y;return o.ex.x=i*a+n*l,o.ex.y=s*a+r*l,o.ey.x=i*p+n*m,o.ey.y=s*p+r*m,o},e.b2Mat33=function(){this.ex=new e.b2Vec3(1,0,0),this.ey=new e.b2Vec3(0,1,0),this.ez=new e.b2Vec3(0,0,1)},e.b2Mat33.prototype.ex=null,e.b2Mat33.prototype.ey=null,e.b2Mat33.prototype.ez=null,e.b2Mat33.IDENTITY=new e.b2Mat33,e.b2Mat33.prototype.Clone=function(){return(new e.b2Mat33).Copy(this)},e.b2Mat33.prototype.SetVVV=function(t,e,o){return this.ex.Copy(t),this.ey.Copy(e),this.ez.Copy(o),this},e.b2Mat33.prototype.Copy=function(t){return this.ex.Copy(t.ex),this.ey.Copy(t.ey),this.ez.Copy(t.ez),this},e.b2Mat33.prototype.SetIdentity=function(){return this.ex.Set(1,0,0),this.ey.Set(0,1,0),this.ez.Set(0,0,1),this},e.b2Mat33.prototype.SetZero=function(){return this.ex.SetZero(),this.ey.SetZero(),this.ez.SetZero(),this},e.b2Mat33.prototype.SelfAddM=function(t){return this.ex.SelfAdd(t.ex),this.ey.SelfAdd(t.ey),this.ez.SelfAdd(t.ez),this},e.b2Mat33.prototype.Solve33=function(t,e,o,i){var n=this.ex.x,s=this.ex.y,r=this.ex.z,a=this.ey.x,l=this.ey.y,p=this.ey.z,m=this.ez.x,_=this.ez.y,b=this.ez.z,h=n*(l*b-p*_)+s*(p*m-a*b)+r*(a*_-l*m);return 0!=h&&(h=1/h),i.x=h*(t*(l*b-p*_)+e*(p*m-a*b)+o*(a*_-l*m)),i.y=h*(n*(e*b-o*_)+s*(o*m-t*b)+r*(t*_-e*m)),i.z=h*(n*(l*o-p*e)+s*(p*t-a*o)+r*(a*e-l*t)),i},e.b2Mat33.prototype.Solve22=function(t,e,o){var i=this.ex.x,n=this.ey.x,s=this.ex.y,r=this.ey.y,a=i*r-n*s;return 0!=a&&(a=1/a),o.x=a*(r*t-n*e),o.y=a*(i*e-s*t),o},e.b2Mat33.prototype.GetInverse22=function(t){var e=this.ex.x,o=this.ey.x,i=this.ex.y,n=this.ey.y,s=e*n-o*i;0!=s&&(s=1/s),t.ex.x=s*n,t.ey.x=-s*o,t.ex.z=0,t.ex.y=-s*i,t.ey.y=s*e,t.ey.z=0,t.ez.x=0,t.ez.y=0,t.ez.z=0},e.b2Mat33.prototype.GetSymInverse33=function(t){var o=e.b2DotV3V3(this.ex,e.b2CrossV3V3(this.ey,this.ez,e.b2Vec3.s_t0));0!=o&&(o=1/o);var i=this.ex.x,n=this.ey.x,s=this.ez.x,r=this.ey.y,a=this.ez.y,l=this.ez.z;t.ex.x=o*(r*l-a*a),t.ex.y=o*(s*a-n*l),t.ex.z=o*(n*a-s*r),t.ey.x=t.ex.y,t.ey.y=o*(i*l-s*s),t.ey.z=o*(s*n-i*a),t.ez.x=t.ex.z,t.ez.y=t.ey.z,t.ez.z=o*(i*r-n*n)},e.b2MulM33V3=function(t,e,o){var i=e.x,n=e.y,s=e.z;return o.x=t.ex.x*i+t.ey.x*n+t.ez.x*s,o.y=t.ex.y*i+t.ey.y*n+t.ez.y*s,o.z=t.ex.z*i+t.ey.z*n+t.ez.z*s,o},e.b2MulM33XYZ=function(t,e,o,i,n){return n.x=t.ex.x*e+t.ey.x*o+t.ez.x*i,n.y=t.ex.y*e+t.ey.y*o+t.ez.y*i,n.z=t.ex.z*e+t.ey.z*o+t.ez.z*i,n},e.b2MulM33V2=function(t,e,o){var i=e.x,n=e.y;return o.x=t.ex.x*i+t.ey.x*n,o.y=t.ex.y*i+t.ey.y*n,o},e.b2MulM33XY=function(t,e,o,i){return i.x=t.ex.x*e+t.ey.x*o,i.y=t.ex.y*e+t.ey.y*o,i},e.b2Rot=function(t){t&&(this.angle=t,this.s=Math.sin(t),this.c=Math.cos(t))},e.b2Rot.prototype.angle=0,e.b2Rot.prototype.s=0,e.b2Rot.prototype.c=1,e.b2Rot.IDENTITY=new e.b2Rot,e.b2Rot.prototype.Clone=function(){return(new e.b2Rot).Copy(this)},e.b2Rot.prototype.Copy=function(t){return this.angle=t.angle,this.s=t.s,this.c=t.c,this},e.b2Rot.prototype.SetAngle=function(t){return this.angle!=t&&(this.angle=t,this.s=Math.sin(t),this.c=Math.cos(t)),this},e.b2Rot.prototype.SetAngleRadians=e.b2Rot.prototype.SetAngle,e.b2Rot.prototype.SetAngleDegrees=function(t){return this.SetAngle(e.b2DegToRad(t))},e.b2Rot.prototype.SetIdentity=function(){return this.angle=0,this.s=0,this.c=1,this},e.b2Rot.prototype.GetAngle=function(){return this.angle},e.b2Rot.prototype.GetAngleRadians=e.b2Rot.prototype.GetAngle,e.b2Rot.prototype.GetAngleDegrees=function(){return e.b2RadToDeg(this.GetAngle())},e.b2Rot.prototype.GetXAxis=function(t){return t.x=this.c,t.y=this.s,t},e.b2Rot.prototype.GetYAxis=function(t){return t.x=-this.s,t.y=this.c,t},e.b2MulRR=function(t,o,i){var n=t.c,s=t.s,r=o.c,a=o.s;for(i.s=s*r+n*a,i.c=n*r-s*a,i.angle=t.angle+o.angle;i.angle<-e.b2_pi;)i.angle+=e.b2_two_pi;for(;i.angle>=e.b2_pi;)i.angle-=e.b2_two_pi;return i},e.b2MulTRR=function(t,o,i){var n=t.c,s=t.s,r=o.c,a=o.s;for(i.s=n*a-s*r,i.c=n*r+s*a,i.angle=t.angle-o.angle;i.angle<-e.b2_pi;)i.angle+=e.b2_two_pi;for(;i.angle>=e.b2_pi;)i.angle-=e.b2_two_pi;return i},e.b2MulRV=function(t,e,o){var i=t.c,n=t.s,s=e.x,r=e.y;return o.x=i*s-n*r,o.y=n*s+i*r,o},e.b2MulTRV=function(t,e,o){var i=t.c,n=t.s,s=e.x,r=e.y;return o.x=i*s+n*r,o.y=-n*s+i*r,o},e.b2Transform=function(){this.p=new e.b2Vec2,this.q=new e.b2Rot},e.b2Transform.prototype.p=null,e.b2Transform.prototype.q=null,e.b2Transform.IDENTITY=new e.b2Transform,e.b2Transform.prototype.Clone=function(){return(new e.b2Transform).Copy(this)},e.b2Transform.prototype.Copy=function(t){return this.p.Copy(t.p),this.q.Copy(t.q),this},e.b2Transform.prototype.SetIdentity=function(){return this.p.SetZero(),this.q.SetIdentity(),this},e.b2Transform.prototype.SetPositionRotation=function(t,e){return this.p.Copy(t),this.q.Copy(e),this},e.b2Transform.prototype.SetPositionAngleRadians=function(t,e){return this.p.Copy(t),this.q.SetAngleRadians(e),this},e.b2Transform.prototype.SetPosition=function(t){return this.p.Copy(t),this},e.b2Transform.prototype.SetPositionXY=function(t,e){return this.p.Set(t,e),this},e.b2Transform.prototype.SetRotation=function(t){return this.q.Copy(t),this},e.b2Transform.prototype.SetRotationAngleRadians=function(t){return this.q.SetAngleRadians(t),this},e.b2Transform.prototype.GetPosition=function(){return this.p},e.b2Transform.prototype.GetRotation=function(){return this.q},e.b2Transform.prototype.GetRotationAngle=function(){return this.q.GetAngle()},e.b2Transform.prototype.GetRotationAngleRadians=e.b2Transform.prototype.GetRotationAngle,e.b2Transform.prototype.GetAngle=function(){return this.q.GetAngle()},e.b2Transform.prototype.GetAngleRadians=e.b2Transform.prototype.GetAngle,e.b2MulXV=function(t,e,o){var i=t.q.c,n=t.q.s,s=e.x,r=e.y;return o.x=i*s-n*r+t.p.x,o.y=n*s+i*r+t.p.y,o},e.b2MulTXV=function(t,e,o){var i=t.q.c,n=t.q.s,s=e.x-t.p.x,r=e.y-t.p.y;return o.x=i*s+n*r,o.y=-n*s+i*r,o},e.b2MulXX=function(t,o,i){return e.b2MulRR(t.q,o.q,i.q),e.b2AddVV(e.b2MulRV(t.q,o.p,i.p),t.p,i.p),i},e.b2MulTXX=function(t,o,i){return e.b2MulTRR(t.q,o.q,i.q),e.b2MulTRV(t.q,e.b2SubVV(o.p,t.p,i.p),i.p),i},e.b2Sweep=function(){this.localCenter=new e.b2Vec2,this.c0=new e.b2Vec2,this.c=new e.b2Vec2},e.b2Sweep.prototype.localCenter=null,e.b2Sweep.prototype.c0=null,e.b2Sweep.prototype.c=null,e.b2Sweep.prototype.a0=0,e.b2Sweep.prototype.a=0,e.b2Sweep.prototype.alpha0=0,e.b2Sweep.prototype.Clone=function(){return(new e.b2Sweep).Copy(this)},e.b2Sweep.prototype.Copy=function(t){return this.localCenter.Copy(t.localCenter),this.c0.Copy(t.c0),this.c.Copy(t.c),this.a0=t.a0,this.a=t.a,this.alpha0=t.alpha0,this},e.b2Sweep.prototype.GetTransform=function(t,o){var i=1-o;t.p.x=i*this.c0.x+o*this.c.x,t.p.y=i*this.c0.y+o*this.c.y;var n=i*this.a0+o*this.a;return t.q.SetAngleRadians(n),t.p.SelfSub(e.b2MulRV(t.q,this.localCenter,e.b2Vec2.s_t0)),t},e.b2Sweep.prototype.Advance=function(t){e.ENABLE_ASSERTS&&e.b2Assert(this.alpha0<1);var o=(t-this.alpha0)/(1-this.alpha0);this.c0.x+=o*(this.c.x-this.c0.x),this.c0.y+=o*(this.c.y-this.c0.y),this.a0+=o*(this.a-this.a0),this.alpha0=t},e.b2Sweep.prototype.Normalize=function(){var t=e.b2_two_pi*Math.floor(this.a0/e.b2_two_pi);this.a0-=t,this.a-=t},e}(e,o),n=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Joint&&(e.b2Joint={}),e.b2JointType={e_unknownJoint:0,e_revoluteJoint:1,e_prismaticJoint:2,e_distanceJoint:3,e_pulleyJoint:4,e_mouseJoint:5,e_gearJoint:6,e_wheelJoint:7,e_weldJoint:8,e_frictionJoint:9,e_ropeJoint:10,e_motorJoint:11,e_areaJoint:12},t.exportProperty(e.b2JointType,"e_unknownJoint",e.b2JointType.e_unknownJoint),t.exportProperty(e.b2JointType,"e_revoluteJoint",e.b2JointType.e_revoluteJoint),t.exportProperty(e.b2JointType,"e_prismaticJoint",e.b2JointType.e_prismaticJoint),t.exportProperty(e.b2JointType,"e_distanceJoint",e.b2JointType.e_distanceJoint),t.exportProperty(e.b2JointType,"e_pulleyJoint",e.b2JointType.e_pulleyJoint),t.exportProperty(e.b2JointType,"e_mouseJoint",e.b2JointType.e_mouseJoint),t.exportProperty(e.b2JointType,"e_gearJoint",e.b2JointType.e_gearJoint),t.exportProperty(e.b2JointType,"e_wheelJoint",e.b2JointType.e_wheelJoint),t.exportProperty(e.b2JointType,"e_weldJoint",e.b2JointType.e_weldJoint),t.exportProperty(e.b2JointType,"e_frictionJoint",e.b2JointType.e_frictionJoint),t.exportProperty(e.b2JointType,"e_ropeJoint",e.b2JointType.e_ropeJoint),t.exportProperty(e.b2JointType,"e_motorJoint",e.b2JointType.e_motorJoint),t.exportProperty(e.b2JointType,"e_areaJoint",e.b2JointType.e_areaJoint),e.b2LimitState={e_inactiveLimit:0,e_atLowerLimit:1,e_atUpperLimit:2,e_equalLimits:3},t.exportProperty(e.b2LimitState,"e_inactiveLimit",e.b2LimitState.e_inactiveLimit),t.exportProperty(e.b2LimitState,"e_atLowerLimit",e.b2LimitState.e_atLowerLimit),t.exportProperty(e.b2LimitState,"e_atUpperLimit",e.b2LimitState.e_atUpperLimit),t.exportProperty(e.b2LimitState,"e_equalLimits",e.b2LimitState.e_equalLimits),e.b2Jacobian=function(){this.linear=new e.b2Vec2},e.b2Jacobian.prototype.linear=null,e.b2Jacobian.prototype.angularA=0,e.b2Jacobian.prototype.angularB=0,e.b2Jacobian.prototype.SetZero=function(){return this.linear.SetZero(),this.angularA=0,this.angularB=0,this},e.b2Jacobian.prototype.Set=function(t,e,o){return this.linear.Copy(t),this.angularA=e,this.angularB=o,this},e.b2JointEdge=function(){},e.b2JointEdge.prototype.other=null,e.b2JointEdge.prototype.joint=null,e.b2JointEdge.prototype.prev=null,e.b2JointEdge.prototype.next=null,e.b2JointDef=function(t){this.type=t},e.b2JointDef.prototype.type=e.b2JointType.e_unknownJoint,e.b2JointDef.prototype.userData=null,e.b2JointDef.prototype.bodyA=null,e.b2JointDef.prototype.bodyB=null,e.b2JointDef.prototype.collideConnected=!1,e.b2Joint=function(t){e.ENABLE_ASSERTS&&e.b2Assert(t.bodyA!=t.bodyB),this.m_type=t.type,this.m_edgeA=new e.b2JointEdge,this.m_edgeB=new e.b2JointEdge,this.m_bodyA=t.bodyA,this.m_bodyB=t.bodyB,this.m_collideConnected=t.collideConnected,this.m_userData=t.userData},e.b2Joint.prototype.m_type=e.b2JointType.e_unknownJoint,e.b2Joint.prototype.m_prev=null,e.b2Joint.prototype.m_next=null,e.b2Joint.prototype.m_edgeA=null,e.b2Joint.prototype.m_edgeB=null,e.b2Joint.prototype.m_bodyA=null,e.b2Joint.prototype.m_bodyB=null,e.b2Joint.prototype.m_index=0,e.b2Joint.prototype.m_islandFlag=!1,e.b2Joint.prototype.m_collideConnected=!1,e.b2Joint.prototype.m_userData=null,e.b2Joint.prototype.GetAnchorA=function(t){return t.SetZero()},e.b2Joint.prototype.GetAnchorB=function(t){return t.SetZero()},e.b2Joint.prototype.GetReactionForce=function(t,e){return e.SetZero()},e.b2Joint.prototype.GetReactionTorque=function(){return 0},e.b2Joint.prototype.InitVelocityConstraints=function(){},e.b2Joint.prototype.SolveVelocityConstraints=function(){},e.b2Joint.prototype.SolvePositionConstraints=function(){return!1},e.b2Joint.prototype.GetType=function(){return this.m_type},e.b2Joint.prototype.GetBodyA=function(){return this.m_bodyA},e.b2Joint.prototype.GetBodyB=function(){return this.m_bodyB},e.b2Joint.prototype.GetNext=function(){return this.m_next},e.b2Joint.prototype.GetUserData=function(){return this.m_userData},e.b2Joint.prototype.SetUserData=function(t){this.m_userData=t},e.b2Joint.prototype.GetCollideConnected=function(){return this.m_collideConnected},e.b2Joint.prototype.Dump=function(){e.DEBUG&&e.b2Log("// Dump is not supported for this joint type.\n")},e.b2Joint.prototype.IsActive=function(){return this.m_bodyA.IsActive()&&this.m_bodyB.IsActive()},e.b2Joint.prototype.ShiftOrigin=function(){},e}(e,i,o),s=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2AreaJoint&&(e.b2AreaJoint={}),e.b2AreaJointDef=function(){t.base(this,e.b2JointType.e_areaJoint),this.bodies=new Array
	},t.inherits(e.b2AreaJointDef,e.b2JointDef),e.b2AreaJointDef.prototype.world=null,e.b2AreaJointDef.prototype.bodies=null,e.b2AreaJointDef.prototype.frequencyHz=0,e.b2AreaJointDef.prototype.dampingRatio=0,e.b2AreaJointDef.prototype.AddBody=function(t){this.bodies.push(t),1==this.bodies.length?this.bodyA=t:2==this.bodies.length&&(this.bodyB=t)},e.b2AreaJoint=function(o){t.base(this,o),e.ENABLE_ASSERTS&&e.b2Assert(o.bodies.length>=3,"You cannot create an area joint with less than three bodies."),this.m_bodies=o.bodies,this.m_frequencyHz=o.frequencyHz,this.m_dampingRatio=o.dampingRatio,this.m_targetLengths=e.b2MakeNumberArray(o.bodies.length),this.m_normals=e.b2Vec2.MakeArray(o.bodies.length),this.m_joints=new Array(o.bodies.length),this.m_deltas=e.b2Vec2.MakeArray(o.bodies.length),this.m_delta=new e.b2Vec2;var i=new e.b2DistanceJointDef;i.frequencyHz=o.frequencyHz,i.dampingRatio=o.dampingRatio,this.m_targetArea=0;for(var n=0,s=this.m_bodies.length;s>n;++n){var r=this.m_bodies[n],a=this.m_bodies[(n+1)%s],l=r.GetWorldCenter(),p=a.GetWorldCenter();this.m_targetLengths[n]=e.b2DistanceVV(l,p),this.m_targetArea+=e.b2CrossVV(l,p),i.Initialize(r,a,l,p),this.m_joints[n]=o.world.CreateJoint(i)}this.m_targetArea*=.5},t.inherits(e.b2AreaJoint,e.b2Joint),e.b2AreaJoint.prototype.m_bodies=null,e.b2AreaJoint.prototype.m_frequencyHz=0,e.b2AreaJoint.prototype.m_dampingRatio=0,e.b2AreaJoint.prototype.m_impulse=0,e.b2AreaJoint.prototype.m_targetLengths=null,e.b2AreaJoint.prototype.m_targetArea=0,e.b2AreaJoint.prototype.m_normals=null,e.b2AreaJoint.prototype.m_joints=null,e.b2AreaJoint.prototype.m_deltas=null,e.b2AreaJoint.prototype.m_delta=null,e.b2AreaJoint.prototype.GetAnchorA=function(t){return t.SetZero()},e.b2AreaJoint.prototype.GetAnchorB=function(t){return t.SetZero()},e.b2AreaJoint.prototype.GetReactionForce=function(t,e){return e.SetZero()},e.b2AreaJoint.prototype.GetReactionTorque=function(){return 0},e.b2AreaJoint.prototype.SetFrequency=function(t){this.m_frequencyHz=t;for(var e=0,o=this.m_joints.length;o>e;++e)this.m_joints[e].SetFrequency(t)},e.b2AreaJoint.prototype.GetFrequency=function(){return this.m_frequencyHz},e.b2AreaJoint.prototype.SetDampingRatio=function(t){this.m_dampingRatio=t;for(var e=0,o=this.m_joints.length;o>e;++e)this.m_joints[e].SetDampingRatio(t)},e.b2AreaJoint.prototype.GetDampingRatio=function(){return this.m_dampingRatio},e.b2AreaJoint.prototype.Dump=function(){e.DEBUG&&e.b2Log("Area joint dumping is not supported.\n")},e.b2AreaJoint.prototype.InitVelocityConstraints=function(t){for(var o=0,i=this.m_bodies.length;i>o;++o){var n=this.m_bodies[(o+i-1)%i],s=this.m_bodies[(o+1)%i],r=t.positions[n.m_islandIndex].c,a=t.positions[s.m_islandIndex].c,l=this.m_deltas[o];e.b2SubVV(a,r,l)}if(t.step.warmStarting){this.m_impulse*=t.step.dtRatio;for(var o=0,i=this.m_bodies.length;i>o;++o){var p=this.m_bodies[o],m=t.velocities[p.m_islandIndex].v,l=this.m_deltas[o];m.x+=p.m_invMass*l.y*.5*this.m_impulse,m.y+=p.m_invMass*-l.x*.5*this.m_impulse}}else this.m_impulse=0},e.b2AreaJoint.prototype.SolveVelocityConstraints=function(t){for(var o=0,i=0,n=0,s=this.m_bodies.length;s>n;++n){var r=this.m_bodies[n],a=t.velocities[r.m_islandIndex].v,l=this.m_deltas[n];o+=l.GetLengthSquared()/r.GetMass(),i+=e.b2CrossVV(a,l)}var p=-2*i/o;this.m_impulse+=p;for(var n=0,s=this.m_bodies.length;s>n;++n){var r=this.m_bodies[n],a=t.velocities[r.m_islandIndex].v,l=this.m_deltas[n];a.x+=r.m_invMass*l.y*.5*p,a.y+=r.m_invMass*-l.x*.5*p}},e.b2AreaJoint.prototype.SolvePositionConstraints=function(t){for(var o=0,i=0,n=0,s=this.m_bodies.length;s>n;++n){var r=this.m_bodies[n],a=this.m_bodies[(n+1)%s],l=t.positions[r.m_islandIndex].c,p=t.positions[a.m_islandIndex].c,m=e.b2SubVV(p,l,this.m_delta),_=m.GetLength();_<e.b2_epsilon&&(_=1),this.m_normals[n].x=m.y/_,this.m_normals[n].y=-m.x/_,o+=_,i+=e.b2CrossVV(l,p)}i*=.5;for(var b=this.m_targetArea-i,h=.5*b/o,c=!0,n=0,s=this.m_bodies.length;s>n;++n){var r=this.m_bodies[n],l=t.positions[r.m_islandIndex].c,u=(n+1)%s,m=e.b2AddVV(this.m_normals[n],this.m_normals[u],this.m_delta);m.SelfMul(h);var y=m.GetLengthSquared();y>e.b2Sq(e.b2_maxLinearCorrection)&&m.SelfMul(e.b2_maxLinearCorrection/e.b2Sqrt(y)),y>e.b2Sq(e.b2_linearSlop)&&(c=!1),l.x+=m.x,l.y+=m.y}return c},e}(e,n,i,o),r=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Distance&&(e.b2Distance={}),e.b2DistanceProxy=function(){this.m_buffer=e.b2Vec2.MakeArray(2)},e.b2DistanceProxy.prototype.m_buffer=null,e.b2DistanceProxy.prototype.m_vertices=null,e.b2DistanceProxy.prototype.m_count=0,e.b2DistanceProxy.prototype.m_radius=0,e.b2DistanceProxy.prototype.Reset=function(){return this.m_vertices=null,this.m_count=0,this.m_radius=0,this},e.b2DistanceProxy.prototype.SetShape=function(t,e){t.SetupDistanceProxy(this,e)},e.b2DistanceProxy.prototype.GetSupport=function(t){for(var o=0,i=e.b2DotVV(this.m_vertices[0],t),n=1;n<this.m_count;++n){var s=e.b2DotVV(this.m_vertices[n],t);s>i&&(o=n,i=s)}return o},e.b2DistanceProxy.prototype.GetSupportVertex=function(t,o){for(var i=0,n=e.b2DotVV(this.m_vertices[0],t),s=1;s<this.m_count;++s){var r=e.b2DotVV(this.m_vertices[s],t);r>n&&(i=s,n=r)}return o.Copy(this.m_vertices[i])},e.b2DistanceProxy.prototype.GetVertexCount=function(){return this.m_count},e.b2DistanceProxy.prototype.GetVertex=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(t>=0&&t<this.m_count),this.m_vertices[t]},e.b2SimplexCache=function(){this.indexA=e.b2MakeNumberArray(3),this.indexB=e.b2MakeNumberArray(3)},e.b2SimplexCache.prototype.metric=0,e.b2SimplexCache.prototype.count=0,e.b2SimplexCache.prototype.indexA=null,e.b2SimplexCache.prototype.indexB=null,e.b2SimplexCache.prototype.Reset=function(){return this.metric=0,this.count=0,this},e.b2DistanceInput=function(){this.proxyA=new e.b2DistanceProxy,this.proxyB=new e.b2DistanceProxy,this.transformA=new e.b2Transform,this.transformB=new e.b2Transform},e.b2DistanceInput.prototype.proxyA=null,e.b2DistanceInput.prototype.proxyB=null,e.b2DistanceInput.prototype.transformA=null,e.b2DistanceInput.prototype.transformB=null,e.b2DistanceInput.prototype.useRadii=!1,e.b2DistanceInput.prototype.Reset=function(){return this.proxyA.Reset(),this.proxyB.Reset(),this.transformA.SetIdentity(),this.transformB.SetIdentity(),this.useRadii=!1,this},e.b2DistanceOutput=function(){this.pointA=new e.b2Vec2,this.pointB=new e.b2Vec2},e.b2DistanceOutput.prototype.pointA=null,e.b2DistanceOutput.prototype.pointB=null,e.b2DistanceOutput.prototype.distance=0,e.b2DistanceOutput.prototype.iterations=0,e.b2DistanceOutput.prototype.Reset=function(){return this.pointA.SetZero(),this.pointB.SetZero(),this.distance=0,this.iterations=0,this},e.b2_gjkCalls=0,e.b2_gjkIters=0,e.b2_gjkMaxIters=0,e.b2SimplexVertex=function(){this.wA=new e.b2Vec2,this.wB=new e.b2Vec2,this.w=new e.b2Vec2},e.b2SimplexVertex.prototype.wA=null,e.b2SimplexVertex.prototype.wB=null,e.b2SimplexVertex.prototype.w=null,e.b2SimplexVertex.prototype.a=0,e.b2SimplexVertex.prototype.indexA=0,e.b2SimplexVertex.prototype.indexB=0,e.b2SimplexVertex.prototype.Copy=function(t){return this.wA.Copy(t.wA),this.wB.Copy(t.wB),this.w.Copy(t.w),this.a=t.a,this.indexA=t.indexA,this.indexB=t.indexB,this},e.b2Simplex=function(){this.m_v1=new e.b2SimplexVertex,this.m_v2=new e.b2SimplexVertex,this.m_v3=new e.b2SimplexVertex,this.m_vertices=new Array(3),this.m_vertices[0]=this.m_v1,this.m_vertices[1]=this.m_v2,this.m_vertices[2]=this.m_v3},e.b2Simplex.prototype.m_v1=null,e.b2Simplex.prototype.m_v2=null,e.b2Simplex.prototype.m_v3=null,e.b2Simplex.prototype.m_vertices=null,e.b2Simplex.prototype.m_count=0,e.b2Simplex.prototype.ReadCache=function(t,o,i,n,s){e.ENABLE_ASSERTS&&e.b2Assert(0<=t.count&&t.count<=3),this.m_count=t.count;for(var r=this.m_vertices,a=0;a<this.m_count;++a){var l=r[a];l.indexA=t.indexA[a],l.indexB=t.indexB[a];var p=o.GetVertex(l.indexA),m=n.GetVertex(l.indexB);e.b2MulXV(i,p,l.wA),e.b2MulXV(s,m,l.wB),e.b2SubVV(l.wB,l.wA,l.w),l.a=0}if(this.m_count>1){var _=t.metric,b=this.GetMetric();(.5*_>b||b>2*_||b<e.b2_epsilon)&&(this.m_count=0)}if(0==this.m_count){var l=r[0];l.indexA=0,l.indexB=0;var p=o.GetVertex(0),m=n.GetVertex(0);e.b2MulXV(i,p,l.wA),e.b2MulXV(s,m,l.wB),e.b2SubVV(l.wB,l.wA,l.w),l.a=1,this.m_count=1}},e.b2Simplex.prototype.WriteCache=function(t){t.metric=this.GetMetric(),t.count=this.m_count;for(var e=this.m_vertices,o=0;o<this.m_count;++o)t.indexA[o]=e[o].indexA,t.indexB[o]=e[o].indexB},e.b2Simplex.prototype.GetSearchDirection=function(t){switch(this.m_count){case 1:return e.b2NegV(this.m_v1.w,t);case 2:var o=e.b2SubVV(this.m_v2.w,this.m_v1.w,t),i=e.b2CrossVV(o,e.b2NegV(this.m_v1.w,e.b2Vec2.s_t0));return i>0?e.b2CrossOneV(o,t):e.b2CrossVOne(o,t);default:return e.ENABLE_ASSERTS&&e.b2Assert(!1),t.SetZero()}},e.b2Simplex.prototype.GetClosestPoint=function(t){switch(this.m_count){case 0:return e.ENABLE_ASSERTS&&e.b2Assert(!1),t.SetZero();case 1:return t.Copy(this.m_v1.w);case 2:return t.Set(this.m_v1.a*this.m_v1.w.x+this.m_v2.a*this.m_v2.w.x,this.m_v1.a*this.m_v1.w.y+this.m_v2.a*this.m_v2.w.y);case 3:return t.SetZero();default:return e.ENABLE_ASSERTS&&e.b2Assert(!1),t.SetZero()}},e.b2Simplex.prototype.GetWitnessPoints=function(t,o){switch(this.m_count){case 0:e.ENABLE_ASSERTS&&e.b2Assert(!1);break;case 1:t.Copy(this.m_v1.wA),o.Copy(this.m_v1.wB);break;case 2:t.x=this.m_v1.a*this.m_v1.wA.x+this.m_v2.a*this.m_v2.wA.x,t.y=this.m_v1.a*this.m_v1.wA.y+this.m_v2.a*this.m_v2.wA.y,o.x=this.m_v1.a*this.m_v1.wB.x+this.m_v2.a*this.m_v2.wB.x,o.y=this.m_v1.a*this.m_v1.wB.y+this.m_v2.a*this.m_v2.wB.y;break;case 3:o.x=t.x=this.m_v1.a*this.m_v1.wA.x+this.m_v2.a*this.m_v2.wA.x+this.m_v3.a*this.m_v3.wA.x,o.y=t.y=this.m_v1.a*this.m_v1.wA.y+this.m_v2.a*this.m_v2.wA.y+this.m_v3.a*this.m_v3.wA.y;break;default:e.ENABLE_ASSERTS&&e.b2Assert(!1)}},e.b2Simplex.prototype.GetMetric=function(){switch(this.m_count){case 0:return e.ENABLE_ASSERTS&&e.b2Assert(!1),0;case 1:return 0;case 2:return e.b2DistanceVV(this.m_v1.w,this.m_v2.w);case 3:return e.b2CrossVV(e.b2SubVV(this.m_v2.w,this.m_v1.w,e.b2Vec2.s_t0),e.b2SubVV(this.m_v3.w,this.m_v1.w,e.b2Vec2.s_t1));default:return e.ENABLE_ASSERTS&&e.b2Assert(!1),0}},e.b2Simplex.prototype.Solve2=function(){var t=this.m_v1.w,o=this.m_v2.w,i=e.b2SubVV(o,t,e.b2Simplex.s_e12),n=-e.b2DotVV(t,i);if(0>=n)return this.m_v1.a=1,this.m_count=1,void 0;var s=e.b2DotVV(o,i);if(0>=s)return this.m_v2.a=1,this.m_count=1,this.m_v1.Copy(this.m_v2),void 0;var r=1/(s+n);this.m_v1.a=s*r,this.m_v2.a=n*r,this.m_count=2},e.b2Simplex.prototype.Solve3=function(){var t=this.m_v1.w,o=this.m_v2.w,i=this.m_v3.w,n=e.b2SubVV(o,t,e.b2Simplex.s_e12),s=e.b2DotVV(t,n),r=e.b2DotVV(o,n),a=r,l=-s,p=e.b2SubVV(i,t,e.b2Simplex.s_e13),m=e.b2DotVV(t,p),_=e.b2DotVV(i,p),b=_,h=-m,c=e.b2SubVV(i,o,e.b2Simplex.s_e23),u=e.b2DotVV(o,c),y=e.b2DotVV(i,c),d=y,f=-u,A=e.b2CrossVV(n,p),S=A*e.b2CrossVV(o,i),C=A*e.b2CrossVV(i,t),v=A*e.b2CrossVV(t,o);if(0>=l&&0>=h)return this.m_v1.a=1,this.m_count=1,void 0;if(a>0&&l>0&&0>=v){var x=1/(a+l);return this.m_v1.a=a*x,this.m_v2.a=l*x,this.m_count=2,void 0}if(b>0&&h>0&&0>=C){var V=1/(b+h);return this.m_v1.a=b*V,this.m_v3.a=h*V,this.m_count=2,this.m_v2.Copy(this.m_v3),void 0}if(0>=a&&0>=f)return this.m_v2.a=1,this.m_count=1,this.m_v1.Copy(this.m_v2),void 0;if(0>=b&&0>=d)return this.m_v3.a=1,this.m_count=1,this.m_v1.Copy(this.m_v3),void 0;if(d>0&&f>0&&0>=S){var g=1/(d+f);return this.m_v2.a=d*g,this.m_v3.a=f*g,this.m_count=2,this.m_v1.Copy(this.m_v3),void 0}var B=1/(S+C+v);this.m_v1.a=S*B,this.m_v2.a=C*B,this.m_v3.a=v*B,this.m_count=3},e.b2Simplex.s_e12=new e.b2Vec2,e.b2Simplex.s_e13=new e.b2Vec2,e.b2Simplex.s_e23=new e.b2Vec2,e.b2Distance=function(t,o,i){++e.b2_gjkCalls;var n=i.proxyA,s=i.proxyB,r=i.transformA,a=i.transformB,l=e.b2Distance.s_simplex;l.ReadCache(o,n,r,s,a);for(var p=l.m_vertices,m=20,_=e.b2Distance.s_saveA,b=e.b2Distance.s_saveB,h=0,c=e.b2_maxFloat,u=c,y=0;m>y;){h=l.m_count;for(var d=0;h>d;++d)_[d]=p[d].indexA,b[d]=p[d].indexB;switch(l.m_count){case 1:break;case 2:l.Solve2();break;case 3:l.Solve3();break;default:e.ENABLE_ASSERTS&&e.b2Assert(!1)}if(3==l.m_count)break;var f=l.GetClosestPoint(e.b2Distance.s_p);u=f.GetLengthSquared(),c=u;var A=l.GetSearchDirection(e.b2Distance.s_d);if(A.GetLengthSquared()<e.b2_epsilon_sq)break;var S=p[l.m_count];S.indexA=n.GetSupport(e.b2MulTRV(r.q,e.b2NegV(A,e.b2Vec2.s_t0),e.b2Distance.s_supportA)),e.b2MulXV(r,n.GetVertex(S.indexA),S.wA),S.indexB=s.GetSupport(e.b2MulTRV(a.q,A,e.b2Distance.s_supportB)),e.b2MulXV(a,s.GetVertex(S.indexB),S.wB),e.b2SubVV(S.wB,S.wA,S.w),++y,++e.b2_gjkIters;for(var C=!1,d=0;h>d;++d)if(S.indexA==_[d]&&S.indexB==b[d]){C=!0;break}if(C)break;++l.m_count}if(e.b2_gjkMaxIters=e.b2Max(e.b2_gjkMaxIters,y),l.GetWitnessPoints(t.pointA,t.pointB),t.distance=e.b2DistanceVV(t.pointA,t.pointB),t.iterations=y,l.WriteCache(o),i.useRadii){var v=n.m_radius,x=s.m_radius;if(t.distance>v+x&&t.distance>e.b2_epsilon){t.distance-=v+x;var V=e.b2SubVV(t.pointB,t.pointA,e.b2Distance.s_normal);V.Normalize(),t.pointA.SelfMulAdd(v,V),t.pointB.SelfMulSub(x,V)}else{var f=e.b2MidVV(t.pointA,t.pointB,e.b2Distance.s_p);t.pointA.Copy(f),t.pointB.Copy(f),t.distance=0}}},e.b2Distance.s_simplex=new e.b2Simplex,e.b2Distance.s_saveA=e.b2MakeNumberArray(3),e.b2Distance.s_saveB=e.b2MakeNumberArray(3),e.b2Distance.s_p=new e.b2Vec2,e.b2Distance.s_d=new e.b2Vec2,e.b2Distance.s_normal=new e.b2Vec2,e.b2Distance.s_supportA=new e.b2Vec2,e.b2Distance.s_supportB=new e.b2Vec2,e}(e,i,o),a=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Collision&&(e.b2Collision={}),e.b2ContactFeatureType={e_vertex:0,e_face:1},t.exportProperty(e.b2ContactFeatureType,"e_vertex",e.b2ContactFeatureType.e_vertex),t.exportProperty(e.b2ContactFeatureType,"e_face",e.b2ContactFeatureType.e_face),e.b2ContactFeature=function(t){this._id=t},e.b2ContactFeature.prototype._id=null,e.b2ContactFeature.prototype._indexA=0,e.b2ContactFeature.prototype._indexB=0,e.b2ContactFeature.prototype._typeA=0,e.b2ContactFeature.prototype._typeB=0,Object.defineProperty(e.b2ContactFeature.prototype,"indexA",{enumerable:!1,configurable:!0,get:function(){return this._indexA},set:function(t){this._indexA=t,this._id._key=4294967040&this._id._key|255&this._indexA}}),Object.defineProperty(e.b2ContactFeature.prototype,"indexB",{enumerable:!1,configurable:!0,get:function(){return this._indexB},set:function(t){this._indexB=t,this._id._key=4294902015&this._id._key|this._indexB<<8&65280}}),Object.defineProperty(e.b2ContactFeature.prototype,"typeA",{enumerable:!1,configurable:!0,get:function(){return this._typeA},set:function(t){this._typeA=t,this._id._key=4278255615&this._id._key|this._typeA<<16&16711680}}),Object.defineProperty(e.b2ContactFeature.prototype,"typeB",{enumerable:!1,configurable:!0,get:function(){return this._typeB},set:function(t){this._typeB=t,this._id._key=16777215&this._id._key|this._typeB<<24&4278190080}}),e.b2ContactID=function(){this.cf=new e.b2ContactFeature(this)},e.b2ContactID.prototype.cf=null,e.b2ContactID.prototype.key=0,e.b2ContactID.prototype.Copy=function(t){return this.key=t.key,this},e.b2ContactID.prototype.Clone=function(){return(new e.b2ContactID).Copy(this)},Object.defineProperty(e.b2ContactID.prototype,"key",{enumerable:!1,configurable:!0,get:function(){return this._key},set:function(t){this._key=t,this.cf._indexA=255&this._key,this.cf._indexB=this._key>>8&255,this.cf._typeA=this._key>>16&255,this.cf._typeB=this._key>>24&255}}),e.b2ManifoldPoint=function(){this.localPoint=new e.b2Vec2,this.id=new e.b2ContactID},e.b2ManifoldPoint.prototype.localPoint=null,e.b2ManifoldPoint.prototype.normalImpulse=0,e.b2ManifoldPoint.prototype.tangentImpulse=0,e.b2ManifoldPoint.prototype.id=null,e.b2ManifoldPoint.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2ManifoldPoint})},e.b2ManifoldPoint.prototype.Reset=function(){this.localPoint.SetZero(),this.normalImpulse=0,this.tangentImpulse=0,this.id.key=0},e.b2ManifoldPoint.prototype.Copy=function(t){return this.localPoint.Copy(t.localPoint),this.normalImpulse=t.normalImpulse,this.tangentImpulse=t.tangentImpulse,this.id.Copy(t.id),this},e.b2ManifoldType={e_unknown:-1,e_circles:0,e_faceA:1,e_faceB:2},t.exportProperty(e.b2ManifoldType,"e_unknown",e.b2ManifoldType.e_unknown),t.exportProperty(e.b2ManifoldType,"e_circles",e.b2ManifoldType.e_circles),t.exportProperty(e.b2ManifoldType,"e_faceA",e.b2ManifoldType.e_faceA),t.exportProperty(e.b2ManifoldType,"e_faceB",e.b2ManifoldType.e_faceB),e.b2Manifold=function(){this.points=e.b2ManifoldPoint.MakeArray(e.b2_maxManifoldPoints),this.localNormal=new e.b2Vec2,this.localPoint=new e.b2Vec2,this.type=e.b2ManifoldType.e_unknown,this.pointCount=0},e.b2Manifold.prototype.points=null,e.b2Manifold.prototype.localNormal=null,e.b2Manifold.prototype.localPoint=null,e.b2Manifold.prototype.type=e.b2ManifoldType.e_unknown,e.b2Manifold.prototype.pointCount=0,e.b2Manifold.prototype.Reset=function(){for(var t=0,o=e.b2_maxManifoldPoints;o>t;++t)this.points[t].Reset();this.localNormal.SetZero(),this.localPoint.SetZero(),this.type=e.b2ManifoldType.e_unknown,this.pointCount=0},e.b2Manifold.prototype.Copy=function(t){this.pointCount=t.pointCount;for(var o=0,i=e.b2_maxManifoldPoints;i>o;++o)this.points[o].Copy(t.points[o]);return this.localNormal.Copy(t.localNormal),this.localPoint.Copy(t.localPoint),this.type=t.type,this},e.b2Manifold.prototype.Clone=function(){return(new e.b2Manifold).Copy(this)},e.b2WorldManifold=function(){this.normal=new e.b2Vec2,this.points=e.b2Vec2.MakeArray(e.b2_maxManifoldPoints),this.separations=e.b2MakeNumberArray(e.b2_maxManifoldPoints)},e.b2WorldManifold.prototype.normal=null,e.b2WorldManifold.prototype.points=null,e.b2WorldManifold.prototype.separations=null,e.b2WorldManifold.prototype.Initialize=function(t,o,i,n,s){if(0!=t.pointCount)switch(t.type){case e.b2ManifoldType.e_circles:this.normal.Set(1,0);var r=e.b2MulXV(o,t.localPoint,e.b2WorldManifold.prototype.Initialize.s_pointA),a=e.b2MulXV(n,t.points[0].localPoint,e.b2WorldManifold.prototype.Initialize.s_pointB);e.b2DistanceSquaredVV(r,a)>e.b2_epsilon_sq&&e.b2SubVV(a,r,this.normal).SelfNormalize();var l=e.b2AddVMulSV(r,i,this.normal,e.b2WorldManifold.prototype.Initialize.s_cA),p=e.b2SubVMulSV(a,s,this.normal,e.b2WorldManifold.prototype.Initialize.s_cB);e.b2MidVV(l,p,this.points[0]),this.separations[0]=e.b2DotVV(e.b2SubVV(p,l,e.b2Vec2.s_t0),this.normal);break;case e.b2ManifoldType.e_faceA:e.b2MulRV(o.q,t.localNormal,this.normal);for(var m=e.b2MulXV(o,t.localPoint,e.b2WorldManifold.prototype.Initialize.s_planePoint),_=0,b=t.pointCount;b>_;++_){var h=e.b2MulXV(n,t.points[_].localPoint,e.b2WorldManifold.prototype.Initialize.s_clipPoint),c=i-e.b2DotVV(e.b2SubVV(h,m,e.b2Vec2.s_t0),this.normal),l=e.b2AddVMulSV(h,c,this.normal,e.b2WorldManifold.prototype.Initialize.s_cA),p=e.b2SubVMulSV(h,s,this.normal,e.b2WorldManifold.prototype.Initialize.s_cB);e.b2MidVV(l,p,this.points[_]),this.separations[_]=e.b2DotVV(e.b2SubVV(p,l,e.b2Vec2.s_t0),this.normal)}break;case e.b2ManifoldType.e_faceB:e.b2MulRV(n.q,t.localNormal,this.normal);for(var m=e.b2MulXV(n,t.localPoint,e.b2WorldManifold.prototype.Initialize.s_planePoint),_=0,b=t.pointCount;b>_;++_){var h=e.b2MulXV(o,t.points[_].localPoint,e.b2WorldManifold.prototype.Initialize.s_clipPoint),c=s-e.b2DotVV(e.b2SubVV(h,m,e.b2Vec2.s_t0),this.normal),p=e.b2AddVMulSV(h,c,this.normal,e.b2WorldManifold.prototype.Initialize.s_cB),l=e.b2SubVMulSV(h,i,this.normal,e.b2WorldManifold.prototype.Initialize.s_cA);e.b2MidVV(l,p,this.points[_]),this.separations[_]=e.b2DotVV(e.b2SubVV(l,p,e.b2Vec2.s_t0),this.normal)}this.normal.SelfNeg()}},e.b2WorldManifold.prototype.Initialize.s_pointA=new e.b2Vec2,e.b2WorldManifold.prototype.Initialize.s_pointB=new e.b2Vec2,e.b2WorldManifold.prototype.Initialize.s_cA=new e.b2Vec2,e.b2WorldManifold.prototype.Initialize.s_cB=new e.b2Vec2,e.b2WorldManifold.prototype.Initialize.s_planePoint=new e.b2Vec2,e.b2WorldManifold.prototype.Initialize.s_clipPoint=new e.b2Vec2,e.b2PointState={b2_nullState:0,b2_addState:1,b2_persistState:2,b2_removeState:3},t.exportProperty(e.b2PointState,"b2_nullState   ",e.b2PointState.b2_nullState),t.exportProperty(e.b2PointState,"b2_addState    ",e.b2PointState.b2_addState),t.exportProperty(e.b2PointState,"b2_persistState",e.b2PointState.b2_persistState),t.exportProperty(e.b2PointState,"b2_removeState ",e.b2PointState.b2_removeState),e.b2GetPointStates=function(t,o,i,n){for(var s=0,r=i.pointCount;r>s;++s){var a=i.points[s].id,l=a.key;t[s]=e.b2PointState.b2_removeState;for(var p=0,m=n.pointCount;m>p;++p)if(n.points[p].id.key==l){t[s]=e.b2PointState.b2_persistState;break}}for(var r=e.b2_maxManifoldPoints;r>s;++s)t[s]=e.b2PointState.b2_nullState;for(var s=0,r=n.pointCount;r>s;++s){var a=n.points[s].id,l=a.key;o[s]=e.b2PointState.b2_addState;for(var p=0,m=i.pointCount;m>p;++p)if(i.points[p].id.key==l){o[s]=e.b2PointState.b2_persistState;break}}for(var r=e.b2_maxManifoldPoints;r>s;++s)o[s]=e.b2PointState.b2_nullState},e.b2ClipVertex=function(){this.v=new e.b2Vec2,this.id=new e.b2ContactID},e.b2ClipVertex.prototype.v=null,e.b2ClipVertex.prototype.id=null,e.b2ClipVertex.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2ClipVertex})},e.b2ClipVertex.prototype.Copy=function(t){return this.v.Copy(t.v),this.id.Copy(t.id),this},e.b2RayCastInput=function(){this.p1=new e.b2Vec2,this.p2=new e.b2Vec2,this.maxFraction=1},e.b2RayCastInput.prototype.p1=null,e.b2RayCastInput.prototype.p2=null,e.b2RayCastInput.prototype.maxFraction=1,e.b2RayCastInput.prototype.Copy=function(t){return this.p1.Copy(t.p1),this.p2.Copy(t.p2),this.maxFraction=t.maxFraction,this},e.b2RayCastOutput=function(){this.normal=new e.b2Vec2,this.fraction=0},e.b2RayCastOutput.prototype.normal=null,e.b2RayCastOutput.prototype.fraction=0,e.b2RayCastOutput.prototype.Copy=function(t){return this.normal.Copy(t.normal),this.fraction=t.fraction,this},e.b2AABB=function(){this.lowerBound=new e.b2Vec2,this.upperBound=new e.b2Vec2,this.m_out_center=new e.b2Vec2,this.m_out_extent=new e.b2Vec2},e.b2AABB.prototype.lowerBound=null,e.b2AABB.prototype.upperBound=null,e.b2AABB.prototype.m_out_center=null,e.b2AABB.prototype.m_out_extent=null,e.b2AABB.prototype.Copy=function(t){return this.lowerBound.Copy(t.lowerBound),this.upperBound.Copy(t.upperBound),this},e.b2AABB.prototype.IsValid=function(){var t=this.upperBound.x-this.lowerBound.x,e=this.upperBound.y-this.lowerBound.y,o=t>=0&&e>=0;return o=o&&this.lowerBound.IsValid()&&this.upperBound.IsValid()},e.b2AABB.prototype.GetCenter=function(){return e.b2MidVV(this.lowerBound,this.upperBound,this.m_out_center)},e.b2AABB.prototype.GetExtents=function(){return e.b2ExtVV(this.lowerBound,this.upperBound,this.m_out_extent)},e.b2AABB.prototype.GetPerimeter=function(){var t=this.upperBound.x-this.lowerBound.x,e=this.upperBound.y-this.lowerBound.y;return 2*(t+e)},e.b2AABB.prototype.Combine1=function(t){return this.lowerBound.x=e.b2Min(this.lowerBound.x,t.lowerBound.x),this.lowerBound.y=e.b2Min(this.lowerBound.y,t.lowerBound.y),this.upperBound.x=e.b2Max(this.upperBound.x,t.upperBound.x),this.upperBound.y=e.b2Max(this.upperBound.y,t.upperBound.y),this},e.b2AABB.prototype.Combine2=function(t,o){return this.lowerBound.x=e.b2Min(t.lowerBound.x,o.lowerBound.x),this.lowerBound.y=e.b2Min(t.lowerBound.y,o.lowerBound.y),this.upperBound.x=e.b2Max(t.upperBound.x,o.upperBound.x),this.upperBound.y=e.b2Max(t.upperBound.y,o.upperBound.y),this},e.b2AABB.Combine=function(t,e,o){return o.Combine2(t,e),o},e.b2AABB.prototype.Contains=function(t){var e=!0;return e=e&&this.lowerBound.x<=t.lowerBound.x,e=e&&this.lowerBound.y<=t.lowerBound.y,e=e&&t.upperBound.x<=this.upperBound.x,e=e&&t.upperBound.y<=this.upperBound.y},e.b2AABB.prototype.RayCast=function(t,o){var i=-e.b2_maxFloat,n=e.b2_maxFloat,s=o.p1.x,r=o.p1.y,a=o.p2.x-o.p1.x,l=o.p2.y-o.p1.y,p=e.b2Abs(a),m=e.b2Abs(l),_=t.normal;if(p<e.b2_epsilon){if(s<this.lowerBound.x||this.upperBound.x<s)return!1}else{var b=1/a,h=(this.lowerBound.x-s)*b,c=(this.upperBound.x-s)*b,u=-1;if(h>c){var y=h;h=c,c=y,u=1}if(h>i&&(_.x=u,_.y=0,i=h),n=e.b2Min(n,c),i>n)return!1}if(m<e.b2_epsilon){if(r<this.lowerBound.y||this.upperBound.y<r)return!1}else{var b=1/l,h=(this.lowerBound.y-r)*b,c=(this.upperBound.y-r)*b,u=-1;if(h>c){var y=h;h=c,c=y,u=1}if(h>i&&(_.x=0,_.y=u,i=h),n=e.b2Min(n,c),i>n)return!1}return 0>i||o.maxFraction<i?!1:(t.fraction=i,!0)},e.b2AABB.prototype.TestOverlap=function(t){var e=t.lowerBound.x-this.upperBound.x,o=t.lowerBound.y-this.upperBound.y,i=this.lowerBound.x-t.upperBound.x,n=this.lowerBound.y-t.upperBound.y;return e>0||o>0?!1:i>0||n>0?!1:!0},e.b2TestOverlapAABB=function(t,e){var o=e.lowerBound.x-t.upperBound.x,i=e.lowerBound.y-t.upperBound.y,n=t.lowerBound.x-e.upperBound.x,s=t.lowerBound.y-e.upperBound.y;return o>0||i>0?!1:n>0||s>0?!1:!0},e.b2ClipSegmentToLine=function(t,o,i,n,s){var r=0,a=o[0],l=o[1],p=e.b2DotVV(i,a.v)-n,m=e.b2DotVV(i,l.v)-n;if(0>=p&&t[r++].Copy(a),0>=m&&t[r++].Copy(l),0>p*m){var _=p/(p-m),b=t[r].v;b.x=a.v.x+_*(l.v.x-a.v.x),b.y=a.v.y+_*(l.v.y-a.v.y);var h=t[r].id;h.cf.indexA=s,h.cf.indexB=a.id.cf.indexB,h.cf.typeA=e.b2ContactFeatureType.e_vertex,h.cf.typeB=e.b2ContactFeatureType.e_face,++r}return r},e.b2TestOverlapShape=function(t,o,i,n,s,r){var a=e.b2TestOverlapShape.s_input.Reset();a.proxyA.SetShape(t,o),a.proxyB.SetShape(i,n),a.transformA.Copy(s),a.transformB.Copy(r),a.useRadii=!0;var l=e.b2TestOverlapShape.s_simplexCache.Reset();l.count=0;var p=e.b2TestOverlapShape.s_output.Reset();return e.b2Distance(p,l,a),p.distance<10*e.b2_epsilon},e.b2TestOverlapShape.s_input=new e.b2DistanceInput,e.b2TestOverlapShape.s_simplexCache=new e.b2SimplexCache,e.b2TestOverlapShape.s_output=new e.b2DistanceOutput,e}(e,r,i,o),l=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Shape&&(e.b2Shape={}),e.b2MassData=function(){this.center=new e.b2Vec2(0,0)},e.b2MassData.prototype.mass=0,e.b2MassData.prototype.center=null,e.b2MassData.prototype.I=0,e.b2ShapeType={e_unknown:-1,e_circleShape:0,e_edgeShape:1,e_polygonShape:2,e_chainShape:3,e_shapeTypeCount:4},t.exportProperty(e.b2ShapeType,"e_unknown",e.b2ShapeType.e_unknown),t.exportProperty(e.b2ShapeType,"e_circleShape",e.b2ShapeType.e_circleShape),t.exportProperty(e.b2ShapeType,"e_edgeShape",e.b2ShapeType.e_edgeShape),t.exportProperty(e.b2ShapeType,"e_polygonShape",e.b2ShapeType.e_polygonShape),t.exportProperty(e.b2ShapeType,"e_chainShape",e.b2ShapeType.e_chainShape),t.exportProperty(e.b2ShapeType,"e_shapeTypeCount",e.b2ShapeType.e_shapeTypeCount),e.b2Shape=function(t,e){this.m_type=t,this.m_radius=e},e.b2Shape.prototype.m_type=e.b2ShapeType.e_unknown,e.b2Shape.prototype.m_radius=0,e.b2Shape.prototype.Clone=function(){return e.ENABLE_ASSERTS&&e.b2Assert(!1),null},e.b2Shape.prototype.Copy=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(this.m_type==t.m_type),this.m_radius=t.m_radius,this},e.b2Shape.prototype.GetType=function(){return this.m_type},e.b2Shape.prototype.GetChildCount=function(){return e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual"),0},e.b2Shape.prototype.TestPoint=function(){return e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual"),!1},e.b2Shape.prototype.RayCast=function(){return e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual"),!1},e.b2Shape.prototype.ComputeAABB=function(){e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual")},e.b2Shape.prototype.ComputeMass=function(){e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual")},e.b2Shape.prototype.SetupDistanceProxy=function(){e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual")},e.b2Shape.prototype.ComputeSubmergedArea=function(){return e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual"),0},e.b2Shape.prototype.Dump=function(){e.ENABLE_ASSERTS&&e.b2Assert(!1,"pure virtual")},e}(e,r,i,o),p=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Fixture&&(e.b2Fixture={}),e.b2Filter=function(){},e.b2Filter.prototype.categoryBits=1,e.b2Filter.prototype.maskBits=65535,e.b2Filter.prototype.groupIndex=0,e.b2Filter.prototype.Clone=function(){return(new e.b2Filter).Copy(this)},e.b2Filter.prototype.Copy=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(this!==t),this.categoryBits=t.categoryBits,this.maskBits=t.maskBits,this.groupIndex=t.groupIndex,this},e.b2FixtureDef=function(){this.filter=new e.b2Filter},e.b2FixtureDef.prototype.shape=null,e.b2FixtureDef.prototype.userData=null,e.b2FixtureDef.prototype.friction=.2,e.b2FixtureDef.prototype.restitution=0,e.b2FixtureDef.prototype.density=0,e.b2FixtureDef.prototype.isSensor=!1,e.b2FixtureDef.prototype.filter=null,e.b2FixtureProxy=function(){this.aabb=new e.b2AABB},e.b2FixtureProxy.prototype.aabb=null,e.b2FixtureProxy.prototype.fixture=null,e.b2FixtureProxy.prototype.childIndex=0,e.b2FixtureProxy.prototype.proxy=null,e.b2FixtureProxy.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2FixtureProxy})},e.b2Fixture=function(){this.m_proxyCount=0,this.m_filter=new e.b2Filter},e.b2Fixture.prototype.m_density=0,e.b2Fixture.prototype.m_next=null,e.b2Fixture.prototype.m_body=null,e.b2Fixture.prototype.m_shape=null,e.b2Fixture.prototype.m_friction=0,e.b2Fixture.prototype.m_restitution=0,e.b2Fixture.prototype.m_proxies=null,e.b2Fixture.prototype.m_proxyCount=0,e.b2Fixture.prototype.m_filter=null,e.b2Fixture.prototype.m_isSensor=!1,e.b2Fixture.prototype.m_userData=null,e.b2Fixture.prototype.GetType=function(){return this.m_shape.GetType()},e.b2Fixture.prototype.GetShape=function(){return this.m_shape},e.b2Fixture.prototype.IsSensor=function(){return this.m_isSensor},e.b2Fixture.prototype.GetFilterData=function(){return this.m_filter},e.b2Fixture.prototype.GetUserData=function(){return this.m_userData},e.b2Fixture.prototype.SetUserData=function(t){this.m_userData=t},e.b2Fixture.prototype.GetBody=function(){return this.m_body},e.b2Fixture.prototype.GetNext=function(){return this.m_next},e.b2Fixture.prototype.SetDensity=function(t){this.m_density=t},e.b2Fixture.prototype.GetDensity=function(){return this.m_density},e.b2Fixture.prototype.GetFriction=function(){return this.m_friction},e.b2Fixture.prototype.SetFriction=function(t){this.m_friction=t},e.b2Fixture.prototype.GetRestitution=function(){return this.m_restitution},e.b2Fixture.prototype.SetRestitution=function(t){this.m_restitution=t},e.b2Fixture.prototype.TestPoint=function(t){return this.m_shape.TestPoint(this.m_body.GetTransform(),t)},e.b2Fixture.prototype.RayCast=function(t,e,o){return this.m_shape.RayCast(t,e,this.m_body.GetTransform(),o)},e.b2Fixture.prototype.GetMassData=function(t){return t=t||new e.b2MassData,this.m_shape.ComputeMass(t,this.m_density),t},e.b2Fixture.prototype.GetAABB=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(t>=0&&t<this.m_proxyCount),this.m_proxies[t].aabb},e.b2Fixture.prototype.Create=function(t,o){this.m_userData=o.userData,this.m_friction=o.friction,this.m_restitution=o.restitution,this.m_body=t,this.m_next=null,this.m_filter.Copy(o.filter),this.m_isSensor=o.isSensor,this.m_shape=o.shape.Clone(),this.m_proxies=e.b2FixtureProxy.MakeArray(this.m_shape.GetChildCount()),this.m_proxyCount=0,this.m_density=o.density},e.b2Fixture.prototype.Destroy=function(){e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_proxyCount),this.m_shape=null},e.b2Fixture.prototype.CreateProxies=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_proxyCount),this.m_proxyCount=this.m_shape.GetChildCount();for(var i=0;i<this.m_proxyCount;++i){var n=this.m_proxies[i];this.m_shape.ComputeAABB(n.aabb,o,i),n.proxy=t.CreateProxy(n.aabb,n),n.fixture=this,n.childIndex=i}},e.b2Fixture.prototype.DestroyProxies=function(t){for(var e=0;e<this.m_proxyCount;++e){var o=this.m_proxies[e];t.DestroyProxy(o.proxy),o.proxy=null}this.m_proxyCount=0},e.b2Fixture.prototype.Synchronize=function(t,o,i){if(0!=this.m_proxyCount)for(var n=0;n<this.m_proxyCount;++n){var s=this.m_proxies[n],r=e.b2Fixture.prototype.Synchronize.s_aabb1,a=e.b2Fixture.prototype.Synchronize.s_aabb2;this.m_shape.ComputeAABB(r,o,n),this.m_shape.ComputeAABB(a,i,n),s.aabb.Combine2(r,a);var l=e.b2SubVV(i.p,o.p,e.b2Fixture.prototype.Synchronize.s_displacement);t.MoveProxy(s.proxy,s.aabb,l)}},e.b2Fixture.prototype.Synchronize.s_aabb1=new e.b2AABB,e.b2Fixture.prototype.Synchronize.s_aabb2=new e.b2AABB,e.b2Fixture.prototype.Synchronize.s_displacement=new e.b2Vec2,e.b2Fixture.prototype.SetFilterData=function(t){this.m_filter.Copy(t),this.Refilter()
	},e.b2Fixture.prototype.Refilter=function(){if(!this.m_body){for(var t=this.m_body.GetContactList();t;){var e=t.contact,o=e.GetFixtureA(),i=e.GetFixtureB();(o==this||i==this)&&e.FlagForFiltering(),t=t.next}var n=this.m_body.GetWorld();if(null!==n)for(var s=n.m_contactManager.m_broadPhase,r=0;r<this.m_proxyCount;++r)s.TouchProxy(this.m_proxies[r].proxy)}},e.b2Fixture.prototype.SetSensor=function(t){t!=this.m_isSensor&&(this.m_body.SetAwake(!0),this.m_isSensor=t)},e.b2Fixture.prototype.Dump=function(t){e.DEBUG&&(e.b2Log("    /*box2d.b2FixtureDef*/ var fd = new box2d.b2FixtureDef();\n"),e.b2Log("    fd.friction = %.15f;\n",this.m_friction),e.b2Log("    fd.restitution = %.15f;\n",this.m_restitution),e.b2Log("    fd.density = %.15f;\n",this.m_density),e.b2Log("    fd.isSensor = %s;\n",this.m_isSensor?"true":"false"),e.b2Log("    fd.filter.categoryBits = %d;\n",this.m_filter.categoryBits),e.b2Log("    fd.filter.maskBits = %d;\n",this.m_filter.maskBits),e.b2Log("    fd.filter.groupIndex = %d;\n",this.m_filter.groupIndex),this.m_shape.Dump(),e.b2Log("\n"),e.b2Log("    fd.shape = shape;\n"),e.b2Log("\n"),e.b2Log("    bodies[%d].CreateFixture(fd);\n",t))},e}(e,a,o,l),m=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Body&&(e.b2Body={}),e.b2BodyType={b2_unknown:-1,b2_staticBody:0,b2_kinematicBody:1,b2_dynamicBody:2,b2_bulletBody:3},t.exportProperty(e.b2BodyType,"b2_unknown",e.b2BodyType.b2_unknown),t.exportProperty(e.b2BodyType,"b2_staticBody",e.b2BodyType.b2_staticBody),t.exportProperty(e.b2BodyType,"b2_kinematicBody",e.b2BodyType.b2_kinematicBody),t.exportProperty(e.b2BodyType,"b2_dynamicBody",e.b2BodyType.b2_dynamicBody),t.exportProperty(e.b2BodyType,"b2_bulletBody",e.b2BodyType.b2_bulletBody),e.b2BodyDef=function(){this.position=new e.b2Vec2(0,0),this.linearVelocity=new e.b2Vec2(0,0)},e.b2BodyDef.prototype.type=e.b2BodyType.b2_staticBody,e.b2BodyDef.prototype.position=null,e.b2BodyDef.prototype.angle=0,e.b2BodyDef.prototype.linearVelocity=null,e.b2BodyDef.prototype.angularVelocity=0,e.b2BodyDef.prototype.linearDamping=0,e.b2BodyDef.prototype.angularDamping=0,e.b2BodyDef.prototype.allowSleep=!0,e.b2BodyDef.prototype.awake=!0,e.b2BodyDef.prototype.fixedRotation=!1,e.b2BodyDef.prototype.bullet=!1,e.b2BodyDef.prototype.active=!0,e.b2BodyDef.prototype.userData=null,e.b2BodyDef.prototype.gravityScale=1,e.b2BodyFlag={e_none:0,e_islandFlag:1,e_awakeFlag:2,e_autoSleepFlag:4,e_bulletFlag:8,e_fixedRotationFlag:16,e_activeFlag:32,e_toiFlag:64},t.exportProperty(e.b2BodyFlag,"e_none",e.b2BodyFlag.e_none),t.exportProperty(e.b2BodyFlag,"e_islandFlag",e.b2BodyFlag.e_islandFlag),t.exportProperty(e.b2BodyFlag,"e_awakeFlag",e.b2BodyFlag.e_awakeFlag),t.exportProperty(e.b2BodyFlag,"e_autoSleepFlag",e.b2BodyFlag.e_autoSleepFlag),t.exportProperty(e.b2BodyFlag,"e_bulletFlag",e.b2BodyFlag.e_bulletFlag),t.exportProperty(e.b2BodyFlag,"e_fixedRotationFlag",e.b2BodyFlag.e_fixedRotationFlag),t.exportProperty(e.b2BodyFlag,"e_activeFlag",e.b2BodyFlag.e_activeFlag),t.exportProperty(e.b2BodyFlag,"e_toiFlag",e.b2BodyFlag.e_toiFlag),e.b2Body=function(t,o){this.m_xf=new e.b2Transform,this.m_out_xf=new e.b2Transform,this.m_sweep=new e.b2Sweep,this.m_out_sweep=new e.b2Sweep,this.m_linearVelocity=new e.b2Vec2,this.m_out_linearVelocity=new e.b2Vec2,this.m_force=new e.b2Vec2,e.ENABLE_ASSERTS&&e.b2Assert(t.position.IsValid()),e.ENABLE_ASSERTS&&e.b2Assert(t.linearVelocity.IsValid()),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t.angle)),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t.angularVelocity)),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t.gravityScale)&&t.gravityScale>=0),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t.angularDamping)&&t.angularDamping>=0),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t.linearDamping)&&t.linearDamping>=0),this.m_flags=e.b2BodyFlag.e_none,t.bullet&&(this.m_flags|=e.b2BodyFlag.e_bulletFlag),t.fixedRotation&&(this.m_flags|=e.b2BodyFlag.e_fixedRotationFlag),t.allowSleep&&(this.m_flags|=e.b2BodyFlag.e_autoSleepFlag),t.awake&&(this.m_flags|=e.b2BodyFlag.e_awakeFlag),t.active&&(this.m_flags|=e.b2BodyFlag.e_activeFlag),this.m_world=o,this.m_xf.p.Copy(t.position),this.m_xf.q.SetAngleRadians(t.angle),this.m_sweep.localCenter.SetZero(),this.m_sweep.c0.Copy(this.m_xf.p),this.m_sweep.c.Copy(this.m_xf.p),this.m_sweep.a0=t.angle,this.m_sweep.a=t.angle,this.m_sweep.alpha0=0,this.m_linearVelocity.Copy(t.linearVelocity),this.m_angularVelocity=t.angularVelocity,this.m_linearDamping=t.linearDamping,this.m_angularDamping=t.angularDamping,this.m_gravityScale=t.gravityScale,this.m_force.SetZero(),this.m_torque=0,this.m_sleepTime=0,this.m_type=t.type,t.type==e.b2BodyType.b2_dynamicBody?(this.m_mass=1,this.m_invMass=1):(this.m_mass=0,this.m_invMass=0),this.m_I=0,this.m_invI=0,this.m_userData=t.userData,this.m_fixtureList=null,this.m_fixtureCount=0,this.m_controllerList=null,this.m_controllerCount=0},e.b2Body.prototype.m_flags=e.b2BodyFlag.e_none,e.b2Body.prototype.m_islandIndex=0,e.b2Body.prototype.m_world=null,e.b2Body.prototype.m_xf=null,e.b2Body.prototype.m_out_xf=null,e.b2Body.prototype.m_sweep=null,e.b2Body.prototype.m_out_sweep=null,e.b2Body.prototype.m_jointList=null,e.b2Body.prototype.m_contactList=null,e.b2Body.prototype.m_prev=null,e.b2Body.prototype.m_next=null,e.b2Body.prototype.m_linearVelocity=null,e.b2Body.prototype.m_out_linearVelocity=null,e.b2Body.prototype.m_angularVelocity=0,e.b2Body.prototype.m_linearDamping=0,e.b2Body.prototype.m_angularDamping=0,e.b2Body.prototype.m_gravityScale=1,e.b2Body.prototype.m_force=null,e.b2Body.prototype.m_torque=0,e.b2Body.prototype.m_sleepTime=0,e.b2Body.prototype.m_type=e.b2BodyType.b2_staticBody,e.b2Body.prototype.m_mass=1,e.b2Body.prototype.m_invMass=1,e.b2Body.prototype.m_I=0,e.b2Body.prototype.m_invI=0,e.b2Body.prototype.m_userData=null,e.b2Body.prototype.m_fixtureList=null,e.b2Body.prototype.m_fixtureCount=0,e.b2Body.prototype.m_controllerList=null,e.b2Body.prototype.m_controllerCount=0,e.b2Body.prototype.CreateFixture=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),1==this.m_world.IsLocked())return null;var o=new e.b2Fixture;if(o.Create(this,t),this.m_flags&e.b2BodyFlag.e_activeFlag){var i=this.m_world.m_contactManager.m_broadPhase;o.CreateProxies(i,this.m_xf)}return o.m_next=this.m_fixtureList,this.m_fixtureList=o,++this.m_fixtureCount,o.m_body=this,o.m_density>0&&this.ResetMassData(),this.m_world.m_flags|=e.b2WorldFlag.e_newFixture,o},e.b2Body.prototype.CreateFixture2=function(t,o){void 0===o&&(o=0);var i=e.b2Body.prototype.CreateFixture2.s_def;return i.shape=t,i.density=o,this.CreateFixture(i)},e.b2Body.prototype.CreateFixture2.s_def=new e.b2FixtureDef,e.b2Body.prototype.DestroyFixture=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),1!=this.m_world.IsLocked()){e.ENABLE_ASSERTS&&e.b2Assert(t.m_body==this),e.ENABLE_ASSERTS&&e.b2Assert(this.m_fixtureCount>0);for(var o=this.m_fixtureList,i=null,n=!1;null!=o;){if(o==t){i?i.m_next=t.m_next:this.m_fixtureList=t.m_next,n=!0;break}i=o,o=o.m_next}e.ENABLE_ASSERTS&&e.b2Assert(n);for(var s=this.m_contactList;s;){var r=s.contact;s=s.next;var a=r.GetFixtureA(),l=r.GetFixtureB();(t==a||t==l)&&this.m_world.m_contactManager.Destroy(r)}if(this.m_flags&e.b2BodyFlag.e_activeFlag){var p=this.m_world.m_contactManager.m_broadPhase;t.DestroyProxies(p)}t.Destroy(),t.m_body=null,t.m_next=null,--this.m_fixtureCount,this.ResetMassData()}},e.b2Body.prototype.SetTransformVecRadians=function(t,e){this.SetTransformXYRadians(t.x,t.y,e)},e.b2Body.prototype.SetTransformXYRadians=function(t,o,i){if((this.m_xf.p.x!=t||this.m_xf.p.y!=o||this.m_xf.q.GetAngleRadians()!=i)&&(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),1!=this.m_world.IsLocked())){this.m_xf.q.SetAngleRadians(i),this.m_xf.p.Set(t,o),e.b2MulXV(this.m_xf,this.m_sweep.localCenter,this.m_sweep.c),this.m_sweep.a=i,this.m_sweep.c0.Copy(this.m_sweep.c),this.m_sweep.a0=i;for(var n=this.m_world.m_contactManager.m_broadPhase,s=this.m_fixtureList;s;s=s.m_next)s.Synchronize(n,this.m_xf,this.m_xf)}},e.b2Body.prototype.SetTransform=function(t){this.SetTransformVecRadians(t.p,t.GetAngleRadians())},e.b2Body.prototype.GetTransform=function(t){return t=t||this.m_out_xf,t.Copy(this.m_xf)},e.b2Body.prototype.GetPosition=function(t){return t=t||this.m_out_xf.p,t.Copy(this.m_xf.p)},e.b2Body.prototype.SetPosition=function(t){this.SetTransformVecRadians(t,this.GetAngleRadians())},e.b2Body.prototype.SetPositionXY=function(t,e){this.SetTransformXYRadians(t,e,this.GetAngleRadians())},e.b2Body.prototype.GetAngleRadians=function(){return this.m_sweep.a},e.b2Body.prototype.SetAngleRadians=function(t){this.SetTransformVecRadians(this.GetPosition(),t)},e.b2Body.prototype.GetWorldCenter=function(t){return t=t||this.m_out_sweep.c,t.Copy(this.m_sweep.c)},e.b2Body.prototype.GetLocalCenter=function(t){return t=t||this.m_out_sweep.localCenter,t.Copy(this.m_sweep.localCenter)},e.b2Body.prototype.SetLinearVelocity=function(t){this.m_type!=e.b2BodyType.b2_staticBody&&(e.b2DotVV(t,t)>0&&this.SetAwake(!0),this.m_linearVelocity.Copy(t))},e.b2Body.prototype.GetLinearVelocity=function(t){return t=t||this.m_out_linearVelocity,t.Copy(this.m_linearVelocity)},e.b2Body.prototype.SetAngularVelocity=function(t){this.m_type!=e.b2BodyType.b2_staticBody&&(t*t>0&&this.SetAwake(!0),this.m_angularVelocity=t)},e.b2Body.prototype.GetAngularVelocity=function(){return this.m_angularVelocity},e.b2Body.prototype.GetDefinition=function(t){return t.type=this.GetType(),t.allowSleep=(this.m_flags&e.b2BodyFlag.e_autoSleepFlag)==e.b2BodyFlag.e_autoSleepFlag,t.angle=this.GetAngleRadians(),t.angularDamping=this.m_angularDamping,t.gravityScale=this.m_gravityScale,t.angularVelocity=this.m_angularVelocity,t.fixedRotation=(this.m_flags&e.b2BodyFlag.e_fixedRotationFlag)==e.b2BodyFlag.e_fixedRotationFlag,t.bullet=(this.m_flags&e.b2BodyFlag.e_bulletFlag)==e.b2BodyFlag.e_bulletFlag,t.awake=(this.m_flags&e.b2BodyFlag.e_awakeFlag)==e.b2BodyFlag.e_awakeFlag,t.linearDamping=this.m_linearDamping,t.linearVelocity.Copy(this.GetLinearVelocity()),t.position.Copy(this.GetPosition()),t.userData=this.GetUserData(),t},e.b2Body.prototype.ApplyForce=function(t,o,i){i=i||!0,this.m_type==e.b2BodyType.b2_dynamicBody&&(i&&0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&this.SetAwake(!0),this.m_flags&e.b2BodyFlag.e_awakeFlag&&(this.m_force.x+=t.x,this.m_force.y+=t.y,this.m_torque+=(o.x-this.m_sweep.c.x)*t.y-(o.y-this.m_sweep.c.y)*t.x))},e.b2Body.prototype.ApplyForceToCenter=function(t,o){o=o||!0,this.m_type==e.b2BodyType.b2_dynamicBody&&(o&&0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&this.SetAwake(!0),this.m_flags&e.b2BodyFlag.e_awakeFlag&&(this.m_force.x+=t.x,this.m_force.y+=t.y))},e.b2Body.prototype.ApplyTorque=function(t,o){o=o||!0,this.m_type==e.b2BodyType.b2_dynamicBody&&(o&&0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&this.SetAwake(!0),this.m_flags&e.b2BodyFlag.e_awakeFlag&&(this.m_torque+=t))},e.b2Body.prototype.ApplyLinearImpulse=function(t,o,i){i=i||!0,this.m_type==e.b2BodyType.b2_dynamicBody&&(i&&0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&this.SetAwake(!0),this.m_flags&e.b2BodyFlag.e_awakeFlag&&(this.m_linearVelocity.x+=this.m_invMass*t.x,this.m_linearVelocity.y+=this.m_invMass*t.y,this.m_angularVelocity+=this.m_invI*((o.x-this.m_sweep.c.x)*t.y-(o.y-this.m_sweep.c.y)*t.x)))},e.b2Body.prototype.ApplyAngularImpulse=function(t,o){o=o||!0,this.m_type==e.b2BodyType.b2_dynamicBody&&(o&&0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&this.SetAwake(!0),this.m_flags&e.b2BodyFlag.e_awakeFlag&&(this.m_angularVelocity+=this.m_invI*t))},e.b2Body.prototype.GetMass=function(){return this.m_mass},e.b2Body.prototype.GetInertia=function(){return this.m_I+this.m_mass*e.b2DotVV(this.m_sweep.localCenter,this.m_sweep.localCenter)},e.b2Body.prototype.GetMassData=function(t){return t.mass=this.m_mass,t.I=this.m_I+this.m_mass*e.b2DotVV(this.m_sweep.localCenter,this.m_sweep.localCenter),t.center.Copy(this.m_sweep.localCenter),t},e.b2Body.prototype.SetMassData=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),1!=this.m_world.IsLocked()&&this.m_type==e.b2BodyType.b2_dynamicBody){this.m_invMass=0,this.m_I=0,this.m_invI=0,this.m_mass=t.mass,this.m_mass<=0&&(this.m_mass=1),this.m_invMass=1/this.m_mass,t.I>0&&0==(this.m_flags&e.b2BodyFlag.e_fixedRotationFlag)&&(this.m_I=t.I-this.m_mass*e.b2DotVV(t.center,t.center),e.ENABLE_ASSERTS&&e.b2Assert(this.m_I>0),this.m_invI=1/this.m_I);var o=e.b2Body.prototype.SetMassData.s_oldCenter.Copy(this.m_sweep.c);this.m_sweep.localCenter.Copy(t.center),e.b2MulXV(this.m_xf,this.m_sweep.localCenter,this.m_sweep.c),this.m_sweep.c0.Copy(this.m_sweep.c),e.b2AddVCrossSV(this.m_linearVelocity,this.m_angularVelocity,e.b2SubVV(this.m_sweep.c,o,e.b2Vec2.s_t0),this.m_linearVelocity)}},e.b2Body.prototype.SetMassData.s_oldCenter=new e.b2Vec2,e.b2Body.prototype.ResetMassData=function(){if(this.m_mass=0,this.m_invMass=0,this.m_I=0,this.m_invI=0,this.m_sweep.localCenter.SetZero(),this.m_type==e.b2BodyType.b2_staticBody||this.m_type==e.b2BodyType.b2_kinematicBody)return this.m_sweep.c0.Copy(this.m_xf.p),this.m_sweep.c.Copy(this.m_xf.p),this.m_sweep.a0=this.m_sweep.a,void 0;e.ENABLE_ASSERTS&&e.b2Assert(this.m_type==e.b2BodyType.b2_dynamicBody);for(var t=e.b2Body.prototype.ResetMassData.s_localCenter.SetZero(),o=this.m_fixtureList;o;o=o.m_next)if(0!=o.m_density){var i=o.GetMassData(e.b2Body.prototype.ResetMassData.s_massData);this.m_mass+=i.mass,t.x+=i.center.x*i.mass,t.y+=i.center.y*i.mass,this.m_I+=i.I}this.m_mass>0?(this.m_invMass=1/this.m_mass,t.x*=this.m_invMass,t.y*=this.m_invMass):(this.m_mass=1,this.m_invMass=1),this.m_I>0&&0==(this.m_flags&e.b2BodyFlag.e_fixedRotationFlag)?(this.m_I-=this.m_mass*e.b2DotVV(t,t),e.ENABLE_ASSERTS&&e.b2Assert(this.m_I>0),this.m_invI=1/this.m_I):(this.m_I=0,this.m_invI=0);var n=e.b2Body.prototype.ResetMassData.s_oldCenter.Copy(this.m_sweep.c);this.m_sweep.localCenter.Copy(t),e.b2MulXV(this.m_xf,this.m_sweep.localCenter,this.m_sweep.c),this.m_sweep.c0.Copy(this.m_sweep.c),e.b2AddVCrossSV(this.m_linearVelocity,this.m_angularVelocity,e.b2SubVV(this.m_sweep.c,n,e.b2Vec2.s_t0),this.m_linearVelocity)},e.b2Body.prototype.ResetMassData.s_localCenter=new e.b2Vec2,e.b2Body.prototype.ResetMassData.s_oldCenter=new e.b2Vec2,e.b2Body.prototype.ResetMassData.s_massData=new e.b2MassData,e.b2Body.prototype.GetWorldPoint=function(t,o){return e.b2MulXV(this.m_xf,t,o)},e.b2Body.prototype.GetWorldVector=function(t,o){return e.b2MulRV(this.m_xf.q,t,o)},e.b2Body.prototype.GetLocalPoint=function(t,o){return e.b2MulTXV(this.m_xf,t,o)},e.b2Body.prototype.GetLocalVector=function(t,o){return e.b2MulTRV(this.m_xf.q,t,o)},e.b2Body.prototype.GetLinearVelocityFromWorldPoint=function(t,o){return e.b2AddVCrossSV(this.m_linearVelocity,this.m_angularVelocity,e.b2SubVV(t,this.m_sweep.c,e.b2Vec2.s_t0),o)},e.b2Body.prototype.GetLinearVelocityFromLocalPoint=function(t,e){return this.GetLinearVelocityFromWorldPoint(this.GetWorldPoint(t,e),e)},e.b2Body.prototype.GetLinearDamping=function(){return this.m_linearDamping},e.b2Body.prototype.SetLinearDamping=function(t){this.m_linearDamping=t},e.b2Body.prototype.GetAngularDamping=function(){return this.m_angularDamping},e.b2Body.prototype.SetAngularDamping=function(t){this.m_angularDamping=t},e.b2Body.prototype.GetGravityScale=function(){return this.m_gravityScale},e.b2Body.prototype.SetGravityScale=function(t){this.m_gravityScale=t},e.b2Body.prototype.SetType=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),1!=this.m_world.IsLocked()&&this.m_type!=t){this.m_type=t,this.ResetMassData(),this.m_type==e.b2BodyType.b2_staticBody&&(this.m_linearVelocity.SetZero(),this.m_angularVelocity=0,this.m_sweep.a0=this.m_sweep.a,this.m_sweep.c0.Copy(this.m_sweep.c),this.SynchronizeFixtures()),this.SetAwake(!0),this.m_force.SetZero(),this.m_torque=0;for(var o=this.m_contactList;o;){var i=o;o=o.next,this.m_world.m_contactManager.Destroy(i.contact)}this.m_contactList=null;for(var n=this.m_world.m_contactManager.m_broadPhase,s=this.m_fixtureList;s;s=s.m_next)for(var r=s.m_proxyCount,a=0;r>a;++a)n.TouchProxy(s.m_proxies[a].proxy)}},e.b2Body.prototype.GetType=function(){return this.m_type},e.b2Body.prototype.SetBullet=function(t){t?this.m_flags|=e.b2BodyFlag.e_bulletFlag:this.m_flags&=~e.b2BodyFlag.e_bulletFlag},e.b2Body.prototype.IsBullet=function(){return(this.m_flags&e.b2BodyFlag.e_bulletFlag)==e.b2BodyFlag.e_bulletFlag},e.b2Body.prototype.SetSleepingAllowed=function(t){t?this.m_flags|=e.b2BodyFlag.e_autoSleepFlag:(this.m_flags&=~e.b2BodyFlag.e_autoSleepFlag,this.SetAwake(!0))},e.b2Body.prototype.IsSleepingAllowed=function(){return(this.m_flags&e.b2BodyFlag.e_autoSleepFlag)==e.b2BodyFlag.e_autoSleepFlag},e.b2Body.prototype.SetAwake=function(t){t?0==(this.m_flags&e.b2BodyFlag.e_awakeFlag)&&(this.m_flags|=e.b2BodyFlag.e_awakeFlag,this.m_sleepTime=0):(this.m_flags&=~e.b2BodyFlag.e_awakeFlag,this.m_sleepTime=0,this.m_linearVelocity.SetZero(),this.m_angularVelocity=0,this.m_force.SetZero(),this.m_torque=0)},e.b2Body.prototype.IsAwake=function(){return(this.m_flags&e.b2BodyFlag.e_awakeFlag)==e.b2BodyFlag.e_awakeFlag},e.b2Body.prototype.SetActive=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.m_world.IsLocked()),t!=this.IsActive())if(t){this.m_flags|=e.b2BodyFlag.e_activeFlag;for(var o=this.m_world.m_contactManager.m_broadPhase,i=this.m_fixtureList;i;i=i.m_next)i.CreateProxies(o,this.m_xf)}else{this.m_flags&=~e.b2BodyFlag.e_activeFlag;for(var o=this.m_world.m_contactManager.m_broadPhase,i=this.m_fixtureList;i;i=i.m_next)i.DestroyProxies(o);for(var n=this.m_contactList;n;){var s=n;n=n.next,this.m_world.m_contactManager.Destroy(s.contact)}this.m_contactList=null}},e.b2Body.prototype.IsActive=function(){return(this.m_flags&e.b2BodyFlag.e_activeFlag)==e.b2BodyFlag.e_activeFlag},e.b2Body.prototype.SetFixedRotation=function(t){var o=(this.m_flags&e.b2BodyFlag.e_fixedRotationFlag)==e.b2BodyFlag.e_fixedRotationFlag;o!=t&&(t?this.m_flags|=e.b2BodyFlag.e_fixedRotationFlag:this.m_flags&=~e.b2BodyFlag.e_fixedRotationFlag,this.m_angularVelocity=0,this.ResetMassData())},e.b2Body.prototype.IsFixedRotation=function(){return(this.m_flags&e.b2BodyFlag.e_fixedRotationFlag)==e.b2BodyFlag.e_fixedRotationFlag},e.b2Body.prototype.GetFixtureList=function(){return this.m_fixtureList},e.b2Body.prototype.GetJointList=function(){return this.m_jointList},e.b2Body.prototype.GetContactList=function(){return this.m_contactList},e.b2Body.prototype.GetNext=function(){return this.m_next},e.b2Body.prototype.GetUserData=function(){return this.m_userData},e.b2Body.prototype.SetUserData=function(t){this.m_userData=t},e.b2Body.prototype.GetWorld=function(){return this.m_world},e.b2Body.prototype.SynchronizeFixtures=function(){var t=e.b2Body.prototype.SynchronizeFixtures.s_xf1;t.q.SetAngleRadians(this.m_sweep.a0),e.b2MulRV(t.q,this.m_sweep.localCenter,t.p),e.b2SubVV(this.m_sweep.c0,t.p,t.p);for(var o=this.m_world.m_contactManager.m_broadPhase,i=this.m_fixtureList;i;i=i.m_next)i.Synchronize(o,t,this.m_xf)},e.b2Body.prototype.SynchronizeFixtures.s_xf1=new e.b2Transform,e.b2Body.prototype.SynchronizeTransform=function(){this.m_xf.q.SetAngleRadians(this.m_sweep.a),e.b2MulRV(this.m_xf.q,this.m_sweep.localCenter,this.m_xf.p),e.b2SubVV(this.m_sweep.c,this.m_xf.p,this.m_xf.p)},e.b2Body.prototype.ShouldCollide=function(t){if(this.m_type!=e.b2BodyType.b2_dynamicBody&&t.m_type!=e.b2BodyType.b2_dynamicBody)return!1;for(var o=this.m_jointList;o;o=o.next)if(o.other==t&&0==o.joint.m_collideConnected)return!1;return!0},e.b2Body.prototype.Advance=function(t){this.m_sweep.Advance(t),this.m_sweep.c.Copy(this.m_sweep.c0),this.m_sweep.a=this.m_sweep.a0,this.m_xf.q.SetAngleRadians(this.m_sweep.a),e.b2MulRV(this.m_xf.q,this.m_sweep.localCenter,this.m_xf.p),e.b2SubVV(this.m_sweep.c,this.m_xf.p,this.m_xf.p)},e.b2Body.prototype.Dump=function(){if(e.DEBUG){var t=this.m_islandIndex;e.b2Log("if (true)\n"),e.b2Log("{\n"),e.b2Log("  /*box2d.b2BodyDef*/ var bd = new box2d.b2BodyDef();\n");var o="";switch(this.m_type){case e.b2BodyType.b2_staticBody:o="box2d.b2BodyType.b2_staticBody";break;case e.b2BodyType.b2_kinematicBody:o="box2d.b2BodyType.b2_kinematicBody";break;case e.b2BodyType.b2_dynamicBody:o="box2d.b2BodyType.b2_dynamicBody";break;default:e.ENABLE_ASSERTS&&e.b2Assert(!1)}e.b2Log("  bd.type = %s;\n",o),e.b2Log("  bd.position.Set(%.15f, %.15f);\n",this.m_xf.p.x,this.m_xf.p.y),e.b2Log("  bd.angle = %.15f;\n",this.m_sweep.a),e.b2Log("  bd.linearVelocity.Set(%.15f, %.15f);\n",this.m_linearVelocity.x,this.m_linearVelocity.y),e.b2Log("  bd.angularVelocity = %.15f;\n",this.m_angularVelocity),e.b2Log("  bd.linearDamping = %.15f;\n",this.m_linearDamping),e.b2Log("  bd.angularDamping = %.15f;\n",this.m_angularDamping),e.b2Log("  bd.allowSleep = %s;\n",this.m_flags&e.b2BodyFlag.e_autoSleepFlag?"true":"false"),e.b2Log("  bd.awake = %s;\n",this.m_flags&e.b2BodyFlag.e_awakeFlag?"true":"false"),e.b2Log("  bd.fixedRotation = %s;\n",this.m_flags&e.b2BodyFlag.e_fixedRotationFlag?"true":"false"),e.b2Log("  bd.bullet = %s;\n",this.m_flags&e.b2BodyFlag.e_bulletFlag?"true":"false"),e.b2Log("  bd.active = %s;\n",this.m_flags&e.b2BodyFlag.e_activeFlag?"true":"false"),e.b2Log("  bd.gravityScale = %.15f;\n",this.m_gravityScale),e.b2Log("\n"),e.b2Log("  bodies[%d] = this.m_world.CreateBody(bd);\n",this.m_islandIndex),e.b2Log("\n");for(var i=this.m_fixtureList;i;i=i.m_next)e.b2Log("  if (true)\n"),e.b2Log("  {\n"),i.Dump(t),e.b2Log("  }\n");e.b2Log("}\n")}},e.b2Body.prototype.GetControllerList=function(){return this.m_controllerList},e.b2Body.prototype.GetControllerCount=function(){return this.m_controllerCount},e}(e,p,i,o),_=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2GrowableStack&&(e.b2GrowableStack={}),e.b2GrowableStack=function(t){this.m_stack=new Array(t)},e.b2GrowableStack.prototype.m_stack=null,e.b2GrowableStack.prototype.m_count=0,e.b2GrowableStack.prototype.Reset=function(){return this.m_count=0,this},e.b2GrowableStack.prototype.Push=function(t){this.m_stack[this.m_count]=t,++this.m_count},e.b2GrowableStack.prototype.Pop=function(){e.ENABLE_ASSERTS&&e.b2Assert(this.m_count>0),--this.m_count;var t=this.m_stack[this.m_count];return this.m_stack[this.m_count]=null,t},e.b2GrowableStack.prototype.GetCount=function(){return this.m_count},e}(e,o),b=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2DynamicTree&&(e.b2DynamicTree={}),e.b2TreeNode=function(t){this.m_id=t||0,this.aabb=new e.b2AABB},e.b2TreeNode.prototype.m_id=0,e.b2TreeNode.prototype.aabb=null,e.b2TreeNode.prototype.userData=null,e.b2TreeNode.prototype.parent=null,e.b2TreeNode.prototype.child1=null,e.b2TreeNode.prototype.child2=null,e.b2TreeNode.prototype.height=0,e.b2TreeNode.prototype.IsLeaf=function(){return null==this.child1},e.b2DynamicTree=function(){},e.b2DynamicTree.prototype.m_root=null,e.b2DynamicTree.prototype.m_freeList=null,e.b2DynamicTree.prototype.m_path=0,e.b2DynamicTree.prototype.m_insertionCount=0,e.b2DynamicTree.s_stack=new e.b2GrowableStack(256),e.b2DynamicTree.s_r=new e.b2Vec2,e.b2DynamicTree.s_v=new e.b2Vec2,e.b2DynamicTree.s_abs_v=new e.b2Vec2,e.b2DynamicTree.s_segmentAABB=new e.b2AABB,e.b2DynamicTree.s_subInput=new e.b2RayCastInput,e.b2DynamicTree.s_combinedAABB=new e.b2AABB,e.b2DynamicTree.s_aabb=new e.b2AABB,e.b2DynamicTree.prototype.GetUserData=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(null!=t),t.userData},e.b2DynamicTree.prototype.GetFatAABB=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(null!=t),t.aabb},e.b2DynamicTree.prototype.Query=function(t,o){if(null!=this.m_root){var i=e.b2DynamicTree.s_stack.Reset();for(i.Push(this.m_root);i.GetCount()>0;){var n=i.Pop();if(null!=n&&n.aabb.TestOverlap(o))if(n.IsLeaf()){var s=t(n);if(0==s)return}else i.Push(n.child1),i.Push(n.child2)}}},e.b2DynamicTree.prototype.RayCast=function(t,o){if(null!=this.m_root){var i=o.p1,n=o.p2,s=e.b2SubVV(n,i,e.b2DynamicTree.s_r);e.ENABLE_ASSERTS&&e.b2Assert(s.GetLengthSquared()>0),s.Normalize();var r=e.b2CrossOneV(s,e.b2DynamicTree.s_v),a=e.b2AbsV(r,e.b2DynamicTree.s_abs_v),l=o.maxFraction,p=e.b2DynamicTree.s_segmentAABB,m=i.x+l*(n.x-i.x),_=i.y+l*(n.y-i.y);p.lowerBound.x=e.b2Min(i.x,m),p.lowerBound.y=e.b2Min(i.y,_),p.upperBound.x=e.b2Max(i.x,m),p.upperBound.y=e.b2Max(i.y,_);var b=e.b2DynamicTree.s_stack.Reset();for(b.Push(this.m_root);b.GetCount()>0;){var h=b.Pop();if(null!=h&&0!=e.b2TestOverlapAABB(h.aabb,p)){var c=h.aabb.GetCenter(),u=h.aabb.GetExtents(),y=e.b2Abs(e.b2DotVV(r,e.b2SubVV(i,c,e.b2Vec2.s_t0)))-e.b2DotVV(a,u);if(!(y>0))if(h.IsLeaf()){var d=e.b2DynamicTree.s_subInput;d.p1.Copy(o.p1),d.p2.Copy(o.p2),d.maxFraction=l;var f=t(d,h);if(0==f)return;f>0&&(l=f,m=i.x+l*(n.x-i.x),_=i.y+l*(n.y-i.y),p.lowerBound.x=e.b2Min(i.x,m),p.lowerBound.y=e.b2Min(i.y,_),p.upperBound.x=e.b2Max(i.x,m),p.upperBound.y=e.b2Max(i.y,_))}else b.Push(h.child1),b.Push(h.child2)}}}},e.b2DynamicTree.prototype.AllocateNode=function(){if(this.m_freeList){var t=this.m_freeList;return this.m_freeList=t.parent,t.parent=null,t.child1=null,t.child2=null,t.height=0,t.userData=null,t}return new e.b2TreeNode(e.b2DynamicTree.prototype.s_node_id++)},e.b2DynamicTree.prototype.s_node_id=0,e.b2DynamicTree.prototype.FreeNode=function(t){t.parent=this.m_freeList,t.height=-1,this.m_freeList=t},e.b2DynamicTree.prototype.CreateProxy=function(t,o){var i=this.AllocateNode(),n=e.b2_aabbExtension,s=e.b2_aabbExtension;return i.aabb.lowerBound.x=t.lowerBound.x-n,i.aabb.lowerBound.y=t.lowerBound.y-s,i.aabb.upperBound.x=t.upperBound.x+n,i.aabb.upperBound.y=t.upperBound.y+s,i.userData=o,i.height=0,this.InsertLeaf(i),i},e.b2DynamicTree.prototype.DestroyProxy=function(t){e.ENABLE_ASSERTS&&e.b2Assert(t.IsLeaf()),this.RemoveLeaf(t),this.FreeNode(t)},e.b2DynamicTree.prototype.MoveProxy=function(t,o,i){if(e.ENABLE_ASSERTS&&e.b2Assert(t.IsLeaf()),t.aabb.Contains(o))return!1;this.RemoveLeaf(t);var n=e.b2_aabbExtension+e.b2_aabbMultiplier*(i.x>0?i.x:-i.x),s=e.b2_aabbExtension+e.b2_aabbMultiplier*(i.y>0?i.y:-i.y);return t.aabb.lowerBound.x=o.lowerBound.x-n,t.aabb.lowerBound.y=o.lowerBound.y-s,t.aabb.upperBound.x=o.upperBound.x+n,t.aabb.upperBound.y=o.upperBound.y+s,this.InsertLeaf(t),!0},e.b2DynamicTree.prototype.InsertLeaf=function(t){if(++this.m_insertionCount,null==this.m_root)return this.m_root=t,this.m_root.parent=null,void 0;for(var o,i,n=t.aabb,s=(n.GetCenter(),this.m_root);0==s.IsLeaf();){o=s.child1,i=s.child2;var r=s.aabb.GetPerimeter(),a=e.b2DynamicTree.s_combinedAABB;a.Combine2(s.aabb,n);var l,p,m,_=a.GetPerimeter(),b=2*_,h=2*(_-r),c=e.b2DynamicTree.s_aabb;o.IsLeaf()?(c.Combine2(n,o.aabb),l=c.GetPerimeter()+h):(c.Combine2(n,o.aabb),p=o.aabb.GetPerimeter(),m=c.GetPerimeter(),l=m-p+h);var u;if(i.IsLeaf()?(c.Combine2(n,i.aabb),u=c.GetPerimeter()+h):(c.Combine2(n,i.aabb),p=i.aabb.GetPerimeter(),m=c.GetPerimeter(),u=m-p+h),l>b&&u>b)break;s=u>l?o:i}var y=s,d=y.parent,f=this.AllocateNode();for(f.parent=d,f.userData=null,f.aabb.Combine2(n,y.aabb),f.height=y.height+1,d?(d.child1==y?d.child1=f:d.child2=f,f.child1=y,f.child2=t,y.parent=f,t.parent=f):(f.child1=y,f.child2=t,y.parent=f,t.parent=f,this.m_root=f),s=t.parent;null!=s;)s=this.Balance(s),o=s.child1,i=s.child2,e.ENABLE_ASSERTS&&e.b2Assert(null!=o),e.ENABLE_ASSERTS&&e.b2Assert(null!=i),s.height=1+e.b2Max(o.height,i.height),s.aabb.Combine2(o.aabb,i.aabb),s=s.parent},e.b2DynamicTree.prototype.RemoveLeaf=function(t){if(t==this.m_root)return this.m_root=null,void 0;var o,i=t.parent,n=i.parent;if(o=i.child1==t?i.child2:i.child1,n){n.child1==i?n.child1=o:n.child2=o,o.parent=n,this.FreeNode(i);for(var s=n;s;){s=this.Balance(s);var r=s.child1,a=s.child2;s.aabb.Combine2(r.aabb,a.aabb),s.height=1+e.b2Max(r.height,a.height),s=s.parent}}else this.m_root=o,o.parent=null,this.FreeNode(i)},e.b2DynamicTree.prototype.Balance=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(null!=t),t.IsLeaf()||t.height<2)return t;var o=t.child1,i=t.child2,n=i.height-o.height;if(n>1){var s=i.child1,r=i.child2;return i.child1=t,i.parent=t.parent,t.parent=i,null!=i.parent?i.parent.child1==t?i.parent.child1=i:(e.ENABLE_ASSERTS&&e.b2Assert(i.parent.child2==t),i.parent.child2=i):this.m_root=i,s.height>r.height?(i.child2=s,t.child2=r,r.parent=t,t.aabb.Combine2(o.aabb,r.aabb),i.aabb.Combine2(t.aabb,s.aabb),t.height=1+e.b2Max(o.height,r.height),i.height=1+e.b2Max(t.height,s.height)):(i.child2=r,t.child2=s,s.parent=t,t.aabb.Combine2(o.aabb,s.aabb),i.aabb.Combine2(t.aabb,r.aabb),t.height=1+e.b2Max(o.height,s.height),i.height=1+e.b2Max(t.height,r.height)),i}if(-1>n){var a=o.child1,l=o.child2;return o.child1=t,o.parent=t.parent,t.parent=o,null!=o.parent?o.parent.child1==t?o.parent.child1=o:(e.ENABLE_ASSERTS&&e.b2Assert(o.parent.child2==t),o.parent.child2=o):this.m_root=o,a.height>l.height?(o.child2=a,t.child1=l,l.parent=t,t.aabb.Combine2(i.aabb,l.aabb),o.aabb.Combine2(t.aabb,a.aabb),t.height=1+e.b2Max(i.height,l.height),o.height=1+e.b2Max(t.height,a.height)):(o.child2=l,t.child1=a,a.parent=t,t.aabb.Combine2(i.aabb,a.aabb),o.aabb.Combine2(t.aabb,l.aabb),t.height=1+e.b2Max(i.height,a.height),o.height=1+e.b2Max(t.height,l.height)),o}return t},e.b2DynamicTree.prototype.GetHeight=function(){return null==this.m_root?0:this.m_root.height},e.b2DynamicTree.prototype.GetAreaRatio=function(){if(null==this.m_root)return 0;var t=this.m_root,e=t.aabb.GetPerimeter(),o=function(t){if(null==t)return 0;if(t.IsLeaf())return 0;var e=t.aabb.GetPerimeter();return e+=o(t.child1),e+=o(t.child2)},i=o(this.m_root);return i/e},e.b2DynamicTree.prototype.ComputeHeightNode=function(t){if(t.IsLeaf())return 0;var o=this.ComputeHeightNode(t.child1),i=this.ComputeHeightNode(t.child2);return 1+e.b2Max(o,i)},e.b2DynamicTree.prototype.ComputeHeight=function(){var t=this.ComputeHeightNode(this.m_root);return t},e.b2DynamicTree.prototype.ValidateStructure=function(t){if(null!=t){t==this.m_root&&e.ENABLE_ASSERTS&&e.b2Assert(null==t.parent);var o=t,i=o.child1,n=o.child2;if(o.IsLeaf())return e.ENABLE_ASSERTS&&e.b2Assert(null==i),e.ENABLE_ASSERTS&&e.b2Assert(null==n),e.ENABLE_ASSERTS&&e.b2Assert(0==o.height),void 0;e.ENABLE_ASSERTS&&e.b2Assert(i.parent==t),e.ENABLE_ASSERTS&&e.b2Assert(n.parent==t),this.ValidateStructure(i),this.ValidateStructure(n)}},e.b2DynamicTree.prototype.ValidateMetrics=function(t){if(null!=t){var o=t,i=o.child1,n=o.child2;if(o.IsLeaf())return e.ENABLE_ASSERTS&&e.b2Assert(null==i),e.ENABLE_ASSERTS&&e.b2Assert(null==n),e.ENABLE_ASSERTS&&e.b2Assert(0==o.height),void 0;var s,r=i.height,a=n.height;s=1+e.b2Max(r,a),e.ENABLE_ASSERTS&&e.b2Assert(o.height==s);var l=e.b2DynamicTree.s_aabb;l.Combine2(i.aabb,n.aabb),e.ENABLE_ASSERTS&&e.b2Assert(l.lowerBound==o.aabb.lowerBound),e.ENABLE_ASSERTS&&e.b2Assert(l.upperBound==o.aabb.upperBound),this.ValidateMetrics(i),this.ValidateMetrics(n)}},e.b2DynamicTree.prototype.Validate=function(){this.ValidateStructure(this.m_root),this.ValidateMetrics(this.m_root);for(var t=0,o=this.m_freeList;null!=o;)o=o.parent,++t;e.ENABLE_ASSERTS&&e.b2Assert(this.GetHeight()==this.ComputeHeight())},e.b2DynamicTree.prototype.GetMaxBalance=function(){var t=function(t,o){if(null==t)return o;if(t.height<=1)return o;e.ENABLE_ASSERTS&&e.b2Assert(0==t.IsLeaf());var i=t.child1,n=t.child2,s=e.b2Abs(n.height-i.height);return e.b2Max(o,s)},o=t(this.m_root,0);return o},e.b2DynamicTree.prototype.RebuildBottomUp=function(){this.Validate()},e.b2DynamicTree.prototype.ShiftOrigin=function(t){var o=function(t,i){if(null!=t&&!(t.height<=1)){e.ENABLE_ASSERTS&&e.b2Assert(0==t.IsLeaf());var n=t.child1,s=t.child2;o(n,i),o(s,i),t.aabb.lowerBound.SelfSub(i),t.aabb.upperBound.SelfSub(i)}};o(this.m_root,t)},e}(e,a,_,o),h=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2BroadPhase&&(e.b2BroadPhase={}),e.b2Pair=function(){},e.b2Pair.prototype.proxyA=null,e.b2Pair.prototype.proxyB=null,e.b2BroadPhase=function(){this.m_tree=new e.b2DynamicTree,this.m_moveBuffer=new Array,this.m_pairBuffer=new Array},e.b2BroadPhase.prototype.m_tree=null,e.b2BroadPhase.prototype.m_proxyCount=0,e.b2BroadPhase.prototype.m_moveCount=0,e.b2BroadPhase.prototype.m_moveBuffer=null,e.b2BroadPhase.prototype.m_pairCount=0,e.b2BroadPhase.prototype.m_pairBuffer=null,e.b2BroadPhase.prototype.CreateProxy=function(t,e){var o=this.m_tree.CreateProxy(t,e);
	return++this.m_proxyCount,this.BufferMove(o),o},e.b2BroadPhase.prototype.DestroyProxy=function(t){this.UnBufferMove(t),--this.m_proxyCount,this.m_tree.DestroyProxy(t)},e.b2BroadPhase.prototype.MoveProxy=function(t,e,o){var i=this.m_tree.MoveProxy(t,e,o);i&&this.BufferMove(t)},e.b2BroadPhase.prototype.TouchProxy=function(t){this.BufferMove(t)},e.b2BroadPhase.prototype.GetFatAABB=function(t){return this.m_tree.GetFatAABB(t)},e.b2BroadPhase.prototype.GetUserData=function(t){return this.m_tree.GetUserData(t)},e.b2BroadPhase.prototype.TestOverlap=function(t,o){var i=this.m_tree.GetFatAABB(t),n=this.m_tree.GetFatAABB(o);return e.b2TestOverlapAABB(i,n)},e.b2BroadPhase.prototype.GetProxyCount=function(){return this.m_proxyCount},e.b2BroadPhase.prototype.GetTreeHeight=function(){return this.m_tree.GetHeight()},e.b2BroadPhase.prototype.GetTreeBalance=function(){return this.m_tree.GetMaxBalance()},e.b2BroadPhase.prototype.GetTreeQuality=function(){return this.m_tree.GetAreaRatio()},e.b2BroadPhase.prototype.ShiftOrigin=function(t){this.m_tree.ShiftOrigin(t)},e.b2BroadPhase.prototype.UpdatePairs=function(t){this.m_pairCount=0;for(var o=0;o<this.m_moveCount;++o){var i=this.m_moveBuffer[o];if(null!=i){var n=this,s=function(t){if(t.m_id==i.m_id)return!0;n.m_pairCount==n.m_pairBuffer.length&&(n.m_pairBuffer[n.m_pairCount]=new e.b2Pair);var o=n.m_pairBuffer[n.m_pairCount];return t.m_id<i.m_id?(o.proxyA=t,o.proxyB=i):(o.proxyA=i,o.proxyB=t),++n.m_pairCount,!0},r=this.m_tree.GetFatAABB(i);this.m_tree.Query(s,r)}}this.m_moveCount=0,this.m_pairBuffer.length=this.m_pairCount,this.m_pairBuffer.sort(e.b2PairLessThan);for(var o=0;o<this.m_pairCount;){var a=this.m_pairBuffer[o],l=this.m_tree.GetUserData(a.proxyA),p=this.m_tree.GetUserData(a.proxyB);for(t.AddPair(l,p),++o;o<this.m_pairCount;){var m=this.m_pairBuffer[o];if(m.proxyA.m_id!=a.proxyA.m_id||m.proxyB.m_id!=a.proxyB.m_id)break;++o}}},e.b2BroadPhase.prototype.Query=function(t,e){this.m_tree.Query(t,e)},e.b2BroadPhase.prototype.RayCast=function(t,e){this.m_tree.RayCast(t,e)},e.b2BroadPhase.prototype.BufferMove=function(t){this.m_moveBuffer[this.m_moveCount]=t,++this.m_moveCount},e.b2BroadPhase.prototype.UnBufferMove=function(t){var e=this.m_moveBuffer.indexOf(t);this.m_moveBuffer[e]=null},e.b2PairLessThan=function(t,e){return t.proxyA.m_id==e.proxyA.m_id?t.proxyB.m_id-e.proxyB.m_id:t.proxyA.m_id-e.proxyA.m_id},e}(e,b,o),c=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Controller&&(e.b2Controller={}),e.b2ControllerEdge=function(){},e.b2ControllerEdge.prototype.controller=null,e.b2ControllerEdge.prototype.body=null,e.b2ControllerEdge.prototype.prevBody=null,e.b2ControllerEdge.prototype.nextBody=null,e.b2ControllerEdge.prototype.prevController=null,e.b2ControllerEdge.prototype.nextController=null,e.b2Controller=function(){},e.b2Controller.prototype.m_world=null,e.b2Controller.prototype.m_bodyList=null,e.b2Controller.prototype.m_bodyCount=0,e.b2Controller.prototype.m_prev=null,e.b2Controller.prototype.m_next=null,e.b2Controller.prototype.Step=function(){},e.b2Controller.prototype.Draw=function(){},e.b2Controller.prototype.GetNext=function(){return this.m_next},e.b2Controller.prototype.GetPrev=function(){return this.m_prev},e.b2Controller.prototype.GetWorld=function(){return this.m_world},e.b2Controller.prototype.GetBodyList=function(){return this.m_bodyList},e.b2Controller.prototype.AddBody=function(t){var o=new e.b2ControllerEdge;o.body=t,o.controller=this,o.nextBody=this.m_bodyList,o.prevBody=null,this.m_bodyList&&(this.m_bodyList.prevBody=o),this.m_bodyList=o,++this.m_bodyCount,o.nextController=t.m_controllerList,o.prevController=null,t.m_controllerList&&(t.m_controllerList.prevController=o),t.m_controllerList=o,++t.m_controllerCount},e.b2Controller.prototype.RemoveBody=function(t){e.ENABLE_ASSERTS&&e.b2Assert(this.m_bodyCount>0);for(var o=this.m_bodyList;o&&o.body!=t;)o=o.nextBody;e.ENABLE_ASSERTS&&e.b2Assert(null!=o),o.prevBody&&(o.prevBody.nextBody=o.nextBody),o.nextBody&&(o.nextBody.prevBody=o.prevBody),this.m_bodyList==o&&(this.m_bodyList=o.nextBody),--this.m_bodyCount,o.nextController&&(o.nextController.prevController=o.prevController),o.prevController&&(o.prevController.nextController=o.nextController),t.m_controllerList==o&&(t.m_controllerList=o.nextController),--t.m_controllerCount},e.b2Controller.prototype.Clear=function(){for(;this.m_bodyList;)this.RemoveBody(this.m_bodyList.body);this.m_bodyCount=0},e}(e,o),u=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2WorldCallbacks&&(e.b2WorldCallbacks={}),e.b2DestructionListener=function(){},e.b2DestructionListener.prototype.SayGoodbyeJoint=function(){},e.b2DestructionListener.prototype.SayGoodbyeFixture=function(){},e.b2ContactFilter=function(){},e.b2ContactFilter.prototype.ShouldCollide=function(t,e){var o=t.GetFilterData(),i=e.GetFilterData();if(o.groupIndex==i.groupIndex&&0!=o.groupIndex)return o.groupIndex>0;var n=0!=(o.maskBits&i.categoryBits)&&0!=(o.categoryBits&i.maskBits);return n},e.b2ContactFilter.b2_defaultFilter=new e.b2ContactFilter,e.b2ContactImpulse=function(){this.normalImpulses=e.b2MakeNumberArray(e.b2_maxManifoldPoints),this.tangentImpulses=e.b2MakeNumberArray(e.b2_maxManifoldPoints)},e.b2ContactImpulse.prototype.normalImpulses=null,e.b2ContactImpulse.prototype.tangentImpulses=null,e.b2ContactImpulse.prototype.count=0,e.b2ContactListener=function(){},e.b2ContactListener.prototype.BeginContact=function(){},e.b2ContactListener.prototype.EndContact=function(){},e.b2ContactListener.prototype.PreSolve=function(){},e.b2ContactListener.prototype.PostSolve=function(){},e.b2ContactListener.b2_defaultListener=new e.b2ContactListener,e.b2QueryCallback=function(){},e.b2QueryCallback.prototype.ReportFixture=function(){return!0},e.b2RayCastCallback=function(){},e.b2RayCastCallback.prototype.ReportFixture=function(t,e,o,i){return i},e}(e,o),y=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2BuoyancyController&&(e.b2BuoyancyController={}),e.b2BuoyancyController=function(){t.base(this),this.normal=new e.b2Vec2(0,1),this.velocity=new e.b2Vec2(0,0),this.gravity=new e.b2Vec2(0,0)},t.inherits(e.b2BuoyancyController,e.b2Controller),e.b2BuoyancyController.prototype.normal=null,e.b2BuoyancyController.prototype.offset=0,e.b2BuoyancyController.prototype.density=0,e.b2BuoyancyController.prototype.velocity=null,e.b2BuoyancyController.prototype.linearDrag=0,e.b2BuoyancyController.prototype.angularDrag=0,e.b2BuoyancyController.prototype.useDensity=!1,e.b2BuoyancyController.prototype.useWorldGravity=!0,e.b2BuoyancyController.prototype.gravity=null,e.b2BuoyancyController.prototype.Step=function(){if(this.m_bodyList){this.useWorldGravity&&this.gravity.Copy(this.GetWorld().GetGravity());for(var t=this.m_bodyList;t;t=t.nextBody){var o=t.body;if(0!=o.IsAwake()){for(var i=new e.b2Vec2,n=new e.b2Vec2,s=0,r=0,a=o.GetFixtureList();a;a=a.m_next){var l=new e.b2Vec2,p=a.GetShape().ComputeSubmergedArea(this.normal,this.offset,o.GetTransform(),l);s+=p,i.x+=p*l.x,i.y+=p*l.y;var m=0;m=this.useDensity?a.GetDensity():1,r+=p*m,n.x+=p*l.x*m,n.y+=p*l.y*m}if(i.x/=s,i.y/=s,n.x/=r,n.y/=r,!(s<e.b2_epsilon)){var _=e.b2NegV(this.gravity,new e.b2Vec2);_.SelfMul(this.density*s),o.ApplyForce(_,n);var b=o.GetLinearVelocityFromWorldPoint(i,new e.b2Vec2);b.SelfSub(this.velocity),b.SelfMul(-this.linearDrag*s),o.ApplyForce(b,i),o.ApplyTorque(-o.GetInertia()/o.GetMass()*s*o.GetAngularVelocity()*this.angularDrag)}}}}},e.b2BuoyancyController.prototype.Draw=function(t){var o=100,i=new e.b2Vec2,n=new e.b2Vec2;i.x=this.normal.x*this.offset+this.normal.y*o,i.y=this.normal.y*this.offset-this.normal.x*o,n.x=this.normal.x*this.offset-this.normal.y*o,n.y=this.normal.y*this.offset+this.normal.x*o;var s=new e.b2Color(0,0,.8);t.DrawSegment(i,n,s)},e}(e,c,i,o,u),d=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2EdgeShape&&(e.b2EdgeShape={}),e.b2EdgeShape=function(){t.base(this,e.b2ShapeType.e_edgeShape,e.b2_polygonRadius),this.m_vertex1=new e.b2Vec2,this.m_vertex2=new e.b2Vec2,this.m_vertex0=new e.b2Vec2,this.m_vertex3=new e.b2Vec2},t.inherits(e.b2EdgeShape,e.b2Shape),e.b2EdgeShape.prototype.m_vertex1=null,e.b2EdgeShape.prototype.m_vertex2=null,e.b2EdgeShape.prototype.m_vertex0=null,e.b2EdgeShape.prototype.m_vertex3=null,e.b2EdgeShape.prototype.m_hasVertex0=!1,e.b2EdgeShape.prototype.m_hasVertex3=!1,e.b2EdgeShape.prototype.Set=function(t,e){return this.m_vertex1.Copy(t),this.m_vertex2.Copy(e),this.m_hasVertex0=!1,this.m_hasVertex3=!1,this},e.b2EdgeShape.prototype.SetAsEdge=e.b2EdgeShape.prototype.Set,e.b2EdgeShape.prototype.Clone=function(){return(new e.b2EdgeShape).Copy(this)},e.b2EdgeShape.prototype.Copy=function(o){return t.base(this,"Copy",o),e.ENABLE_ASSERTS&&e.b2Assert(o instanceof e.b2EdgeShape),this.m_vertex1.Copy(o.m_vertex1),this.m_vertex2.Copy(o.m_vertex2),this.m_vertex0.Copy(o.m_vertex0),this.m_vertex3.Copy(o.m_vertex3),this.m_hasVertex0=o.m_hasVertex0,this.m_hasVertex3=o.m_hasVertex3,this},e.b2EdgeShape.prototype.GetChildCount=function(){return 1},e.b2EdgeShape.prototype.TestPoint=function(){return!1},e.b2EdgeShape.prototype.RayCast=function(t,o,i){var n=e.b2MulTXV(i,o.p1,e.b2EdgeShape.prototype.RayCast.s_p1),s=e.b2MulTXV(i,o.p2,e.b2EdgeShape.prototype.RayCast.s_p2),r=e.b2SubVV(s,n,e.b2EdgeShape.prototype.RayCast.s_d),a=this.m_vertex1,l=this.m_vertex2,p=e.b2SubVV(l,a,e.b2EdgeShape.prototype.RayCast.s_e),m=t.normal.Set(p.y,-p.x).SelfNormalize(),_=e.b2DotVV(m,e.b2SubVV(a,n,e.b2Vec2.s_t0)),b=e.b2DotVV(m,r);if(0==b)return!1;var h=_/b;if(0>h||o.maxFraction<h)return!1;var c=e.b2AddVMulSV(n,h,r,e.b2EdgeShape.prototype.RayCast.s_q),u=e.b2SubVV(l,a,e.b2EdgeShape.prototype.RayCast.s_r),y=e.b2DotVV(u,u);if(0==y)return!1;var d=e.b2DotVV(e.b2SubVV(c,a,e.b2Vec2.s_t0),u)/y;return 0>d||d>1?!1:(t.fraction=h,e.b2MulRV(i.q,t.normal,t.normal),_>0&&t.normal.SelfNeg(),!0)},e.b2EdgeShape.prototype.RayCast.s_p1=new e.b2Vec2,e.b2EdgeShape.prototype.RayCast.s_p2=new e.b2Vec2,e.b2EdgeShape.prototype.RayCast.s_d=new e.b2Vec2,e.b2EdgeShape.prototype.RayCast.s_e=new e.b2Vec2,e.b2EdgeShape.prototype.RayCast.s_q=new e.b2Vec2,e.b2EdgeShape.prototype.RayCast.s_r=new e.b2Vec2,e.b2EdgeShape.prototype.ComputeAABB=function(t,o){var i=e.b2MulXV(o,this.m_vertex1,e.b2EdgeShape.prototype.ComputeAABB.s_v1),n=e.b2MulXV(o,this.m_vertex2,e.b2EdgeShape.prototype.ComputeAABB.s_v2);e.b2MinV(i,n,t.lowerBound),e.b2MaxV(i,n,t.upperBound);var s=this.m_radius;t.lowerBound.SelfSubXY(s,s),t.upperBound.SelfAddXY(s,s)},e.b2EdgeShape.prototype.ComputeAABB.s_v1=new e.b2Vec2,e.b2EdgeShape.prototype.ComputeAABB.s_v2=new e.b2Vec2,e.b2EdgeShape.prototype.ComputeMass=function(t){t.mass=0,e.b2MidVV(this.m_vertex1,this.m_vertex2,t.center),t.I=0},e.b2EdgeShape.prototype.SetupDistanceProxy=function(t){t.m_vertices=new Array(2),t.m_vertices[0]=this.m_vertex1,t.m_vertices[1]=this.m_vertex2,t.m_count=2,t.m_radius=this.m_radius},e.b2EdgeShape.prototype.ComputeSubmergedArea=function(t,e,o,i){return i.SetZero(),0},e.b2EdgeShape.prototype.Dump=function(){e.b2Log("    /*box2d.b2EdgeShape*/ var shape = new box2d.b2EdgeShape();\n"),e.b2Log("    shape.m_radius = %.15f;\n",this.m_radius),e.b2Log("    shape.m_vertex0.Set(%.15f, %.15f);\n",this.m_vertex0.x,this.m_vertex0.y),e.b2Log("    shape.m_vertex1.Set(%.15f, %.15f);\n",this.m_vertex1.x,this.m_vertex1.y),e.b2Log("    shape.m_vertex2.Set(%.15f, %.15f);\n",this.m_vertex2.x,this.m_vertex2.y),e.b2Log("    shape.m_vertex3.Set(%.15f, %.15f);\n",this.m_vertex3.x,this.m_vertex3.y),e.b2Log("    shape.m_hasVertex0 = %s;\n",this.m_hasVertex0),e.b2Log("    shape.m_hasVertex3 = %s;\n",this.m_hasVertex3)},e}(e,l),f=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ChainShape&&(e.b2ChainShape={}),e.b2ChainShape=function(){t.base(this,e.b2ShapeType.e_chainShape,e.b2_polygonRadius),this.m_prevVertex=new e.b2Vec2,this.m_nextVertex=new e.b2Vec2},t.inherits(e.b2ChainShape,e.b2Shape),e.b2ChainShape.prototype.m_vertices=null,e.b2ChainShape.prototype.m_count=0,e.b2ChainShape.prototype.m_prevVertex=null,e.b2ChainShape.prototype.m_nextVertex=null,e.b2ChainShape.prototype.m_hasPrevVertex=!1,e.b2ChainShape.prototype.m_hasNextVertex=!1,e.b2ChainShape.prototype.CreateLoop=function(t,o){if(o=o||t.length,e.ENABLE_ASSERTS&&e.b2Assert(null==this.m_vertices&&0==this.m_count),e.ENABLE_ASSERTS&&e.b2Assert(o>=3),e.ENABLE_ASSERTS)for(var i=1;o>i;++i){var n=t[i-1],s=t[i];e.b2Assert(e.b2DistanceSquaredVV(n,s)>e.b2_linearSlop*e.b2_linearSlop)}this.m_count=o+1,this.m_vertices=e.b2Vec2.MakeArray(this.m_count);for(var i=0;o>i;++i)this.m_vertices[i].Copy(t[i]);return this.m_vertices[o].Copy(this.m_vertices[0]),this.m_prevVertex.Copy(this.m_vertices[this.m_count-2]),this.m_nextVertex.Copy(this.m_vertices[1]),this.m_hasPrevVertex=!0,this.m_hasNextVertex=!0,this},e.b2ChainShape.prototype.CreateChain=function(t,o){if(o=o||t.length,e.ENABLE_ASSERTS&&e.b2Assert(null==this.m_vertices&&0==this.m_count),e.ENABLE_ASSERTS&&e.b2Assert(o>=2),e.ENABLE_ASSERTS)for(var i=1;o>i;++i){var n=t[i-1],s=t[i];e.b2Assert(e.b2DistanceSquaredVV(n,s)>e.b2_linearSlop*e.b2_linearSlop)}this.m_count=o,this.m_vertices=e.b2Vec2.MakeArray(o);for(var i=0;o>i;++i)this.m_vertices[i].Copy(t[i]);return this.m_hasPrevVertex=!1,this.m_hasNextVertex=!1,this.m_prevVertex.SetZero(),this.m_nextVertex.SetZero(),this},e.b2ChainShape.prototype.SetPrevVertex=function(t){return this.m_prevVertex.Copy(t),this.m_hasPrevVertex=!0,this},e.b2ChainShape.prototype.SetNextVertex=function(t){return this.m_nextVertex.Copy(t),this.m_hasNextVertex=!0,this},e.b2ChainShape.prototype.Clone=function(){return(new e.b2ChainShape).Copy(this)},e.b2ChainShape.prototype.Copy=function(o){return t.base(this,"Copy",o),e.ENABLE_ASSERTS&&e.b2Assert(o instanceof e.b2ChainShape),this.CreateChain(o.m_vertices,o.m_count),this.m_prevVertex.Copy(o.m_prevVertex),this.m_nextVertex.Copy(o.m_nextVertex),this.m_hasPrevVertex=o.m_hasPrevVertex,this.m_hasNextVertex=o.m_hasNextVertex,this},e.b2ChainShape.prototype.GetChildCount=function(){return this.m_count-1},e.b2ChainShape.prototype.GetChildEdge=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(o>=0&&o<this.m_count-1),t.m_type=e.b2ShapeType.e_edgeShape,t.m_radius=this.m_radius,t.m_vertex1.Copy(this.m_vertices[o]),t.m_vertex2.Copy(this.m_vertices[o+1]),o>0?(t.m_vertex0.Copy(this.m_vertices[o-1]),t.m_hasVertex0=!0):(t.m_vertex0.Copy(this.m_prevVertex),t.m_hasVertex0=this.m_hasPrevVertex),o<this.m_count-2?(t.m_vertex3.Copy(this.m_vertices[o+2]),t.m_hasVertex3=!0):(t.m_vertex3.Copy(this.m_nextVertex),t.m_hasVertex3=this.m_hasNextVertex)},e.b2ChainShape.prototype.TestPoint=function(){return!1},e.b2ChainShape.prototype.RayCast=function(t,o,i,n){e.ENABLE_ASSERTS&&e.b2Assert(n<this.m_count);var s=e.b2ChainShape.s_edgeShape;return s.m_vertex1.Copy(this.m_vertices[n]),s.m_vertex2.Copy(this.m_vertices[(n+1)%this.m_count]),s.RayCast(t,o,i,0)},e.b2ChainShape.s_edgeShape=new e.b2EdgeShape,e.b2ChainShape.prototype.ComputeAABB=function(t,o,i){e.ENABLE_ASSERTS&&e.b2Assert(i<this.m_count);var n=this.m_vertices[i],s=this.m_vertices[(i+1)%this.m_count],r=e.b2MulXV(o,n,e.b2ChainShape.prototype.ComputeAABB.s_v1),a=e.b2MulXV(o,s,e.b2ChainShape.prototype.ComputeAABB.s_v2);e.b2MinV(r,a,t.lowerBound),e.b2MaxV(r,a,t.upperBound)},e.b2ChainShape.prototype.ComputeAABB.s_v1=new e.b2Vec2,e.b2ChainShape.prototype.ComputeAABB.s_v2=new e.b2Vec2,e.b2ChainShape.prototype.ComputeMass=function(t){t.mass=0,t.center.SetZero(),t.I=0},e.b2ChainShape.prototype.SetupDistanceProxy=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(o>=0&&o<this.m_count),t.m_buffer[0].Copy(this.m_vertices[o]),o+1<this.m_count?t.m_buffer[1].Copy(this.m_vertices[o+1]):t.m_buffer[1].Copy(this.m_vertices[0]),t.m_vertices=t.m_buffer,t.m_count=2,t.m_radius=this.m_radius},e.b2ChainShape.prototype.ComputeSubmergedArea=function(t,e,o,i){return i.SetZero(),0},e.b2ChainShape.prototype.Dump=function(){e.b2Log("    /*box2d.b2ChainShape*/ var shape = new box2d.b2ChainShape();\n"),e.b2Log("    /*box2d.b2Vec2[]*/ var vs = box2d.b2Vec2.MakeArray(%d);\n",e.b2_maxPolygonVertices);for(var t=0;t<this.m_count;++t)e.b2Log("    vs[%d].Set(%.15f, %.15f);\n",t,this.m_vertices[t].x,this.m_vertices[t].y);e.b2Log("    shape.CreateChain(vs, %d);\n",this.m_count),e.b2Log("    shape.m_prevVertex.Set(%.15f, %.15f);\n",this.m_prevVertex.x,this.m_prevVertex.y),e.b2Log("    shape.m_nextVertex.Set(%.15f, %.15f);\n",this.m_nextVertex.x,this.m_nextVertex.y),e.b2Log("    shape.m_hasPrevVertex = %s;\n",this.m_hasPrevVertex?"true":"false"),e.b2Log("    shape.m_hasNextVertex = %s;\n",this.m_hasNextVertex?"true":"false")},e}(e,d,l),A=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2CircleShape&&(e.b2CircleShape={}),e.b2CircleShape=function(o){t.base(this,e.b2ShapeType.e_circleShape,o||0),this.m_p=new e.b2Vec2},t.inherits(e.b2CircleShape,e.b2Shape),e.b2CircleShape.prototype.m_p=null,e.b2CircleShape.prototype.Clone=function(){return(new e.b2CircleShape).Copy(this)},e.b2CircleShape.prototype.Copy=function(o){return t.base(this,"Copy",o),e.ENABLE_ASSERTS&&e.b2Assert(o instanceof e.b2CircleShape),this.m_p.Copy(o.m_p),this},e.b2CircleShape.prototype.GetChildCount=function(){return 1},e.b2CircleShape.prototype.TestPoint=function(t,o){var i=e.b2MulXV(t,this.m_p,e.b2CircleShape.prototype.TestPoint.s_center),n=e.b2SubVV(o,i,e.b2CircleShape.prototype.TestPoint.s_d);return e.b2DotVV(n,n)<=e.b2Sq(this.m_radius)},e.b2CircleShape.prototype.TestPoint.s_center=new e.b2Vec2,e.b2CircleShape.prototype.TestPoint.s_d=new e.b2Vec2,e.b2CircleShape.prototype.RayCast=function(t,o,i){var n=e.b2MulXV(i,this.m_p,e.b2CircleShape.prototype.RayCast.s_position),s=e.b2SubVV(o.p1,n,e.b2CircleShape.prototype.RayCast.s_s),r=e.b2DotVV(s,s)-e.b2Sq(this.m_radius),a=e.b2SubVV(o.p2,o.p1,e.b2CircleShape.prototype.RayCast.s_r),l=e.b2DotVV(s,a),p=e.b2DotVV(a,a),m=l*l-p*r;if(0>m||p<e.b2_epsilon)return!1;var _=-(l+e.b2Sqrt(m));return _>=0&&_<=o.maxFraction*p?(_/=p,t.fraction=_,e.b2AddVMulSV(s,_,a,t.normal).SelfNormalize(),!0):!1},e.b2CircleShape.prototype.RayCast.s_position=new e.b2Vec2,e.b2CircleShape.prototype.RayCast.s_s=new e.b2Vec2,e.b2CircleShape.prototype.RayCast.s_r=new e.b2Vec2,e.b2CircleShape.prototype.ComputeAABB=function(t,o){var i=e.b2MulXV(o,this.m_p,e.b2CircleShape.prototype.ComputeAABB.s_p);t.lowerBound.Set(i.x-this.m_radius,i.y-this.m_radius),t.upperBound.Set(i.x+this.m_radius,i.y+this.m_radius)},e.b2CircleShape.prototype.ComputeAABB.s_p=new e.b2Vec2,e.b2CircleShape.prototype.ComputeMass=function(t,o){var i=e.b2Sq(this.m_radius);t.mass=o*e.b2_pi*i,t.center.Copy(this.m_p),t.I=t.mass*(.5*i+e.b2DotVV(this.m_p,this.m_p))},e.b2CircleShape.prototype.SetupDistanceProxy=function(t){t.m_vertices=new Array(1,!0),t.m_vertices[0]=this.m_p,t.m_count=1,t.m_radius=this.m_radius},e.b2CircleShape.prototype.ComputeSubmergedArea=function(t,o,i,n){var s=e.b2MulXV(i,this.m_p,new e.b2Vec2),r=-(e.b2DotVV(t,s)-o);if(r<-this.m_radius+e.b2_epsilon)return 0;if(r>this.m_radius)return n.Copy(s),e.b2_pi*this.m_radius*this.m_radius;var a=this.m_radius*this.m_radius,l=r*r,p=a*(e.b2Asin(r/this.m_radius)+e.b2_pi/2)+r*e.b2Sqrt(a-l),m=-2/3*e.b2Pow(a-l,1.5)/p;return n.x=s.x+t.x*m,n.y=s.y+t.y*m,p},e.b2CircleShape.prototype.Dump=function(){e.b2Log("    /*box2d.b2CircleShape*/ var shape = new box2d.b2CircleShape();\n"),e.b2Log("    shape.m_radius = %.15f;\n",this.m_radius),e.b2Log("    shape.m_p.Set(%.15f, %.15f);\n",this.m_p.x,this.m_p.y)},e}(e,l),S=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ConstantAccelController&&(e.b2ConstantAccelController={}),e.b2ConstantAccelController=function(){t.base(this),this.A=new e.b2Vec2(0,0)},t.inherits(e.b2ConstantAccelController,e.b2Controller),e.b2ConstantAccelController.prototype.A=null,e.b2ConstantAccelController.prototype.Step=function(t){for(var o=e.b2MulSV(t.dt,this.A,e.b2ConstantAccelController.prototype.Step.s_dtA),i=this.m_bodyList;i;i=i.nextBody){var n=i.body;n.IsAwake()&&n.SetLinearVelocity(e.b2AddVV(n.GetLinearVelocity(),o,e.b2Vec2.s_t0))}},e.b2ConstantAccelController.prototype.Step.s_dtA=new e.b2Vec2,e}(e,c,i,o),C=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ConstantForceController&&(e.b2ConstantForceController={}),e.b2ConstantForceController=function(){t.base(this),this.F=new e.b2Vec2(0,0)},t.inherits(e.b2ConstantForceController,e.b2Controller),e.b2ConstantForceController.prototype.F=null,e.b2ConstantForceController.prototype.Step=function(){for(var t=this.m_bodyList;t;t=t.nextBody){var e=t.body;e.IsAwake()&&e.ApplyForce(this.F,e.GetWorldCenter())}},e}(e,c,i,o),v=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Timer&&(e.b2Timer={}),e.b2Timer=function(){this.m_start=(new Date).getTime()},e.b2Timer.prototype.m_start=0,e.b2Timer.prototype.Reset=function(){return this.m_start=(new Date).getTime(),this},e.b2Timer.prototype.GetMilliseconds=function(){return(new Date).getTime()-this.m_start},e.b2Counter=function(){},e.b2Counter.prototype.m_count=0,e.b2Counter.prototype.m_min_count=0,e.b2Counter.prototype.m_max_count=0,e.b2Counter.prototype.GetCount=function(){return this.m_count},e.b2Counter.prototype.GetMinCount=function(){return this.m_min_count},e.b2Counter.prototype.GetMaxCount=function(){return this.m_max_count},e.b2Counter.prototype.ResetCount=function(){var t=this.m_count;return this.m_count=0,t},e.b2Counter.prototype.ResetMinCount=function(){this.m_min_count=0},e.b2Counter.prototype.ResetMaxCount=function(){this.m_max_count=0},e.b2Counter.prototype.Increment=function(){this.m_count++,this.m_max_count<this.m_count&&(this.m_max_count=this.m_count)},e.b2Counter.prototype.Decrement=function(){this.m_count--,this.m_min_count>this.m_count&&(this.m_min_count=this.m_count)},e}(e,o),x=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2TimeOfImpact&&(e.b2TimeOfImpact={}),e.b2_toiTime=0,e.b2_toiMaxTime=0,e.b2_toiCalls=0,e.b2_toiIters=0,e.b2_toiMaxIters=0,e.b2_toiRootIters=0,e.b2_toiMaxRootIters=0,e.b2TOIInput=function(){this.proxyA=new e.b2DistanceProxy,this.proxyB=new e.b2DistanceProxy,this.sweepA=new e.b2Sweep,this.sweepB=new e.b2Sweep},e.b2TOIInput.prototype.proxyA=null,e.b2TOIInput.prototype.proxyB=null,e.b2TOIInput.prototype.sweepA=null,e.b2TOIInput.prototype.sweepB=null,e.b2TOIInput.prototype.tMax=0,e.b2TOIOutputState={e_unknown:0,e_failed:1,e_overlapped:2,e_touching:3,e_separated:4},t.exportProperty(e.b2TOIOutputState,"e_unknown",e.b2TOIOutputState.e_unknown),t.exportProperty(e.b2TOIOutputState,"e_failed",e.b2TOIOutputState.e_failed),t.exportProperty(e.b2TOIOutputState,"e_overlapped",e.b2TOIOutputState.e_overlapped),t.exportProperty(e.b2TOIOutputState,"e_touching",e.b2TOIOutputState.e_touching),t.exportProperty(e.b2TOIOutputState,"e_separated",e.b2TOIOutputState.e_separated),e.b2TOIOutput=function(){},e.b2TOIOutput.prototype.state=e.b2TOIOutputState.e_unknown,e.b2TOIOutput.prototype.t=0,e.b2SeparationFunctionType={e_unknown:-1,e_points:0,e_faceA:1,e_faceB:2},t.exportProperty(e.b2SeparationFunctionType,"e_unknown",e.b2SeparationFunctionType.e_unknown),t.exportProperty(e.b2SeparationFunctionType,"e_points",e.b2SeparationFunctionType.e_points),t.exportProperty(e.b2SeparationFunctionType,"e_faceA",e.b2SeparationFunctionType.e_faceA),t.exportProperty(e.b2SeparationFunctionType,"e_faceB",e.b2SeparationFunctionType.e_faceB),e.b2SeparationFunction=function(){this.m_sweepA=new e.b2Sweep,this.m_sweepB=new e.b2Sweep,this.m_localPoint=new e.b2Vec2,this.m_axis=new e.b2Vec2},e.b2SeparationFunction.prototype.m_proxyA=null,e.b2SeparationFunction.prototype.m_proxyB=null,e.b2SeparationFunction.prototype.m_sweepA=null,e.b2SeparationFunction.prototype.m_sweepB=null,e.b2SeparationFunction.prototype.m_type=e.b2SeparationFunctionType.e_unknown,e.b2SeparationFunction.prototype.m_localPoint=null,e.b2SeparationFunction.prototype.m_axis=null,e.b2SeparationFunction.prototype.Initialize=function(t,o,i,n,s,r){this.m_proxyA=o,this.m_proxyB=n;var a=t.count;e.ENABLE_ASSERTS&&e.b2Assert(a>0&&3>a),this.m_sweepA.Copy(i),this.m_sweepB.Copy(s);var l=e.b2TimeOfImpact.s_xfA,p=e.b2TimeOfImpact.s_xfB;if(this.m_sweepA.GetTransform(l,r),this.m_sweepB.GetTransform(p,r),1==a){this.m_type=e.b2SeparationFunctionType.e_points;var m=this.m_proxyA.GetVertex(t.indexA[0]),_=this.m_proxyB.GetVertex(t.indexB[0]),b=e.b2MulXV(l,m,e.b2TimeOfImpact.s_pointA),h=e.b2MulXV(p,_,e.b2TimeOfImpact.s_pointB);e.b2SubVV(h,b,this.m_axis);var c=this.m_axis.Normalize();return c}if(t.indexA[0]==t.indexA[1]){this.m_type=e.b2SeparationFunctionType.e_faceB;var u=this.m_proxyB.GetVertex(t.indexB[0]),y=this.m_proxyB.GetVertex(t.indexB[1]);e.b2CrossVOne(e.b2SubVV(y,u,e.b2Vec2.s_t0),this.m_axis).SelfNormalize();var d=e.b2MulRV(p.q,this.m_axis,e.b2TimeOfImpact.s_normal);e.b2MidVV(u,y,this.m_localPoint);var h=e.b2MulXV(p,this.m_localPoint,e.b2TimeOfImpact.s_pointB),m=this.m_proxyA.GetVertex(t.indexA[0]),b=e.b2MulXV(l,m,e.b2TimeOfImpact.s_pointA),c=e.b2DotVV(e.b2SubVV(b,h,e.b2Vec2.s_t0),d);return 0>c&&(this.m_axis.SelfNeg(),c=-c),c}this.m_type=e.b2SeparationFunctionType.e_faceA;var f=this.m_proxyA.GetVertex(t.indexA[0]),A=this.m_proxyA.GetVertex(t.indexA[1]);e.b2CrossVOne(e.b2SubVV(A,f,e.b2Vec2.s_t0),this.m_axis).SelfNormalize();var d=e.b2MulRV(l.q,this.m_axis,e.b2TimeOfImpact.s_normal);e.b2MidVV(f,A,this.m_localPoint);var b=e.b2MulXV(l,this.m_localPoint,e.b2TimeOfImpact.s_pointA),_=this.m_proxyB.GetVertex(t.indexB[0]),h=e.b2MulXV(p,_,e.b2TimeOfImpact.s_pointB),c=e.b2DotVV(e.b2SubVV(h,b,e.b2Vec2.s_t0),d);return 0>c&&(this.m_axis.SelfNeg(),c=-c),c},e.b2SeparationFunction.prototype.FindMinSeparation=function(t,o,i){var n=e.b2TimeOfImpact.s_xfA,s=e.b2TimeOfImpact.s_xfB;switch(this.m_sweepA.GetTransform(n,i),this.m_sweepB.GetTransform(s,i),this.m_type){case e.b2SeparationFunctionType.e_points:var r=e.b2MulTRV(n.q,this.m_axis,e.b2TimeOfImpact.s_axisA),a=e.b2MulTRV(s.q,e.b2NegV(this.m_axis,e.b2Vec2.s_t0),e.b2TimeOfImpact.s_axisB);t[0]=this.m_proxyA.GetSupport(r),o[0]=this.m_proxyB.GetSupport(a);var l=this.m_proxyA.GetVertex(t[0]),p=this.m_proxyB.GetVertex(o[0]),m=e.b2MulXV(n,l,e.b2TimeOfImpact.s_pointA),_=e.b2MulXV(s,p,e.b2TimeOfImpact.s_pointB),b=e.b2DotVV(e.b2SubVV(_,m,e.b2Vec2.s_t0),this.m_axis);return b;case e.b2SeparationFunctionType.e_faceA:var h=e.b2MulRV(n.q,this.m_axis,e.b2TimeOfImpact.s_normal),m=e.b2MulXV(n,this.m_localPoint,e.b2TimeOfImpact.s_pointA),a=e.b2MulTRV(s.q,e.b2NegV(h,e.b2Vec2.s_t0),e.b2TimeOfImpact.s_axisB);t[0]=-1,o[0]=this.m_proxyB.GetSupport(a);var p=this.m_proxyB.GetVertex(o[0]),_=e.b2MulXV(s,p,e.b2TimeOfImpact.s_pointB),b=e.b2DotVV(e.b2SubVV(_,m,e.b2Vec2.s_t0),h);return b;case e.b2SeparationFunctionType.e_faceB:var h=e.b2MulRV(s.q,this.m_axis,e.b2TimeOfImpact.s_normal),_=e.b2MulXV(s,this.m_localPoint,e.b2TimeOfImpact.s_pointB),r=e.b2MulTRV(n.q,e.b2NegV(h,e.b2Vec2.s_t0),e.b2TimeOfImpact.s_axisA);o[0]=-1,t[0]=this.m_proxyA.GetSupport(r);var l=this.m_proxyA.GetVertex(t[0]),m=e.b2MulXV(n,l,e.b2TimeOfImpact.s_pointA),b=e.b2DotVV(e.b2SubVV(m,_,e.b2Vec2.s_t0),h);return b;default:return e.ENABLE_ASSERTS&&e.b2Assert(!1),t[0]=-1,o[0]=-1,0}},e.b2SeparationFunction.prototype.Evaluate=function(t,o,i){var n=e.b2TimeOfImpact.s_xfA,s=e.b2TimeOfImpact.s_xfB;switch(this.m_sweepA.GetTransform(n,i),this.m_sweepB.GetTransform(s,i),this.m_type){case e.b2SeparationFunctionType.e_points:var r=this.m_proxyA.GetVertex(t),a=this.m_proxyB.GetVertex(o),l=e.b2MulXV(n,r,e.b2TimeOfImpact.s_pointA),p=e.b2MulXV(s,a,e.b2TimeOfImpact.s_pointB),m=e.b2DotVV(e.b2SubVV(p,l,e.b2Vec2.s_t0),this.m_axis);return m;case e.b2SeparationFunctionType.e_faceA:var _=e.b2MulRV(n.q,this.m_axis,e.b2TimeOfImpact.s_normal),l=e.b2MulXV(n,this.m_localPoint,e.b2TimeOfImpact.s_pointA),a=this.m_proxyB.GetVertex(o),p=e.b2MulXV(s,a,e.b2TimeOfImpact.s_pointB),m=e.b2DotVV(e.b2SubVV(p,l,e.b2Vec2.s_t0),_);return m;case e.b2SeparationFunctionType.e_faceB:var _=e.b2MulRV(s.q,this.m_axis,e.b2TimeOfImpact.s_normal),p=e.b2MulXV(s,this.m_localPoint,e.b2TimeOfImpact.s_pointB),r=this.m_proxyA.GetVertex(t),l=e.b2MulXV(n,r,e.b2TimeOfImpact.s_pointA),m=e.b2DotVV(e.b2SubVV(l,p,e.b2Vec2.s_t0),_);return m;default:return e.ENABLE_ASSERTS&&e.b2Assert(!1),0}},e.b2TimeOfImpact=function(t,o){var i=e.b2TimeOfImpact.s_timer.Reset();++e.b2_toiCalls,t.state=e.b2TOIOutputState.e_unknown,t.t=o.tMax;var n=o.proxyA,s=o.proxyB,r=e.b2TimeOfImpact.s_sweepA.Copy(o.sweepA),a=e.b2TimeOfImpact.s_sweepB.Copy(o.sweepB);r.Normalize(),a.Normalize();var l=o.tMax,p=n.m_radius+s.m_radius,m=e.b2Max(e.b2_linearSlop,p-3*e.b2_linearSlop),_=.25*e.b2_linearSlop;e.ENABLE_ASSERTS&&e.b2Assert(m>_);var b=0,h=20,c=0,u=e.b2TimeOfImpact.s_cache;u.count=0;var y=e.b2TimeOfImpact.s_distanceInput;for(y.proxyA=o.proxyA,y.proxyB=o.proxyB,y.useRadii=!1;;){var d=e.b2TimeOfImpact.s_xfA,f=e.b2TimeOfImpact.s_xfB;r.GetTransform(d,b),a.GetTransform(f,b),y.transformA.Copy(d),y.transformB.Copy(f);var A=e.b2TimeOfImpact.s_distanceOutput;if(e.b2Distance(A,u,y),A.distance<=0){t.state=e.b2TOIOutputState.e_overlapped,t.t=0;break}if(A.distance<m+_){t.state=e.b2TOIOutputState.e_touching,t.t=b;break}var S=e.b2TimeOfImpact.s_fcn;S.Initialize(u,n,r,s,a,b);for(var C=!1,v=l,x=0;;){var V=e.b2TimeOfImpact.s_indexA,g=e.b2TimeOfImpact.s_indexB,B=S.FindMinSeparation(V,g,v);if(B>m+_){t.state=e.b2TOIOutputState.e_separated,t.t=l,C=!0;break}if(B>m-_){b=v;break}var w=S.Evaluate(V[0],g[0],b);if(m-_>w){t.state=e.b2TOIOutputState.e_failed,t.t=b,C=!0;break}if(m+_>=w){t.state=e.b2TOIOutputState.e_touching,t.t=b,C=!0;break}for(var M=0,J=b,P=v;;){var T=0;T=1&M?J+(m-w)*(P-J)/(B-w):.5*(J+P),++M,++e.b2_toiRootIters;var D=S.Evaluate(V[0],g[0],T);if(e.b2Abs(D-m)<_){v=T;break}if(D>m?(J=T,w=D):(P=T,B=D),50==M)break}if(e.b2_toiMaxRootIters=e.b2Max(e.b2_toiMaxRootIters,M),++x,x==e.b2_maxPolygonVertices)break}if(++c,++e.b2_toiIters,C)break;if(c==h){t.state=e.b2TOIOutputState.e_failed,t.t=b;break}}e.b2_toiMaxIters=e.b2Max(e.b2_toiMaxIters,c);var R=i.GetMilliseconds();e.b2_toiMaxTime=e.b2Max(e.b2_toiMaxTime,R),e.b2_toiTime+=R},e.b2TimeOfImpact.s_timer=new e.b2Timer,e.b2TimeOfImpact.s_cache=new e.b2SimplexCache,e.b2TimeOfImpact.s_distanceInput=new e.b2DistanceInput,e.b2TimeOfImpact.s_distanceOutput=new e.b2DistanceOutput,e.b2TimeOfImpact.s_xfA=new e.b2Transform,e.b2TimeOfImpact.s_xfB=new e.b2Transform,e.b2TimeOfImpact.s_indexA=e.b2MakeNumberArray(1),e.b2TimeOfImpact.s_indexB=e.b2MakeNumberArray(1),e.b2TimeOfImpact.s_fcn=new e.b2SeparationFunction,e.b2TimeOfImpact.s_sweepA=new e.b2Sweep,e.b2TimeOfImpact.s_sweepB=new e.b2Sweep,e.b2TimeOfImpact.s_pointA=new e.b2Vec2,e.b2TimeOfImpact.s_pointB=new e.b2Vec2,e.b2TimeOfImpact.s_normal=new e.b2Vec2,e.b2TimeOfImpact.s_axisA=new e.b2Vec2,e.b2TimeOfImpact.s_axisB=new e.b2Vec2,e}(e,r,i,o,v),V=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Contact&&(e.b2Contact={}),e.b2MixFriction=function(t,o){return e.b2Sqrt(t*o)},e.b2MixRestitution=function(t,e){return t>e?t:e},e.b2ContactEdge=function(){},e.b2ContactEdge.prototype.other=null,e.b2ContactEdge.prototype.contact=null,e.b2ContactEdge.prototype.prev=null,e.b2ContactEdge.prototype.next=null,e.b2ContactFlag={e_none:0,e_islandFlag:1,e_touchingFlag:2,e_enabledFlag:4,e_filterFlag:8,e_bulletHitFlag:16,e_toiFlag:32},t.exportProperty(e.b2ContactFlag,"e_none",e.b2ContactFlag.e_none),t.exportProperty(e.b2ContactFlag,"e_islandFlag",e.b2ContactFlag.e_islandFlag),t.exportProperty(e.b2ContactFlag,"e_touchingFlag",e.b2ContactFlag.e_touchingFlag),t.exportProperty(e.b2ContactFlag,"e_enabledFlag",e.b2ContactFlag.e_enabledFlag),t.exportProperty(e.b2ContactFlag,"e_filterFlag",e.b2ContactFlag.e_filterFlag),t.exportProperty(e.b2ContactFlag,"e_bulletHitFlag",e.b2ContactFlag.e_bulletHitFlag),t.exportProperty(e.b2ContactFlag,"e_toiFlag",e.b2ContactFlag.e_toiFlag),e.b2Contact=function(){this.m_nodeA=new e.b2ContactEdge,this.m_nodeB=new e.b2ContactEdge,this.m_manifold=new e.b2Manifold,this.m_oldManifold=new e.b2Manifold},e.b2Contact.prototype.m_flags=e.b2ContactFlag.e_none,e.b2Contact.prototype.m_prev=null,e.b2Contact.prototype.m_next=null,e.b2Contact.prototype.m_nodeA=null,e.b2Contact.prototype.m_nodeB=null,e.b2Contact.prototype.m_fixtureA=null,e.b2Contact.prototype.m_fixtureB=null,e.b2Contact.prototype.m_indexA=0,e.b2Contact.prototype.m_indexB=0,e.b2Contact.prototype.m_manifold=null,e.b2Contact.prototype.m_toiCount=0,e.b2Contact.prototype.m_toi=0,e.b2Contact.prototype.m_friction=0,e.b2Contact.prototype.m_restitution=0,e.b2Contact.prototype.m_tangentSpeed=0,e.b2Contact.prototype.m_oldManifold=null,e.b2Contact.prototype.GetManifold=function(){return this.m_manifold
	},e.b2Contact.prototype.GetWorldManifold=function(t){var e=this.m_fixtureA.GetBody(),o=this.m_fixtureB.GetBody(),i=this.m_fixtureA.GetShape(),n=this.m_fixtureB.GetShape();t.Initialize(this.m_manifold,e.GetTransform(),i.m_radius,o.GetTransform(),n.m_radius)},e.b2Contact.prototype.IsTouching=function(){return(this.m_flags&e.b2ContactFlag.e_touchingFlag)==e.b2ContactFlag.e_touchingFlag},e.b2Contact.prototype.SetEnabled=function(t){t?this.m_flags|=e.b2ContactFlag.e_enabledFlag:this.m_flags&=~e.b2ContactFlag.e_enabledFlag},e.b2Contact.prototype.IsEnabled=function(){return(this.m_flags&e.b2ContactFlag.e_enabledFlag)==e.b2ContactFlag.e_enabledFlag},e.b2Contact.prototype.GetNext=function(){return this.m_next},e.b2Contact.prototype.GetFixtureA=function(){return this.m_fixtureA},e.b2Contact.prototype.GetChildIndexA=function(){return this.m_indexA},e.b2Contact.prototype.GetFixtureB=function(){return this.m_fixtureB},e.b2Contact.prototype.GetChildIndexB=function(){return this.m_indexB},e.b2Contact.prototype.Evaluate=function(){},e.b2Contact.prototype.FlagForFiltering=function(){this.m_flags|=e.b2ContactFlag.e_filterFlag},e.b2Contact.prototype.SetFriction=function(t){this.m_friction=t},e.b2Contact.prototype.GetFriction=function(){return this.m_friction},e.b2Contact.prototype.ResetFriction=function(){this.m_friction=e.b2MixFriction(this.m_fixtureA.m_friction,this.m_fixtureB.m_friction)},e.b2Contact.prototype.SetRestitution=function(t){this.m_restitution=t},e.b2Contact.prototype.GetRestitution=function(){return this.m_restitution},e.b2Contact.prototype.ResetRestitution=function(){this.m_restitution=e.b2MixRestitution(this.m_fixtureA.m_restitution,this.m_fixtureB.m_restitution)},e.b2Contact.prototype.SetTangentSpeed=function(t){this.m_tangentSpeed=t},e.b2Contact.prototype.GetTangentSpeed=function(){return this.m_tangentSpeed},e.b2Contact.prototype.Reset=function(t,o,i,n){this.m_flags=e.b2ContactFlag.e_enabledFlag,this.m_fixtureA=t,this.m_fixtureB=i,this.m_indexA=o,this.m_indexB=n,this.m_manifold.pointCount=0,this.m_prev=null,this.m_next=null,this.m_nodeA.contact=null,this.m_nodeA.prev=null,this.m_nodeA.next=null,this.m_nodeA.other=null,this.m_nodeB.contact=null,this.m_nodeB.prev=null,this.m_nodeB.next=null,this.m_nodeB.other=null,this.m_toiCount=0,this.m_friction=e.b2MixFriction(this.m_fixtureA.m_friction,this.m_fixtureB.m_friction),this.m_restitution=e.b2MixRestitution(this.m_fixtureA.m_restitution,this.m_fixtureB.m_restitution)},e.b2Contact.prototype.Update=function(t){var o=this.m_oldManifold;this.m_oldManifold=this.m_manifold,this.m_manifold=o,this.m_flags|=e.b2ContactFlag.e_enabledFlag;var i=!1,n=(this.m_flags&e.b2ContactFlag.e_touchingFlag)==e.b2ContactFlag.e_touchingFlag,s=this.m_fixtureA.IsSensor(),r=this.m_fixtureB.IsSensor(),a=s||r,l=this.m_fixtureA.GetBody(),p=this.m_fixtureB.GetBody(),m=l.GetTransform(),_=p.GetTransform();if(a){var b=this.m_fixtureA.GetShape(),h=this.m_fixtureB.GetShape();i=e.b2TestOverlapShape(b,this.m_indexA,h,this.m_indexB,m,_),this.m_manifold.pointCount=0}else{this.Evaluate(this.m_manifold,m,_),i=this.m_manifold.pointCount>0;for(var c=0;c<this.m_manifold.pointCount;++c){var u=this.m_manifold.points[c];u.normalImpulse=0,u.tangentImpulse=0;for(var y=u.id,d=0;d<this.m_oldManifold.pointCount;++d){var f=this.m_oldManifold.points[d];if(f.id.key==y.key){u.normalImpulse=f.normalImpulse,u.tangentImpulse=f.tangentImpulse;break}}}i!=n&&(l.SetAwake(!0),p.SetAwake(!0))}i?this.m_flags|=e.b2ContactFlag.e_touchingFlag:this.m_flags&=~e.b2ContactFlag.e_touchingFlag,0==n&&1==i&&t&&t.BeginContact(this),1==n&&0==i&&t&&t.EndContact(this),0==a&&i&&t&&t.PreSolve(this,this.m_oldManifold)},e.b2Contact.prototype.ComputeTOI=function(t,o){var i=e.b2Contact.prototype.ComputeTOI.s_input;i.proxyA.SetShape(this.m_fixtureA.GetShape(),this.m_indexA),i.proxyB.SetShape(this.m_fixtureB.GetShape(),this.m_indexB),i.sweepA.Copy(t),i.sweepB.Copy(o),i.tMax=e.b2_linearSlop;var n=e.b2Contact.prototype.ComputeTOI.s_output;return e.b2TimeOfImpact(n,i),n.t},e.b2Contact.prototype.ComputeTOI.s_input=new e.b2TOIInput,e.b2Contact.prototype.ComputeTOI.s_output=new e.b2TOIOutput,e}(e,a,o,x),g=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2DistanceJoint&&(e.b2DistanceJoint={}),e.b2DistanceJointDef=function(){t.base(this,e.b2JointType.e_distanceJoint),this.localAnchorA=new e.b2Vec2,this.localAnchorB=new e.b2Vec2},t.inherits(e.b2DistanceJointDef,e.b2JointDef),e.b2DistanceJointDef.prototype.localAnchorA=null,e.b2DistanceJointDef.prototype.localAnchorB=null,e.b2DistanceJointDef.prototype.length=1,e.b2DistanceJointDef.prototype.frequencyHz=0,e.b2DistanceJointDef.prototype.dampingRatio=0,e.b2DistanceJointDef.prototype.Initialize=function(t,o,i,n){this.bodyA=t,this.bodyB=o,this.bodyA.GetLocalPoint(i,this.localAnchorA),this.bodyB.GetLocalPoint(n,this.localAnchorB),this.length=e.b2DistanceVV(i,n),this.frequencyHz=0,this.dampingRatio=0},e.b2DistanceJoint=function(o){t.base(this,o),this.m_u=new e.b2Vec2,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_frequencyHz=o.frequencyHz,this.m_dampingRatio=o.dampingRatio,this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_length=o.length},t.inherits(e.b2DistanceJoint,e.b2Joint),e.b2DistanceJoint.prototype.m_frequencyHz=0,e.b2DistanceJoint.prototype.m_dampingRatio=0,e.b2DistanceJoint.prototype.m_bias=0,e.b2DistanceJoint.prototype.m_localAnchorA=null,e.b2DistanceJoint.prototype.m_localAnchorB=null,e.b2DistanceJoint.prototype.m_gamma=0,e.b2DistanceJoint.prototype.m_impulse=0,e.b2DistanceJoint.prototype.m_length=0,e.b2DistanceJoint.prototype.m_indexA=0,e.b2DistanceJoint.prototype.m_indexB=0,e.b2DistanceJoint.prototype.m_u=null,e.b2DistanceJoint.prototype.m_rA=null,e.b2DistanceJoint.prototype.m_rB=null,e.b2DistanceJoint.prototype.m_localCenterA=null,e.b2DistanceJoint.prototype.m_localCenterB=null,e.b2DistanceJoint.prototype.m_invMassA=0,e.b2DistanceJoint.prototype.m_invMassB=0,e.b2DistanceJoint.prototype.m_invIA=0,e.b2DistanceJoint.prototype.m_invIB=0,e.b2DistanceJoint.prototype.m_mass=0,e.b2DistanceJoint.prototype.m_qA=null,e.b2DistanceJoint.prototype.m_qB=null,e.b2DistanceJoint.prototype.m_lalcA=null,e.b2DistanceJoint.prototype.m_lalcB=null,e.b2DistanceJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2DistanceJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2DistanceJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*this.m_impulse*this.m_u.x,t*this.m_impulse*this.m_u.y)},e.b2DistanceJoint.prototype.GetReactionTorque=function(){return 0},e.b2DistanceJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2DistanceJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2DistanceJoint.prototype.SetLength=function(t){this.m_length=t},e.b2DistanceJoint.prototype.GetLength=function(){return this.m_length},e.b2DistanceJoint.prototype.SetFrequency=function(t){this.m_frequencyHz=t},e.b2DistanceJoint.prototype.GetFrequency=function(){return this.m_frequencyHz},e.b2DistanceJoint.prototype.SetDampingRatio=function(t){this.m_dampingRatio=t},e.b2DistanceJoint.prototype.GetDampingRatio=function(){return this.m_dampingRatio},e.b2DistanceJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2DistanceJointDef*/ var jd = new box2d.b2DistanceJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.length = %.15f;\n",this.m_length),e.b2Log("  jd.frequencyHz = %.15f;\n",this.m_frequencyHz),e.b2Log("  jd.dampingRatio = %.15f;\n",this.m_dampingRatio),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e.b2DistanceJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.velocities[this.m_indexA].v,s=t.velocities[this.m_indexA].w,r=t.positions[this.m_indexB].c,a=t.positions[this.m_indexB].a,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=this.m_qA.SetAngleRadians(i),_=this.m_qB.SetAngleRadians(a);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA),e.b2MulRV(m,this.m_lalcA,this.m_rA),e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(_,this.m_lalcB,this.m_rB),this.m_u.x=r.x+this.m_rB.x-o.x-this.m_rA.x,this.m_u.y=r.y+this.m_rB.y-o.y-this.m_rA.y;var b=this.m_u.GetLength();b>e.b2_linearSlop?this.m_u.SelfMul(1/b):this.m_u.SetZero();var h=e.b2CrossVV(this.m_rA,this.m_u),c=e.b2CrossVV(this.m_rB,this.m_u),u=this.m_invMassA+this.m_invIA*h*h+this.m_invMassB+this.m_invIB*c*c;if(this.m_mass=0!=u?1/u:0,this.m_frequencyHz>0){var y=b-this.m_length,d=2*e.b2_pi*this.m_frequencyHz,f=2*this.m_mass*this.m_dampingRatio*d,A=this.m_mass*d*d,S=t.step.dt;this.m_gamma=S*(f+S*A),this.m_gamma=0!=this.m_gamma?1/this.m_gamma:0,this.m_bias=y*S*A*this.m_gamma,u+=this.m_gamma,this.m_mass=0!=u?1/u:0}else this.m_gamma=0,this.m_bias=0;if(t.step.warmStarting){this.m_impulse*=t.step.dtRatio;var C=e.b2MulSV(this.m_impulse,this.m_u,e.b2DistanceJoint.prototype.InitVelocityConstraints.s_P);n.SelfMulSub(this.m_invMassA,C),s-=this.m_invIA*e.b2CrossVV(this.m_rA,C),l.SelfMulAdd(this.m_invMassB,C),p+=this.m_invIB*e.b2CrossVV(this.m_rB,C)}else this.m_impulse=0;t.velocities[this.m_indexA].w=s,t.velocities[this.m_indexB].w=p},e.b2DistanceJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2DistanceJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=e.b2AddVCrossSV(o,i,this.m_rA,e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpA),a=e.b2AddVCrossSV(n,s,this.m_rB,e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpB),l=e.b2DotVV(this.m_u,e.b2SubVV(a,r,e.b2Vec2.s_t0)),p=-this.m_mass*(l+this.m_bias+this.m_gamma*this.m_impulse);this.m_impulse+=p;var m=e.b2MulSV(p,this.m_u,e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_P);o.SelfMulSub(this.m_invMassA,m),i-=this.m_invIA*e.b2CrossVV(this.m_rA,m),n.SelfMulAdd(this.m_invMassB,m),s+=this.m_invIB*e.b2CrossVV(this.m_rB,m),t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpA=new e.b2Vec2,e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpB=new e.b2Vec2,e.b2DistanceJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2DistanceJoint.prototype.SolvePositionConstraints=function(t){if(this.m_frequencyHz>0)return!0;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=(this.m_qA.SetAngleRadians(i),this.m_qB.SetAngleRadians(s),e.b2MulRV(this.m_qA,this.m_lalcA,this.m_rA)),a=e.b2MulRV(this.m_qB,this.m_lalcB,this.m_rB),l=this.m_u;l.x=n.x+a.x-o.x-r.x,l.y=n.y+a.y-o.y-r.y;var p=this.m_u.Normalize(),m=p-this.m_length;m=e.b2Clamp(m,-e.b2_maxLinearCorrection,e.b2_maxLinearCorrection);var _=-this.m_mass*m,b=e.b2MulSV(_,l,e.b2DistanceJoint.prototype.SolvePositionConstraints.s_P);return o.SelfMulSub(this.m_invMassA,b),i-=this.m_invIA*e.b2CrossVV(r,b),n.SelfMulAdd(this.m_invMassB,b),s+=this.m_invIB*e.b2CrossVV(a,b),t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,e.b2Abs(m)<e.b2_linearSlop},e.b2DistanceJoint.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e}(e,n,i,o),B=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Draw&&(e.b2Draw={}),e.b2Color=function(t,e,o){this.r=t,this.g=e,this.b=o},e.b2Color.prototype.r=.5,e.b2Color.prototype.g=.5,e.b2Color.prototype.b=.5,e.b2Color.prototype.SetRGB=function(t,e,o){return this.r=t,this.g=e,this.b=o,this},e.b2Color.prototype.MakeStyleString=function(t){var o=Math.round(Math.max(0,Math.min(255,255*this.r))),i=Math.round(Math.max(0,Math.min(255,255*this.g))),n=Math.round(Math.max(0,Math.min(255,255*this.b))),s="undefined"==typeof t?1:Math.max(0,Math.min(1,t));return e.b2Color.MakeStyleString(o,i,n,s)},e.b2Color.MakeStyleString=function(t,e,o,i){return 1>i?"rgba("+t+","+e+","+o+","+i+")":"rgb("+t+","+e+","+o+")"},e.b2Color.RED=new e.b2Color(1,0,0),e.b2Color.GREEN=new e.b2Color(0,1,0),e.b2Color.BLUE=new e.b2Color(0,0,1),e.b2DrawFlags={e_none:0,e_shapeBit:1,e_jointBit:2,e_aabbBit:4,e_pairBit:8,e_centerOfMassBit:16,e_controllerBit:32,e_all:63},t.exportProperty(e.b2DrawFlags,"e_none",e.b2DrawFlags.e_none),t.exportProperty(e.b2DrawFlags,"e_shapeBit",e.b2DrawFlags.e_shapeBit),t.exportProperty(e.b2DrawFlags,"e_jointBit",e.b2DrawFlags.e_jointBit),t.exportProperty(e.b2DrawFlags,"e_aabbBit",e.b2DrawFlags.e_aabbBit),t.exportProperty(e.b2DrawFlags,"e_pairBit",e.b2DrawFlags.e_pairBit),t.exportProperty(e.b2DrawFlags,"e_centerOfMassBit",e.b2DrawFlags.e_centerOfMassBit),t.exportProperty(e.b2DrawFlags,"e_controllerBit",e.b2DrawFlags.e_controllerBit),t.exportProperty(e.b2DrawFlags,"e_all",e.b2DrawFlags.e_all),e.b2Draw=function(){},e.b2Draw.prototype.m_drawFlags=e.b2DrawFlags.e_none,e.b2Draw.prototype.SetFlags=function(t){this.m_drawFlags=t},e.b2Draw.prototype.GetFlags=function(){return this.m_drawFlags},e.b2Draw.prototype.AppendFlags=function(t){this.m_drawFlags|=t},e.b2Draw.prototype.ClearFlags=function(t){this.m_drawFlags&=~t},e.b2Draw.prototype.PushTransform=function(){},e.b2Draw.prototype.PopTransform=function(){},e.b2Draw.prototype.DrawPolygon=function(){},e.b2Draw.prototype.DrawSolidPolygon=function(){},e.b2Draw.prototype.DrawCircle=function(){},e.b2Draw.prototype.DrawSolidCircle=function(){},e.b2Draw.prototype.DrawSegment=function(){},e.b2Draw.prototype.DrawTransform=function(){},e}(e,o),w=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2FrictionJoint&&(e.b2FrictionJoint={}),e.b2FrictionJointDef=function(){t.base(this,e.b2JointType.e_frictionJoint),this.localAnchorA=new e.b2Vec2,this.localAnchorB=new e.b2Vec2},t.inherits(e.b2FrictionJointDef,e.b2JointDef),e.b2FrictionJointDef.prototype.localAnchorA=null,e.b2FrictionJointDef.prototype.localAnchorB=null,e.b2FrictionJointDef.prototype.maxForce=0,e.b2FrictionJointDef.prototype.maxTorque=0,e.b2FrictionJointDef.prototype.Initialize=function(t,e,o){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(o,this.localAnchorA),this.bodyB.GetLocalPoint(o,this.localAnchorB)},e.b2FrictionJoint=function(o){t.base(this,o),this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_linearImpulse=(new e.b2Vec2).SetZero(),this.m_maxForce=o.maxForce,this.m_maxTorque=o.maxTorque,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_linearMass=(new e.b2Mat22).SetZero(),this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_K=new e.b2Mat22},t.inherits(e.b2FrictionJoint,e.b2Joint),e.b2FrictionJoint.prototype.m_localAnchorA=null,e.b2FrictionJoint.prototype.m_localAnchorB=null,e.b2FrictionJoint.prototype.m_linearImpulse=null,e.b2FrictionJoint.prototype.m_angularImpulse=0,e.b2FrictionJoint.prototype.m_maxForce=0,e.b2FrictionJoint.prototype.m_maxTorque=0,e.b2FrictionJoint.prototype.m_indexA=0,e.b2FrictionJoint.prototype.m_indexB=0,e.b2FrictionJoint.prototype.m_rA=null,e.b2FrictionJoint.prototype.m_rB=null,e.b2FrictionJoint.prototype.m_localCenterA=null,e.b2FrictionJoint.prototype.m_localCenterB=null,e.b2FrictionJoint.prototype.m_invMassA=0,e.b2FrictionJoint.prototype.m_invMassB=0,e.b2FrictionJoint.prototype.m_invIA=0,e.b2FrictionJoint.prototype.m_invIB=0,e.b2FrictionJoint.prototype.m_linearMass=null,e.b2FrictionJoint.prototype.m_angularMass=0,e.b2FrictionJoint.prototype.m_qA=null,e.b2FrictionJoint.prototype.m_qB=null,e.b2FrictionJoint.prototype.m_lalcA=null,e.b2FrictionJoint.prototype.m_lalcB=null,e.b2FrictionJoint.prototype.m_K=null,e.b2FrictionJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].a,i=t.velocities[this.m_indexA].v,n=t.velocities[this.m_indexA].w,s=t.positions[this.m_indexB].a,r=t.velocities[this.m_indexB].v,a=t.velocities[this.m_indexB].w,l=this.m_qA.SetAngleRadians(o),p=this.m_qB.SetAngleRadians(s);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var m=e.b2MulRV(l,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var _=e.b2MulRV(p,this.m_lalcB,this.m_rB),b=this.m_invMassA,h=this.m_invMassB,c=this.m_invIA,u=this.m_invIB,y=this.m_K;if(y.ex.x=b+h+c*m.y*m.y+u*_.y*_.y,y.ex.y=-c*m.x*m.y-u*_.x*_.y,y.ey.x=y.ex.y,y.ey.y=b+h+c*m.x*m.x+u*_.x*_.x,y.GetInverse(this.m_linearMass),this.m_angularMass=c+u,this.m_angularMass>0&&(this.m_angularMass=1/this.m_angularMass),t.step.warmStarting){this.m_linearImpulse.SelfMul(t.step.dtRatio),this.m_angularImpulse*=t.step.dtRatio;var d=this.m_linearImpulse;i.SelfMulSub(b,d),n-=c*(e.b2CrossVV(this.m_rA,d)+this.m_angularImpulse),r.SelfMulAdd(h,d),a+=u*(e.b2CrossVV(this.m_rB,d)+this.m_angularImpulse)}else this.m_linearImpulse.SetZero(),this.m_angularImpulse=0;t.velocities[this.m_indexA].w=n,t.velocities[this.m_indexB].w=a},e.b2FrictionJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_invMassA,a=this.m_invMassB,l=this.m_invIA,p=this.m_invIB,m=t.step.dt,_=s-i,b=-this.m_angularMass*_,h=this.m_angularImpulse,c=m*this.m_maxTorque;this.m_angularImpulse=e.b2Clamp(this.m_angularImpulse+b,-c,c),b=this.m_angularImpulse-h,i-=l*b,s+=p*b;var _=e.b2SubVV(e.b2AddVCrossSV(n,s,this.m_rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(o,i,this.m_rA,e.b2Vec2.s_t1),e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_Cdot),u=e.b2MulMV(this.m_linearMass,_,e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_impulseV).SelfNeg(),y=e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_oldImpulseV.Copy(this.m_linearImpulse);this.m_linearImpulse.SelfAdd(u);var c=m*this.m_maxForce;this.m_linearImpulse.GetLengthSquared()>c*c&&(this.m_linearImpulse.Normalize(),this.m_linearImpulse.SelfMul(c)),e.b2SubVV(this.m_linearImpulse,y,u),o.SelfMulSub(r,u),i-=l*e.b2CrossVV(this.m_rA,u),n.SelfMulAdd(a,u),s+=p*e.b2CrossVV(this.m_rB,u),t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_Cdot=new e.b2Vec2,e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_impulseV=new e.b2Vec2,e.b2FrictionJoint.prototype.SolveVelocityConstraints.s_oldImpulseV=new e.b2Vec2,e.b2FrictionJoint.prototype.SolvePositionConstraints=function(){return!0},e.b2FrictionJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2FrictionJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2FrictionJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*this.m_linearImpulse.x,t*this.m_linearImpulse.y)},e.b2FrictionJoint.prototype.GetReactionTorque=function(t){return t*this.m_angularImpulse},e.b2FrictionJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2FrictionJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2FrictionJoint.prototype.SetMaxForce=function(t){this.m_maxForce=t},e.b2FrictionJoint.prototype.GetMaxForce=function(){return this.m_maxForce},e.b2FrictionJoint.prototype.SetMaxTorque=function(t){this.m_maxTorque=t},e.b2FrictionJoint.prototype.GetMaxTorque=function(){return this.m_maxTorque},e.b2FrictionJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2FrictionJointDef*/ var jd = new box2d.b2FrictionJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.maxForce = %.15f;\n",this.m_maxForce),e.b2Log("  jd.maxTorque = %.15f;\n",this.m_maxTorque),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),M=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2PrismaticJoint&&(e.b2PrismaticJoint={}),e.b2PrismaticJointDef=function(){t.base(this,e.b2JointType.e_prismaticJoint),this.localAnchorA=new e.b2Vec2,this.localAnchorB=new e.b2Vec2,this.localAxisA=new e.b2Vec2(1,0)},t.inherits(e.b2PrismaticJointDef,e.b2JointDef),e.b2PrismaticJointDef.prototype.localAnchorA=null,e.b2PrismaticJointDef.prototype.localAnchorB=null,e.b2PrismaticJointDef.prototype.localAxisA=null,e.b2PrismaticJointDef.prototype.referenceAngle=0,e.b2PrismaticJointDef.prototype.enableLimit=!1,e.b2PrismaticJointDef.prototype.lowerTranslation=0,e.b2PrismaticJointDef.prototype.upperTranslation=0,e.b2PrismaticJointDef.prototype.enableMotor=!1,e.b2PrismaticJointDef.prototype.maxMotorForce=0,e.b2PrismaticJointDef.prototype.motorSpeed=0,e.b2PrismaticJointDef.prototype.Initialize=function(t,e,o,i){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(o,this.localAnchorA),this.bodyB.GetLocalPoint(o,this.localAnchorB),this.bodyA.GetLocalVector(i,this.localAxisA),this.referenceAngle=this.bodyB.GetAngleRadians()-this.bodyA.GetAngleRadians()},e.b2PrismaticJoint=function(o){t.base(this,o),this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_localXAxisA=o.localAxisA.Clone().SelfNormalize(),this.m_localYAxisA=e.b2CrossOneV(this.m_localXAxisA,new e.b2Vec2),this.m_referenceAngle=o.referenceAngle,this.m_impulse=new e.b2Vec3(0,0,0),this.m_lowerTranslation=o.lowerTranslation,this.m_upperTranslation=o.upperTranslation,this.m_maxMotorForce=o.maxMotorForce,this.m_motorSpeed=o.motorSpeed,this.m_enableLimit=o.enableLimit,this.m_enableMotor=o.enableMotor,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_axis=new e.b2Vec2(0,0),this.m_perp=new e.b2Vec2(0,0),this.m_K=new e.b2Mat33,this.m_K3=new e.b2Mat33,this.m_K2=new e.b2Mat22,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2},t.inherits(e.b2PrismaticJoint,e.b2Joint),e.b2PrismaticJoint.prototype.m_localAnchorA=null,e.b2PrismaticJoint.prototype.m_localAnchorB=null,e.b2PrismaticJoint.prototype.m_localXAxisA=null,e.b2PrismaticJoint.prototype.m_localYAxisA=null,e.b2PrismaticJoint.prototype.m_referenceAngle=0,e.b2PrismaticJoint.prototype.m_impulse=null,e.b2PrismaticJoint.prototype.m_motorImpulse=0,e.b2PrismaticJoint.prototype.m_lowerTranslation=0,e.b2PrismaticJoint.prototype.m_upperTranslation=0,e.b2PrismaticJoint.prototype.m_maxMotorForce=0,e.b2PrismaticJoint.prototype.m_motorSpeed=0,e.b2PrismaticJoint.prototype.m_enableLimit=!1,e.b2PrismaticJoint.prototype.m_enableMotor=!1,e.b2PrismaticJoint.prototype.m_limitState=e.b2LimitState.e_inactiveLimit,e.b2PrismaticJoint.prototype.m_indexA=0,e.b2PrismaticJoint.prototype.m_indexB=0,e.b2PrismaticJoint.prototype.m_localCenterA=null,e.b2PrismaticJoint.prototype.m_localCenterB=null,e.b2PrismaticJoint.prototype.m_invMassA=0,e.b2PrismaticJoint.prototype.m_invMassB=0,e.b2PrismaticJoint.prototype.m_invIA=0,e.b2PrismaticJoint.prototype.m_invIB=0,e.b2PrismaticJoint.prototype.m_axis=null,e.b2PrismaticJoint.prototype.m_perp=null,e.b2PrismaticJoint.prototype.m_s1=0,e.b2PrismaticJoint.prototype.m_s2=0,e.b2PrismaticJoint.prototype.m_a1=0,e.b2PrismaticJoint.prototype.m_a2=0,e.b2PrismaticJoint.prototype.m_K=null,e.b2PrismaticJoint.prototype.m_K3=null,e.b2PrismaticJoint.prototype.m_K2=null,e.b2PrismaticJoint.prototype.m_motorMass=0,e.b2PrismaticJoint.prototype.m_qA=null,e.b2PrismaticJoint.prototype.m_qB=null,e.b2PrismaticJoint.prototype.m_lalcA=null,e.b2PrismaticJoint.prototype.m_lalcB=null,e.b2PrismaticJoint.prototype.m_rA=null,e.b2PrismaticJoint.prototype.m_rB=null,e.b2PrismaticJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.velocities[this.m_indexA].v,s=t.velocities[this.m_indexA].w,r=t.positions[this.m_indexB].c,a=t.positions[this.m_indexB].a,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=this.m_qA.SetAngleRadians(i),_=this.m_qB.SetAngleRadians(a);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var b=e.b2MulRV(m,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var h=e.b2MulRV(_,this.m_lalcB,this.m_rB),c=e.b2AddVV(e.b2SubVV(r,o,e.b2Vec2.s_t0),e.b2SubVV(h,b,e.b2Vec2.s_t1),e.b2PrismaticJoint.prototype.InitVelocityConstraints.s_d),u=this.m_invMassA,y=this.m_invMassB,d=this.m_invIA,f=this.m_invIB;if(e.b2MulRV(m,this.m_localXAxisA,this.m_axis),this.m_a1=e.b2CrossVV(e.b2AddVV(c,b,e.b2Vec2.s_t0),this.m_axis),this.m_a2=e.b2CrossVV(h,this.m_axis),this.m_motorMass=u+y+d*this.m_a1*this.m_a1+f*this.m_a2*this.m_a2,this.m_motorMass>0&&(this.m_motorMass=1/this.m_motorMass),e.b2MulRV(m,this.m_localYAxisA,this.m_perp),this.m_s1=e.b2CrossVV(e.b2AddVV(c,b,e.b2Vec2.s_t0),this.m_perp),this.m_s2=e.b2CrossVV(h,this.m_perp),this.m_K.ex.x=u+y+d*this.m_s1*this.m_s1+f*this.m_s2*this.m_s2,this.m_K.ex.y=d*this.m_s1+f*this.m_s2,this.m_K.ex.z=d*this.m_s1*this.m_a1+f*this.m_s2*this.m_a2,this.m_K.ey.x=this.m_K.ex.y,this.m_K.ey.y=d+f,0==this.m_K.ey.y&&(this.m_K.ey.y=1),this.m_K.ey.z=d*this.m_a1+f*this.m_a2,this.m_K.ez.x=this.m_K.ex.z,this.m_K.ez.y=this.m_K.ey.z,this.m_K.ez.z=u+y+d*this.m_a1*this.m_a1+f*this.m_a2*this.m_a2,this.m_enableLimit){var A=e.b2DotVV(this.m_axis,c);e.b2Abs(this.m_upperTranslation-this.m_lowerTranslation)<2*e.b2_linearSlop?this.m_limitState=e.b2LimitState.e_equalLimits:A<=this.m_lowerTranslation?this.m_limitState!=e.b2LimitState.e_atLowerLimit&&(this.m_limitState=e.b2LimitState.e_atLowerLimit,this.m_impulse.z=0):A>=this.m_upperTranslation?this.m_limitState!=e.b2LimitState.e_atUpperLimit&&(this.m_limitState=e.b2LimitState.e_atUpperLimit,this.m_impulse.z=0):(this.m_limitState=e.b2LimitState.e_inactiveLimit,this.m_impulse.z=0)}else this.m_limitState=e.b2LimitState.e_inactiveLimit,this.m_impulse.z=0;if(0==this.m_enableMotor&&(this.m_motorImpulse=0),t.step.warmStarting){this.m_impulse.SelfMul(t.step.dtRatio),this.m_motorImpulse*=t.step.dtRatio;var S=e.b2AddVV(e.b2MulSV(this.m_impulse.x,this.m_perp,e.b2Vec2.s_t0),e.b2MulSV(this.m_motorImpulse+this.m_impulse.z,this.m_axis,e.b2Vec2.s_t1),e.b2PrismaticJoint.prototype.InitVelocityConstraints.s_P),C=this.m_impulse.x*this.m_s1+this.m_impulse.y+(this.m_motorImpulse+this.m_impulse.z)*this.m_a1,v=this.m_impulse.x*this.m_s2+this.m_impulse.y+(this.m_motorImpulse+this.m_impulse.z)*this.m_a2;n.SelfMulSub(u,S),s-=d*C,l.SelfMulAdd(y,S),p+=f*v}else this.m_impulse.SetZero(),this.m_motorImpulse=0;t.velocities[this.m_indexA].w=s,t.velocities[this.m_indexB].w=p},e.b2PrismaticJoint.prototype.InitVelocityConstraints.s_d=new e.b2Vec2,e.b2PrismaticJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_invMassA,a=this.m_invMassB,l=this.m_invIA,p=this.m_invIB;if(this.m_enableMotor&&this.m_limitState!=e.b2LimitState.e_equalLimits){var m=e.b2DotVV(this.m_axis,e.b2SubVV(n,o,e.b2Vec2.s_t0))+this.m_a2*s-this.m_a1*i,_=this.m_motorMass*(this.m_motorSpeed-m),b=this.m_motorImpulse,h=t.step.dt*this.m_maxMotorForce;this.m_motorImpulse=e.b2Clamp(this.m_motorImpulse+_,-h,h),_=this.m_motorImpulse-b;var c=e.b2MulSV(_,this.m_axis,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P),u=_*this.m_a1,y=_*this.m_a2;o.SelfMulSub(r,c),i-=l*u,n.SelfMulAdd(a,c),s+=p*y}var d=e.b2DotVV(this.m_perp,e.b2SubVV(n,o,e.b2Vec2.s_t0))+this.m_s2*s-this.m_s1*i,f=s-i;if(this.m_enableLimit&&this.m_limitState!=e.b2LimitState.e_inactiveLimit){var A=e.b2DotVV(this.m_axis,e.b2SubVV(n,o,e.b2Vec2.s_t0))+this.m_a2*s-this.m_a1*i,S=e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f1.Copy(this.m_impulse),C=this.m_K.Solve33(-d,-f,-A,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df3);this.m_impulse.SelfAdd(C),this.m_limitState==e.b2LimitState.e_atLowerLimit?this.m_impulse.z=e.b2Max(this.m_impulse.z,0):this.m_limitState==e.b2LimitState.e_atUpperLimit&&(this.m_impulse.z=e.b2Min(this.m_impulse.z,0));var v=-d-(this.m_impulse.z-S.z)*this.m_K.ez.x,x=-f-(this.m_impulse.z-S.z)*this.m_K.ez.y,V=this.m_K.Solve22(v,x,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f2r);V.x+=S.x,V.y+=S.y,this.m_impulse.x=V.x,this.m_impulse.y=V.y,C.x=this.m_impulse.x-S.x,C.y=this.m_impulse.y-S.y,C.z=this.m_impulse.z-S.z;var c=e.b2AddVV(e.b2MulSV(C.x,this.m_perp,e.b2Vec2.s_t0),e.b2MulSV(C.z,this.m_axis,e.b2Vec2.s_t1),e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P),u=C.x*this.m_s1+C.y+C.z*this.m_a1,y=C.x*this.m_s2+C.y+C.z*this.m_a2;o.SelfMulSub(r,c),i-=l*u,n.SelfMulAdd(a,c),s+=p*y}else{var C=this.m_K.Solve22(-d,-f,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df2);this.m_impulse.x+=C.x,this.m_impulse.y+=C.y;var c=e.b2MulSV(C.x,this.m_perp,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P),u=C.x*this.m_s1+C.y,y=C.x*this.m_s2+C.y;o.SelfMulSub(r,c),i-=l*u,n.SelfMulAdd(a,c),s+=p*y}t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f2r=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f1=new e.b2Vec3,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df3=new e.b2Vec3,e.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df2=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s),l=this.m_invMassA,p=this.m_invMassB,m=this.m_invIA,_=this.m_invIB,b=e.b2MulRV(r,this.m_lalcA,this.m_rA),h=e.b2MulRV(a,this.m_lalcB,this.m_rB),c=e.b2SubVV(e.b2AddVV(n,h,e.b2Vec2.s_t0),e.b2AddVV(o,b,e.b2Vec2.s_t1),e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_d),u=e.b2MulRV(r,this.m_localXAxisA,this.m_axis),y=e.b2CrossVV(e.b2AddVV(c,b,e.b2Vec2.s_t0),u),d=e.b2CrossVV(h,u),f=e.b2MulRV(r,this.m_localYAxisA,this.m_perp),A=e.b2CrossVV(e.b2AddVV(c,b,e.b2Vec2.s_t0),f),S=e.b2CrossVV(h,f),C=e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse,v=e.b2DotVV(f,c),x=s-i-this.m_referenceAngle,V=e.b2Abs(v),g=e.b2Abs(x),B=!1,w=0;
	if(this.m_enableLimit){var M=e.b2DotVV(u,c);e.b2Abs(this.m_upperTranslation-this.m_lowerTranslation)<2*e.b2_linearSlop?(w=e.b2Clamp(M,-e.b2_maxLinearCorrection,e.b2_maxLinearCorrection),V=e.b2Max(V,e.b2Abs(M)),B=!0):M<=this.m_lowerTranslation?(w=e.b2Clamp(M-this.m_lowerTranslation+e.b2_linearSlop,-e.b2_maxLinearCorrection,0),V=e.b2Max(V,this.m_lowerTranslation-M),B=!0):M>=this.m_upperTranslation&&(w=e.b2Clamp(M-this.m_upperTranslation-e.b2_linearSlop,0,e.b2_maxLinearCorrection),V=e.b2Max(V,M-this.m_upperTranslation),B=!0)}if(B){var J=l+p+m*A*A+_*S*S,P=m*A+_*S,T=m*A*y+_*S*d,D=m+_;0==D&&(D=1);var R=m*y+_*d,I=l+p+m*y*y+_*d*d,L=this.m_K3;L.ex.Set(J,P,T),L.ey.Set(P,D,R),L.ez.Set(T,R,I),C=L.Solve33(-v,-x,-w,C)}else{var J=l+p+m*A*A+_*S*S,P=m*A+_*S,D=m+_;0==D&&(D=1);var E=this.m_K2;E.ex.Set(J,P),E.ey.Set(P,D);var F=E.Solve(-v,-x,e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse1);C.x=F.x,C.y=F.y,C.z=0}var G=e.b2AddVV(e.b2MulSV(C.x,f,e.b2Vec2.s_t0),e.b2MulSV(C.z,u,e.b2Vec2.s_t1),e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_P),N=C.x*A+C.y+C.z*y,k=C.x*S+C.y+C.z*d;return o.SelfMulSub(l,G),i-=m*N,n.SelfMulAdd(p,G),s+=_*k,t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,V<=e.b2_linearSlop&&g<=e.b2_angularSlop},e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_d=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse=new e.b2Vec3,e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse1=new e.b2Vec2,e.b2PrismaticJoint.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e.b2PrismaticJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2PrismaticJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2PrismaticJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*(this.m_impulse.x*this.m_perp.x+(this.m_motorImpulse+this.m_impulse.z)*this.m_axis.x),t*(this.m_impulse.x*this.m_perp.y+(this.m_motorImpulse+this.m_impulse.z)*this.m_axis.y))},e.b2PrismaticJoint.prototype.GetReactionTorque=function(t){return t*this.m_impulse.y},e.b2PrismaticJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2PrismaticJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2PrismaticJoint.prototype.GetLocalAxisA=function(t){return t.Copy(this.m_localXAxisA)},e.b2PrismaticJoint.prototype.GetReferenceAngle=function(){return this.m_referenceAngle},e.b2PrismaticJoint.prototype.GetJointTranslation=function(){var t=this.m_bodyA.GetWorldPoint(this.m_localAnchorA,e.b2PrismaticJoint.prototype.GetJointTranslation.s_pA),o=this.m_bodyB.GetWorldPoint(this.m_localAnchorB,e.b2PrismaticJoint.prototype.GetJointTranslation.s_pB),i=e.b2SubVV(o,t,e.b2PrismaticJoint.prototype.GetJointTranslation.s_d),n=this.m_bodyA.GetWorldVector(this.m_localXAxisA,e.b2PrismaticJoint.prototype.GetJointTranslation.s_axis),s=e.b2DotVV(i,n);return s},e.b2PrismaticJoint.prototype.GetJointTranslation.s_pA=new e.b2Vec2,e.b2PrismaticJoint.prototype.GetJointTranslation.s_pB=new e.b2Vec2,e.b2PrismaticJoint.prototype.GetJointTranslation.s_d=new e.b2Vec2,e.b2PrismaticJoint.prototype.GetJointTranslation.s_axis=new e.b2Vec2,e.b2PrismaticJoint.prototype.GetJointSpeed=function(){var t=this.m_bodyA,o=this.m_bodyB;e.b2SubVV(this.m_localAnchorA,t.m_sweep.localCenter,this.m_lalcA);var i=e.b2MulRV(t.m_xf.q,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,o.m_sweep.localCenter,this.m_lalcB);var n=e.b2MulRV(o.m_xf.q,this.m_lalcB,this.m_rB),s=e.b2AddVV(t.m_sweep.c,i,e.b2Vec2.s_t0),r=e.b2AddVV(o.m_sweep.c,n,e.b2Vec2.s_t1),a=e.b2SubVV(r,s,e.b2Vec2.s_t2),l=t.GetWorldVector(this.m_localXAxisA,this.m_axis),p=t.m_linearVelocity,m=o.m_linearVelocity,_=t.m_angularVelocity,b=o.m_angularVelocity,h=e.b2DotVV(a,e.b2CrossSV(_,l,e.b2Vec2.s_t0))+e.b2DotVV(l,e.b2SubVV(e.b2AddVCrossSV(m,b,n,e.b2Vec2.s_t0),e.b2AddVCrossSV(p,_,i,e.b2Vec2.s_t1),e.b2Vec2.s_t0));return h},e.b2PrismaticJoint.prototype.IsLimitEnabled=function(){return this.m_enableLimit},e.b2PrismaticJoint.prototype.EnableLimit=function(t){t!=this.m_enableLimit&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_enableLimit=t,this.m_impulse.z=0)},e.b2PrismaticJoint.prototype.GetLowerLimit=function(){return this.m_lowerTranslation},e.b2PrismaticJoint.prototype.GetUpperLimit=function(){return this.m_upperTranslation},e.b2PrismaticJoint.prototype.SetLimits=function(t,e){(t!=this.m_lowerTranslation||e!=this.m_upperTranslation)&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_lowerTranslation=t,this.m_upperTranslation=e,this.m_impulse.z=0)},e.b2PrismaticJoint.prototype.IsMotorEnabled=function(){return this.m_enableMotor},e.b2PrismaticJoint.prototype.EnableMotor=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_enableMotor=t},e.b2PrismaticJoint.prototype.SetMotorSpeed=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_motorSpeed=t},e.b2PrismaticJoint.prototype.GetMotorSpeed=function(){return this.m_motorSpeed},e.b2PrismaticJoint.prototype.SetMaxMotorForce=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_maxMotorForce=t},e.b2PrismaticJoint.prototype.GetMaxMotorForce=function(){return this.m_maxMotorForce},e.b2PrismaticJoint.prototype.GetMotorForce=function(t){return t*this.m_motorImpulse},e.b2PrismaticJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2PrismaticJointDef*/ var jd = new box2d.b2PrismaticJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.localAxisA.Set(%.15f, %.15f);\n",this.m_localXAxisA.x,this.m_localXAxisA.y),e.b2Log("  jd.referenceAngle = %.15f;\n",this.m_referenceAngle),e.b2Log("  jd.enableLimit = %s;\n",this.m_enableLimit?"true":"false"),e.b2Log("  jd.lowerTranslation = %.15f;\n",this.m_lowerTranslation),e.b2Log("  jd.upperTranslation = %.15f;\n",this.m_upperTranslation),e.b2Log("  jd.enableMotor = %s;\n",this.m_enableMotor?"true":"false"),e.b2Log("  jd.motorSpeed = %.15f;\n",this.m_motorSpeed),e.b2Log("  jd.maxMotorForce = %.15f;\n",this.m_maxMotorForce),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),J=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2RevoluteJoint&&(e.b2RevoluteJoint={}),e.b2RevoluteJointDef=function(){t.base(this,e.b2JointType.e_revoluteJoint),this.localAnchorA=new e.b2Vec2(0,0),this.localAnchorB=new e.b2Vec2(0,0)},t.inherits(e.b2RevoluteJointDef,e.b2JointDef),e.b2RevoluteJointDef.prototype.localAnchorA=null,e.b2RevoluteJointDef.prototype.localAnchorB=null,e.b2RevoluteJointDef.prototype.referenceAngle=0,e.b2RevoluteJointDef.prototype.enableLimit=!1,e.b2RevoluteJointDef.prototype.lowerAngle=0,e.b2RevoluteJointDef.prototype.upperAngle=0,e.b2RevoluteJointDef.prototype.enableMotor=!1,e.b2RevoluteJointDef.prototype.motorSpeed=0,e.b2RevoluteJointDef.prototype.maxMotorTorque=0,e.b2RevoluteJointDef.prototype.Initialize=function(t,e,o){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(o,this.localAnchorA),this.bodyB.GetLocalPoint(o,this.localAnchorB),this.referenceAngle=this.bodyB.GetAngleRadians()-this.bodyA.GetAngleRadians()},e.b2RevoluteJoint=function(o){t.base(this,o),this.m_localAnchorA=new e.b2Vec2,this.m_localAnchorB=new e.b2Vec2,this.m_impulse=new e.b2Vec3,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_mass=new e.b2Mat33,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_K=new e.b2Mat22,this.m_localAnchorA.Copy(o.localAnchorA),this.m_localAnchorB.Copy(o.localAnchorB),this.m_referenceAngle=o.referenceAngle,this.m_impulse.SetZero(),this.m_motorImpulse=0,this.m_lowerAngle=o.lowerAngle,this.m_upperAngle=o.upperAngle,this.m_maxMotorTorque=o.maxMotorTorque,this.m_motorSpeed=o.motorSpeed,this.m_enableLimit=o.enableLimit,this.m_enableMotor=o.enableMotor,this.m_limitState=e.b2LimitState.e_inactiveLimit},t.inherits(e.b2RevoluteJoint,e.b2Joint),e.b2RevoluteJoint.prototype.m_localAnchorA=null,e.b2RevoluteJoint.prototype.m_localAnchorB=null,e.b2RevoluteJoint.prototype.m_impulse=null,e.b2RevoluteJoint.prototype.m_motorImpulse=0,e.b2RevoluteJoint.prototype.m_enableMotor=!1,e.b2RevoluteJoint.prototype.m_maxMotorTorque=0,e.b2RevoluteJoint.prototype.m_motorSpeed=0,e.b2RevoluteJoint.prototype.m_enableLimit=!1,e.b2RevoluteJoint.prototype.m_referenceAngle=0,e.b2RevoluteJoint.prototype.m_lowerAngle=0,e.b2RevoluteJoint.prototype.m_upperAngle=0,e.b2RevoluteJoint.prototype.m_indexA=0,e.b2RevoluteJoint.prototype.m_indexB=0,e.b2RevoluteJoint.prototype.m_rA=null,e.b2RevoluteJoint.prototype.m_rB=null,e.b2RevoluteJoint.prototype.m_localCenterA=null,e.b2RevoluteJoint.prototype.m_localCenterB=null,e.b2RevoluteJoint.prototype.m_invMassA=0,e.b2RevoluteJoint.prototype.m_invMassB=0,e.b2RevoluteJoint.prototype.m_invIA=0,e.b2RevoluteJoint.prototype.m_invIB=0,e.b2RevoluteJoint.prototype.m_mass=null,e.b2RevoluteJoint.prototype.m_motorMass=0,e.b2RevoluteJoint.prototype.m_limitState=e.b2LimitState.e_inactiveLimit,e.b2RevoluteJoint.prototype.m_qA=null,e.b2RevoluteJoint.prototype.m_qB=null,e.b2RevoluteJoint.prototype.m_lalcA=null,e.b2RevoluteJoint.prototype.m_lalcB=null,e.b2RevoluteJoint.prototype.m_K=null,e.b2RevoluteJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].a,i=t.velocities[this.m_indexA].v,n=t.velocities[this.m_indexA].w,s=t.positions[this.m_indexB].a,r=t.velocities[this.m_indexB].v,a=t.velocities[this.m_indexB].w,l=this.m_qA.SetAngleRadians(o),p=this.m_qB.SetAngleRadians(s);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA),e.b2MulRV(l,this.m_lalcA,this.m_rA),e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(p,this.m_lalcB,this.m_rB);var m=this.m_invMassA,_=this.m_invMassB,b=this.m_invIA,h=this.m_invIB,c=b+h==0;if(this.m_mass.ex.x=m+_+this.m_rA.y*this.m_rA.y*b+this.m_rB.y*this.m_rB.y*h,this.m_mass.ey.x=-this.m_rA.y*this.m_rA.x*b-this.m_rB.y*this.m_rB.x*h,this.m_mass.ez.x=-this.m_rA.y*b-this.m_rB.y*h,this.m_mass.ex.y=this.m_mass.ey.x,this.m_mass.ey.y=m+_+this.m_rA.x*this.m_rA.x*b+this.m_rB.x*this.m_rB.x*h,this.m_mass.ez.y=this.m_rA.x*b+this.m_rB.x*h,this.m_mass.ex.z=this.m_mass.ez.x,this.m_mass.ey.z=this.m_mass.ez.y,this.m_mass.ez.z=b+h,this.m_motorMass=b+h,this.m_motorMass>0&&(this.m_motorMass=1/this.m_motorMass),(0==this.m_enableMotor||c)&&(this.m_motorImpulse=0),this.m_enableLimit&&0==c){var u=s-o-this.m_referenceAngle;e.b2Abs(this.m_upperAngle-this.m_lowerAngle)<2*e.b2_angularSlop?this.m_limitState=e.b2LimitState.e_equalLimits:u<=this.m_lowerAngle?(this.m_limitState!=e.b2LimitState.e_atLowerLimit&&(this.m_impulse.z=0),this.m_limitState=e.b2LimitState.e_atLowerLimit):u>=this.m_upperAngle?(this.m_limitState!=e.b2LimitState.e_atUpperLimit&&(this.m_impulse.z=0),this.m_limitState=e.b2LimitState.e_atUpperLimit):(this.m_limitState=e.b2LimitState.e_inactiveLimit,this.m_impulse.z=0)}else this.m_limitState=e.b2LimitState.e_inactiveLimit;if(t.step.warmStarting){this.m_impulse.SelfMul(t.step.dtRatio),this.m_motorImpulse*=t.step.dtRatio;var y=e.b2RevoluteJoint.prototype.InitVelocityConstraints.s_P.Set(this.m_impulse.x,this.m_impulse.y);i.SelfMulSub(m,y),n-=b*(e.b2CrossVV(this.m_rA,y)+this.m_motorImpulse+this.m_impulse.z),r.SelfMulAdd(_,y),a+=h*(e.b2CrossVV(this.m_rB,y)+this.m_motorImpulse+this.m_impulse.z)}else this.m_impulse.SetZero(),this.m_motorImpulse=0;t.velocities[this.m_indexA].w=n,t.velocities[this.m_indexB].w=a},e.b2RevoluteJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_invMassA,a=this.m_invMassB,l=this.m_invIA,p=this.m_invIB,m=l+p==0;if(this.m_enableMotor&&this.m_limitState!=e.b2LimitState.e_equalLimits&&0==m){var _=s-i-this.m_motorSpeed,b=-this.m_motorMass*_,h=this.m_motorImpulse,c=t.step.dt*this.m_maxMotorTorque;this.m_motorImpulse=e.b2Clamp(this.m_motorImpulse+b,-c,c),b=this.m_motorImpulse-h,i-=l*b,s+=p*b}if(this.m_enableLimit&&this.m_limitState!=e.b2LimitState.e_inactiveLimit&&0==m){var u=e.b2SubVV(e.b2AddVCrossSV(n,s,this.m_rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(o,i,this.m_rA,e.b2Vec2.s_t1),e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot1),y=s-i,b=this.m_mass.Solve33(u.x,u.y,y,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse3).SelfNeg();if(this.m_limitState==e.b2LimitState.e_equalLimits)this.m_impulse.SelfAdd(b);else if(this.m_limitState==e.b2LimitState.e_atLowerLimit){var d=this.m_impulse.z+b.z;if(0>d){var f=-u.x+this.m_impulse.z*this.m_mass.ez.x,A=-u.y+this.m_impulse.z*this.m_mass.ez.y,S=this.m_mass.Solve22(f,A,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced);b.x=S.x,b.y=S.y,b.z=-this.m_impulse.z,this.m_impulse.x+=S.x,this.m_impulse.y+=S.y,this.m_impulse.z=0}else this.m_impulse.SelfAdd(b)}else if(this.m_limitState==e.b2LimitState.e_atUpperLimit){var d=this.m_impulse.z+b.z;if(d>0){var f=-u.x+this.m_impulse.z*this.m_mass.ez.x,A=-u.y+this.m_impulse.z*this.m_mass.ez.y,S=this.m_mass.Solve22(f,A,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced);b.x=S.x,b.y=S.y,b.z=-this.m_impulse.z,this.m_impulse.x+=S.x,this.m_impulse.y+=S.y,this.m_impulse.z=0}else this.m_impulse.SelfAdd(b)}var C=e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_P.Set(b.x,b.y);o.SelfMulSub(r,C),i-=l*(e.b2CrossVV(this.m_rA,C)+b.z),n.SelfMulAdd(a,C),s+=p*(e.b2CrossVV(this.m_rB,C)+b.z)}else{var _=e.b2SubVV(e.b2AddVCrossSV(n,s,this.m_rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(o,i,this.m_rA,e.b2Vec2.s_t1),e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot),b=this.m_mass.Solve22(-_.x,-_.y,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse2);this.m_impulse.x+=b.x,this.m_impulse.y+=b.y,o.SelfMulSub(r,b),i-=l*e.b2CrossVV(this.m_rA,b),n.SelfMulAdd(a,b),s+=p*e.b2CrossVV(this.m_rB,b)}t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot1=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse3=new e.b2Vec3,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse2=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s),l=0,p=0,m=this.m_invIA+this.m_invIB==0;if(this.m_enableLimit&&this.m_limitState!=e.b2LimitState.e_inactiveLimit&&0==m){var _=s-i-this.m_referenceAngle,b=0;if(this.m_limitState==e.b2LimitState.e_equalLimits){var h=e.b2Clamp(_-this.m_lowerAngle,-e.b2_maxAngularCorrection,e.b2_maxAngularCorrection);b=-this.m_motorMass*h,l=e.b2Abs(h)}else if(this.m_limitState==e.b2LimitState.e_atLowerLimit){var h=_-this.m_lowerAngle;l=-h,h=e.b2Clamp(h+e.b2_angularSlop,-e.b2_maxAngularCorrection,0),b=-this.m_motorMass*h}else if(this.m_limitState==e.b2LimitState.e_atUpperLimit){var h=_-this.m_upperAngle;l=h,h=e.b2Clamp(h-e.b2_angularSlop,0,e.b2_maxAngularCorrection),b=-this.m_motorMass*h}i-=this.m_invIA*b,s+=this.m_invIB*b}r.SetAngleRadians(i),a.SetAngleRadians(s),e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var c=e.b2MulRV(r,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var u=e.b2MulRV(a,this.m_lalcB,this.m_rB),h=e.b2SubVV(e.b2AddVV(n,u,e.b2Vec2.s_t0),e.b2AddVV(o,c,e.b2Vec2.s_t1),e.b2RevoluteJoint.prototype.SolvePositionConstraints.s_C);p=h.GetLength();var y=this.m_invMassA,d=this.m_invMassB,f=this.m_invIA,A=this.m_invIB,S=this.m_K;S.ex.x=y+d+f*c.y*c.y+A*u.y*u.y,S.ex.y=-f*c.x*c.y-A*u.x*u.y,S.ey.x=S.ex.y,S.ey.y=y+d+f*c.x*c.x+A*u.x*u.x;var C=S.Solve(h.x,h.y,e.b2RevoluteJoint.prototype.SolvePositionConstraints.s_impulse).SelfNeg();return o.SelfMulSub(y,C),i-=f*e.b2CrossVV(c,C),n.SelfMulAdd(d,C),s+=A*e.b2CrossVV(u,C),t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,p<=e.b2_linearSlop&&l<=e.b2_angularSlop},e.b2RevoluteJoint.prototype.SolvePositionConstraints.s_C=new e.b2Vec2,e.b2RevoluteJoint.prototype.SolvePositionConstraints.s_impulse=new e.b2Vec2,e.b2RevoluteJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2RevoluteJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2RevoluteJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*this.m_impulse.x,t*this.m_impulse.y)},e.b2RevoluteJoint.prototype.GetReactionTorque=function(t){return t*this.m_impulse.z},e.b2RevoluteJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2RevoluteJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2RevoluteJoint.prototype.GetReferenceAngle=function(){return this.m_referenceAngle},e.b2RevoluteJoint.prototype.GetJointAngleRadians=function(){return this.m_bodyB.m_sweep.a-this.m_bodyA.m_sweep.a-this.m_referenceAngle},e.b2RevoluteJoint.prototype.GetJointSpeed=function(){return this.m_bodyB.m_angularVelocity-this.m_bodyA.m_angularVelocity},e.b2RevoluteJoint.prototype.IsMotorEnabled=function(){return this.m_enableMotor},e.b2RevoluteJoint.prototype.EnableMotor=function(t){this.m_enableMotor!=t&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_enableMotor=t)},e.b2RevoluteJoint.prototype.GetMotorTorque=function(t){return t*this.m_motorImpulse},e.b2RevoluteJoint.prototype.GetMotorSpeed=function(){return this.m_motorSpeed},e.b2RevoluteJoint.prototype.SetMaxMotorTorque=function(t){this.m_maxMotorTorque=t},e.b2RevoluteJoint.prototype.GetMaxMotorTorque=function(){return this.m_maxMotorTorque},e.b2RevoluteJoint.prototype.IsLimitEnabled=function(){return this.m_enableLimit},e.b2RevoluteJoint.prototype.EnableLimit=function(t){t!=this.m_enableLimit&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_enableLimit=t,this.m_impulse.z=0)},e.b2RevoluteJoint.prototype.GetLowerLimit=function(){return this.m_lowerAngle},e.b2RevoluteJoint.prototype.GetUpperLimit=function(){return this.m_upperAngle},e.b2RevoluteJoint.prototype.SetLimits=function(t,e){(t!=this.m_lowerAngle||e!=this.m_upperAngle)&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_impulse.z=0,this.m_lowerAngle=t,this.m_upperAngle=e)},e.b2RevoluteJoint.prototype.SetMotorSpeed=function(t){this.m_motorSpeed!=t&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_motorSpeed=t)},e.b2RevoluteJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2RevoluteJointDef*/ var jd = new box2d.b2RevoluteJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.referenceAngle = %.15f;\n",this.m_referenceAngle),e.b2Log("  jd.enableLimit = %s;\n",this.m_enableLimit?"true":"false"),e.b2Log("  jd.lowerAngle = %.15f;\n",this.m_lowerAngle),e.b2Log("  jd.upperAngle = %.15f;\n",this.m_upperAngle),e.b2Log("  jd.enableMotor = %s;\n",this.m_enableMotor?"true":"false"),e.b2Log("  jd.motorSpeed = %.15f;\n",this.m_motorSpeed),e.b2Log("  jd.maxMotorTorque = %.15f;\n",this.m_maxMotorTorque),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),P=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2GearJoint&&(e.b2GearJoint={}),e.b2GearJointDef=function(){t.base(this,e.b2JointType.e_gearJoint)},t.inherits(e.b2GearJointDef,e.b2JointDef),e.b2GearJointDef.prototype.joint1=null,e.b2GearJointDef.prototype.joint2=null,e.b2GearJointDef.prototype.ratio=1,e.b2GearJoint=function(o){t.base(this,o),this.m_joint1=o.joint1,this.m_joint2=o.joint2,this.m_localAnchorA=new e.b2Vec2,this.m_localAnchorB=new e.b2Vec2,this.m_localAnchorC=new e.b2Vec2,this.m_localAnchorD=new e.b2Vec2,this.m_localAxisC=new e.b2Vec2,this.m_localAxisD=new e.b2Vec2,this.m_lcA=new e.b2Vec2,this.m_lcB=new e.b2Vec2,this.m_lcC=new e.b2Vec2,this.m_lcD=new e.b2Vec2,this.m_JvAC=new e.b2Vec2,this.m_JvBD=new e.b2Vec2,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_qC=new e.b2Rot,this.m_qD=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_lalcC=new e.b2Vec2,this.m_lalcD=new e.b2Vec2,this.m_typeA=this.m_joint1.GetType(),this.m_typeB=this.m_joint2.GetType(),e.ENABLE_ASSERTS&&e.b2Assert(this.m_typeA==e.b2JointType.e_revoluteJoint||this.m_typeA==e.b2JointType.e_prismaticJoint),e.ENABLE_ASSERTS&&e.b2Assert(this.m_typeB==e.b2JointType.e_revoluteJoint||this.m_typeB==e.b2JointType.e_prismaticJoint);var i,n;this.m_bodyC=this.m_joint1.GetBodyA(),this.m_bodyA=this.m_joint1.GetBodyB();var s=this.m_bodyA.m_xf,r=this.m_bodyA.m_sweep.a,a=this.m_bodyC.m_xf,l=this.m_bodyC.m_sweep.a;if(this.m_typeA==e.b2JointType.e_revoluteJoint){var p=o.joint1;this.m_localAnchorC.Copy(p.m_localAnchorA),this.m_localAnchorA.Copy(p.m_localAnchorB),this.m_referenceAngleA=p.m_referenceAngle,this.m_localAxisC.SetZero(),i=r-l-this.m_referenceAngleA}else{var m=o.joint1;this.m_localAnchorC.Copy(m.m_localAnchorA),this.m_localAnchorA.Copy(m.m_localAnchorB),this.m_referenceAngleA=m.m_referenceAngle,this.m_localAxisC.Copy(m.m_localXAxisA);var _=this.m_localAnchorC,b=e.b2MulTRV(a.q,e.b2AddVV(e.b2MulRV(s.q,this.m_localAnchorA,e.b2Vec2.s_t0),e.b2SubVV(s.p,a.p,e.b2Vec2.s_t1),e.b2Vec2.s_t0),e.b2Vec2.s_t0);i=e.b2DotVV(e.b2SubVV(b,_,e.b2Vec2.s_t0),this.m_localAxisC)}this.m_bodyD=this.m_joint2.GetBodyA(),this.m_bodyB=this.m_joint2.GetBodyB();var h=this.m_bodyB.m_xf,c=this.m_bodyB.m_sweep.a,u=this.m_bodyD.m_xf,y=this.m_bodyD.m_sweep.a;if(this.m_typeB==e.b2JointType.e_revoluteJoint){var p=o.joint2;this.m_localAnchorD.Copy(p.m_localAnchorA),this.m_localAnchorB.Copy(p.m_localAnchorB),this.m_referenceAngleB=p.m_referenceAngle,this.m_localAxisD.SetZero(),n=c-y-this.m_referenceAngleB}else{var m=o.joint2;this.m_localAnchorD.Copy(m.m_localAnchorA),this.m_localAnchorB.Copy(m.m_localAnchorB),this.m_referenceAngleB=m.m_referenceAngle,this.m_localAxisD.Copy(m.m_localXAxisA);var d=this.m_localAnchorD,f=e.b2MulTRV(u.q,e.b2AddVV(e.b2MulRV(h.q,this.m_localAnchorB,e.b2Vec2.s_t0),e.b2SubVV(h.p,u.p,e.b2Vec2.s_t1),e.b2Vec2.s_t0),e.b2Vec2.s_t0);n=e.b2DotVV(e.b2SubVV(f,d,e.b2Vec2.s_t0),this.m_localAxisD)}this.m_ratio=o.ratio,this.m_constant=i+this.m_ratio*n,this.m_impulse=0},t.inherits(e.b2GearJoint,e.b2Joint),e.b2GearJoint.prototype.m_joint1=null,e.b2GearJoint.prototype.m_joint2=null,e.b2GearJoint.prototype.m_typeA=e.b2JointType.e_unknownJoint,e.b2GearJoint.prototype.m_typeB=e.b2JointType.e_unknownJoint,e.b2GearJoint.prototype.m_bodyC=null,e.b2GearJoint.prototype.m_bodyD=null,e.b2GearJoint.prototype.m_localAnchorA=null,e.b2GearJoint.prototype.m_localAnchorB=null,e.b2GearJoint.prototype.m_localAnchorC=null,e.b2GearJoint.prototype.m_localAnchorD=null,e.b2GearJoint.prototype.m_localAxisC=null,e.b2GearJoint.prototype.m_localAxisD=null,e.b2GearJoint.prototype.m_referenceAngleA=0,e.b2GearJoint.prototype.m_referenceAngleB=0,e.b2GearJoint.prototype.m_constant=0,e.b2GearJoint.prototype.m_ratio=0,e.b2GearJoint.prototype.m_impulse=0,e.b2GearJoint.prototype.m_indexA=0,e.b2GearJoint.prototype.m_indexB=0,e.b2GearJoint.prototype.m_indexC=0,e.b2GearJoint.prototype.m_indexD=0,e.b2GearJoint.prototype.m_lcA=null,e.b2GearJoint.prototype.m_lcB=null,e.b2GearJoint.prototype.m_lcC=null,e.b2GearJoint.prototype.m_lcD=null,e.b2GearJoint.prototype.m_mA=0,e.b2GearJoint.prototype.m_mB=0,e.b2GearJoint.prototype.m_mC=0,e.b2GearJoint.prototype.m_mD=0,e.b2GearJoint.prototype.m_iA=0,e.b2GearJoint.prototype.m_iB=0,e.b2GearJoint.prototype.m_iC=0,e.b2GearJoint.prototype.m_iD=0,e.b2GearJoint.prototype.m_JvAC=null,e.b2GearJoint.prototype.m_JvBD=null,e.b2GearJoint.prototype.m_JwA=0,e.b2GearJoint.prototype.m_JwB=0,e.b2GearJoint.prototype.m_JwC=0,e.b2GearJoint.prototype.m_JwD=0,e.b2GearJoint.prototype.m_mass=0,e.b2GearJoint.prototype.m_qA=null,e.b2GearJoint.prototype.m_qB=null,e.b2GearJoint.prototype.m_qC=null,e.b2GearJoint.prototype.m_qD=null,e.b2GearJoint.prototype.m_lalcA=null,e.b2GearJoint.prototype.m_lalcB=null,e.b2GearJoint.prototype.m_lalcC=null,e.b2GearJoint.prototype.m_lalcD=null,e.b2GearJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_indexC=this.m_bodyC.m_islandIndex,this.m_indexD=this.m_bodyD.m_islandIndex,this.m_lcA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_lcB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_lcC.Copy(this.m_bodyC.m_sweep.localCenter),this.m_lcD.Copy(this.m_bodyD.m_sweep.localCenter),this.m_mA=this.m_bodyA.m_invMass,this.m_mB=this.m_bodyB.m_invMass,this.m_mC=this.m_bodyC.m_invMass,this.m_mD=this.m_bodyD.m_invMass,this.m_iA=this.m_bodyA.m_invI,this.m_iB=this.m_bodyB.m_invI,this.m_iC=this.m_bodyC.m_invI,this.m_iD=this.m_bodyD.m_invI;var o=t.positions[this.m_indexA].a,i=t.velocities[this.m_indexA].v,n=t.velocities[this.m_indexA].w,s=t.positions[this.m_indexB].a,r=t.velocities[this.m_indexB].v,a=t.velocities[this.m_indexB].w,l=t.positions[this.m_indexC].a,p=t.velocities[this.m_indexC].v,m=t.velocities[this.m_indexC].w,_=t.positions[this.m_indexD].a,b=t.velocities[this.m_indexD].v,h=t.velocities[this.m_indexD].w,c=this.m_qA.SetAngleRadians(o),u=this.m_qB.SetAngleRadians(s),y=this.m_qC.SetAngleRadians(l),d=this.m_qD.SetAngleRadians(_);if(this.m_mass=0,this.m_typeA==e.b2JointType.e_revoluteJoint)this.m_JvAC.SetZero(),this.m_JwA=1,this.m_JwC=1,this.m_mass+=this.m_iA+this.m_iC;else{var f=e.b2MulRV(y,this.m_localAxisC,e.b2GearJoint.prototype.InitVelocityConstraints.s_u);e.b2SubVV(this.m_localAnchorC,this.m_lcC,this.m_lalcC);var A=e.b2MulRV(y,this.m_lalcC,e.b2GearJoint.prototype.InitVelocityConstraints.s_rC);e.b2SubVV(this.m_localAnchorA,this.m_lcA,this.m_lalcA);var S=e.b2MulRV(c,this.m_lalcA,e.b2GearJoint.prototype.InitVelocityConstraints.s_rA);this.m_JvAC.Copy(f),this.m_JwC=e.b2CrossVV(A,f),this.m_JwA=e.b2CrossVV(S,f),this.m_mass+=this.m_mC+this.m_mA+this.m_iC*this.m_JwC*this.m_JwC+this.m_iA*this.m_JwA*this.m_JwA}if(this.m_typeB==e.b2JointType.e_revoluteJoint)this.m_JvBD.SetZero(),this.m_JwB=this.m_ratio,this.m_JwD=this.m_ratio,this.m_mass+=this.m_ratio*this.m_ratio*(this.m_iB+this.m_iD);else{var f=e.b2MulRV(d,this.m_localAxisD,e.b2GearJoint.prototype.InitVelocityConstraints.s_u);e.b2SubVV(this.m_localAnchorD,this.m_lcD,this.m_lalcD);var C=e.b2MulRV(d,this.m_lalcD,e.b2GearJoint.prototype.InitVelocityConstraints.s_rD);e.b2SubVV(this.m_localAnchorB,this.m_lcB,this.m_lalcB);var v=e.b2MulRV(u,this.m_lalcB,e.b2GearJoint.prototype.InitVelocityConstraints.s_rB);e.b2MulSV(this.m_ratio,f,this.m_JvBD),this.m_JwD=this.m_ratio*e.b2CrossVV(C,f),this.m_JwB=this.m_ratio*e.b2CrossVV(v,f),this.m_mass+=this.m_ratio*this.m_ratio*(this.m_mD+this.m_mB)+this.m_iD*this.m_JwD*this.m_JwD+this.m_iB*this.m_JwB*this.m_JwB}this.m_mass=this.m_mass>0?1/this.m_mass:0,t.step.warmStarting?(i.SelfMulAdd(this.m_mA*this.m_impulse,this.m_JvAC),n+=this.m_iA*this.m_impulse*this.m_JwA,r.SelfMulAdd(this.m_mB*this.m_impulse,this.m_JvBD),a+=this.m_iB*this.m_impulse*this.m_JwB,p.SelfMulSub(this.m_mC*this.m_impulse,this.m_JvAC),m-=this.m_iC*this.m_impulse*this.m_JwC,b.SelfMulSub(this.m_mD*this.m_impulse,this.m_JvBD),h-=this.m_iD*this.m_impulse*this.m_JwD):this.m_impulse=0,t.velocities[this.m_indexA].w=n,t.velocities[this.m_indexB].w=a,t.velocities[this.m_indexC].w=m,t.velocities[this.m_indexD].w=h},e.b2GearJoint.prototype.InitVelocityConstraints.s_u=new e.b2Vec2,e.b2GearJoint.prototype.InitVelocityConstraints.s_rA=new e.b2Vec2,e.b2GearJoint.prototype.InitVelocityConstraints.s_rB=new e.b2Vec2,e.b2GearJoint.prototype.InitVelocityConstraints.s_rC=new e.b2Vec2,e.b2GearJoint.prototype.InitVelocityConstraints.s_rD=new e.b2Vec2,e.b2GearJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=t.velocities[this.m_indexC].v,a=t.velocities[this.m_indexC].w,l=t.velocities[this.m_indexD].v,p=t.velocities[this.m_indexD].w,m=e.b2DotVV(this.m_JvAC,e.b2SubVV(o,r,e.b2Vec2.s_t0))+e.b2DotVV(this.m_JvBD,e.b2SubVV(n,l,e.b2Vec2.s_t0));m+=this.m_JwA*i-this.m_JwC*a+(this.m_JwB*s-this.m_JwD*p);var _=-this.m_mass*m;this.m_impulse+=_,o.SelfMulAdd(this.m_mA*_,this.m_JvAC),i+=this.m_iA*_*this.m_JwA,n.SelfMulAdd(this.m_mB*_,this.m_JvBD),s+=this.m_iB*_*this.m_JwB,r.SelfMulSub(this.m_mC*_,this.m_JvAC),a-=this.m_iC*_*this.m_JwC,l.SelfMulSub(this.m_mD*_,this.m_JvBD),p-=this.m_iD*_*this.m_JwD,t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s,t.velocities[this.m_indexC].w=a,t.velocities[this.m_indexD].w=p},e.b2GearJoint.prototype.SolvePositionConstraints=function(t){var o,i,n,s,r,a,l=t.positions[this.m_indexA].c,p=t.positions[this.m_indexA].a,m=t.positions[this.m_indexB].c,_=t.positions[this.m_indexB].a,b=t.positions[this.m_indexC].c,h=t.positions[this.m_indexC].a,c=t.positions[this.m_indexD].c,u=t.positions[this.m_indexD].a,y=this.m_qA.SetAngleRadians(p),d=this.m_qB.SetAngleRadians(_),f=this.m_qC.SetAngleRadians(h),A=this.m_qD.SetAngleRadians(u),S=0,C=this.m_JvAC,v=this.m_JvBD,x=0;if(this.m_typeA==e.b2JointType.e_revoluteJoint)C.SetZero(),n=1,r=1,x+=this.m_iA+this.m_iC,o=p-h-this.m_referenceAngleA;else{var V=e.b2MulRV(f,this.m_localAxisC,e.b2GearJoint.prototype.SolvePositionConstraints.s_u),g=e.b2MulRV(f,this.m_lalcC,e.b2GearJoint.prototype.SolvePositionConstraints.s_rC),B=e.b2MulRV(y,this.m_lalcA,e.b2GearJoint.prototype.SolvePositionConstraints.s_rA);C.Copy(V),r=e.b2CrossVV(g,V),n=e.b2CrossVV(B,V),x+=this.m_mC+this.m_mA+this.m_iC*r*r+this.m_iA*n*n;var w=this.m_lalcC,M=e.b2MulTRV(f,e.b2AddVV(B,e.b2SubVV(l,b,e.b2Vec2.s_t0),e.b2Vec2.s_t0),e.b2Vec2.s_t0);o=e.b2DotVV(e.b2SubVV(M,w,e.b2Vec2.s_t0),this.m_localAxisC)}if(this.m_typeB==e.b2JointType.e_revoluteJoint)v.SetZero(),s=this.m_ratio,a=this.m_ratio,x+=this.m_ratio*this.m_ratio*(this.m_iB+this.m_iD),i=_-u-this.m_referenceAngleB;else{var V=e.b2MulRV(A,this.m_localAxisD,e.b2GearJoint.prototype.SolvePositionConstraints.s_u),J=e.b2MulRV(A,this.m_lalcD,e.b2GearJoint.prototype.SolvePositionConstraints.s_rD),P=e.b2MulRV(d,this.m_lalcB,e.b2GearJoint.prototype.SolvePositionConstraints.s_rB);e.b2MulSV(this.m_ratio,V,v),a=this.m_ratio*e.b2CrossVV(J,V),s=this.m_ratio*e.b2CrossVV(P,V),x+=this.m_ratio*this.m_ratio*(this.m_mD+this.m_mB)+this.m_iD*a*a+this.m_iB*s*s;var T=this.m_lalcD,D=e.b2MulTRV(A,e.b2AddVV(P,e.b2SubVV(m,c,e.b2Vec2.s_t0),e.b2Vec2.s_t0),e.b2Vec2.s_t0);i=e.b2DotVV(e.b2SubVV(D,T,e.b2Vec2.s_t0),this.m_localAxisD)}var R=o+this.m_ratio*i-this.m_constant,I=0;return x>0&&(I=-R/x),l.SelfMulAdd(this.m_mA*I,C),p+=this.m_iA*I*n,m.SelfMulAdd(this.m_mB*I,v),_+=this.m_iB*I*s,b.SelfMulSub(this.m_mC*I,C),h-=this.m_iC*I*r,c.SelfMulSub(this.m_mD*I,v),u-=this.m_iD*I*a,t.positions[this.m_indexA].a=p,t.positions[this.m_indexB].a=_,t.positions[this.m_indexC].a=h,t.positions[this.m_indexD].a=u,S<e.b2_linearSlop
	},e.b2GearJoint.prototype.SolvePositionConstraints.s_u=new e.b2Vec2,e.b2GearJoint.prototype.SolvePositionConstraints.s_rA=new e.b2Vec2,e.b2GearJoint.prototype.SolvePositionConstraints.s_rB=new e.b2Vec2,e.b2GearJoint.prototype.SolvePositionConstraints.s_rC=new e.b2Vec2,e.b2GearJoint.prototype.SolvePositionConstraints.s_rD=new e.b2Vec2,e.b2GearJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2GearJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2GearJoint.prototype.GetReactionForce=function(t,o){return e.b2MulSV(t*this.m_impulse,this.m_JvAC,o)},e.b2GearJoint.prototype.GetReactionTorque=function(t){return t*this.m_impulse*this.m_JwA},e.b2GearJoint.prototype.GetJoint1=function(){return this.m_joint1},e.b2GearJoint.prototype.GetJoint2=function(){return this.m_joint2},e.b2GearJoint.prototype.GetRatio=function(){return this.m_ratio},e.b2GearJoint.prototype.SetRatio=function(t){e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t)),this.m_ratio=t},e.b2GearJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex,i=this.m_joint1.m_index,n=this.m_joint2.m_index;e.b2Log("  /*box2d.b2GearJointDef*/ var jd = new box2d.b2GearJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.joint1 = joints[%d];\n",i),e.b2Log("  jd.joint2 = joints[%d];\n",n),e.b2Log("  jd.ratio = %.15f;\n",this.m_ratio),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,M,J,o),T=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2GravityController&&(e.b2GravityController={}),e.b2GravityController=function(){t.base(this)},t.inherits(e.b2GravityController,e.b2Controller),e.b2GravityController.prototype.G=1,e.b2GravityController.prototype.invSqr=!0,e.b2GravityController.prototype.Step=function(){if(this.invSqr)for(var t=this.m_bodyList;t;t=t.nextBody)for(var o=t.body,i=o.GetWorldCenter(),n=o.GetMass(),s=this.m_bodyList;s!=t;s=s.nextBody){var r=s.body,a=r.GetWorldCenter(),l=r.GetMass(),p=a.x-i.x,m=a.y-i.y,_=p*p+m*m;if(!(_<e.b2_epsilon)){var b=e.b2GravityController.prototype.Step.s_f.Set(p,m);b.SelfMul(this.G/_/e.b2Sqrt(_)*n*l),o.IsAwake()&&o.ApplyForce(b,i),r.IsAwake()&&r.ApplyForce(b.SelfMul(-1),a)}}else for(var t=this.m_bodyList;t;t=t.nextBody)for(var o=t.body,i=o.GetWorldCenter(),n=o.GetMass(),s=this.m_bodyList;s!=t;s=s.nextBody){var r=s.body,a=r.GetWorldCenter(),l=r.GetMass(),p=a.x-i.x,m=a.y-i.y,_=p*p+m*m;if(!(_<e.b2_epsilon)){var b=e.b2GravityController.prototype.Step.s_f.Set(p,m);b.SelfMul(this.G/_*n*l),o.IsAwake()&&o.ApplyForce(b,i),r.IsAwake()&&r.ApplyForce(b.SelfMul(-1),a)}}},e.b2GravityController.prototype.Step.s_f=new e.b2Vec2,e}(e,c,i,o),D=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2MotorJoint&&(e.b2MotorJoint={}),e.b2MotorJointDef=function(){t.base(this,e.b2JointType.e_motorJoint),this.linearOffset=new e.b2Vec2(0,0)},t.inherits(e.b2MotorJointDef,e.b2JointDef),e.b2MotorJointDef.prototype.linearOffset=null,e.b2MotorJointDef.prototype.angularOffset=0,e.b2MotorJointDef.prototype.maxForce=1,e.b2MotorJointDef.prototype.maxTorque=1,e.b2MotorJointDef.prototype.correctionFactor=.3,e.b2MotorJointDef.prototype.Initialize=function(t,e){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(this.bodyB.GetPosition(),this.linearOffset);var o=this.bodyA.GetAngleRadians(),i=this.bodyB.GetAngleRadians();this.angularOffset=i-o},e.b2MotorJoint=function(o){t.base(this,o),this.m_linearOffset=o.linearOffset.Clone(),this.m_linearImpulse=new e.b2Vec2(0,0),this.m_maxForce=o.maxForce,this.m_maxTorque=o.maxTorque,this.m_correctionFactor=o.correctionFactor,this.m_rA=new e.b2Vec2(0,0),this.m_rB=new e.b2Vec2(0,0),this.m_localCenterA=new e.b2Vec2(0,0),this.m_localCenterB=new e.b2Vec2(0,0),this.m_linearError=new e.b2Vec2(0,0),this.m_linearMass=new e.b2Mat22,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_K=new e.b2Mat22},t.inherits(e.b2MotorJoint,e.b2Joint),e.b2MotorJoint.prototype.m_linearOffset=null,e.b2MotorJoint.prototype.m_angularOffset=0,e.b2MotorJoint.prototype.m_linearImpulse=null,e.b2MotorJoint.prototype.m_angularImpulse=0,e.b2MotorJoint.prototype.m_maxForce=0,e.b2MotorJoint.prototype.m_maxTorque=0,e.b2MotorJoint.prototype.m_correctionFactor=.3,e.b2MotorJoint.prototype.m_indexA=0,e.b2MotorJoint.prototype.m_indexB=0,e.b2MotorJoint.prototype.m_rA=null,e.b2MotorJoint.prototype.m_rB=null,e.b2MotorJoint.prototype.m_localCenterA=null,e.b2MotorJoint.prototype.m_localCenterB=null,e.b2MotorJoint.prototype.m_linearError=null,e.b2MotorJoint.prototype.m_angularError=0,e.b2MotorJoint.prototype.m_invMassA=0,e.b2MotorJoint.prototype.m_invMassB=0,e.b2MotorJoint.prototype.m_invIA=0,e.b2MotorJoint.prototype.m_invIB=0,e.b2MotorJoint.prototype.m_linearMass=null,e.b2MotorJoint.prototype.m_angularMass=0,e.b2MotorJoint.prototype.m_qA=null,e.b2MotorJoint.prototype.m_qB=null,e.b2MotorJoint.prototype.m_K=null,e.b2MotorJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetPosition(t)},e.b2MotorJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetPosition(t)},e.b2MotorJoint.prototype.GetReactionForce=function(t,o){return e.b2MulSV(t,this.m_linearImpulse,o)},e.b2MotorJoint.prototype.GetReactionTorque=function(t){return t*this.m_angularImpulse},e.b2MotorJoint.prototype.SetCorrectionFactor=function(t){e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t)&&t>=0&&1>=t),this._correctionFactor=t},e.b2MotorJoint.prototype.GetCorrectionFactor=function(){return this.m_correctionFactor},e.b2MotorJoint.prototype.SetLinearOffset=function(t){e.b2IsEqualToV(t,this.m_linearOffset)||(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_linearOffset.Copy(t))},e.b2MotorJoint.prototype.GetLinearOffset=function(t){return t.Copy(this.m_linearOffset)},e.b2MotorJoint.prototype.SetAngularOffset=function(t){t!=this.m_angularOffset&&(this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_angularOffset=t)},e.b2MotorJoint.prototype.GetAngularOffset=function(){return this.m_angularOffset},e.b2MotorJoint.prototype.SetMaxForce=function(t){e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t)&&t>=0),this.m_maxForce=t},e.b2MotorJoint.prototype.GetMaxForce=function(){return this.m_maxForce},e.b2MotorJoint.prototype.SetMaxTorque=function(t){e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(t)&&t>=0),this.m_maxTorque=t},e.b2MotorJoint.prototype.GetMaxTorque=function(){return this.m_maxTorque},e.b2MotorJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.velocities[this.m_indexA].v,s=t.velocities[this.m_indexA].w,r=t.positions[this.m_indexB].c,a=t.positions[this.m_indexB].a,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=this.m_qA.SetAngleRadians(i),_=this.m_qB.SetAngleRadians(a),b=e.b2MulRV(m,e.b2NegV(this.m_localCenterA,e.b2Vec2.s_t0),this.m_rA),h=e.b2MulRV(_,e.b2NegV(this.m_localCenterB,e.b2Vec2.s_t0),this.m_rB),c=this.m_invMassA,u=this.m_invMassB,y=this.m_invIA,d=this.m_invIB,f=this.m_K;if(f.ex.x=c+u+y*b.y*b.y+d*h.y*h.y,f.ex.y=-y*b.x*b.y-d*h.x*h.y,f.ey.x=f.ex.y,f.ey.y=c+u+y*b.x*b.x+d*h.x*h.x,f.GetInverse(this.m_linearMass),this.m_angularMass=y+d,this.m_angularMass>0&&(this.m_angularMass=1/this.m_angularMass),e.b2SubVV(e.b2SubVV(e.b2AddVV(r,h,e.b2Vec2.s_t0),e.b2AddVV(o,b,e.b2Vec2.s_t1),e.b2Vec2.s_t2),e.b2MulRV(m,this.m_linearOffset,e.b2Vec2.s_t3),this.m_linearError),this.m_angularError=a-i-this.m_angularOffset,t.step.warmStarting){this.m_linearImpulse.SelfMul(t.step.dtRatio),this.m_angularImpulse*=t.step.dtRatio;var A=this.m_linearImpulse;n.SelfMulSub(c,A),s-=y*(e.b2CrossVV(b,A)+this.m_angularImpulse),l.SelfMulAdd(u,A),p+=d*(e.b2CrossVV(h,A)+this.m_angularImpulse)}else this.m_linearImpulse.SetZero(),this.m_angularImpulse=0;t.velocities[this.m_indexA].w=s,t.velocities[this.m_indexB].w=p},e.b2MotorJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_invMassA,a=this.m_invMassB,l=this.m_invIA,p=this.m_invIB,m=t.step.dt,_=t.step.inv_dt,b=s-i+_*this.m_correctionFactor*this.m_angularError,h=-this.m_angularMass*b,c=this.m_angularImpulse,u=m*this.m_maxTorque;this.m_angularImpulse=e.b2Clamp(this.m_angularImpulse+h,-u,u),h=this.m_angularImpulse-c,i-=l*h,s+=p*h;var y=this.m_rA,d=this.m_rB,b=e.b2AddVV(e.b2SubVV(e.b2AddVV(n,e.b2CrossSV(s,d,e.b2Vec2.s_t0),e.b2Vec2.s_t0),e.b2AddVV(o,e.b2CrossSV(i,y,e.b2Vec2.s_t1),e.b2Vec2.s_t1),e.b2Vec2.s_t2),e.b2MulSV(_*this.m_correctionFactor,this.m_linearError,e.b2Vec2.s_t3),e.b2MotorJoint.prototype.SolveVelocityConstraints.s_Cdot),h=e.b2MulMV(this.m_linearMass,b,e.b2MotorJoint.prototype.SolveVelocityConstraints.s_impulse).SelfNeg(),c=e.b2MotorJoint.prototype.SolveVelocityConstraints.s_oldImpulse.Copy(this.m_linearImpulse);this.m_linearImpulse.SelfAdd(h);var u=m*this.m_maxForce;this.m_linearImpulse.GetLengthSquared()>u*u&&(this.m_linearImpulse.Normalize(),this.m_linearImpulse.SelfMul(u)),e.b2SubVV(this.m_linearImpulse,c,h),o.SelfMulSub(r,h),i-=l*e.b2CrossVV(y,h),n.SelfMulAdd(a,h),s+=p*e.b2CrossVV(d,h),t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2MotorJoint.prototype.SolveVelocityConstraints.s_Cdot=new e.b2Vec2,e.b2MotorJoint.prototype.SolveVelocityConstraints.s_impulse=new e.b2Vec2,e.b2MotorJoint.prototype.SolveVelocityConstraints.s_oldImpulse=new e.b2Vec2,e.b2MotorJoint.prototype.SolvePositionConstraints=function(){return!0},e.b2MotorJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2MotorJointDef*/ var jd = new box2d.b2MotorJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.linearOffset.Set(%.15f, %.15f);\n",this.m_linearOffset.x,this.m_linearOffset.y),e.b2Log("  jd.angularOffset = %.15f;\n",this.m_angularOffset),e.b2Log("  jd.maxForce = %.15f;\n",this.m_maxForce),e.b2Log("  jd.maxTorque = %.15f;\n",this.m_maxTorque),e.b2Log("  jd.correctionFactor = %.15f;\n",this.m_correctionFactor),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),R=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2MouseJoint&&(e.b2MouseJoint={}),e.b2MouseJointDef=function(){t.base(this,e.b2JointType.e_mouseJoint),this.target=new e.b2Vec2},t.inherits(e.b2MouseJointDef,e.b2JointDef),e.b2MouseJointDef.prototype.target=null,e.b2MouseJointDef.prototype.maxForce=0,e.b2MouseJointDef.prototype.frequencyHz=5,e.b2MouseJointDef.prototype.dampingRatio=.7,e.b2MouseJoint=function(o){t.base(this,o),this.m_localAnchorB=new e.b2Vec2,this.m_targetA=new e.b2Vec2,this.m_impulse=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_mass=new e.b2Mat22,this.m_C=new e.b2Vec2,this.m_qB=new e.b2Rot,this.m_lalcB=new e.b2Vec2,this.m_K=new e.b2Mat22,e.ENABLE_ASSERTS&&e.b2Assert(o.target.IsValid()),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(o.maxForce)&&o.maxForce>=0),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(o.frequencyHz)&&o.frequencyHz>=0),e.ENABLE_ASSERTS&&e.b2Assert(e.b2IsValid(o.dampingRatio)&&o.dampingRatio>=0),this.m_targetA.Copy(o.target),e.b2MulTXV(this.m_bodyB.GetTransform(),this.m_targetA,this.m_localAnchorB),this.m_maxForce=o.maxForce,this.m_impulse.SetZero(),this.m_frequencyHz=o.frequencyHz,this.m_dampingRatio=o.dampingRatio,this.m_beta=0,this.m_gamma=0},t.inherits(e.b2MouseJoint,e.b2Joint),e.b2MouseJoint.prototype.m_localAnchorB=null,e.b2MouseJoint.prototype.m_targetA=null,e.b2MouseJoint.prototype.m_frequencyHz=0,e.b2MouseJoint.prototype.m_dampingRatio=0,e.b2MouseJoint.prototype.m_beta=0,e.b2MouseJoint.prototype.m_impulse=null,e.b2MouseJoint.prototype.m_maxForce=0,e.b2MouseJoint.prototype.m_gamma=0,e.b2MouseJoint.prototype.m_indexA=0,e.b2MouseJoint.prototype.m_indexB=0,e.b2MouseJoint.prototype.m_rB=null,e.b2MouseJoint.prototype.m_localCenterB=null,e.b2MouseJoint.prototype.m_invMassB=0,e.b2MouseJoint.prototype.m_invIB=0,e.b2MouseJoint.prototype.m_mass=null,e.b2MouseJoint.prototype.m_C=null,e.b2MouseJoint.prototype.m_qB=null,e.b2MouseJoint.prototype.m_lalcB=null,e.b2MouseJoint.prototype.m_K=null,e.b2MouseJoint.prototype.SetTarget=function(t){0==this.m_bodyB.IsAwake()&&this.m_bodyB.SetAwake(!0),this.m_targetA.Copy(t)},e.b2MouseJoint.prototype.GetTarget=function(t){return t.Copy(this.m_targetA)},e.b2MouseJoint.prototype.SetMaxForce=function(t){this.m_maxForce=t},e.b2MouseJoint.prototype.GetMaxForce=function(){return this.m_maxForce},e.b2MouseJoint.prototype.SetFrequency=function(t){this.m_frequencyHz=t},e.b2MouseJoint.prototype.GetFrequency=function(){return this.m_frequencyHz},e.b2MouseJoint.prototype.SetDampingRatio=function(t){this.m_dampingRatio=t},e.b2MouseJoint.prototype.GetDampingRatio=function(){return this.m_dampingRatio},e.b2MouseJoint.prototype.InitVelocityConstraints=function(t){this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexB].c,i=t.positions[this.m_indexB].a,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_qB.SetAngleRadians(i),a=this.m_bodyB.GetMass(),l=2*e.b2_pi*this.m_frequencyHz,p=2*a*this.m_dampingRatio*l,m=a*l*l,_=t.step.dt;e.ENABLE_ASSERTS&&e.b2Assert(p+_*m>e.b2_epsilon),this.m_gamma=_*(p+_*m),0!=this.m_gamma&&(this.m_gamma=1/this.m_gamma),this.m_beta=_*m*this.m_gamma,e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(r,this.m_lalcB,this.m_rB);var b=this.m_K;b.ex.x=this.m_invMassB+this.m_invIB*this.m_rB.y*this.m_rB.y+this.m_gamma,b.ex.y=-this.m_invIB*this.m_rB.x*this.m_rB.y,b.ey.x=b.ex.y,b.ey.y=this.m_invMassB+this.m_invIB*this.m_rB.x*this.m_rB.x+this.m_gamma,b.GetInverse(this.m_mass),this.m_C.x=o.x+this.m_rB.x-this.m_targetA.x,this.m_C.y=o.y+this.m_rB.y-this.m_targetA.y,this.m_C.SelfMul(this.m_beta),s*=.98,t.step.warmStarting?(this.m_impulse.SelfMul(t.step.dtRatio),n.x+=this.m_invMassB*this.m_impulse.x,n.y+=this.m_invMassB*this.m_impulse.y,s+=this.m_invIB*e.b2CrossVV(this.m_rB,this.m_impulse)):this.m_impulse.SetZero(),t.velocities[this.m_indexB].w=s},e.b2MouseJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexB].v,i=t.velocities[this.m_indexB].w,n=e.b2AddVCrossSV(o,i,this.m_rB,e.b2MouseJoint.prototype.SolveVelocityConstraints.s_Cdot),s=e.b2MulMV(this.m_mass,e.b2AddVV(n,e.b2AddVV(this.m_C,e.b2MulSV(this.m_gamma,this.m_impulse,e.b2Vec2.s_t0),e.b2Vec2.s_t0),e.b2Vec2.s_t0).SelfNeg(),e.b2MouseJoint.prototype.SolveVelocityConstraints.s_impulse),r=e.b2MouseJoint.prototype.SolveVelocityConstraints.s_oldImpulse.Copy(this.m_impulse);this.m_impulse.SelfAdd(s);var a=t.step.dt*this.m_maxForce;this.m_impulse.GetLengthSquared()>a*a&&this.m_impulse.SelfMul(a/this.m_impulse.GetLength()),e.b2SubVV(this.m_impulse,r,s),o.SelfMulAdd(this.m_invMassB,s),i+=this.m_invIB*e.b2CrossVV(this.m_rB,s),t.velocities[this.m_indexB].w=i},e.b2MouseJoint.prototype.SolveVelocityConstraints.s_Cdot=new e.b2Vec2,e.b2MouseJoint.prototype.SolveVelocityConstraints.s_impulse=new e.b2Vec2,e.b2MouseJoint.prototype.SolveVelocityConstraints.s_oldImpulse=new e.b2Vec2,e.b2MouseJoint.prototype.SolvePositionConstraints=function(){return!0},e.b2MouseJoint.prototype.GetAnchorA=function(t){return t.Copy(this.m_targetA)},e.b2MouseJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2MouseJoint.prototype.GetReactionForce=function(t,o){return e.b2MulSV(t,this.m_impulse,o)},e.b2MouseJoint.prototype.GetReactionTorque=function(){return 0},e.b2MouseJoint.prototype.Dump=function(){e.DEBUG&&e.b2Log("Mouse joint dumping is not supported.\n")},e.b2MouseJoint.prototype.ShiftOrigin=function(t){this.m_targetA.SelfSub(t)},e}(e,n,i,o),I=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2PolygonShape&&(e.b2PolygonShape={}),e.b2PolygonShape=function(){t.base(this,e.b2ShapeType.e_polygonShape,e.b2_polygonRadius),this.m_centroid=new e.b2Vec2(0,0),this.m_vertices=e.b2Vec2.MakeArray(e.b2_maxPolygonVertices),this.m_normals=e.b2Vec2.MakeArray(e.b2_maxPolygonVertices)},t.inherits(e.b2PolygonShape,e.b2Shape),e.b2PolygonShape.prototype.m_centroid=null,e.b2PolygonShape.prototype.m_vertices=null,e.b2PolygonShape.prototype.m_normals=null,e.b2PolygonShape.prototype.m_count=0,e.b2PolygonShape.prototype.Clone=function(){return(new e.b2PolygonShape).Copy(this)},e.b2PolygonShape.prototype.Copy=function(o){t.base(this,"Copy",o),e.ENABLE_ASSERTS&&e.b2Assert(o instanceof e.b2PolygonShape),this.m_centroid.Copy(o.m_centroid),this.m_count=o.m_count;for(var i=0,n=this.m_count;n>i;++i)this.m_vertices[i].Copy(o.m_vertices[i]),this.m_normals[i].Copy(o.m_normals[i]);return this},e.b2PolygonShape.prototype.SetAsBox=function(t,e){return this.m_count=4,this.m_vertices[0].Set(-t,-e),this.m_vertices[1].Set(t,-e),this.m_vertices[2].Set(t,e),this.m_vertices[3].Set(-t,e),this.m_normals[0].Set(0,-1),this.m_normals[1].Set(1,0),this.m_normals[2].Set(0,1),this.m_normals[3].Set(-1,0),this.m_centroid.SetZero(),this},e.b2PolygonShape.prototype.SetAsOrientedBox=function(t,o,i,n){this.m_count=4,this.m_vertices[0].Set(-t,-o),this.m_vertices[1].Set(t,-o),this.m_vertices[2].Set(t,o),this.m_vertices[3].Set(-t,o),this.m_normals[0].Set(0,-1),this.m_normals[1].Set(1,0),this.m_normals[2].Set(0,1),this.m_normals[3].Set(-1,0),this.m_centroid.Copy(i);var s=new e.b2Transform;s.SetPosition(i),s.SetRotationAngleRadians(n);for(var r=0,a=this.m_count;a>r;++r)e.b2MulXV(s,this.m_vertices[r],this.m_vertices[r]),e.b2MulRV(s.q,this.m_normals[r],this.m_normals[r]);return this},e.b2PolygonShape.prototype.Set=function(t,o){if(void 0===o&&(o=t.length),e.ENABLE_ASSERTS&&e.b2Assert(o>=3&&o<=e.b2_maxPolygonVertices),3>o)return this.SetAsBox(1,1);for(var i=e.b2Min(o,e.b2_maxPolygonVertices),n=e.b2PolygonShape.prototype.Set.s_ps,s=0,r=0;i>r;++r){for(var a=t[r],l=!0,p=0;s>p;++p)if(e.b2DistanceSquaredVV(a,n[p])<.5*e.b2_linearSlop){l=!1;break}l&&n[s++].Copy(a)}if(i=s,3>i)return e.ENABLE_ASSERTS&&e.b2Assert(!1),this.SetAsBox(1,1);for(var m=0,_=n[0].x,r=1;i>r;++r){var b=n[r].x;(b>_||b==_&&n[r].y<n[m].y)&&(m=r,_=b)}for(var h=e.b2PolygonShape.prototype.Set.s_hull,c=0,u=m;;){h[c]=u;for(var y=0,p=1;i>p;++p)if(y!=u){var d=e.b2SubVV(n[y],n[h[c]],e.b2PolygonShape.prototype.Set.s_r),a=e.b2SubVV(n[p],n[h[c]],e.b2PolygonShape.prototype.Set.s_v),f=e.b2CrossVV(d,a);0>f&&(y=p),0==f&&a.GetLengthSquared()>d.GetLengthSquared()&&(y=p)}else y=p;if(++c,u=y,y==m)break}this.m_count=c;for(var r=0;c>r;++r)this.m_vertices[r].Copy(n[h[r]]);for(var r=0,A=c;A>r;++r){var S=this.m_vertices[r],C=this.m_vertices[(r+1)%A],v=e.b2SubVV(C,S,e.b2Vec2.s_t0);e.ENABLE_ASSERTS&&e.b2Assert(v.GetLengthSquared()>e.b2_epsilon_sq),e.b2CrossVOne(v,this.m_normals[r]).SelfNormalize()}return e.b2PolygonShape.ComputeCentroid(this.m_vertices,c,this.m_centroid),this},e.b2PolygonShape.prototype.Set.s_ps=e.b2Vec2.MakeArray(e.b2_maxPolygonVertices),e.b2PolygonShape.prototype.Set.s_hull=e.b2MakeNumberArray(e.b2_maxPolygonVertices),e.b2PolygonShape.prototype.Set.s_r=new e.b2Vec2,e.b2PolygonShape.prototype.Set.s_v=new e.b2Vec2,e.b2PolygonShape.prototype.SetAsVector=function(t,e){return this.Set(t,e),this},e.b2PolygonShape.prototype.SetAsArray=function(t,e){return this.Set(t,e),this},e.b2PolygonShape.prototype.GetChildCount=function(){return 1},e.b2PolygonShape.prototype.TestPoint=function(t,o){for(var i=e.b2MulTXV(t,o,e.b2PolygonShape.prototype.TestPoint.s_pLocal),n=0,s=this.m_count;s>n;++n){var r=e.b2DotVV(this.m_normals[n],e.b2SubVV(i,this.m_vertices[n],e.b2Vec2.s_t0));if(r>0)return!1}return!0},e.b2PolygonShape.prototype.TestPoint.s_pLocal=new e.b2Vec2,e.b2PolygonShape.prototype.RayCast=function(t,o,i){for(var n=e.b2MulTXV(i,o.p1,e.b2PolygonShape.prototype.RayCast.s_p1),s=e.b2MulTXV(i,o.p2,e.b2PolygonShape.prototype.RayCast.s_p2),r=e.b2SubVV(s,n,e.b2PolygonShape.prototype.RayCast.s_d),a=0,l=o.maxFraction,p=-1,m=0,_=this.m_count;_>m;++m){var b=e.b2DotVV(this.m_normals[m],e.b2SubVV(this.m_vertices[m],n,e.b2Vec2.s_t0)),h=e.b2DotVV(this.m_normals[m],r);if(0==h){if(0>b)return!1}else 0>h&&a*h>b?(a=b/h,p=m):h>0&&l*h>b&&(l=b/h);if(a>l)return!1}return e.ENABLE_ASSERTS&&e.b2Assert(a>=0&&a<=o.maxFraction),p>=0?(t.fraction=a,e.b2MulRV(i.q,this.m_normals[p],t.normal),!0):!1},e.b2PolygonShape.prototype.RayCast.s_p1=new e.b2Vec2,e.b2PolygonShape.prototype.RayCast.s_p2=new e.b2Vec2,e.b2PolygonShape.prototype.RayCast.s_d=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeAABB=function(t,o){for(var i=e.b2MulXV(o,this.m_vertices[0],t.lowerBound),n=t.upperBound.Copy(i),s=0,r=this.m_count;r>s;++s){var a=e.b2MulXV(o,this.m_vertices[s],e.b2PolygonShape.prototype.ComputeAABB.s_v);e.b2MinV(a,i,i),e.b2MaxV(a,n,n)}var l=this.m_radius;i.SelfSubXY(l,l),n.SelfAddXY(l,l)},e.b2PolygonShape.prototype.ComputeAABB.s_v=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeMass=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(this.m_count>=3);for(var i=e.b2PolygonShape.prototype.ComputeMass.s_center.SetZero(),n=0,s=0,r=e.b2PolygonShape.prototype.ComputeMass.s_s.SetZero(),a=0,l=this.m_count;l>a;++a)r.SelfAdd(this.m_vertices[a]);r.SelfMul(1/this.m_count);for(var p=1/3,a=0,l=this.m_count;l>a;++a){var m=e.b2SubVV(this.m_vertices[a],r,e.b2PolygonShape.prototype.ComputeMass.s_e1),_=e.b2SubVV(this.m_vertices[(a+1)%l],r,e.b2PolygonShape.prototype.ComputeMass.s_e2),b=e.b2CrossVV(m,_),h=.5*b;n+=h,i.SelfAdd(e.b2MulSV(h*p,e.b2AddVV(m,_,e.b2Vec2.s_t0),e.b2Vec2.s_t1));var c=m.x,u=m.y,y=_.x,d=_.y,f=c*c+y*c+y*y,A=u*u+d*u+d*d;s+=.25*p*b*(f+A)}t.mass=o*n,e.ENABLE_ASSERTS&&e.b2Assert(n>e.b2_epsilon),i.SelfMul(1/n),e.b2AddVV(i,r,t.center),t.I=o*s,t.I+=t.mass*(e.b2DotVV(t.center,t.center)-e.b2DotVV(i,i))},e.b2PolygonShape.prototype.ComputeMass.s_center=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeMass.s_s=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeMass.s_e1=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeMass.s_e2=new e.b2Vec2,e.b2PolygonShape.prototype.Validate=function(){for(var t=0;t<this.m_count;++t)for(var o=t,i=(t+1)%this.m_count,n=this.m_vertices[o],s=e.b2SubVV(this.m_vertices[i],n,e.b2PolygonShape.prototype.Validate.s_e),r=0;r<this.m_count;++r)if(r!=o&&r!=i){var a=e.b2SubVV(this.m_vertices[r],n,e.b2PolygonShape.prototype.Validate.s_v),l=e.b2CrossVV(s,a);if(0>l)return!1}return!0},e.b2PolygonShape.prototype.Validate.s_e=new e.b2Vec2,e.b2PolygonShape.prototype.Validate.s_v=new e.b2Vec2,e.b2PolygonShape.prototype.SetupDistanceProxy=function(t){t.m_vertices=this.m_vertices,t.m_count=this.m_count,t.m_radius=this.m_radius},e.b2PolygonShape.prototype.ComputeSubmergedArea=function(t,o,i,n){for(var s=e.b2MulTRV(i.q,t,e.b2PolygonShape.prototype.ComputeSubmergedArea.s_normalL),r=o-e.b2DotVV(t,i.p),a=e.b2PolygonShape.prototype.ComputeSubmergedArea.s_depths,l=0,p=-1,m=-1,_=!1,b=0,h=this.m_count;h>b;++b){a[b]=e.b2DotVV(s,this.m_vertices[b])-r;var c=a[b]<-e.b2_epsilon;b>0&&(c?_||(p=b-1,l++):_&&(m=b-1,l++)),_=c}switch(l){case 0:if(_){var u=e.b2PolygonShape.prototype.ComputeSubmergedArea.s_md;return this.ComputeMass(u,1),e.b2MulXV(i,u.center,n),u.mass}return 0;case 1:-1==p?p=this.m_count-1:m=this.m_count-1}for(var y=(p+1)%this.m_count,d=(m+1)%this.m_count,f=(0-a[p])/(a[y]-a[p]),A=(0-a[m])/(a[d]-a[m]),S=e.b2PolygonShape.prototype.ComputeSubmergedArea.s_intoVec.Set(this.m_vertices[p].x*(1-f)+this.m_vertices[y].x*f,this.m_vertices[p].y*(1-f)+this.m_vertices[y].y*f),C=e.b2PolygonShape.prototype.ComputeSubmergedArea.s_outoVec.Set(this.m_vertices[m].x*(1-A)+this.m_vertices[d].x*A,this.m_vertices[m].y*(1-A)+this.m_vertices[d].y*A),v=0,x=e.b2PolygonShape.prototype.ComputeSubmergedArea.s_center.SetZero(),V=this.m_vertices[y],g=null,b=y;b!=d;){b=(b+1)%this.m_count,g=b==d?C:this.m_vertices[b];var B=.5*((V.x-S.x)*(g.y-S.y)-(V.y-S.y)*(g.x-S.x));v+=B,x.x+=B*(S.x+V.x+g.x)/3,x.y+=B*(S.y+V.y+g.y)/3,V=g}return x.SelfMul(1/v),e.b2MulXV(i,x,n),v},e.b2PolygonShape.prototype.ComputeSubmergedArea.s_normalL=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeSubmergedArea.s_depths=e.b2MakeNumberArray(e.b2_maxPolygonVertices),e.b2PolygonShape.prototype.ComputeSubmergedArea.s_md=new e.b2MassData,e.b2PolygonShape.prototype.ComputeSubmergedArea.s_intoVec=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeSubmergedArea.s_outoVec=new e.b2Vec2,e.b2PolygonShape.prototype.ComputeSubmergedArea.s_center=new e.b2Vec2,e.b2PolygonShape.prototype.Dump=function(){e.b2Log("    /*box2d.b2PolygonShape*/ var shape = new box2d.b2PolygonShape();\n"),e.b2Log("    /*box2d.b2Vec2[]*/ var vs = box2d.b2Vec2.MakeArray(%d);\n",e.b2_maxPolygonVertices);for(var t=0;t<this.m_count;++t)e.b2Log("    vs[%d].Set(%.15f, %.15f);\n",t,this.m_vertices[t].x,this.m_vertices[t].y);e.b2Log("    shape.Set(vs, %d);\n",this.m_count)},e.b2PolygonShape.ComputeCentroid=function(t,o,i){e.ENABLE_ASSERTS&&e.b2Assert(o>=3);var n=i;n.SetZero();for(var s=0,r=e.b2PolygonShape.ComputeCentroid.s_pRef.SetZero(),a=1/3,l=0;o>l;++l){var p=r,m=t[l],_=t[(l+1)%o],b=e.b2SubVV(m,p,e.b2PolygonShape.ComputeCentroid.s_e1),h=e.b2SubVV(_,p,e.b2PolygonShape.ComputeCentroid.s_e2),c=e.b2CrossVV(b,h),u=.5*c;s+=u,n.x+=u*a*(p.x+m.x+_.x),n.y+=u*a*(p.y+m.y+_.y)}return e.ENABLE_ASSERTS&&e.b2Assert(s>e.b2_epsilon),n.SelfMul(1/s),n},e.b2PolygonShape.ComputeCentroid.s_pRef=new e.b2Vec2,e.b2PolygonShape.ComputeCentroid.s_e1=new e.b2Vec2,e.b2PolygonShape.ComputeCentroid.s_e2=new e.b2Vec2,e}(e,l),L=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2PulleyJoint&&(e.b2PulleyJoint={}),e.b2_minPulleyLength=2,e.b2PulleyJointDef=function(){t.base(this,e.b2JointType.e_pulleyJoint),this.collideConnected=!0,this.groundAnchorA=new e.b2Vec2(-1,1),this.groundAnchorB=new e.b2Vec2(1,1),this.localAnchorA=new e.b2Vec2(-1,0),this.localAnchorB=new e.b2Vec2(1,0)},t.inherits(e.b2PulleyJointDef,e.b2JointDef),e.b2PulleyJointDef.prototype.groundAnchorA=null,e.b2PulleyJointDef.prototype.groundAnchorB=null,e.b2PulleyJointDef.prototype.localAnchorA=null,e.b2PulleyJointDef.prototype.localAnchorB=null,e.b2PulleyJointDef.prototype.lengthA=0,e.b2PulleyJointDef.prototype.lengthB=0,e.b2PulleyJointDef.prototype.ratio=1,e.b2PulleyJointDef.prototype.Initialize=function(t,o,i,n,s,r,a){this.bodyA=t,this.bodyB=o,this.groundAnchorA.Copy(i),this.groundAnchorB.Copy(n),this.bodyA.GetLocalPoint(s,this.localAnchorA),this.bodyB.GetLocalPoint(r,this.localAnchorB),this.lengthA=e.b2DistanceVV(s,i),this.lengthB=e.b2DistanceVV(r,n),this.ratio=a,e.ENABLE_ASSERTS&&e.b2Assert(this.ratio>e.b2_epsilon)},e.b2PulleyJoint=function(o){t.base(this,o),this.m_groundAnchorA=new e.b2Vec2,this.m_groundAnchorB=new e.b2Vec2,this.m_localAnchorA=new e.b2Vec2,this.m_localAnchorB=new e.b2Vec2,this.m_uA=new e.b2Vec2,this.m_uB=new e.b2Vec2,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_groundAnchorA.Copy(o.groundAnchorA),this.m_groundAnchorB.Copy(o.groundAnchorB),this.m_localAnchorA.Copy(o.localAnchorA),this.m_localAnchorB.Copy(o.localAnchorB),this.m_lengthA=o.lengthA,this.m_lengthB=o.lengthB,e.ENABLE_ASSERTS&&e.b2Assert(0!=o.ratio),this.m_ratio=o.ratio,this.m_constant=o.lengthA+this.m_ratio*o.lengthB,this.m_impulse=0},t.inherits(e.b2PulleyJoint,e.b2Joint),e.b2PulleyJoint.prototype.m_groundAnchorA=null,e.b2PulleyJoint.prototype.m_groundAnchorB=null,e.b2PulleyJoint.prototype.m_lengthA=0,e.b2PulleyJoint.prototype.m_lengthB=0,e.b2PulleyJoint.prototype.m_localAnchorA=null,e.b2PulleyJoint.prototype.m_localAnchorB=null,e.b2PulleyJoint.prototype.m_constant=0,e.b2PulleyJoint.prototype.m_ratio=0,e.b2PulleyJoint.prototype.m_impulse=0,e.b2PulleyJoint.prototype.m_indexA=0,e.b2PulleyJoint.prototype.m_indexB=0,e.b2PulleyJoint.prototype.m_uA=null,e.b2PulleyJoint.prototype.m_uB=null,e.b2PulleyJoint.prototype.m_rA=null,e.b2PulleyJoint.prototype.m_rB=null,e.b2PulleyJoint.prototype.m_localCenterA=null,e.b2PulleyJoint.prototype.m_localCenterB=null,e.b2PulleyJoint.prototype.m_invMassA=0,e.b2PulleyJoint.prototype.m_invMassB=0,e.b2PulleyJoint.prototype.m_invIA=0,e.b2PulleyJoint.prototype.m_invIB=0,e.b2PulleyJoint.prototype.m_mass=0,e.b2PulleyJoint.prototype.m_qA=null,e.b2PulleyJoint.prototype.m_qB=null,e.b2PulleyJoint.prototype.m_lalcA=null,e.b2PulleyJoint.prototype.m_lalcB=null,e.b2PulleyJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.velocities[this.m_indexA].v,s=t.velocities[this.m_indexA].w,r=t.positions[this.m_indexB].c,a=t.positions[this.m_indexB].a,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=this.m_qA.SetAngleRadians(i),_=this.m_qB.SetAngleRadians(a);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA),e.b2MulRV(m,this.m_lalcA,this.m_rA),e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(_,this.m_lalcB,this.m_rB),this.m_uA.Copy(o).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA),this.m_uB.Copy(r).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB);var b=this.m_uA.GetLength(),h=this.m_uB.GetLength();b>10*e.b2_linearSlop?this.m_uA.SelfMul(1/b):this.m_uA.SetZero(),h>10*e.b2_linearSlop?this.m_uB.SelfMul(1/h):this.m_uB.SetZero();var c=e.b2CrossVV(this.m_rA,this.m_uA),u=e.b2CrossVV(this.m_rB,this.m_uB),y=this.m_invMassA+this.m_invIA*c*c,d=this.m_invMassB+this.m_invIB*u*u;if(this.m_mass=y+this.m_ratio*this.m_ratio*d,this.m_mass>0&&(this.m_mass=1/this.m_mass),t.step.warmStarting){this.m_impulse*=t.step.dtRatio;var f=e.b2MulSV(-this.m_impulse,this.m_uA,e.b2PulleyJoint.prototype.InitVelocityConstraints.s_PA),A=e.b2MulSV(-this.m_ratio*this.m_impulse,this.m_uB,e.b2PulleyJoint.prototype.InitVelocityConstraints.s_PB);n.SelfMulAdd(this.m_invMassA,f),s+=this.m_invIA*e.b2CrossVV(this.m_rA,f),l.SelfMulAdd(this.m_invMassB,A),p+=this.m_invIB*e.b2CrossVV(this.m_rB,A)}else this.m_impulse=0;t.velocities[this.m_indexA].w=s,t.velocities[this.m_indexB].w=p},e.b2PulleyJoint.prototype.InitVelocityConstraints.s_PA=new e.b2Vec2,e.b2PulleyJoint.prototype.InitVelocityConstraints.s_PB=new e.b2Vec2,e.b2PulleyJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=e.b2AddVCrossSV(o,i,this.m_rA,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpA),a=e.b2AddVCrossSV(n,s,this.m_rB,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpB),l=-e.b2DotVV(this.m_uA,r)-this.m_ratio*e.b2DotVV(this.m_uB,a),p=-this.m_mass*l;this.m_impulse+=p;var m=e.b2MulSV(-p,this.m_uA,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PA),_=e.b2MulSV(-this.m_ratio*p,this.m_uB,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PB);o.SelfMulAdd(this.m_invMassA,m),i+=this.m_invIA*e.b2CrossVV(this.m_rA,m),n.SelfMulAdd(this.m_invMassB,_),s+=this.m_invIB*e.b2CrossVV(this.m_rB,_),t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpA=new e.b2Vec2,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpB=new e.b2Vec2,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PA=new e.b2Vec2,e.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PB=new e.b2Vec2,e.b2PulleyJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s);
	e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var l=e.b2MulRV(r,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var p=e.b2MulRV(a,this.m_lalcB,this.m_rB),m=this.m_uA.Copy(o).SelfAdd(l).SelfSub(this.m_groundAnchorA),_=this.m_uB.Copy(n).SelfAdd(p).SelfSub(this.m_groundAnchorB),b=m.GetLength(),h=_.GetLength();b>10*e.b2_linearSlop?m.SelfMul(1/b):m.SetZero(),h>10*e.b2_linearSlop?_.SelfMul(1/h):_.SetZero();var c=e.b2CrossVV(l,m),u=e.b2CrossVV(p,_),y=this.m_invMassA+this.m_invIA*c*c,d=this.m_invMassB+this.m_invIB*u*u,f=y+this.m_ratio*this.m_ratio*d;f>0&&(f=1/f);var A=this.m_constant-b-this.m_ratio*h,S=e.b2Abs(A),C=-f*A,v=e.b2MulSV(-C,m,e.b2PulleyJoint.prototype.SolvePositionConstraints.s_PA),x=e.b2MulSV(-this.m_ratio*C,_,e.b2PulleyJoint.prototype.SolvePositionConstraints.s_PB);return o.SelfMulAdd(this.m_invMassA,v),i+=this.m_invIA*e.b2CrossVV(l,v),n.SelfMulAdd(this.m_invMassB,x),s+=this.m_invIB*e.b2CrossVV(p,x),t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,S<e.b2_linearSlop},e.b2PulleyJoint.prototype.SolvePositionConstraints.s_PA=new e.b2Vec2,e.b2PulleyJoint.prototype.SolvePositionConstraints.s_PB=new e.b2Vec2,e.b2PulleyJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2PulleyJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2PulleyJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*this.m_impulse*this.m_uB.x,t*this.m_impulse*this.m_uB.y)},e.b2PulleyJoint.prototype.GetReactionTorque=function(){return 0},e.b2PulleyJoint.prototype.GetGroundAnchorA=function(t){return t.Copy(this.m_groundAnchorA)},e.b2PulleyJoint.prototype.GetGroundAnchorB=function(t){return t.Copy(this.m_groundAnchorB)},e.b2PulleyJoint.prototype.GetLengthA=function(){return this.m_lengthA},e.b2PulleyJoint.prototype.GetLengthB=function(){return this.m_lengthB},e.b2PulleyJoint.prototype.GetRatio=function(){return this.m_ratio},e.b2PulleyJoint.prototype.GetCurrentLengthA=function(){var t=this.m_bodyA.GetWorldPoint(this.m_localAnchorA,e.b2PulleyJoint.prototype.GetCurrentLengthA.s_p),o=this.m_groundAnchorA;return e.b2DistanceVV(t,o)},e.b2PulleyJoint.prototype.GetCurrentLengthA.s_p=new e.b2Vec2,e.b2PulleyJoint.prototype.GetCurrentLengthB=function(){var t=this.m_bodyB.GetWorldPoint(this.m_localAnchorB,e.b2PulleyJoint.prototype.GetCurrentLengthB.s_p),o=this.m_groundAnchorB;return e.b2DistanceVV(t,o)},e.b2PulleyJoint.prototype.GetCurrentLengthB.s_p=new e.b2Vec2,e.b2PulleyJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2PulleyJointDef*/ var jd = new box2d.b2PulleyJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.groundAnchorA.Set(%.15f, %.15f);\n",this.m_groundAnchorA.x,this.m_groundAnchorA.y),e.b2Log("  jd.groundAnchorB.Set(%.15f, %.15f);\n",this.m_groundAnchorB.x,this.m_groundAnchorB.y),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.lengthA = %.15f;\n",this.m_lengthA),e.b2Log("  jd.lengthB = %.15f;\n",this.m_lengthB),e.b2Log("  jd.ratio = %.15f;\n",this.m_ratio),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e.b2PulleyJoint.prototype.ShiftOrigin=function(t){this.m_groundAnchorA.SelfSub(t),this.m_groundAnchorB.SelfSub(t)},e}(e,n,i,o),E=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Rope&&(e.b2Rope={}),e.b2RopeDef=function(){this.vertices=new Array,this.masses=new Array,this.gravity=new e.b2Vec2},e.b2RopeDef.prototype.vertices=null,e.b2RopeDef.prototype.count=0,e.b2RopeDef.prototype.masses=null,e.b2RopeDef.prototype.gravity=null,e.b2RopeDef.prototype.damping=.1,e.b2RopeDef.prototype.k2=.9,e.b2RopeDef.prototype.k3=.1,e.b2Rope=function(){this.m_gravity=new e.b2Vec2},e.b2Rope.prototype.m_count=0,e.b2Rope.prototype.m_ps=null,e.b2Rope.prototype.m_p0s=null,e.b2Rope.prototype.m_vs=null,e.b2Rope.prototype.m_ims=null,e.b2Rope.prototype.m_Ls=null,e.b2Rope.prototype.m_as=null,e.b2Rope.prototype.m_gravity=null,e.b2Rope.prototype.m_damping=0,e.b2Rope.prototype.m_k2=1,e.b2Rope.prototype.m_k3=.1,e.b2Rope.prototype.GetVertexCount=function(){return this.m_count},e.b2Rope.prototype.GetVertices=function(){return this.m_ps},e.b2Rope.prototype.Initialize=function(t){e.ENABLE_ASSERTS&&e.b2Assert(t.count>=3),this.m_count=t.count,this.m_ps=e.b2Vec2.MakeArray(this.m_count),this.m_p0s=e.b2Vec2.MakeArray(this.m_count),this.m_vs=e.b2Vec2.MakeArray(this.m_count),this.m_ims=e.b2MakeNumberArray(this.m_count);for(var o=0;o<this.m_count;++o){this.m_ps[o].Copy(t.vertices[o]),this.m_p0s[o].Copy(t.vertices[o]),this.m_vs[o].SetZero();var i=t.masses[o];this.m_ims[o]=i>0?1/i:0}var n=this.m_count-1,s=this.m_count-2;this.m_Ls=e.b2MakeNumberArray(n),this.m_as=e.b2MakeNumberArray(s);for(var o=0;n>o;++o){var r=this.m_ps[o],a=this.m_ps[o+1];this.m_Ls[o]=e.b2DistanceVV(r,a)}for(var o=0;s>o;++o){var r=this.m_ps[o],a=this.m_ps[o+1],l=this.m_ps[o+2],p=e.b2SubVV(a,r,e.b2Vec2.s_t0),m=e.b2SubVV(l,a,e.b2Vec2.s_t1),_=e.b2CrossVV(p,m),b=e.b2DotVV(p,m);this.m_as[o]=e.b2Atan2(_,b)}this.m_gravity.Copy(t.gravity),this.m_damping=t.damping,this.m_k2=t.k2,this.m_k3=t.k3},e.b2Rope.prototype.Step=function(t,o){if(0!=t){for(var i=Math.exp(-t*this.m_damping),n=0;n<this.m_count;++n)this.m_p0s[n].Copy(this.m_ps[n]),this.m_ims[n]>0&&this.m_vs[n].SelfMulAdd(t,this.m_gravity),this.m_vs[n].SelfMul(i),this.m_ps[n].SelfMulAdd(t,this.m_vs[n]);for(var n=0;o>n;++n)this.SolveC2(),this.SolveC3(),this.SolveC2();for(var s=1/t,n=0;n<this.m_count;++n)e.b2MulSV(s,e.b2SubVV(this.m_ps[n],this.m_p0s[n],e.b2Vec2.s_t0),this.m_vs[n])}},e.b2Rope.prototype.SolveC2=function(){for(var t=this.m_count-1,o=0;t>o;++o){var i=this.m_ps[o],n=this.m_ps[o+1],s=e.b2SubVV(n,i,e.b2Rope.s_d),r=s.Normalize(),a=this.m_ims[o],l=this.m_ims[o+1];if(a+l!=0){var p=a/(a+l),m=l/(a+l);i.SelfMulSub(this.m_k2*p*(this.m_Ls[o]-r),s),n.SelfMulAdd(this.m_k2*m*(this.m_Ls[o]-r),s)}}},e.b2Rope.s_d=new e.b2Vec2,e.b2Rope.prototype.SetAngleRadians=function(t){for(var e=this.m_count-2,o=0;e>o;++o)this.m_as[o]=t},e.b2Rope.prototype.SolveC3=function(){for(var t=this.m_count-2,o=0;t>o;++o){var i=this.m_ps[o],n=this.m_ps[o+1],s=this.m_ps[o+2],r=this.m_ims[o],a=this.m_ims[o+1],l=this.m_ims[o+2],p=e.b2SubVV(n,i,e.b2Rope.s_d1),m=e.b2SubVV(s,n,e.b2Rope.s_d2),_=p.GetLengthSquared(),b=m.GetLengthSquared();if(_*b!=0){var h=e.b2CrossVV(p,m),c=e.b2DotVV(p,m),u=e.b2Atan2(h,c),y=e.b2MulSV(-1/_,p.SelfSkew(),e.b2Rope.s_Jd1),d=e.b2MulSV(1/b,m.SelfSkew(),e.b2Rope.s_Jd2),f=e.b2NegV(y,e.b2Rope.s_J1),A=e.b2SubVV(y,d,e.b2Rope.s_J2),S=d,C=r*e.b2DotVV(f,f)+a*e.b2DotVV(A,A)+l*e.b2DotVV(S,S);if(0!=C){C=1/C;for(var v=u-this.m_as[o];v>e.b2_pi;)u-=2*e.b2_pi,v=u-this.m_as[o];for(;v<-e.b2_pi;)u+=2*e.b2_pi,v=u-this.m_as[o];var x=-this.m_k3*C*v;i.SelfMulAdd(r*x,f),n.SelfMulAdd(a*x,A),s.SelfMulAdd(l*x,S)}}}},e.b2Rope.s_d1=new e.b2Vec2,e.b2Rope.s_d2=new e.b2Vec2,e.b2Rope.s_Jd1=new e.b2Vec2,e.b2Rope.s_Jd2=new e.b2Vec2,e.b2Rope.s_J1=new e.b2Vec2,e.b2Rope.s_J2=new e.b2Vec2,e.b2Rope.prototype.Draw=function(t){for(var o=new e.b2Color(.4,.5,.7),i=0;i<this.m_count-1;++i)t.DrawSegment(this.m_ps[i],this.m_ps[i+1],o)},e}(e,B,i),F=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2RopeJoint&&(e.b2RopeJoint={}),e.b2RopeJointDef=function(){t.base(this,e.b2JointType.e_ropeJoint),this.localAnchorA=new e.b2Vec2(-1,0),this.localAnchorB=new e.b2Vec2(1,0)},t.inherits(e.b2RopeJointDef,e.b2JointDef),e.b2RopeJointDef.prototype.localAnchorA=null,e.b2RopeJointDef.prototype.localAnchorB=null,e.b2RopeJointDef.prototype.maxLength=0,e.b2RopeJoint=function(o){t.base(this,o),this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_maxLength=o.maxLength,this.m_u=new e.b2Vec2,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2},t.inherits(e.b2RopeJoint,e.b2Joint),e.b2RopeJoint.prototype.m_localAnchorA=null,e.b2RopeJoint.prototype.m_localAnchorB=null,e.b2RopeJoint.prototype.m_maxLength=0,e.b2RopeJoint.prototype.m_length=0,e.b2RopeJoint.prototype.m_impulse=0,e.b2RopeJoint.prototype.m_indexA=0,e.b2RopeJoint.prototype.m_indexB=0,e.b2RopeJoint.prototype.m_u=null,e.b2RopeJoint.prototype.m_rA=null,e.b2RopeJoint.prototype.m_rB=null,e.b2RopeJoint.prototype.m_localCenterA=null,e.b2RopeJoint.prototype.m_localCenterB=null,e.b2RopeJoint.prototype.m_invMassA=0,e.b2RopeJoint.prototype.m_invMassB=0,e.b2RopeJoint.prototype.m_invIA=0,e.b2RopeJoint.prototype.m_invIB=0,e.b2RopeJoint.prototype.m_mass=0,e.b2RopeJoint.prototype.m_state=e.b2LimitState.e_inactiveLimit,e.b2RopeJoint.prototype.m_qA=null,e.b2RopeJoint.prototype.m_qB=null,e.b2RopeJoint.prototype.m_lalcA=null,e.b2RopeJoint.prototype.m_lalcB=null,e.b2RopeJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.velocities[this.m_indexA].v,s=t.velocities[this.m_indexA].w,r=t.positions[this.m_indexB].c,a=t.positions[this.m_indexB].a,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=this.m_qA.SetAngleRadians(i),_=this.m_qB.SetAngleRadians(a);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA),e.b2MulRV(m,this.m_lalcA,this.m_rA),e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(_,this.m_lalcB,this.m_rB),this.m_u.Copy(r).SelfAdd(this.m_rB).SelfSub(o).SelfSub(this.m_rA),this.m_length=this.m_u.GetLength();var b=this.m_length-this.m_maxLength;if(this.m_state=b>0?e.b2LimitState.e_atUpperLimit:e.b2LimitState.e_inactiveLimit,!(this.m_length>e.b2_linearSlop))return this.m_u.SetZero(),this.m_mass=0,this.m_impulse=0,void 0;this.m_u.SelfMul(1/this.m_length);var h=e.b2CrossVV(this.m_rA,this.m_u),c=e.b2CrossVV(this.m_rB,this.m_u),u=this.m_invMassA+this.m_invIA*h*h+this.m_invMassB+this.m_invIB*c*c;if(this.m_mass=0!=u?1/u:0,t.step.warmStarting){this.m_impulse*=t.step.dtRatio;var y=e.b2MulSV(this.m_impulse,this.m_u,e.b2RopeJoint.prototype.InitVelocityConstraints.s_P);n.SelfMulSub(this.m_invMassA,y),s-=this.m_invIA*e.b2CrossVV(this.m_rA,y),l.SelfMulAdd(this.m_invMassB,y),p+=this.m_invIB*e.b2CrossVV(this.m_rB,y)}else this.m_impulse=0;t.velocities[this.m_indexA].w=s,t.velocities[this.m_indexB].w=p},e.b2RopeJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2RopeJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=e.b2AddVCrossSV(o,i,this.m_rA,e.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpA),a=e.b2AddVCrossSV(n,s,this.m_rB,e.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpB),l=this.m_length-this.m_maxLength,p=e.b2DotVV(this.m_u,e.b2SubVV(a,r,e.b2Vec2.s_t0));0>l&&(p+=t.step.inv_dt*l);var m=-this.m_mass*p,_=this.m_impulse;this.m_impulse=e.b2Min(0,this.m_impulse+m),m=this.m_impulse-_;var b=e.b2MulSV(m,this.m_u,e.b2RopeJoint.prototype.SolveVelocityConstraints.s_P);o.SelfMulSub(this.m_invMassA,b),i-=this.m_invIA*e.b2CrossVV(this.m_rA,b),n.SelfMulAdd(this.m_invMassB,b),s+=this.m_invIB*e.b2CrossVV(this.m_rB,b),t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpA=new e.b2Vec2,e.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpB=new e.b2Vec2,e.b2RopeJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2RopeJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var l=e.b2MulRV(r,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var p=e.b2MulRV(a,this.m_lalcB,this.m_rB),m=this.m_u.Copy(n).SelfAdd(p).SelfSub(o).SelfSub(l),_=m.Normalize(),b=_-this.m_maxLength;b=e.b2Clamp(b,0,e.b2_maxLinearCorrection);var h=-this.m_mass*b,c=e.b2MulSV(h,m,e.b2RopeJoint.prototype.SolvePositionConstraints.s_P);return o.SelfMulSub(this.m_invMassA,c),i-=this.m_invIA*e.b2CrossVV(l,c),n.SelfMulAdd(this.m_invMassB,c),s+=this.m_invIB*e.b2CrossVV(p,c),t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,_-this.m_maxLength<e.b2_linearSlop},e.b2RopeJoint.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e.b2RopeJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2RopeJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2RopeJoint.prototype.GetReactionForce=function(t,o){var i=e.b2MulSV(t*this.m_impulse,this.m_u,o);return i},e.b2RopeJoint.prototype.GetReactionTorque=function(){return 0},e.b2RopeJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2RopeJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2RopeJoint.prototype.SetMaxLength=function(t){this.m_maxLength=t},e.b2RopeJoint.prototype.GetMaxLength=function(){return this.m_maxLength},e.b2RopeJoint.prototype.GetLimitState=function(){return this.m_state},e.b2RopeJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2RopeJointDef*/ var jd = new box2d.b2RopeJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.maxLength = %.15f;\n",this.m_maxLength),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),G=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2TensorDampingController&&(e.b2TensorDampingController={}),e.b2TensorDampingController=function(){t.base(this),this.T=new e.b2Mat22,this.maxTimestep=0},t.inherits(e.b2TensorDampingController,e.b2Controller),e.b2TensorDampingController.prototype.T=new e.b2Mat22,e.b2TensorDampingController.prototype.maxTimestep=0,e.b2TensorDampingController.prototype.Step=function(t){var o=t.dt;if(!(o<=e.b2_epsilon)){o>this.maxTimestep&&this.maxTimestep>0&&(o=this.maxTimestep);for(var i=this.m_bodyList;i;i=i.nextBody){var n=i.body;if(n.IsAwake()){var s=n.GetWorldVector(e.b2MulMV(this.T,n.GetLocalVector(n.GetLinearVelocity(),e.b2Vec2.s_t0),e.b2Vec2.s_t1),e.b2TensorDampingController.prototype.Step.s_damping);n.SetLinearVelocity(e.b2AddVV(n.GetLinearVelocity(),e.b2MulSV(o,s,e.b2Vec2.s_t0),e.b2Vec2.s_t1))}}}},e.b2TensorDampingController.prototype.Step.s_damping=new e.b2Vec2,e.b2TensorDampingController.prototype.SetAxisAligned=function(t,o){this.T.ex.x=-t,this.T.ex.y=0,this.T.ey.x=0,this.T.ey.y=-o,this.maxTimestep=t>0||o>0?1/e.b2Max(t,o):0},e}(e,c,i,o),N=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2TimeStep&&(e.b2TimeStep={}),e.b2Profile=function(){},e.b2Profile.prototype.step=0,e.b2Profile.prototype.collide=0,e.b2Profile.prototype.solve=0,e.b2Profile.prototype.solveInit=0,e.b2Profile.prototype.solveVelocity=0,e.b2Profile.prototype.solvePosition=0,e.b2Profile.prototype.broadphase=0,e.b2Profile.prototype.solveTOI=0,e.b2Profile.prototype.Reset=function(){return this.step=0,this.collide=0,this.solve=0,this.solveInit=0,this.solveVelocity=0,this.solvePosition=0,this.broadphase=0,this.solveTOI=0,this},e.b2TimeStep=function(){},e.b2TimeStep.prototype.dt=0,e.b2TimeStep.prototype.inv_dt=0,e.b2TimeStep.prototype.dtRatio=0,e.b2TimeStep.prototype.velocityIterations=0,e.b2TimeStep.prototype.positionIterations=0,e.b2TimeStep.prototype.warmStarting=!1,e.b2TimeStep.prototype.Copy=function(t){return this.dt=t.dt,this.inv_dt=t.inv_dt,this.dtRatio=t.dtRatio,this.positionIterations=t.positionIterations,this.velocityIterations=t.velocityIterations,this.warmStarting=t.warmStarting,this},e.b2Position=function(){this.c=new e.b2Vec2},e.b2Position.prototype.c=null,e.b2Position.prototype.a=0,e.b2Position.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2Position})},e.b2Velocity=function(){this.v=new e.b2Vec2},e.b2Velocity.prototype.v=null,e.b2Velocity.prototype.w=0,e.b2Velocity.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2Velocity})},e.b2SolverData=function(){this.step=new e.b2TimeStep},e.b2SolverData.prototype.step=null,e.b2SolverData.prototype.positions=null,e.b2SolverData.prototype.velocities=null,e}(e,o),k=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2WeldJoint&&(e.b2WeldJoint={}),e.b2WeldJointDef=function(){t.base(this,e.b2JointType.e_weldJoint),this.localAnchorA=new e.b2Vec2,this.localAnchorB=new e.b2Vec2},t.inherits(e.b2WeldJointDef,e.b2JointDef),e.b2WeldJointDef.prototype.localAnchorA=null,e.b2WeldJointDef.prototype.localAnchorB=null,e.b2WeldJointDef.prototype.referenceAngle=0,e.b2WeldJointDef.prototype.frequencyHz=0,e.b2WeldJointDef.prototype.dampingRatio=0,e.b2WeldJointDef.prototype.Initialize=function(t,e,o){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(o,this.localAnchorA),this.bodyB.GetLocalPoint(o,this.localAnchorB),this.referenceAngle=this.bodyB.GetAngleRadians()-this.bodyA.GetAngleRadians()},e.b2WeldJoint=function(o){t.base(this,o),this.m_frequencyHz=o.frequencyHz,this.m_dampingRatio=o.dampingRatio,this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_referenceAngle=o.referenceAngle,this.m_impulse=new e.b2Vec3(0,0,0),this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_mass=new e.b2Mat33,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_K=new e.b2Mat33},t.inherits(e.b2WeldJoint,e.b2Joint),e.b2WeldJoint.prototype.m_frequencyHz=0,e.b2WeldJoint.prototype.m_dampingRatio=0,e.b2WeldJoint.prototype.m_bias=0,e.b2WeldJoint.prototype.m_localAnchorA=null,e.b2WeldJoint.prototype.m_localAnchorB=null,e.b2WeldJoint.prototype.m_referenceAngle=0,e.b2WeldJoint.prototype.m_gamma=0,e.b2WeldJoint.prototype.m_impulse=null,e.b2WeldJoint.prototype.m_indexA=0,e.b2WeldJoint.prototype.m_indexB=0,e.b2WeldJoint.prototype.m_rA=null,e.b2WeldJoint.prototype.m_rB=null,e.b2WeldJoint.prototype.m_localCenterA=null,e.b2WeldJoint.prototype.m_localCenterB=null,e.b2WeldJoint.prototype.m_invMassA=0,e.b2WeldJoint.prototype.m_invMassB=0,e.b2WeldJoint.prototype.m_invIA=0,e.b2WeldJoint.prototype.m_invIB=0,e.b2WeldJoint.prototype.m_mass=null,e.b2WeldJoint.prototype.m_qA=null,e.b2WeldJoint.prototype.m_qB=null,e.b2WeldJoint.prototype.m_lalcA=null,e.b2WeldJoint.prototype.m_lalcB=null,e.b2WeldJoint.prototype.m_K=null,e.b2WeldJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=t.positions[this.m_indexA].a,i=t.velocities[this.m_indexA].v,n=t.velocities[this.m_indexA].w,s=t.positions[this.m_indexB].a,r=t.velocities[this.m_indexB].v,a=t.velocities[this.m_indexB].w,l=this.m_qA.SetAngleRadians(o),p=this.m_qB.SetAngleRadians(s);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA),e.b2MulRV(l,this.m_lalcA,this.m_rA),e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB),e.b2MulRV(p,this.m_lalcB,this.m_rB);var m=this.m_invMassA,_=this.m_invMassB,b=this.m_invIA,h=this.m_invIB,c=this.m_K;if(c.ex.x=m+_+this.m_rA.y*this.m_rA.y*b+this.m_rB.y*this.m_rB.y*h,c.ey.x=-this.m_rA.y*this.m_rA.x*b-this.m_rB.y*this.m_rB.x*h,c.ez.x=-this.m_rA.y*b-this.m_rB.y*h,c.ex.y=c.ey.x,c.ey.y=m+_+this.m_rA.x*this.m_rA.x*b+this.m_rB.x*this.m_rB.x*h,c.ez.y=this.m_rA.x*b+this.m_rB.x*h,c.ex.z=c.ez.x,c.ey.z=c.ez.y,c.ez.z=b+h,this.m_frequencyHz>0){c.GetInverse22(this.m_mass);var u=b+h,y=u>0?1/u:0,d=s-o-this.m_referenceAngle,f=2*e.b2_pi*this.m_frequencyHz,A=2*y*this.m_dampingRatio*f,S=y*f*f,C=t.step.dt;this.m_gamma=C*(A+C*S),this.m_gamma=0!=this.m_gamma?1/this.m_gamma:0,this.m_bias=d*C*S*this.m_gamma,u+=this.m_gamma,this.m_mass.ez.z=0!=u?1/u:0}else c.GetSymInverse33(this.m_mass),this.m_gamma=0,this.m_bias=0;if(t.step.warmStarting){this.m_impulse.SelfMul(t.step.dtRatio);var v=e.b2WeldJoint.prototype.InitVelocityConstraints.s_P.Set(this.m_impulse.x,this.m_impulse.y);i.SelfMulSub(m,v),n-=b*(e.b2CrossVV(this.m_rA,v)+this.m_impulse.z),r.SelfMulAdd(_,v),a+=h*(e.b2CrossVV(this.m_rB,v)+this.m_impulse.z)}else this.m_impulse.SetZero();t.velocities[this.m_indexA].w=n,t.velocities[this.m_indexB].w=a},e.b2WeldJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2WeldJoint.prototype.SolveVelocityConstraints=function(t){var o=t.velocities[this.m_indexA].v,i=t.velocities[this.m_indexA].w,n=t.velocities[this.m_indexB].v,s=t.velocities[this.m_indexB].w,r=this.m_invMassA,a=this.m_invMassB,l=this.m_invIA,p=this.m_invIB;if(this.m_frequencyHz>0){var m=s-i,_=-this.m_mass.ez.z*(m+this.m_bias+this.m_gamma*this.m_impulse.z);this.m_impulse.z+=_,i-=l*_,s+=p*_;var b=e.b2SubVV(e.b2AddVCrossSV(n,s,this.m_rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(o,i,this.m_rA,e.b2Vec2.s_t1),e.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1),h=e.b2MulM33XY(this.m_mass,b.x,b.y,e.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse1).SelfNeg();this.m_impulse.x+=h.x,this.m_impulse.y+=h.y;var c=h;o.SelfMulSub(r,c),i-=l*e.b2CrossVV(this.m_rA,c),n.SelfMulAdd(a,c),s+=p*e.b2CrossVV(this.m_rB,c)}else{var b=e.b2SubVV(e.b2AddVCrossSV(n,s,this.m_rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(o,i,this.m_rA,e.b2Vec2.s_t1),e.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1),m=s-i,u=e.b2MulM33XYZ(this.m_mass,b.x,b.y,m,e.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse).SelfNeg();this.m_impulse.SelfAdd(u);var c=e.b2WeldJoint.prototype.SolveVelocityConstraints.s_P.Set(u.x,u.y);o.SelfMulSub(r,c),i-=l*(e.b2CrossVV(this.m_rA,c)+u.z),n.SelfMulAdd(a,c),s+=p*(e.b2CrossVV(this.m_rB,c)+u.z)}t.velocities[this.m_indexA].w=i,t.velocities[this.m_indexB].w=s},e.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1=new e.b2Vec2,e.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse1=new e.b2Vec2,e.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse=new e.b2Vec3,e.b2WeldJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2WeldJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s),l=this.m_invMassA,p=this.m_invMassB,m=this.m_invIA,_=this.m_invIB;e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var b=e.b2MulRV(r,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var h,c,u=e.b2MulRV(a,this.m_lalcB,this.m_rB),y=this.m_K;if(y.ex.x=l+p+b.y*b.y*m+u.y*u.y*_,y.ey.x=-b.y*b.x*m-u.y*u.x*_,y.ez.x=-b.y*m-u.y*_,y.ex.y=y.ey.x,y.ey.y=l+p+b.x*b.x*m+u.x*u.x*_,y.ez.y=b.x*m+u.x*_,y.ex.z=y.ez.x,y.ey.z=y.ez.y,y.ez.z=m+_,this.m_frequencyHz>0){var d=e.b2SubVV(e.b2AddVV(n,u,e.b2Vec2.s_t0),e.b2AddVV(o,b,e.b2Vec2.s_t1),e.b2WeldJoint.prototype.SolvePositionConstraints.s_C1);h=d.GetLength(),c=0;var f=y.Solve22(d.x,d.y,e.b2WeldJoint.prototype.SolvePositionConstraints.s_P).SelfNeg();o.SelfMulSub(l,f),i-=m*e.b2CrossVV(b,f),n.SelfMulAdd(p,f),s+=_*e.b2CrossVV(u,f)}else{var d=e.b2SubVV(e.b2AddVV(n,u,e.b2Vec2.s_t0),e.b2AddVV(o,b,e.b2Vec2.s_t1),e.b2WeldJoint.prototype.SolvePositionConstraints.s_C1),A=s-i-this.m_referenceAngle;h=d.GetLength(),c=e.b2Abs(A);var S=y.Solve33(d.x,d.y,A,e.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse).SelfNeg(),f=e.b2WeldJoint.prototype.SolvePositionConstraints.s_P.Set(S.x,S.y);o.SelfMulSub(l,f),i-=m*(e.b2CrossVV(this.m_rA,f)+S.z),n.SelfMulAdd(p,f),s+=_*(e.b2CrossVV(this.m_rB,f)+S.z)}return t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,h<=e.b2_linearSlop&&c<=e.b2_angularSlop},e.b2WeldJoint.prototype.SolvePositionConstraints.s_C1=new e.b2Vec2,e.b2WeldJoint.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse=new e.b2Vec3,e.b2WeldJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2WeldJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2WeldJoint.prototype.GetReactionForce=function(t,e){return e.Set(t*this.m_impulse.x,t*this.m_impulse.y)},e.b2WeldJoint.prototype.GetReactionTorque=function(t){return t*this.m_impulse.z},e.b2WeldJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2WeldJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2WeldJoint.prototype.GetReferenceAngle=function(){return this.m_referenceAngle},e.b2WeldJoint.prototype.SetFrequency=function(t){this.m_frequencyHz=t},e.b2WeldJoint.prototype.GetFrequency=function(){return this.m_frequencyHz},e.b2WeldJoint.prototype.SetDampingRatio=function(t){this.m_dampingRatio=t},e.b2WeldJoint.prototype.GetDampingRatio=function(){return this.m_dampingRatio},e.b2WeldJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2WeldJointDef*/ var jd = new box2d.b2WeldJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.referenceAngle = %.15f;\n",this.m_referenceAngle),e.b2Log("  jd.frequencyHz = %.15f;\n",this.m_frequencyHz),e.b2Log("  jd.dampingRatio = %.15f;\n",this.m_dampingRatio),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),W=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2WheelJoint&&(e.b2WheelJoint={}),e.b2WheelJointDef=function(){t.base(this,e.b2JointType.e_wheelJoint),this.localAnchorA=new e.b2Vec2(0,0),this.localAnchorB=new e.b2Vec2(0,0),this.localAxisA=new e.b2Vec2(1,0)},t.inherits(e.b2WheelJointDef,e.b2JointDef),e.b2WheelJointDef.prototype.localAnchorA=null,e.b2WheelJointDef.prototype.localAnchorB=null,e.b2WheelJointDef.prototype.localAxisA=null,e.b2WheelJointDef.prototype.enableMotor=!1,e.b2WheelJointDef.prototype.maxMotorTorque=0,e.b2WheelJointDef.prototype.motorSpeed=0,e.b2WheelJointDef.prototype.frequencyHz=2,e.b2WheelJointDef.prototype.dampingRatio=.7,e.b2WheelJointDef.prototype.Initialize=function(t,e,o,i){this.bodyA=t,this.bodyB=e,this.bodyA.GetLocalPoint(o,this.localAnchorA),this.bodyB.GetLocalPoint(o,this.localAnchorB),this.bodyA.GetLocalVector(i,this.localAxisA)},e.b2WheelJoint=function(o){t.base(this,o),this.m_frequencyHz=o.frequencyHz,this.m_dampingRatio=o.dampingRatio,this.m_localAnchorA=o.localAnchorA.Clone(),this.m_localAnchorB=o.localAnchorB.Clone(),this.m_localXAxisA=o.localAxisA.Clone(),this.m_localYAxisA=e.b2CrossOneV(this.m_localXAxisA,new e.b2Vec2),this.m_maxMotorTorque=o.maxMotorTorque,this.m_motorSpeed=o.motorSpeed,this.m_enableMotor=o.enableMotor,this.m_localCenterA=new e.b2Vec2,this.m_localCenterB=new e.b2Vec2,this.m_ax=new e.b2Vec2,this.m_ay=new e.b2Vec2,this.m_qA=new e.b2Rot,this.m_qB=new e.b2Rot,this.m_lalcA=new e.b2Vec2,this.m_lalcB=new e.b2Vec2,this.m_rA=new e.b2Vec2,this.m_rB=new e.b2Vec2,this.m_ax.SetZero(),this.m_ay.SetZero()},t.inherits(e.b2WheelJoint,e.b2Joint),e.b2WheelJoint.prototype.m_frequencyHz=0,e.b2WheelJoint.prototype.m_dampingRatio=0,e.b2WheelJoint.prototype.m_localAnchorA=null,e.b2WheelJoint.prototype.m_localAnchorB=null,e.b2WheelJoint.prototype.m_localXAxisA=null,e.b2WheelJoint.prototype.m_localYAxisA=null,e.b2WheelJoint.prototype.m_impulse=0,e.b2WheelJoint.prototype.m_motorImpulse=0,e.b2WheelJoint.prototype.m_springImpulse=0,e.b2WheelJoint.prototype.m_maxMotorTorque=0,e.b2WheelJoint.prototype.m_motorSpeed=0,e.b2WheelJoint.prototype.m_enableMotor=!1,e.b2WheelJoint.prototype.m_indexA=0,e.b2WheelJoint.prototype.m_indexB=0,e.b2WheelJoint.prototype.m_localCenterA=null,e.b2WheelJoint.prototype.m_localCenterB=null,e.b2WheelJoint.prototype.m_invMassA=0,e.b2WheelJoint.prototype.m_invMassB=0,e.b2WheelJoint.prototype.m_invIA=0,e.b2WheelJoint.prototype.m_invIB=0,e.b2WheelJoint.prototype.m_ax=null,e.b2WheelJoint.prototype.m_ay=null,e.b2WheelJoint.prototype.m_sAx=0,e.b2WheelJoint.prototype.m_sBx=0,e.b2WheelJoint.prototype.m_sAy=0,e.b2WheelJoint.prototype.m_sBy=0,e.b2WheelJoint.prototype.m_mass=0,e.b2WheelJoint.prototype.m_motorMass=0,e.b2WheelJoint.prototype.m_springMass=0,e.b2WheelJoint.prototype.m_bias=0,e.b2WheelJoint.prototype.m_gamma=0,e.b2WheelJoint.prototype.m_qA=null,e.b2WheelJoint.prototype.m_qB=null,e.b2WheelJoint.prototype.m_lalcA=null,e.b2WheelJoint.prototype.m_lalcB=null,e.b2WheelJoint.prototype.m_rA=null,e.b2WheelJoint.prototype.m_rB=null,e.b2WheelJoint.prototype.GetMotorSpeed=function(){return this.m_motorSpeed},e.b2WheelJoint.prototype.GetMaxMotorTorque=function(){return this.m_maxMotorTorque},e.b2WheelJoint.prototype.SetSpringFrequencyHz=function(t){this.m_frequencyHz=t},e.b2WheelJoint.prototype.GetSpringFrequencyHz=function(){return this.m_frequencyHz},e.b2WheelJoint.prototype.SetSpringDampingRatio=function(t){this.m_dampingRatio=t},e.b2WheelJoint.prototype.GetSpringDampingRatio=function(){return this.m_dampingRatio},e.b2WheelJoint.prototype.InitVelocityConstraints=function(t){this.m_indexA=this.m_bodyA.m_islandIndex,this.m_indexB=this.m_bodyB.m_islandIndex,this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter),this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter),this.m_invMassA=this.m_bodyA.m_invMass,this.m_invMassB=this.m_bodyB.m_invMass,this.m_invIA=this.m_bodyA.m_invI,this.m_invIB=this.m_bodyB.m_invI;var o=this.m_invMassA,i=this.m_invMassB,n=this.m_invIA,s=this.m_invIB,r=t.positions[this.m_indexA].c,a=t.positions[this.m_indexA].a,l=t.velocities[this.m_indexA].v,p=t.velocities[this.m_indexA].w,m=t.positions[this.m_indexB].c,_=t.positions[this.m_indexB].a,b=t.velocities[this.m_indexB].v,h=t.velocities[this.m_indexB].w,c=this.m_qA.SetAngleRadians(a),u=this.m_qB.SetAngleRadians(_);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var y=e.b2MulRV(c,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var d=e.b2MulRV(u,this.m_lalcB,this.m_rB),f=e.b2SubVV(e.b2AddVV(m,d,e.b2Vec2.s_t0),e.b2AddVV(r,y,e.b2Vec2.s_t1),e.b2WheelJoint.prototype.InitVelocityConstraints.s_d);if(e.b2MulRV(c,this.m_localYAxisA,this.m_ay),this.m_sAy=e.b2CrossVV(e.b2AddVV(f,y,e.b2Vec2.s_t0),this.m_ay),this.m_sBy=e.b2CrossVV(d,this.m_ay),this.m_mass=o+i+n*this.m_sAy*this.m_sAy+s*this.m_sBy*this.m_sBy,this.m_mass>0&&(this.m_mass=1/this.m_mass),this.m_springMass=0,this.m_bias=0,this.m_gamma=0,this.m_frequencyHz>0){e.b2MulRV(c,this.m_localXAxisA,this.m_ax),this.m_sAx=e.b2CrossVV(e.b2AddVV(f,y,e.b2Vec2.s_t0),this.m_ax),this.m_sBx=e.b2CrossVV(d,this.m_ax);var A=o+i+n*this.m_sAx*this.m_sAx+s*this.m_sBx*this.m_sBx;
	if(A>0){this.m_springMass=1/A;var S=e.b2DotVV(f,this.m_ax),C=2*e.b2_pi*this.m_frequencyHz,v=2*this.m_springMass*this.m_dampingRatio*C,x=this.m_springMass*C*C,V=t.step.dt;this.m_gamma=V*(v+V*x),this.m_gamma>0&&(this.m_gamma=1/this.m_gamma),this.m_bias=S*V*x*this.m_gamma,this.m_springMass=A+this.m_gamma,this.m_springMass>0&&(this.m_springMass=1/this.m_springMass)}}else this.m_springImpulse=0;if(this.m_enableMotor?(this.m_motorMass=n+s,this.m_motorMass>0&&(this.m_motorMass=1/this.m_motorMass)):(this.m_motorMass=0,this.m_motorImpulse=0),t.step.warmStarting){this.m_impulse*=t.step.dtRatio,this.m_springImpulse*=t.step.dtRatio,this.m_motorImpulse*=t.step.dtRatio;var g=e.b2AddVV(e.b2MulSV(this.m_impulse,this.m_ay,e.b2Vec2.s_t0),e.b2MulSV(this.m_springImpulse,this.m_ax,e.b2Vec2.s_t1),e.b2WheelJoint.prototype.InitVelocityConstraints.s_P),B=this.m_impulse*this.m_sAy+this.m_springImpulse*this.m_sAx+this.m_motorImpulse,w=this.m_impulse*this.m_sBy+this.m_springImpulse*this.m_sBx+this.m_motorImpulse;l.SelfMulSub(this.m_invMassA,g),p-=this.m_invIA*B,b.SelfMulAdd(this.m_invMassB,g),h+=this.m_invIB*w}else this.m_impulse=0,this.m_springImpulse=0,this.m_motorImpulse=0;t.velocities[this.m_indexA].w=p,t.velocities[this.m_indexB].w=h},e.b2WheelJoint.prototype.InitVelocityConstraints.s_d=new e.b2Vec2,e.b2WheelJoint.prototype.InitVelocityConstraints.s_P=new e.b2Vec2,e.b2WheelJoint.prototype.SolveVelocityConstraints=function(t){var o=this.m_invMassA,i=this.m_invMassB,n=this.m_invIA,s=this.m_invIB,r=t.velocities[this.m_indexA].v,a=t.velocities[this.m_indexA].w,l=t.velocities[this.m_indexB].v,p=t.velocities[this.m_indexB].w,m=e.b2DotVV(this.m_ax,e.b2SubVV(l,r,e.b2Vec2.s_t0))+this.m_sBx*p-this.m_sAx*a,_=-this.m_springMass*(m+this.m_bias+this.m_gamma*this.m_springImpulse);this.m_springImpulse+=_;var b=e.b2MulSV(_,this.m_ax,e.b2WheelJoint.prototype.SolveVelocityConstraints.s_P),h=_*this.m_sAx,c=_*this.m_sBx;r.SelfMulSub(o,b),a-=n*h,l.SelfMulAdd(i,b),p+=s*c;var m=p-a-this.m_motorSpeed,_=-this.m_motorMass*m,u=this.m_motorImpulse,y=t.step.dt*this.m_maxMotorTorque;this.m_motorImpulse=e.b2Clamp(this.m_motorImpulse+_,-y,y),_=this.m_motorImpulse-u,a-=n*_,p+=s*_;var m=e.b2DotVV(this.m_ay,e.b2SubVV(l,r,e.b2Vec2.s_t0))+this.m_sBy*p-this.m_sAy*a,_=-this.m_mass*m;this.m_impulse+=_;var b=e.b2MulSV(_,this.m_ay,e.b2WheelJoint.prototype.SolveVelocityConstraints.s_P),h=_*this.m_sAy,c=_*this.m_sBy;r.SelfMulSub(o,b),a-=n*h,l.SelfMulAdd(i,b),p+=s*c,t.velocities[this.m_indexA].w=a,t.velocities[this.m_indexB].w=p},e.b2WheelJoint.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2WheelJoint.prototype.SolvePositionConstraints=function(t){var o=t.positions[this.m_indexA].c,i=t.positions[this.m_indexA].a,n=t.positions[this.m_indexB].c,s=t.positions[this.m_indexB].a,r=this.m_qA.SetAngleRadians(i),a=this.m_qB.SetAngleRadians(s);e.b2SubVV(this.m_localAnchorA,this.m_localCenterA,this.m_lalcA);var l=e.b2MulRV(r,this.m_lalcA,this.m_rA);e.b2SubVV(this.m_localAnchorB,this.m_localCenterB,this.m_lalcB);var p,m=e.b2MulRV(a,this.m_lalcB,this.m_rB),_=e.b2AddVV(e.b2SubVV(n,o,e.b2Vec2.s_t0),e.b2SubVV(m,l,e.b2Vec2.s_t1),e.b2WheelJoint.prototype.SolvePositionConstraints.s_d),b=e.b2MulRV(r,this.m_localYAxisA,this.m_ay),h=e.b2CrossVV(e.b2AddVV(_,l,e.b2Vec2.s_t0),b),c=e.b2CrossVV(m,b),u=e.b2DotVV(_,this.m_ay),y=this.m_invMassA+this.m_invMassB+this.m_invIA*this.m_sAy*this.m_sAy+this.m_invIB*this.m_sBy*this.m_sBy;p=0!=y?-u/y:0;var d=e.b2MulSV(p,b,e.b2WheelJoint.prototype.SolvePositionConstraints.s_P),f=p*h,A=p*c;return o.SelfMulSub(this.m_invMassA,d),i-=this.m_invIA*f,n.SelfMulAdd(this.m_invMassB,d),s+=this.m_invIB*A,t.positions[this.m_indexA].a=i,t.positions[this.m_indexB].a=s,e.b2Abs(u)<=e.b2_linearSlop},e.b2WheelJoint.prototype.SolvePositionConstraints.s_d=new e.b2Vec2,e.b2WheelJoint.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e.b2WheelJoint.prototype.GetDefinition=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(!1),t},e.b2WheelJoint.prototype.GetAnchorA=function(t){return this.m_bodyA.GetWorldPoint(this.m_localAnchorA,t)},e.b2WheelJoint.prototype.GetAnchorB=function(t){return this.m_bodyB.GetWorldPoint(this.m_localAnchorB,t)},e.b2WheelJoint.prototype.GetReactionForce=function(t,e){return e.x=t*(this.m_impulse*this.m_ay.x+this.m_springImpulse*this.m_ax.x),e.y=t*(this.m_impulse*this.m_ay.y+this.m_springImpulse*this.m_ax.y),e},e.b2WheelJoint.prototype.GetReactionTorque=function(t){return t*this.m_motorImpulse},e.b2WheelJoint.prototype.GetLocalAnchorA=function(t){return t.Copy(this.m_localAnchorA)},e.b2WheelJoint.prototype.GetLocalAnchorB=function(t){return t.Copy(this.m_localAnchorB)},e.b2WheelJoint.prototype.GetLocalAxisA=function(t){return t.Copy(this.m_localXAxisA)},e.b2WheelJoint.prototype.GetJointTranslation=function(){var t=this.m_bodyA,o=this.m_bodyB,i=t.GetWorldPoint(this.m_localAnchorA,new e.b2Vec2),n=o.GetWorldPoint(this.m_localAnchorB,new e.b2Vec2),s=e.b2SubVV(n,i,new e.b2Vec2),r=t.GetWorldVector(this.m_localXAxisA,new e.b2Vec2),a=e.b2DotVV(s,r);return a},e.b2WheelJoint.prototype.GetJointSpeed=function(){var t=this.m_bodyA.m_angularVelocity,e=this.m_bodyB.m_angularVelocity;return e-t},e.b2WheelJoint.prototype.IsMotorEnabled=function(){return this.m_enableMotor},e.b2WheelJoint.prototype.EnableMotor=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_enableMotor=t},e.b2WheelJoint.prototype.SetMotorSpeed=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_motorSpeed=t},e.b2WheelJoint.prototype.SetMaxMotorTorque=function(t){this.m_bodyA.SetAwake(!0),this.m_bodyB.SetAwake(!0),this.m_maxMotorTorque=t},e.b2WheelJoint.prototype.GetMotorTorque=function(t){return t*this.m_motorImpulse},e.b2WheelJoint.prototype.Dump=function(){if(e.DEBUG){var t=this.m_bodyA.m_islandIndex,o=this.m_bodyB.m_islandIndex;e.b2Log("  /*box2d.b2WheelJointDef*/ var jd = new box2d.b2WheelJointDef();\n"),e.b2Log("  jd.bodyA = bodies[%d];\n",t),e.b2Log("  jd.bodyB = bodies[%d];\n",o),e.b2Log("  jd.collideConnected = %s;\n",this.m_collideConnected?"true":"false"),e.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n",this.m_localAnchorA.x,this.m_localAnchorA.y),e.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n",this.m_localAnchorB.x,this.m_localAnchorB.y),e.b2Log("  jd.localAxisA.Set(%.15f, %.15f);\n",this.m_localXAxisA.x,this.m_localXAxisA.y),e.b2Log("  jd.enableMotor = %s;\n",this.m_enableMotor?"true":"false"),e.b2Log("  jd.motorSpeed = %.15f;\n",this.m_motorSpeed),e.b2Log("  jd.maxMotorTorque = %.15f;\n",this.m_maxMotorTorque),e.b2Log("  jd.frequencyHz = %.15f;\n",this.m_frequencyHz),e.b2Log("  jd.dampingRatio = %.15f;\n",this.m_dampingRatio),e.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n",this.m_index)}},e}(e,n,i,o),q=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ContactFactory&&(e.b2ContactFactory={}),e.b2ContactRegister=function(){},e.b2ContactRegister.prototype.createFcn=null,e.b2ContactRegister.prototype.destroyFcn=null,e.b2ContactRegister.prototype.primary=!1,e.b2ContactFactory=function(t){this.m_allocator=t,this.InitializeRegisters()},e.b2ContactFactory.prototype.m_allocator=null,e.b2ContactFactory.prototype.AddType=function(t,o,i,n){var s=e.b2MakeArray(256,function(){return t()}),r=function(e){return s.length>0?s.pop():t(e)},a=function(t){s.push(t)};this.m_registers[i][n].pool=s,this.m_registers[i][n].createFcn=r,this.m_registers[i][n].destroyFcn=a,this.m_registers[i][n].primary=!0,i!=n&&(this.m_registers[n][i].pool=s,this.m_registers[n][i].createFcn=r,this.m_registers[n][i].destroyFcn=a,this.m_registers[n][i].primary=!1)},e.b2ContactFactory.prototype.InitializeRegisters=function(){this.m_registers=new Array(e.b2ShapeType.e_shapeTypeCount);for(var t=0;t<e.b2ShapeType.e_shapeTypeCount;t++){this.m_registers[t]=new Array(e.b2ShapeType.e_shapeTypeCount);for(var o=0;o<e.b2ShapeType.e_shapeTypeCount;o++)this.m_registers[t][o]=new e.b2ContactRegister}this.AddType(e.b2CircleContact.Create,e.b2CircleContact.Destroy,e.b2ShapeType.e_circleShape,e.b2ShapeType.e_circleShape),this.AddType(e.b2PolygonAndCircleContact.Create,e.b2PolygonAndCircleContact.Destroy,e.b2ShapeType.e_polygonShape,e.b2ShapeType.e_circleShape),this.AddType(e.b2PolygonContact.Create,e.b2PolygonContact.Destroy,e.b2ShapeType.e_polygonShape,e.b2ShapeType.e_polygonShape),this.AddType(e.b2EdgeAndCircleContact.Create,e.b2EdgeAndCircleContact.Destroy,e.b2ShapeType.e_edgeShape,e.b2ShapeType.e_circleShape),this.AddType(e.b2EdgeAndPolygonContact.Create,e.b2EdgeAndPolygonContact.Destroy,e.b2ShapeType.e_edgeShape,e.b2ShapeType.e_polygonShape),this.AddType(e.b2ChainAndCircleContact.Create,e.b2ChainAndCircleContact.Destroy,e.b2ShapeType.e_chainShape,e.b2ShapeType.e_circleShape),this.AddType(e.b2ChainAndPolygonContact.Create,e.b2ChainAndPolygonContact.Destroy,e.b2ShapeType.e_chainShape,e.b2ShapeType.e_polygonShape)},e.b2ContactFactory.prototype.Create=function(t,o,i,n){var s=t.GetType(),r=i.GetType();e.ENABLE_ASSERTS&&e.b2Assert(s>=0&&s<e.b2ShapeType.e_shapeTypeCount),e.ENABLE_ASSERTS&&e.b2Assert(r>=0&&r<e.b2ShapeType.e_shapeTypeCount);var a=this.m_registers[s][r],l=a.createFcn;if(null!=l){if(a.primary){var p=l(this.m_allocator);return p.Reset(t,o,i,n),p}var p=l(this.m_allocator);return p.Reset(i,n,t,o),p}return null},e.b2ContactFactory.prototype.Destroy=function(t){var o=t.m_fixtureA,i=t.m_fixtureB;t.m_manifold.pointCount>0&&0==o.IsSensor()&&0==i.IsSensor()&&(o.GetBody().SetAwake(!0),i.GetBody().SetAwake(!0));var n=o.GetType(),s=i.GetType();e.ENABLE_ASSERTS&&e.b2Assert(n>=0&&s<e.b2ShapeType.e_shapeTypeCount),e.ENABLE_ASSERTS&&e.b2Assert(n>=0&&s<e.b2ShapeType.e_shapeTypeCount);var r=this.m_registers[n][s],a=r.destroyFcn;a(t,this.m_allocator)},e}(e,V,o),z=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ContactManager&&(e.b2ContactManager={}),e.b2ContactManager=function(){this.m_broadPhase=new e.b2BroadPhase,this.m_contactFactory=new e.b2ContactFactory(this.m_allocator)},e.b2ContactManager.prototype.m_broadPhase=null,e.b2ContactManager.prototype.m_contactList=null,e.b2ContactManager.prototype.m_contactCount=0,e.b2ContactManager.prototype.m_contactFilter=e.b2ContactFilter.b2_defaultFilter,e.b2ContactManager.prototype.m_contactListener=e.b2ContactListener.b2_defaultListener,e.b2ContactManager.prototype.m_allocator=null,e.b2ContactManager.prototype.m_contactFactory=null,e.b2ContactManager.prototype.Destroy=function(t){var e=t.GetFixtureA(),o=t.GetFixtureB(),i=e.GetBody(),n=o.GetBody();this.m_contactListener&&t.IsTouching()&&this.m_contactListener.EndContact(t),t.m_prev&&(t.m_prev.m_next=t.m_next),t.m_next&&(t.m_next.m_prev=t.m_prev),t==this.m_contactList&&(this.m_contactList=t.m_next),t.m_nodeA.prev&&(t.m_nodeA.prev.next=t.m_nodeA.next),t.m_nodeA.next&&(t.m_nodeA.next.prev=t.m_nodeA.prev),t.m_nodeA==i.m_contactList&&(i.m_contactList=t.m_nodeA.next),t.m_nodeB.prev&&(t.m_nodeB.prev.next=t.m_nodeB.next),t.m_nodeB.next&&(t.m_nodeB.next.prev=t.m_nodeB.prev),t.m_nodeB==n.m_contactList&&(n.m_contactList=t.m_nodeB.next),this.m_contactFactory.Destroy(t),--this.m_contactCount},e.b2ContactManager.prototype.Collide=function(){for(var t=this.m_contactList;t;){var o=t.GetFixtureA(),i=t.GetFixtureB(),n=t.GetChildIndexA(),s=t.GetChildIndexB(),r=o.GetBody(),a=i.GetBody();if(t.m_flags&e.b2ContactFlag.e_filterFlag){if(0==a.ShouldCollide(r)){var l=t;t=l.m_next,this.Destroy(l);continue}if(this.m_contactFilter&&0==this.m_contactFilter.ShouldCollide(o,i)){l=t,t=l.m_next,this.Destroy(l);continue}t.m_flags&=~e.b2ContactFlag.e_filterFlag}var p=r.IsAwake()&&r.m_type!=e.b2BodyType.b2_staticBody,m=a.IsAwake()&&a.m_type!=e.b2BodyType.b2_staticBody;if(0!=p||0!=m){var _=o.m_proxies[n].proxy,b=i.m_proxies[s].proxy,h=this.m_broadPhase.TestOverlap(_,b);0!=h?(t.Update(this.m_contactListener),t=t.m_next):(l=t,t=l.m_next,this.Destroy(l))}else t=t.m_next}},e.b2ContactManager.prototype.FindNewContacts=function(){this.m_broadPhase.UpdatePairs(this)},e.b2ContactManager.prototype.AddPair=function(t,o){e.ENABLE_ASSERTS&&e.b2Assert(t instanceof e.b2FixtureProxy),e.ENABLE_ASSERTS&&e.b2Assert(o instanceof e.b2FixtureProxy);var i=t,n=o,s=i.fixture,r=n.fixture,a=i.childIndex,l=n.childIndex,p=s.GetBody(),m=r.GetBody();if(p!=m){for(var _=m.GetContactList();_;){if(_.other==p){var b=_.contact.GetFixtureA(),h=_.contact.GetFixtureB(),c=_.contact.GetChildIndexA(),u=_.contact.GetChildIndexB();if(b==s&&h==r&&c==a&&u==l)return;if(b==r&&h==s&&c==l&&u==a)return}_=_.next}if(0!=m.ShouldCollide(p)&&(!this.m_contactFilter||0!=this.m_contactFilter.ShouldCollide(s,r))){var y=this.m_contactFactory.Create(s,a,r,l);null!=y&&(s=y.GetFixtureA(),r=y.GetFixtureB(),a=y.GetChildIndexA(),l=y.GetChildIndexB(),p=s.m_body,m=r.m_body,y.m_prev=null,y.m_next=this.m_contactList,null!==this.m_contactList&&(this.m_contactList.m_prev=y),this.m_contactList=y,y.m_nodeA.contact=y,y.m_nodeA.other=m,y.m_nodeA.prev=null,y.m_nodeA.next=p.m_contactList,null!=p.m_contactList&&(p.m_contactList.prev=y.m_nodeA),p.m_contactList=y.m_nodeA,y.m_nodeB.contact=y,y.m_nodeB.other=p,y.m_nodeB.prev=null,y.m_nodeB.next=m.m_contactList,null!=m.m_contactList&&(m.m_contactList.prev=y.m_nodeB),m.m_contactList=y.m_nodeB,0==s.IsSensor()&&0==r.IsSensor()&&(p.SetAwake(!0),m.SetAwake(!0)),++this.m_contactCount)}}},e}(e,h,a,q,i,o),O=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2CollideEdge&&(e.b2CollideEdge={}),e.b2CollideEdgeAndCircle=function(t,o,i,n,s){t.pointCount=0;var r=e.b2MulTXV(i,e.b2MulXV(s,n.m_p,e.b2Vec2.s_t0),e.b2CollideEdgeAndCircle.s_Q),a=o.m_vertex1,l=o.m_vertex2,p=e.b2SubVV(l,a,e.b2CollideEdgeAndCircle.s_e),m=e.b2DotVV(p,e.b2SubVV(l,r,e.b2Vec2.s_t0)),_=e.b2DotVV(p,e.b2SubVV(r,a,e.b2Vec2.s_t0)),b=o.m_radius+n.m_radius,h=e.b2CollideEdgeAndCircle.s_id;if(h.cf.indexB=0,h.cf.typeB=e.b2ContactFeatureType.e_vertex,0>=_){var c=a,u=e.b2SubVV(r,c,e.b2CollideEdgeAndCircle.s_d),y=e.b2DotVV(u,u);if(y>b*b)return;if(o.m_hasVertex0){var d=o.m_vertex0,f=a,A=e.b2SubVV(f,d,e.b2CollideEdgeAndCircle.s_e1),S=e.b2DotVV(A,e.b2SubVV(f,r,e.b2Vec2.s_t0));if(S>0)return}return h.cf.indexA=0,h.cf.typeA=e.b2ContactFeatureType.e_vertex,t.pointCount=1,t.type=e.b2ManifoldType.e_circles,t.localNormal.SetZero(),t.localPoint.Copy(c),t.points[0].id.Copy(h),t.points[0].localPoint.Copy(n.m_p),void 0}if(0>=m){var c=l,u=e.b2SubVV(r,c,e.b2CollideEdgeAndCircle.s_d),y=e.b2DotVV(u,u);if(y>b*b)return;if(o.m_hasVertex3){var C=o.m_vertex3,v=l,x=e.b2SubVV(C,v,e.b2CollideEdgeAndCircle.s_e2),V=e.b2DotVV(x,e.b2SubVV(r,v,e.b2Vec2.s_t0));if(V>0)return}return h.cf.indexA=1,h.cf.typeA=e.b2ContactFeatureType.e_vertex,t.pointCount=1,t.type=e.b2ManifoldType.e_circles,t.localNormal.SetZero(),t.localPoint.Copy(c),t.points[0].id.Copy(h),t.points[0].localPoint.Copy(n.m_p),void 0}var g=e.b2DotVV(p,p);e.ENABLE_ASSERTS&&e.b2Assert(g>0);var c=e.b2CollideEdgeAndCircle.s_P;c.x=1/g*(m*a.x+_*l.x),c.y=1/g*(m*a.y+_*l.y);var u=e.b2SubVV(r,c,e.b2CollideEdgeAndCircle.s_d),y=e.b2DotVV(u,u);if(!(y>b*b)){var B=e.b2CollideEdgeAndCircle.s_n.Set(-p.y,p.x);e.b2DotVV(B,e.b2SubVV(r,a,e.b2Vec2.s_t0))<0&&B.Set(-B.x,-B.y),B.Normalize(),h.cf.indexA=0,h.cf.typeA=e.b2ContactFeatureType.e_face,t.pointCount=1,t.type=e.b2ManifoldType.e_faceA,t.localNormal.Copy(B),t.localPoint.Copy(a),t.points[0].id.Copy(h),t.points[0].localPoint.Copy(n.m_p)}},e.b2CollideEdgeAndCircle.s_Q=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_e=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_d=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_e1=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_e2=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_P=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_n=new e.b2Vec2,e.b2CollideEdgeAndCircle.s_id=new e.b2ContactID,e.b2EPAxisType={e_unknown:0,e_edgeA:1,e_edgeB:2},t.exportProperty(e.b2EPAxisType,"e_unknown",e.b2EPAxisType.e_unknown),t.exportProperty(e.b2EPAxisType,"e_edgeA",e.b2EPAxisType.e_edgeA),t.exportProperty(e.b2EPAxisType,"e_edgeB",e.b2EPAxisType.e_edgeB),e.b2EPAxis=function(){},e.b2EPAxis.prototype.type=e.b2EPAxisType.e_unknown,e.b2EPAxis.prototype.index=0,e.b2EPAxis.prototype.separation=0,e.b2TempPolygon=function(){this.vertices=e.b2Vec2.MakeArray(e.b2_maxPolygonVertices),this.normals=e.b2Vec2.MakeArray(e.b2_maxPolygonVertices),this.count=0},e.b2TempPolygon.prototype.vertices=null,e.b2TempPolygon.prototype.normals=null,e.b2TempPolygon.prototype.count=0,e.b2ReferenceFace=function(){this.i1=0,this.i2=0,this.v1=new e.b2Vec2,this.v2=new e.b2Vec2,this.normal=new e.b2Vec2,this.sideNormal1=new e.b2Vec2,this.sideOffset1=0,this.sideNormal2=new e.b2Vec2,this.sideOffset2=0},e.b2ReferenceFace.prototype.i1=0,e.b2ReferenceFace.prototype.i2=0,e.b2ReferenceFace.prototype.v1=null,e.b2ReferenceFace.prototype.v2=null,e.b2ReferenceFace.prototype.normal=null,e.b2ReferenceFace.prototype.sideNormal1=null,e.b2ReferenceFace.prototype.sideOffset1=0,e.b2ReferenceFace.prototype.sideNormal2=null,e.b2ReferenceFace.prototype.sideOffset2=0,e.b2EPColliderVertexType={e_isolated:0,e_concave:1,e_convex:2},t.exportProperty(e.b2EPColliderVertexType,"e_isolated",e.b2EPColliderVertexType.e_isolated),t.exportProperty(e.b2EPColliderVertexType,"e_concave",e.b2EPColliderVertexType.e_concave),t.exportProperty(e.b2EPColliderVertexType,"e_convex",e.b2EPColliderVertexType.e_convex),e.b2EPCollider=function(){this.m_polygonB=new e.b2TempPolygon,this.m_xf=new e.b2Transform,this.m_centroidB=new e.b2Vec2,this.m_v0=new e.b2Vec2,this.m_v1=new e.b2Vec2,this.m_v2=new e.b2Vec2,this.m_v3=new e.b2Vec2,this.m_normal0=new e.b2Vec2,this.m_normal1=new e.b2Vec2,this.m_normal2=new e.b2Vec2,this.m_normal=new e.b2Vec2,this.m_type1=e.b2EPColliderVertexType.e_isolated,this.m_type2=e.b2EPColliderVertexType.e_isolated,this.m_lowerLimit=new e.b2Vec2,this.m_upperLimit=new e.b2Vec2,this.m_radius=0,this.m_front=!1},e.b2EPCollider.prototype.m_polygonB=null,e.b2EPCollider.prototype.m_xf=null,e.b2EPCollider.prototype.m_centroidB=null,e.b2EPCollider.prototype.m_v0=null,e.b2EPCollider.prototype.m_v1=null,e.b2EPCollider.prototype.m_v2=null,e.b2EPCollider.prototype.m_v3=null,e.b2EPCollider.prototype.m_normal0=null,e.b2EPCollider.prototype.m_normal1=null,e.b2EPCollider.prototype.m_normal2=null,e.b2EPCollider.prototype.m_normal=null,e.b2EPCollider.prototype.m_type1=e.b2EPColliderVertexType.e_isolated,e.b2EPCollider.prototype.m_type2=e.b2EPColliderVertexType.e_isolated,e.b2EPCollider.prototype.m_lowerLimit=null,e.b2EPCollider.prototype.m_upperLimit=null,e.b2EPCollider.prototype.m_radius=0,e.b2EPCollider.prototype.m_front=!1,e.b2EPCollider.prototype.Collide=function(t,o,i,n,s){e.b2MulTXX(i,s,this.m_xf),e.b2MulXV(this.m_xf,n.m_centroid,this.m_centroidB),this.m_v0.Copy(o.m_vertex0),this.m_v1.Copy(o.m_vertex1),this.m_v2.Copy(o.m_vertex2),this.m_v3.Copy(o.m_vertex3);var r=o.m_hasVertex0,a=o.m_hasVertex3,l=e.b2SubVV(this.m_v2,this.m_v1,e.b2EPCollider.s_edge1);l.Normalize(),this.m_normal1.Set(l.y,-l.x);var p=e.b2DotVV(this.m_normal1,e.b2SubVV(this.m_centroidB,this.m_v1,e.b2Vec2.s_t0)),m=0,_=0,b=!1,h=!1;if(r){var c=e.b2SubVV(this.m_v1,this.m_v0,e.b2EPCollider.s_edge0);c.Normalize(),this.m_normal0.Set(c.y,-c.x),b=e.b2CrossVV(c,l)>=0,m=e.b2DotVV(this.m_normal0,e.b2SubVV(this.m_centroidB,this.m_v0,e.b2Vec2.s_t0))}if(a){var u=e.b2SubVV(this.m_v3,this.m_v2,e.b2EPCollider.s_edge2);u.Normalize(),this.m_normal2.Set(u.y,-u.x),h=e.b2CrossVV(l,u)>0,_=e.b2DotVV(this.m_normal2,e.b2SubVV(this.m_centroidB,this.m_v2,e.b2Vec2.s_t0))}r&&a?b&&h?(this.m_front=m>=0||p>=0||_>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal0),this.m_upperLimit.Copy(this.m_normal2)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1).SelfNeg())):b?(this.m_front=m>=0||p>=0&&_>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal0),this.m_upperLimit.Copy(this.m_normal1)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal2).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1).SelfNeg())):h?(this.m_front=_>=0||m>=0&&p>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal2)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal0).SelfNeg())):(this.m_front=m>=0&&p>=0&&_>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal1)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal2).SelfNeg(),this.m_upperLimit.Copy(this.m_normal0).SelfNeg())):r?b?(this.m_front=m>=0||p>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal0),this.m_upperLimit.Copy(this.m_normal1).SelfNeg()):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal1).SelfNeg())):(this.m_front=m>=0&&p>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal1).SelfNeg()):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal0).SelfNeg())):a?h?(this.m_front=p>=0||_>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal2)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1))):(this.m_front=p>=0&&_>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1)):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal2).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1))):(this.m_front=p>=0,this.m_front?(this.m_normal.Copy(this.m_normal1),this.m_lowerLimit.Copy(this.m_normal1).SelfNeg(),this.m_upperLimit.Copy(this.m_normal1).SelfNeg()):(this.m_normal.Copy(this.m_normal1).SelfNeg(),this.m_lowerLimit.Copy(this.m_normal1),this.m_upperLimit.Copy(this.m_normal1))),this.m_polygonB.count=n.m_count;for(var y=0,d=n.m_count;d>y;++y)e.b2MulXV(this.m_xf,n.m_vertices[y],this.m_polygonB.vertices[y]),e.b2MulRV(this.m_xf.q,n.m_normals[y],this.m_polygonB.normals[y]);this.m_radius=2*e.b2_polygonRadius,t.pointCount=0;var f=this.ComputeEdgeSeparation(e.b2EPCollider.s_edgeAxis);if(f.type!=e.b2EPAxisType.e_unknown&&!(f.separation>this.m_radius)){var A=this.ComputePolygonSeparation(e.b2EPCollider.s_polygonAxis);if(!(A.type!=e.b2EPAxisType.e_unknown&&A.separation>this.m_radius)){var S,C=.98,v=.001;S=A.type==e.b2EPAxisType.e_unknown?f:A.separation>C*f.separation+v?A:f;var x=e.b2EPCollider.s_ie,V=e.b2EPCollider.s_rf;if(S.type==e.b2EPAxisType.e_edgeA){t.type=e.b2ManifoldType.e_faceA;for(var g=0,B=e.b2DotVV(this.m_normal,this.m_polygonB.normals[0]),y=1,d=this.m_polygonB.count;d>y;++y){var w=e.b2DotVV(this.m_normal,this.m_polygonB.normals[y]);B>w&&(B=w,g=y)}var M=g,J=(M+1)%this.m_polygonB.count,P=x[0];P.v.Copy(this.m_polygonB.vertices[M]),P.id.cf.indexA=0,P.id.cf.indexB=M,P.id.cf.typeA=e.b2ContactFeatureType.e_face,P.id.cf.typeB=e.b2ContactFeatureType.e_vertex;var T=x[1];T.v.Copy(this.m_polygonB.vertices[J]),T.id.cf.indexA=0,T.id.cf.indexB=J,T.id.cf.typeA=e.b2ContactFeatureType.e_face,T.id.cf.typeB=e.b2ContactFeatureType.e_vertex,this.m_front?(V.i1=0,V.i2=1,V.v1.Copy(this.m_v1),V.v2.Copy(this.m_v2),V.normal.Copy(this.m_normal1)):(V.i1=1,V.i2=0,V.v1.Copy(this.m_v2),V.v2.Copy(this.m_v1),V.normal.Copy(this.m_normal1).SelfNeg())}else{t.type=e.b2ManifoldType.e_faceB;var P=x[0];P.v.Copy(this.m_v1),P.id.cf.indexA=0,P.id.cf.indexB=S.index,P.id.cf.typeA=e.b2ContactFeatureType.e_vertex,P.id.cf.typeB=e.b2ContactFeatureType.e_face;var T=x[1];T.v.Copy(this.m_v2),T.id.cf.indexA=0,T.id.cf.indexB=S.index,T.id.cf.typeA=e.b2ContactFeatureType.e_vertex,T.id.cf.typeB=e.b2ContactFeatureType.e_face,V.i1=S.index,V.i2=(V.i1+1)%this.m_polygonB.count,V.v1.Copy(this.m_polygonB.vertices[V.i1]),V.v2.Copy(this.m_polygonB.vertices[V.i2]),V.normal.Copy(this.m_polygonB.normals[V.i1])}V.sideNormal1.Set(V.normal.y,-V.normal.x),V.sideNormal2.Copy(V.sideNormal1).SelfNeg(),V.sideOffset1=e.b2DotVV(V.sideNormal1,V.v1),V.sideOffset2=e.b2DotVV(V.sideNormal2,V.v2);var D=e.b2EPCollider.s_clipPoints1,R=e.b2EPCollider.s_clipPoints2,I=0;if(I=e.b2ClipSegmentToLine(D,x,V.sideNormal1,V.sideOffset1,V.i1),!(I<e.b2_maxManifoldPoints||(I=e.b2ClipSegmentToLine(R,D,V.sideNormal2,V.sideOffset2,V.i2),I<e.b2_maxManifoldPoints))){S.type==e.b2EPAxisType.e_edgeA?(t.localNormal.Copy(V.normal),t.localPoint.Copy(V.v1)):(t.localNormal.Copy(n.m_normals[V.i1]),t.localPoint.Copy(n.m_vertices[V.i1]));for(var L=0,y=0,d=e.b2_maxManifoldPoints;d>y;++y){var E;if(E=e.b2DotVV(V.normal,e.b2SubVV(R[y].v,V.v1,e.b2Vec2.s_t0)),E<=this.m_radius){var F=t.points[L];S.type==e.b2EPAxisType.e_edgeA?(e.b2MulTXV(this.m_xf,R[y].v,F.localPoint),F.id=R[y].id):(F.localPoint.Copy(R[y].v),F.id.cf.typeA=R[y].id.cf.typeB,F.id.cf.typeB=R[y].id.cf.typeA,F.id.cf.indexA=R[y].id.cf.indexB,F.id.cf.indexB=R[y].id.cf.indexA),++L}}t.pointCount=L}}}},e.b2EPCollider.s_edge1=new e.b2Vec2,e.b2EPCollider.s_edge0=new e.b2Vec2,e.b2EPCollider.s_edge2=new e.b2Vec2,e.b2EPCollider.s_ie=e.b2ClipVertex.MakeArray(2),e.b2EPCollider.s_rf=new e.b2ReferenceFace,e.b2EPCollider.s_clipPoints1=e.b2ClipVertex.MakeArray(2),e.b2EPCollider.s_clipPoints2=e.b2ClipVertex.MakeArray(2),e.b2EPCollider.s_edgeAxis=new e.b2EPAxis,e.b2EPCollider.s_polygonAxis=new e.b2EPAxis,e.b2EPCollider.prototype.ComputeEdgeSeparation=function(t){var o=t;o.type=e.b2EPAxisType.e_edgeA,o.index=this.m_front?0:1,o.separation=e.b2_maxFloat;for(var i=0,n=this.m_polygonB.count;n>i;++i){var s=e.b2DotVV(this.m_normal,e.b2SubVV(this.m_polygonB.vertices[i],this.m_v1,e.b2Vec2.s_t0));s<o.separation&&(o.separation=s)}return o},e.b2EPCollider.prototype.ComputePolygonSeparation=function(t){var o=t;o.type=e.b2EPAxisType.e_unknown,o.index=-1,o.separation=-e.b2_maxFloat;for(var i=e.b2EPCollider.s_perp.Set(-this.m_normal.y,this.m_normal.x),n=0,s=this.m_polygonB.count;s>n;++n){var r=e.b2NegV(this.m_polygonB.normals[n],e.b2EPCollider.s_n),a=e.b2DotVV(r,e.b2SubVV(this.m_polygonB.vertices[n],this.m_v1,e.b2Vec2.s_t0)),l=e.b2DotVV(r,e.b2SubVV(this.m_polygonB.vertices[n],this.m_v2,e.b2Vec2.s_t0)),p=e.b2Min(a,l);if(p>this.m_radius)return o.type=e.b2EPAxisType.e_edgeB,o.index=n,o.separation=p,o;if(e.b2DotVV(r,i)>=0){if(e.b2DotVV(e.b2SubVV(r,this.m_upperLimit,e.b2Vec2.s_t0),this.m_normal)<-e.b2_angularSlop)continue}else if(e.b2DotVV(e.b2SubVV(r,this.m_lowerLimit,e.b2Vec2.s_t0),this.m_normal)<-e.b2_angularSlop)continue;p>o.separation&&(o.type=e.b2EPAxisType.e_edgeB,o.index=n,o.separation=p)}return o},e.b2EPCollider.s_n=new e.b2Vec2,e.b2EPCollider.s_perp=new e.b2Vec2,e.b2CollideEdgeAndPolygon=function(t,o,i,n,s){var r=e.b2CollideEdgeAndPolygon.s_collider;r.Collide(t,o,i,n,s)},e.b2CollideEdgeAndPolygon.s_collider=new e.b2EPCollider,e}(e,a),j=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ChainAndCircleContact&&(e.b2ChainAndCircleContact={}),e.b2ChainAndCircleContact=function(){t.base(this)},t.inherits(e.b2ChainAndCircleContact,e.b2Contact),e.b2ChainAndCircleContact.Create=function(){return new e.b2ChainAndCircleContact},e.b2ChainAndCircleContact.Destroy=function(){},e.b2ChainAndCircleContact.prototype.Reset=function(o,i,n,s){t.base(this,"Reset",o,i,n,s),e.ENABLE_ASSERTS&&e.b2Assert(o.GetType()==e.b2ShapeType.e_chainShape),e.ENABLE_ASSERTS&&e.b2Assert(n.GetType()==e.b2ShapeType.e_circleShape)},e.b2ChainAndCircleContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2ChainShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2CircleShape);var r=n instanceof e.b2ChainShape?n:null,a=e.b2ChainAndCircleContact.prototype.Evaluate.s_edge;r.GetChildEdge(a,this.m_indexA),e.b2CollideEdgeAndCircle(t,a,o,s instanceof e.b2CircleShape?s:null,i)},e.b2ChainAndCircleContact.prototype.Evaluate.s_edge=new e.b2EdgeShape,e}(e,O,V,o),X=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ChainAndPolygonContact&&(e.b2ChainAndPolygonContact={}),e.b2ChainAndPolygonContact=function(){t.base(this)},t.inherits(e.b2ChainAndPolygonContact,e.b2Contact),e.b2ChainAndPolygonContact.Create=function(){return new e.b2ChainAndPolygonContact},e.b2ChainAndPolygonContact.Destroy=function(){},e.b2ChainAndPolygonContact.prototype.Reset=function(o,i,n,s){t.base(this,"Reset",o,i,n,s),e.ENABLE_ASSERTS&&e.b2Assert(o.GetType()==e.b2ShapeType.e_chainShape),e.ENABLE_ASSERTS&&e.b2Assert(n.GetType()==e.b2ShapeType.e_polygonShape)},e.b2ChainAndPolygonContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2ChainShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2PolygonShape);var r=n instanceof e.b2ChainShape?n:null,a=e.b2ChainAndPolygonContact.prototype.Evaluate.s_edge;r.GetChildEdge(a,this.m_indexA),e.b2CollideEdgeAndPolygon(t,a,o,s instanceof e.b2PolygonShape?s:null,i)},e.b2ChainAndPolygonContact.prototype.Evaluate.s_edge=new e.b2EdgeShape,e}(e,f,O,V,I,o),U=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2CollideCircle&&(e.b2CollideCircle={}),e.b2CollideCircles=function(t,o,i,n,s){t.pointCount=0;var r=e.b2MulXV(i,o.m_p,e.b2CollideCircles.s_pA),a=e.b2MulXV(s,n.m_p,e.b2CollideCircles.s_pB),l=e.b2DistanceSquaredVV(r,a),p=o.m_radius+n.m_radius;l>p*p||(t.type=e.b2ManifoldType.e_circles,t.localPoint.Copy(o.m_p),t.localNormal.SetZero(),t.pointCount=1,t.points[0].localPoint.Copy(n.m_p),t.points[0].id.key=0)},e.b2CollideCircles.s_pA=new e.b2Vec2,e.b2CollideCircles.s_pB=new e.b2Vec2,e.b2CollidePolygonAndCircle=function(t,o,i,n,s){t.pointCount=0;for(var r=e.b2MulXV(s,n.m_p,e.b2CollidePolygonAndCircle.s_c),a=e.b2MulTXV(i,r,e.b2CollidePolygonAndCircle.s_cLocal),l=0,p=-e.b2_maxFloat,m=o.m_radius+n.m_radius,_=o.m_count,b=o.m_vertices,h=o.m_normals,c=0;_>c;++c){var u=e.b2DotVV(h[c],e.b2SubVV(a,b[c],e.b2Vec2.s_t0));if(u>m)return;u>p&&(p=u,l=c)}var y=l,d=(y+1)%_,f=b[y],A=b[d];if(p<e.b2_epsilon)return t.pointCount=1,t.type=e.b2ManifoldType.e_faceA,t.localNormal.Copy(h[l]),e.b2MidVV(f,A,t.localPoint),t.points[0].localPoint.Copy(n.m_p),t.points[0].id.key=0,void 0;var S=e.b2DotVV(e.b2SubVV(a,f,e.b2Vec2.s_t0),e.b2SubVV(A,f,e.b2Vec2.s_t1)),C=e.b2DotVV(e.b2SubVV(a,A,e.b2Vec2.s_t0),e.b2SubVV(f,A,e.b2Vec2.s_t1));if(0>=S){if(e.b2DistanceSquaredVV(a,f)>m*m)return;t.pointCount=1,t.type=e.b2ManifoldType.e_faceA,e.b2SubVV(a,f,t.localNormal).SelfNormalize(),t.localPoint.Copy(f),t.points[0].localPoint.Copy(n.m_p),t.points[0].id.key=0}else if(0>=C){if(e.b2DistanceSquaredVV(a,A)>m*m)return;t.pointCount=1,t.type=e.b2ManifoldType.e_faceA,e.b2SubVV(a,A,t.localNormal).SelfNormalize(),t.localPoint.Copy(A),t.points[0].localPoint.Copy(n.m_p),t.points[0].id.key=0}else{var v=e.b2MidVV(f,A,e.b2CollidePolygonAndCircle.s_faceCenter);if(p=e.b2DotVV(e.b2SubVV(a,v,e.b2Vec2.s_t1),h[y]),p>m)return;t.pointCount=1,t.type=e.b2ManifoldType.e_faceA,t.localNormal.Copy(h[y]).SelfNormalize(),t.localPoint.Copy(v),t.points[0].localPoint.Copy(n.m_p),t.points[0].id.key=0}},e.b2CollidePolygonAndCircle.s_c=new e.b2Vec2,e.b2CollidePolygonAndCircle.s_cLocal=new e.b2Vec2,e.b2CollidePolygonAndCircle.s_faceCenter=new e.b2Vec2,e}(e,a),Z=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2CircleContact&&(e.b2CircleContact={}),e.b2CircleContact=function(){t.base(this)},t.inherits(e.b2CircleContact,e.b2Contact),e.b2CircleContact.Create=function(){return new e.b2CircleContact},e.b2CircleContact.Destroy=function(){},e.b2CircleContact.prototype.Reset=function(e,o,i,n){t.base(this,"Reset",e,o,i,n)},e.b2CircleContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2CircleShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2CircleShape),e.b2CollideCircles(t,n instanceof e.b2CircleShape?n:null,o,s instanceof e.b2CircleShape?s:null,i)},e}(e,U,V,o),H=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2EdgeAndCircleContact&&(e.b2EdgeAndCircleContact={}),e.b2EdgeAndCircleContact=function(){t.base(this)
	},t.inherits(e.b2EdgeAndCircleContact,e.b2Contact),e.b2EdgeAndCircleContact.Create=function(){return new e.b2EdgeAndCircleContact},e.b2EdgeAndCircleContact.Destroy=function(){},e.b2EdgeAndCircleContact.prototype.Reset=function(o,i,n,s){t.base(this,"Reset",o,i,n,s),e.ENABLE_ASSERTS&&e.b2Assert(o.GetType()==e.b2ShapeType.e_edgeShape),e.ENABLE_ASSERTS&&e.b2Assert(n.GetType()==e.b2ShapeType.e_circleShape)},e.b2EdgeAndCircleContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2EdgeShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2CircleShape),e.b2CollideEdgeAndCircle(t,n instanceof e.b2EdgeShape?n:null,o,s instanceof e.b2CircleShape?s:null,i)},e}(e,O,V,o),K=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2EdgeAndPolygonContact&&(e.b2EdgeAndPolygonContact={}),e.b2EdgeAndPolygonContact=function(){t.base(this)},t.inherits(e.b2EdgeAndPolygonContact,e.b2Contact),e.b2EdgeAndPolygonContact.Create=function(){return new e.b2EdgeAndPolygonContact},e.b2EdgeAndPolygonContact.Destroy=function(){},e.b2EdgeAndPolygonContact.prototype.Reset=function(o,i,n,s){t.base(this,"Reset",o,i,n,s),e.ENABLE_ASSERTS&&e.b2Assert(o.GetType()==e.b2ShapeType.e_edgeShape),e.ENABLE_ASSERTS&&e.b2Assert(n.GetType()==e.b2ShapeType.e_polygonShape)},e.b2EdgeAndPolygonContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2EdgeShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2PolygonShape),e.b2CollideEdgeAndPolygon(t,n instanceof e.b2EdgeShape?n:null,o,s instanceof e.b2PolygonShape?s:null,i)},e}(e,V,o),Y=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2PolygonAndCircleContact&&(e.b2PolygonAndCircleContact={}),e.b2PolygonAndCircleContact=function(){t.base(this)},t.inherits(e.b2PolygonAndCircleContact,e.b2Contact),e.b2PolygonAndCircleContact.Create=function(){return new e.b2PolygonAndCircleContact},e.b2PolygonAndCircleContact.Destroy=function(){},e.b2PolygonAndCircleContact.prototype.Reset=function(o,i,n,s){t.base(this,"Reset",o,i,n,s),e.ENABLE_ASSERTS&&e.b2Assert(o.GetType()==e.b2ShapeType.e_polygonShape),e.ENABLE_ASSERTS&&e.b2Assert(n.GetType()==e.b2ShapeType.e_circleShape)},e.b2PolygonAndCircleContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2PolygonShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2CircleShape),e.b2CollidePolygonAndCircle(t,n instanceof e.b2PolygonShape?n:null,o,s instanceof e.b2CircleShape?s:null,i)},e}(e,V,o),Q=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2CollidePolygon&&(e.b2CollidePolygon={}),e.b2FindMaxSeparation=function(t,o,i,n,s){for(var r=o.m_count,a=n.m_count,l=o.m_normals,p=o.m_vertices,m=n.m_vertices,_=e.b2MulTXX(s,i,e.b2FindMaxSeparation.s_xf),b=0,h=-e.b2_maxFloat,c=0;r>c;++c){for(var u=e.b2MulRV(_.q,l[c],e.b2FindMaxSeparation.s_n),y=e.b2MulXV(_,p[c],e.b2FindMaxSeparation.s_v1),d=e.b2_maxFloat,f=0;a>f;++f){var A=e.b2DotVV(u,e.b2SubVV(m[f],y,e.b2Vec2.s_t0));d>A&&(d=A)}d>h&&(h=d,b=c)}return t[0]=b,h},e.b2FindMaxSeparation.s_xf=new e.b2Transform,e.b2FindMaxSeparation.s_n=new e.b2Vec2,e.b2FindMaxSeparation.s_v1=new e.b2Vec2,e.b2FindIncidentEdge=function(t,o,i,n,s,r){var a=o.m_count,l=o.m_normals,p=s.m_count,m=s.m_vertices,_=s.m_normals;e.ENABLE_ASSERTS&&e.b2Assert(n>=0&&a>n);for(var b=e.b2MulTRV(r.q,e.b2MulRV(i.q,l[n],e.b2Vec2.s_t0),e.b2FindIncidentEdge.s_normal1),h=0,c=e.b2_maxFloat,u=0;p>u;++u){var y=e.b2DotVV(b,_[u]);c>y&&(c=y,h=u)}var d=h,f=(d+1)%p,A=t[0];e.b2MulXV(r,m[d],A.v);var S=A.id.cf;S.indexA=n,S.indexB=d,S.typeA=e.b2ContactFeatureType.e_face,S.typeB=e.b2ContactFeatureType.e_vertex;var C=t[1];e.b2MulXV(r,m[f],C.v);var v=C.id.cf;v.indexA=n,v.indexB=f,v.typeA=e.b2ContactFeatureType.e_face,v.typeB=e.b2ContactFeatureType.e_vertex},e.b2FindIncidentEdge.s_normal1=new e.b2Vec2,e.b2CollidePolygons=function(t,o,i,n,s){t.pointCount=0;var r=o.m_radius+n.m_radius,a=e.b2CollidePolygons.s_edgeA;a[0]=0;var l=e.b2FindMaxSeparation(a,o,i,n,s);if(!(l>r)){var p=e.b2CollidePolygons.s_edgeB;p[0]=0;var m=e.b2FindMaxSeparation(p,n,s,o,i);if(!(m>r)){var _,b,h,c,u=0,y=0,d=.98,f=.001;m>d*l+f?(_=n,b=o,h=s,c=i,u=p[0],t.type=e.b2ManifoldType.e_faceB,y=1):(_=o,b=n,h=i,c=s,u=a[0],t.type=e.b2ManifoldType.e_faceA,y=0);var A=e.b2CollidePolygons.s_incidentEdge;e.b2FindIncidentEdge(A,_,h,u,b,c);var S=_.m_count,C=_.m_vertices,v=u,x=(u+1)%S,V=C[v],g=C[x],B=e.b2SubVV(g,V,e.b2CollidePolygons.s_localTangent);B.Normalize();var w,M=e.b2CrossVOne(B,e.b2CollidePolygons.s_localNormal),J=e.b2MidVV(V,g,e.b2CollidePolygons.s_planePoint),P=e.b2MulRV(h.q,B,e.b2CollidePolygons.s_tangent),T=e.b2CrossVOne(P,e.b2CollidePolygons.s_normal),D=e.b2MulXV(h,V,e.b2CollidePolygons.s_v11),R=e.b2MulXV(h,g,e.b2CollidePolygons.s_v12),I=e.b2DotVV(T,D),L=-e.b2DotVV(P,D)+r,E=e.b2DotVV(P,R)+r,F=e.b2CollidePolygons.s_clipPoints1,G=e.b2CollidePolygons.s_clipPoints2,N=e.b2NegV(P,e.b2CollidePolygons.s_ntangent);if(w=e.b2ClipSegmentToLine(F,A,N,L,v),!(2>w||(w=e.b2ClipSegmentToLine(G,F,P,E,x),2>w))){t.localNormal.Copy(M),t.localPoint.Copy(J);for(var k=0,W=0;W<e.b2_maxManifoldPoints;++W){var q=G[W],z=e.b2DotVV(T,q.v)-I;if(r>=z){var O=t.points[k];if(e.b2MulTXV(c,q.v,O.localPoint),O.id.Copy(q.id),y){var j=O.id.cf;O.id.cf.indexA=j.indexB,O.id.cf.indexB=j.indexA,O.id.cf.typeA=j.typeB,O.id.cf.typeB=j.typeA}++k}}t.pointCount=k}}}},e.b2CollidePolygons.s_incidentEdge=e.b2ClipVertex.MakeArray(2),e.b2CollidePolygons.s_clipPoints1=e.b2ClipVertex.MakeArray(2),e.b2CollidePolygons.s_clipPoints2=e.b2ClipVertex.MakeArray(2),e.b2CollidePolygons.s_edgeA=e.b2MakeNumberArray(1),e.b2CollidePolygons.s_edgeB=e.b2MakeNumberArray(1),e.b2CollidePolygons.s_localTangent=new e.b2Vec2,e.b2CollidePolygons.s_localNormal=new e.b2Vec2,e.b2CollidePolygons.s_planePoint=new e.b2Vec2,e.b2CollidePolygons.s_normal=new e.b2Vec2,e.b2CollidePolygons.s_tangent=new e.b2Vec2,e.b2CollidePolygons.s_ntangent=new e.b2Vec2,e.b2CollidePolygons.s_v11=new e.b2Vec2,e.b2CollidePolygons.s_v12=new e.b2Vec2,e}(e,a),$=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2PolygonContact&&(e.b2PolygonContact={}),e.b2PolygonContact=function(){t.base(this)},t.inherits(e.b2PolygonContact,e.b2Contact),e.b2PolygonContact.Create=function(){return new e.b2PolygonContact},e.b2PolygonContact.Destroy=function(){},e.b2PolygonContact.prototype.Reset=function(e,o,i,n){t.base(this,"Reset",e,o,i,n)},e.b2PolygonContact.prototype.Evaluate=function(t,o,i){var n=this.m_fixtureA.GetShape(),s=this.m_fixtureB.GetShape();e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2PolygonShape),e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2PolygonShape),e.b2CollidePolygons(t,n instanceof e.b2PolygonShape?n:null,o,s instanceof e.b2PolygonShape?s:null,i)},e}(e,Q,V,o),te=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2ContactSolver&&(e.b2ContactSolver={}),e.b2VelocityConstraintPoint=function(){this.rA=new e.b2Vec2,this.rB=new e.b2Vec2},e.b2VelocityConstraintPoint.prototype.rA=null,e.b2VelocityConstraintPoint.prototype.rB=null,e.b2VelocityConstraintPoint.prototype.normalImpulse=0,e.b2VelocityConstraintPoint.prototype.tangentImpulse=0,e.b2VelocityConstraintPoint.prototype.normalMass=0,e.b2VelocityConstraintPoint.prototype.tangentMass=0,e.b2VelocityConstraintPoint.prototype.velocityBias=0,e.b2VelocityConstraintPoint.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2VelocityConstraintPoint})},e.b2ContactVelocityConstraint=function(){this.points=e.b2VelocityConstraintPoint.MakeArray(e.b2_maxManifoldPoints),this.normal=new e.b2Vec2,this.tangent=new e.b2Vec2,this.normalMass=new e.b2Mat22,this.K=new e.b2Mat22},e.b2ContactVelocityConstraint.prototype.points=null,e.b2ContactVelocityConstraint.prototype.normal=null,e.b2ContactVelocityConstraint.prototype.tangent=null,e.b2ContactVelocityConstraint.prototype.normalMass=null,e.b2ContactVelocityConstraint.prototype.K=null,e.b2ContactVelocityConstraint.prototype.indexA=0,e.b2ContactVelocityConstraint.prototype.indexB=0,e.b2ContactVelocityConstraint.prototype.invMassA=0,e.b2ContactVelocityConstraint.prototype.invMassB=0,e.b2ContactVelocityConstraint.prototype.invIA=0,e.b2ContactVelocityConstraint.prototype.invIB=0,e.b2ContactVelocityConstraint.prototype.friction=0,e.b2ContactVelocityConstraint.prototype.restitution=0,e.b2ContactVelocityConstraint.prototype.tangentSpeed=0,e.b2ContactVelocityConstraint.prototype.pointCount=0,e.b2ContactVelocityConstraint.prototype.contactIndex=0,e.b2ContactVelocityConstraint.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2ContactVelocityConstraint})},e.b2ContactPositionConstraint=function(){this.localPoints=e.b2Vec2.MakeArray(e.b2_maxManifoldPoints),this.localNormal=new e.b2Vec2,this.localPoint=new e.b2Vec2,this.localCenterA=new e.b2Vec2,this.localCenterB=new e.b2Vec2},e.b2ContactPositionConstraint.prototype.localPoints=null,e.b2ContactPositionConstraint.prototype.localNormal=null,e.b2ContactPositionConstraint.prototype.localPoint=null,e.b2ContactPositionConstraint.prototype.indexA=0,e.b2ContactPositionConstraint.prototype.indexB=0,e.b2ContactPositionConstraint.prototype.invMassA=0,e.b2ContactPositionConstraint.prototype.invMassB=0,e.b2ContactPositionConstraint.prototype.localCenterA=null,e.b2ContactPositionConstraint.prototype.localCenterB=null,e.b2ContactPositionConstraint.prototype.invIA=0,e.b2ContactPositionConstraint.prototype.invIB=0,e.b2ContactPositionConstraint.prototype.type=e.b2ManifoldType.e_unknown,e.b2ContactPositionConstraint.prototype.radiusA=0,e.b2ContactPositionConstraint.prototype.radiusB=0,e.b2ContactPositionConstraint.prototype.pointCount=0,e.b2ContactPositionConstraint.MakeArray=function(t){return e.b2MakeArray(t,function(){return new e.b2ContactPositionConstraint})},e.b2ContactSolverDef=function(){this.step=new e.b2TimeStep},e.b2ContactSolverDef.prototype.step=null,e.b2ContactSolverDef.prototype.contacts=null,e.b2ContactSolverDef.prototype.count=0,e.b2ContactSolverDef.prototype.positions=null,e.b2ContactSolverDef.prototype.velocities=null,e.b2ContactSolverDef.prototype.allocator=null,e.b2ContactSolver=function(){this.m_step=new e.b2TimeStep,this.m_positionConstraints=e.b2ContactPositionConstraint.MakeArray(1024),this.m_velocityConstraints=e.b2ContactVelocityConstraint.MakeArray(1024)},e.b2ContactSolver.prototype.m_step=null,e.b2ContactSolver.prototype.m_positions=null,e.b2ContactSolver.prototype.m_velocities=null,e.b2ContactSolver.prototype.m_allocator=null,e.b2ContactSolver.prototype.m_positionConstraints=null,e.b2ContactSolver.prototype.m_velocityConstraints=null,e.b2ContactSolver.prototype.m_contacts=null,e.b2ContactSolver.prototype.m_count=0,e.b2ContactSolver.prototype.Initialize=function(t){if(this.m_step.Copy(t.step),this.m_allocator=t.allocator,this.m_count=t.count,this.m_positionConstraints.length<this.m_count){var o=e.b2Max(2*this.m_positionConstraints.length,this.m_count);for(e.DEBUG&&window.console.log("box2d.b2ContactSolver.m_positionConstraints: "+o);this.m_positionConstraints.length<o;)this.m_positionConstraints[this.m_positionConstraints.length]=new e.b2ContactPositionConstraint}if(this.m_velocityConstraints.length<this.m_count){var o=e.b2Max(2*this.m_velocityConstraints.length,this.m_count);for(e.DEBUG&&window.console.log("box2d.b2ContactSolver.m_velocityConstraints: "+o);this.m_velocityConstraints.length<o;)this.m_velocityConstraints[this.m_velocityConstraints.length]=new e.b2ContactVelocityConstraint}this.m_positions=t.positions,this.m_velocities=t.velocities,this.m_contacts=t.contacts;var i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S,C;for(i=0,n=this.m_count;n>i;++i)for(a=this.m_contacts[i],l=a.m_fixtureA,p=a.m_fixtureB,m=l.GetShape(),_=p.GetShape(),b=m.m_radius,h=_.m_radius,c=l.GetBody(),u=p.GetBody(),y=a.GetManifold(),d=y.pointCount,e.ENABLE_ASSERTS&&e.b2Assert(d>0),f=this.m_velocityConstraints[i],f.friction=a.m_friction,f.restitution=a.m_restitution,f.tangentSpeed=a.m_tangentSpeed,f.indexA=c.m_islandIndex,f.indexB=u.m_islandIndex,f.invMassA=c.m_invMass,f.invMassB=u.m_invMass,f.invIA=c.m_invI,f.invIB=u.m_invI,f.contactIndex=i,f.pointCount=d,f.K.SetZero(),f.normalMass.SetZero(),A=this.m_positionConstraints[i],A.indexA=c.m_islandIndex,A.indexB=u.m_islandIndex,A.invMassA=c.m_invMass,A.invMassB=u.m_invMass,A.localCenterA.Copy(c.m_sweep.localCenter),A.localCenterB.Copy(u.m_sweep.localCenter),A.invIA=c.m_invI,A.invIB=u.m_invI,A.localNormal.Copy(y.localNormal),A.localPoint.Copy(y.localPoint),A.pointCount=d,A.radiusA=b,A.radiusB=h,A.type=y.type,s=0,r=d;r>s;++s)S=y.points[s],C=f.points[s],this.m_step.warmStarting?(C.normalImpulse=this.m_step.dtRatio*S.normalImpulse,C.tangentImpulse=this.m_step.dtRatio*S.tangentImpulse):(C.normalImpulse=0,C.tangentImpulse=0),C.rA.SetZero(),C.rB.SetZero(),C.normalMass=0,C.tangentMass=0,C.velocityBias=0,A.localPoints[s].Copy(S.localPoint);return this},e.b2ContactSolver.prototype.InitializeVelocityConstraints=function(){var t,o,i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S,C,v,x,V,g,B,w,M,J,P,T,D,R,I,L,E,F,G,N,k,W,q,z,O,j=e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfA,X=e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfB,U=e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_worldManifold,Z=1e3;for(t=0,o=this.m_count;o>t;++t){for(s=this.m_velocityConstraints[t],r=this.m_positionConstraints[t],a=r.radiusA,l=r.radiusB,p=this.m_contacts[s.contactIndex].GetManifold(),m=s.indexA,_=s.indexB,b=s.invMassA,h=s.invMassB,c=s.invIA,u=s.invIB,y=r.localCenterA,d=r.localCenterB,f=this.m_positions[m].c,A=this.m_positions[m].a,S=this.m_velocities[m].v,C=this.m_velocities[m].w,v=this.m_positions[_].c,x=this.m_positions[_].a,V=this.m_velocities[_].v,g=this.m_velocities[_].w,e.ENABLE_ASSERTS&&e.b2Assert(p.pointCount>0),j.q.SetAngleRadians(A),X.q.SetAngleRadians(x),e.b2SubVV(f,e.b2MulRV(j.q,y,e.b2Vec2.s_t0),j.p),e.b2SubVV(v,e.b2MulRV(X.q,d,e.b2Vec2.s_t0),X.p),U.Initialize(p,j,a,X,l),s.normal.Copy(U.normal),e.b2CrossVOne(s.normal,s.tangent),B=s.pointCount,i=0,n=B;n>i;++i)w=s.points[i],e.b2SubVV(U.points[i],f,w.rA),e.b2SubVV(U.points[i],v,w.rB),M=e.b2CrossVV(w.rA,s.normal),J=e.b2CrossVV(w.rB,s.normal),P=b+h+c*M*M+u*J*J,w.normalMass=P>0?1/P:0,T=s.tangent,D=e.b2CrossVV(w.rA,T),R=e.b2CrossVV(w.rB,T),I=b+h+c*D*D+u*R*R,w.tangentMass=I>0?1/I:0,w.velocityBias=0,L=e.b2DotVV(s.normal,e.b2SubVV(e.b2AddVCrossSV(V,g,w.rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(S,C,w.rA,e.b2Vec2.s_t1),e.b2Vec2.s_t0)),L<-e.b2_velocityThreshold&&(w.velocityBias+=-s.restitution*L);2==s.pointCount&&(E=s.points[0],F=s.points[1],G=e.b2CrossVV(E.rA,s.normal),N=e.b2CrossVV(E.rB,s.normal),k=e.b2CrossVV(F.rA,s.normal),W=e.b2CrossVV(F.rB,s.normal),q=b+h+c*G*G+u*N*N,z=b+h+c*k*k+u*W*W,O=b+h+c*G*k+u*N*W,Z*(q*z-O*O)>q*q?(s.K.ex.Set(q,O),s.K.ey.Set(O,z),s.K.GetInverse(s.normalMass)):s.pointCount=1)}},e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfA=new e.b2Transform,e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfB=new e.b2Transform,e.b2ContactSolver.prototype.InitializeVelocityConstraints.s_worldManifold=new e.b2WorldManifold,e.b2ContactSolver.prototype.WarmStart=function(){var t,o,i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S=e.b2ContactSolver.prototype.WarmStart.s_P;for(t=0,o=this.m_count;o>t;++t){for(s=this.m_velocityConstraints[t],r=s.indexA,a=s.indexB,l=s.invMassA,p=s.invIA,m=s.invMassB,_=s.invIB,b=s.pointCount,h=this.m_velocities[r].v,c=this.m_velocities[r].w,u=this.m_velocities[a].v,y=this.m_velocities[a].w,d=s.normal,f=s.tangent,i=0,n=b;n>i;++i)A=s.points[i],e.b2AddVV(e.b2MulSV(A.normalImpulse,d,e.b2Vec2.s_t0),e.b2MulSV(A.tangentImpulse,f,e.b2Vec2.s_t1),S),c-=p*e.b2CrossVV(A.rA,S),h.SelfMulSub(l,S),y+=_*e.b2CrossVV(A.rB,S),u.SelfMulAdd(m,S);this.m_velocities[r].w=c,this.m_velocities[a].w=y}},e.b2ContactSolver.prototype.WarmStart.s_P=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints=function(){var t,o,i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S,C,v,x,V,g,B,w,M,J,P=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv,T=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv1,D=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv2,R=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P,I=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_a,L=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_b,E=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_x,F=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_d,G=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1,N=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P2,k=e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1P2;for(t=0,o=this.m_count;o>t;++t){for(s=this.m_velocityConstraints[t],r=s.indexA,a=s.indexB,l=s.invMassA,p=s.invIA,m=s.invMassB,_=s.invIB,b=s.pointCount,h=this.m_velocities[r].v,c=this.m_velocities[r].w,u=this.m_velocities[a].v,y=this.m_velocities[a].w,d=s.normal,f=s.tangent,A=s.friction,e.ENABLE_ASSERTS&&e.b2Assert(1==b||2==b),i=0,n=b;n>i;++i)S=s.points[i],e.b2SubVV(e.b2AddVCrossSV(u,y,S.rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(h,c,S.rA,e.b2Vec2.s_t1),P),C=e.b2DotVV(P,f)-s.tangentSpeed,x=S.tangentMass*-C,V=A*S.normalImpulse,g=e.b2Clamp(S.tangentImpulse+x,-V,V),x=g-S.tangentImpulse,S.tangentImpulse=g,e.b2MulSV(x,f,R),h.SelfMulSub(l,R),c-=p*e.b2CrossVV(S.rA,R),u.SelfMulAdd(m,R),y+=_*e.b2CrossVV(S.rB,R);if(1==s.pointCount)S=s.points[0],e.b2SubVV(e.b2AddVCrossSV(u,y,S.rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(h,c,S.rA,e.b2Vec2.s_t1),P),v=e.b2DotVV(P,d),x=-S.normalMass*(v-S.velocityBias),g=e.b2Max(S.normalImpulse+x,0),x=g-S.normalImpulse,S.normalImpulse=g,e.b2MulSV(x,d,R),h.SelfMulSub(l,R),c-=p*e.b2CrossVV(S.rA,R),u.SelfMulAdd(m,R),y+=_*e.b2CrossVV(S.rB,R);else for(B=s.points[0],w=s.points[1],I.Set(B.normalImpulse,w.normalImpulse),e.ENABLE_ASSERTS&&e.b2Assert(I.x>=0&&I.y>=0),e.b2SubVV(e.b2AddVCrossSV(u,y,B.rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(h,c,B.rA,e.b2Vec2.s_t1),T),e.b2SubVV(e.b2AddVCrossSV(u,y,w.rB,e.b2Vec2.s_t0),e.b2AddVCrossSV(h,c,w.rA,e.b2Vec2.s_t1),D),M=e.b2DotVV(T,d),J=e.b2DotVV(D,d),L.x=M-B.velocityBias,L.y=J-w.velocityBias,L.SelfSub(e.b2MulMV(s.K,I,e.b2Vec2.s_t0));;){if(e.b2MulMV(s.normalMass,L,E).SelfNeg(),E.x>=0&&E.y>=0){e.b2SubVV(E,I,F),e.b2MulSV(F.x,d,G),e.b2MulSV(F.y,d,N),e.b2AddVV(G,N,k),h.SelfMulSub(l,k),c-=p*(e.b2CrossVV(B.rA,G)+e.b2CrossVV(w.rA,N)),u.SelfMulAdd(m,k),y+=_*(e.b2CrossVV(B.rB,G)+e.b2CrossVV(w.rB,N)),B.normalImpulse=E.x,w.normalImpulse=E.y;break}if(E.x=-B.normalMass*L.x,E.y=0,M=0,J=s.K.ex.y*E.x+L.y,E.x>=0&&J>=0){e.b2SubVV(E,I,F),e.b2MulSV(F.x,d,G),e.b2MulSV(F.y,d,N),e.b2AddVV(G,N,k),h.SelfMulSub(l,k),c-=p*(e.b2CrossVV(B.rA,G)+e.b2CrossVV(w.rA,N)),u.SelfMulAdd(m,k),y+=_*(e.b2CrossVV(B.rB,G)+e.b2CrossVV(w.rB,N)),B.normalImpulse=E.x,w.normalImpulse=E.y;break}if(E.x=0,E.y=-w.normalMass*L.y,M=s.K.ey.x*E.y+L.x,J=0,E.y>=0&&M>=0){e.b2SubVV(E,I,F),e.b2MulSV(F.x,d,G),e.b2MulSV(F.y,d,N),e.b2AddVV(G,N,k),h.SelfMulSub(l,k),c-=p*(e.b2CrossVV(B.rA,G)+e.b2CrossVV(w.rA,N)),u.SelfMulAdd(m,k),y+=_*(e.b2CrossVV(B.rB,G)+e.b2CrossVV(w.rB,N)),B.normalImpulse=E.x,w.normalImpulse=E.y;break}if(E.x=0,E.y=0,M=L.x,J=L.y,M>=0&&J>=0){e.b2SubVV(E,I,F),e.b2MulSV(F.x,d,G),e.b2MulSV(F.y,d,N),e.b2AddVV(G,N,k),h.SelfMulSub(l,k),c-=p*(e.b2CrossVV(B.rA,G)+e.b2CrossVV(w.rA,N)),u.SelfMulAdd(m,k),y+=_*(e.b2CrossVV(B.rB,G)+e.b2CrossVV(w.rB,N)),B.normalImpulse=E.x,w.normalImpulse=E.y;break}break}this.m_velocities[r].w=c,this.m_velocities[a].w=y}},e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv1=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv2=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_a=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_b=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_x=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_d=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P2=new e.b2Vec2,e.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1P2=new e.b2Vec2,e.b2ContactSolver.prototype.StoreImpulses=function(){var t,e,o,i,n,s;for(t=0,e=this.m_count;e>t;++t)for(n=this.m_velocityConstraints[t],s=this.m_contacts[n.contactIndex].GetManifold(),o=0,i=n.pointCount;i>o;++o)s.points[o].normalImpulse=n.points[o].normalImpulse,s.points[o].tangentImpulse=n.points[o].tangentImpulse},e.b2PositionSolverManifold=function(){this.normal=new e.b2Vec2,this.point=new e.b2Vec2},e.b2PositionSolverManifold.prototype.normal=null,e.b2PositionSolverManifold.prototype.point=null,e.b2PositionSolverManifold.prototype.separation=0,e.b2PositionSolverManifold.prototype.Initialize=function(t,o,i,n){var s=e.b2PositionSolverManifold.prototype.Initialize.s_pointA,r=e.b2PositionSolverManifold.prototype.Initialize.s_pointB,a=e.b2PositionSolverManifold.prototype.Initialize.s_planePoint,l=e.b2PositionSolverManifold.prototype.Initialize.s_clipPoint;switch(e.ENABLE_ASSERTS&&e.b2Assert(t.pointCount>0),t.type){case e.b2ManifoldType.e_circles:e.b2MulXV(o,t.localPoint,s),e.b2MulXV(i,t.localPoints[0],r),e.b2SubVV(r,s,this.normal).SelfNormalize(),e.b2MidVV(s,r,this.point),this.separation=e.b2DotVV(e.b2SubVV(r,s,e.b2Vec2.s_t0),this.normal)-t.radiusA-t.radiusB;break;case e.b2ManifoldType.e_faceA:e.b2MulRV(o.q,t.localNormal,this.normal),e.b2MulXV(o,t.localPoint,a),e.b2MulXV(i,t.localPoints[n],l),this.separation=e.b2DotVV(e.b2SubVV(l,a,e.b2Vec2.s_t0),this.normal)-t.radiusA-t.radiusB,this.point.Copy(l);break;case e.b2ManifoldType.e_faceB:e.b2MulRV(i.q,t.localNormal,this.normal),e.b2MulXV(i,t.localPoint,a),e.b2MulXV(o,t.localPoints[n],l),this.separation=e.b2DotVV(e.b2SubVV(l,a,e.b2Vec2.s_t0),this.normal)-t.radiusA-t.radiusB,this.point.Copy(l),this.normal.SelfNeg()}},e.b2PositionSolverManifold.prototype.Initialize.s_pointA=new e.b2Vec2,e.b2PositionSolverManifold.prototype.Initialize.s_pointB=new e.b2Vec2,e.b2PositionSolverManifold.prototype.Initialize.s_planePoint=new e.b2Vec2,e.b2PositionSolverManifold.prototype.Initialize.s_clipPoint=new e.b2Vec2,e.b2ContactSolver.prototype.SolvePositionConstraints=function(){var t,o,i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S,C,v,x,V,g,B,w=e.b2ContactSolver.prototype.SolvePositionConstraints.s_xfA,M=e.b2ContactSolver.prototype.SolvePositionConstraints.s_xfB,J=e.b2ContactSolver.prototype.SolvePositionConstraints.s_psm,P=e.b2ContactSolver.prototype.SolvePositionConstraints.s_rA,T=e.b2ContactSolver.prototype.SolvePositionConstraints.s_rB,D=e.b2ContactSolver.prototype.SolvePositionConstraints.s_P,R=0;for(t=0,o=this.m_count;o>t;++t){for(s=this.m_positionConstraints[t],r=s.indexA,a=s.indexB,l=s.localCenterA,p=s.invMassA,m=s.invIA,_=s.localCenterB,b=s.invMassB,h=s.invIB,c=s.pointCount,u=this.m_positions[r].c,y=this.m_positions[r].a,d=this.m_positions[a].c,f=this.m_positions[a].a,i=0,n=c;n>i;++i)w.q.SetAngleRadians(y),M.q.SetAngleRadians(f),e.b2SubVV(u,e.b2MulRV(w.q,l,e.b2Vec2.s_t0),w.p),e.b2SubVV(d,e.b2MulRV(M.q,_,e.b2Vec2.s_t0),M.p),J.Initialize(s,w,M,i),A=J.normal,S=J.point,C=J.separation,e.b2SubVV(S,u,P),e.b2SubVV(S,d,T),R=e.b2Min(R,C),v=e.b2Clamp(e.b2_baumgarte*(C+e.b2_linearSlop),-e.b2_maxLinearCorrection,0),x=e.b2CrossVV(P,A),V=e.b2CrossVV(T,A),g=p+b+m*x*x+h*V*V,B=g>0?-v/g:0,e.b2MulSV(B,A,D),u.SelfMulSub(p,D),y-=m*e.b2CrossVV(P,D),d.SelfMulAdd(b,D),f+=h*e.b2CrossVV(T,D);this.m_positions[r].a=y,this.m_positions[a].a=f}return R>-3*e.b2_linearSlop},e.b2ContactSolver.prototype.SolvePositionConstraints.s_xfA=new e.b2Transform,e.b2ContactSolver.prototype.SolvePositionConstraints.s_xfB=new e.b2Transform,e.b2ContactSolver.prototype.SolvePositionConstraints.s_psm=new e.b2PositionSolverManifold,e.b2ContactSolver.prototype.SolvePositionConstraints.s_rA=new e.b2Vec2,e.b2ContactSolver.prototype.SolvePositionConstraints.s_rB=new e.b2Vec2,e.b2ContactSolver.prototype.SolvePositionConstraints.s_P=new e.b2Vec2,e.b2ContactSolver.prototype.SolveTOIPositionConstraints=function(t,o){var i,n,s,r,a,l,p,m,_,b,h,c,u,y,d,f,A,S,C,v,x,V,g,B,w,M,J=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfA,P=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfB,T=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_psm,D=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rA,R=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rB,I=e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_P,L=0;for(i=0,n=this.m_count;n>i;++i){for(a=this.m_positionConstraints[i],l=a.indexA,p=a.indexB,m=a.localCenterA,_=a.localCenterB,b=a.pointCount,h=0,c=0,(l==t||l==o)&&(h=a.invMassA,c=a.invIA),u=0,y=0,(p==t||p==o)&&(u=a.invMassB,y=a.invIB),d=this.m_positions[l].c,f=this.m_positions[l].a,A=this.m_positions[p].c,S=this.m_positions[p].a,s=0,r=b;r>s;++s)J.q.SetAngleRadians(f),P.q.SetAngleRadians(S),e.b2SubVV(d,e.b2MulRV(J.q,m,e.b2Vec2.s_t0),J.p),e.b2SubVV(A,e.b2MulRV(P.q,_,e.b2Vec2.s_t0),P.p),T.Initialize(a,J,P,s),C=T.normal,v=T.point,x=T.separation,e.b2SubVV(v,d,D),e.b2SubVV(v,A,R),L=e.b2Min(L,x),V=e.b2Clamp(e.b2_toiBaumgarte*(x+e.b2_linearSlop),-e.b2_maxLinearCorrection,0),g=e.b2CrossVV(D,C),B=e.b2CrossVV(R,C),w=h+u+c*g*g+y*B*B,M=w>0?-V/w:0,e.b2MulSV(M,C,I),d.SelfMulSub(h,I),f-=c*e.b2CrossVV(D,I),A.SelfMulAdd(u,I),S+=y*e.b2CrossVV(R,I);this.m_positions[l].a=f,this.m_positions[p].a=S}return L>=-1.5*e.b2_linearSlop},e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfA=new e.b2Transform,e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfB=new e.b2Transform,e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_psm=new e.b2PositionSolverManifold,e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rA=new e.b2Vec2,e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rB=new e.b2Vec2,e.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_P=new e.b2Vec2,e}(e,j,X,Z,a,H,K,i,Y,$,o),ee=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2Island&&(e.b2Island={}),e.b2Island=function(){this.m_bodies=new Array(1024),this.m_contacts=new Array(1024),this.m_joints=new Array(1024),this.m_positions=e.b2Position.MakeArray(1024),this.m_velocities=e.b2Velocity.MakeArray(1024)},e.b2Island.prototype.m_allocator=null,e.b2Island.prototype.m_listener=null,e.b2Island.prototype.m_bodies=null,e.b2Island.prototype.m_contacts=null,e.b2Island.prototype.m_joints=null,e.b2Island.prototype.m_positions=null,e.b2Island.prototype.m_velocities=null,e.b2Island.prototype.m_bodyCount=0,e.b2Island.prototype.m_jointCount=0,e.b2Island.prototype.m_contactCount=0,e.b2Island.prototype.m_bodyCapacity=0,e.b2Island.prototype.m_contactCapacity=0,e.b2Island.prototype.m_jointCapacity=0,e.b2Island.prototype.Initialize=function(t,o,i,n,s){for(this.m_bodyCapacity=t,this.m_contactCapacity=o,this.m_jointCapacity=i,this.m_bodyCount=0,this.m_contactCount=0,this.m_jointCount=0,this.m_allocator=n,this.m_listener=s;this.m_bodies.length<t;)this.m_bodies[this.m_bodies.length]=null;for(;this.m_contacts.length<o;)this.m_contacts[this.m_contacts.length]=null;for(;this.m_joints.length<i;)this.m_joints[this.m_joints.length]=null;if(this.m_positions.length<t){var r=e.b2Max(2*this.m_positions.length,t);for(e.DEBUG&&window.console.log("box2d.b2Island.m_positions: "+r);this.m_positions.length<r;)this.m_positions[this.m_positions.length]=new e.b2Position}if(this.m_velocities.length<t){var r=e.b2Max(2*this.m_velocities.length,t);for(e.DEBUG&&window.console.log("box2d.b2Island.m_velocities: "+r);this.m_velocities.length<r;)this.m_velocities[this.m_velocities.length]=new e.b2Velocity}},e.b2Island.prototype.Clear=function(){this.m_bodyCount=0,this.m_contactCount=0,this.m_jointCount=0},e.b2Island.prototype.AddBody=function(t){e.ENABLE_ASSERTS&&e.b2Assert(this.m_bodyCount<this.m_bodyCapacity),t.m_islandIndex=this.m_bodyCount,this.m_bodies[this.m_bodyCount++]=t},e.b2Island.prototype.AddContact=function(t){e.ENABLE_ASSERTS&&e.b2Assert(this.m_contactCount<this.m_contactCapacity),this.m_contacts[this.m_contactCount++]=t},e.b2Island.prototype.AddJoint=function(t){e.ENABLE_ASSERTS&&e.b2Assert(this.m_jointCount<this.m_jointCapacity),this.m_joints[this.m_jointCount++]=t},e.b2Island.prototype.Solve=function(t,o,i,n){for(var s=e.b2Island.s_timer.Reset(),r=o.dt,a=0;a<this.m_bodyCount;++a){var l=this.m_bodies[a],p=this.m_positions[a].c.Copy(l.m_sweep.c),m=l.m_sweep.a,_=this.m_velocities[a].v.Copy(l.m_linearVelocity),b=l.m_angularVelocity;l.m_sweep.c0.Copy(l.m_sweep.c),l.m_sweep.a0=l.m_sweep.a,l.m_type==e.b2BodyType.b2_dynamicBody&&(_.x+=r*(l.m_gravityScale*i.x+l.m_invMass*l.m_force.x),_.y+=r*(l.m_gravityScale*i.y+l.m_invMass*l.m_force.y),b+=r*l.m_invI*l.m_torque,_.SelfMul(1/(1+r*l.m_linearDamping)),b*=1/(1+r*l.m_angularDamping)),this.m_positions[a].a=m,this.m_velocities[a].w=b}s.Reset();var h=e.b2Island.s_solverData;h.step.Copy(o),h.positions=this.m_positions,h.velocities=this.m_velocities;var c=e.b2Island.s_contactSolverDef;c.step.Copy(o),c.contacts=this.m_contacts,c.count=this.m_contactCount,c.positions=this.m_positions,c.velocities=this.m_velocities,c.allocator=this.m_allocator;var u=e.b2Island.s_contactSolver.Initialize(c);u.InitializeVelocityConstraints(),o.warmStarting&&u.WarmStart();for(var a=0;a<this.m_jointCount;++a)this.m_joints[a].InitVelocityConstraints(h);t.solveInit=s.GetMilliseconds(),s.Reset();for(var a=0;a<o.velocityIterations;++a){for(var y=0;y<this.m_jointCount;++y)this.m_joints[y].SolveVelocityConstraints(h);u.SolveVelocityConstraints()}u.StoreImpulses(),t.solveVelocity=s.GetMilliseconds();for(var a=0;a<this.m_bodyCount;++a){var p=this.m_positions[a].c,m=this.m_positions[a].a,_=this.m_velocities[a].v,b=this.m_velocities[a].w,d=e.b2MulSV(r,_,e.b2Island.s_translation);if(e.b2DotVV(d,d)>e.b2_maxTranslationSquared){var f=e.b2_maxTranslation/d.GetLength();_.SelfMul(f)}var A=r*b;if(A*A>e.b2_maxRotationSquared){var f=e.b2_maxRotation/e.b2Abs(A);b*=f}p.x+=r*_.x,p.y+=r*_.y,m+=r*b,this.m_positions[a].a=m,this.m_velocities[a].w=b}s.Reset();for(var S=!1,a=0;a<o.positionIterations;++a){for(var C=u.SolvePositionConstraints(),v=!0,y=0;y<this.m_jointCount;++y){var x=this.m_joints[y].SolvePositionConstraints(h);v=v&&x}if(C&&v){S=!0;break}}for(var a=0;a<this.m_bodyCount;++a){var V=this.m_bodies[a];V.m_sweep.c.Copy(this.m_positions[a].c),V.m_sweep.a=this.m_positions[a].a,V.m_linearVelocity.Copy(this.m_velocities[a].v),V.m_angularVelocity=this.m_velocities[a].w,V.SynchronizeTransform()}if(t.solvePosition=s.GetMilliseconds(),this.Report(u.m_velocityConstraints),n){for(var g=e.b2_maxFloat,B=e.b2_linearSleepTolerance*e.b2_linearSleepTolerance,w=e.b2_angularSleepTolerance*e.b2_angularSleepTolerance,a=0;a<this.m_bodyCount;++a){var l=this.m_bodies[a];l.GetType()!=e.b2BodyType.b2_staticBody&&(0==(l.m_flags&e.b2BodyFlag.e_autoSleepFlag)||l.m_angularVelocity*l.m_angularVelocity>w||e.b2DotVV(l.m_linearVelocity,l.m_linearVelocity)>B?(l.m_sleepTime=0,g=0):(l.m_sleepTime+=r,g=e.b2Min(g,l.m_sleepTime)))}if(g>=e.b2_timeToSleep&&S)for(var a=0;a<this.m_bodyCount;++a){var l=this.m_bodies[a];l.SetAwake(!1)}}},e.b2Island.prototype.SolveTOI=function(t,o,i){e.ENABLE_ASSERTS&&e.b2Assert(o<this.m_bodyCount),e.ENABLE_ASSERTS&&e.b2Assert(i<this.m_bodyCount);for(var n=0;n<this.m_bodyCount;++n){var s=this.m_bodies[n];this.m_positions[n].c.Copy(s.m_sweep.c),this.m_positions[n].a=s.m_sweep.a,this.m_velocities[n].v.Copy(s.m_linearVelocity),this.m_velocities[n].w=s.m_angularVelocity}var r=e.b2Island.s_contactSolverDef;r.contacts=this.m_contacts,r.count=this.m_contactCount,r.allocator=this.m_allocator,r.step.Copy(t),r.positions=this.m_positions,r.velocities=this.m_velocities;for(var a=e.b2Island.s_contactSolver.Initialize(r),n=0;n<t.positionIterations;++n){var l=a.SolveTOIPositionConstraints(o,i);if(l)break}this.m_bodies[o].m_sweep.c0.Copy(this.m_positions[o].c),this.m_bodies[o].m_sweep.a0=this.m_positions[o].a,this.m_bodies[i].m_sweep.c0.Copy(this.m_positions[i].c),this.m_bodies[i].m_sweep.a0=this.m_positions[i].a,a.InitializeVelocityConstraints();
	for(var n=0;n<t.velocityIterations;++n)a.SolveVelocityConstraints();for(var p=t.dt,n=0;n<this.m_bodyCount;++n){var m=this.m_positions[n].c,_=this.m_positions[n].a,b=this.m_velocities[n].v,h=this.m_velocities[n].w,c=e.b2MulSV(p,b,e.b2Island.s_translation);if(e.b2DotVV(c,c)>e.b2_maxTranslationSquared){var u=e.b2_maxTranslation/c.GetLength();b.SelfMul(u)}var y=p*h;if(y*y>e.b2_maxRotationSquared){var u=e.b2_maxRotation/e.b2Abs(y);h*=u}m.SelfMulAdd(p,b),_+=p*h,this.m_positions[n].a=_,this.m_velocities[n].w=h;var d=this.m_bodies[n];d.m_sweep.c.Copy(m),d.m_sweep.a=_,d.m_linearVelocity.Copy(b),d.m_angularVelocity=h,d.SynchronizeTransform()}this.Report(a.m_velocityConstraints)},e.b2Island.prototype.Report=function(t){if(null!=this.m_listener)for(var o=0;o<this.m_contactCount;++o){var i=this.m_contacts[o];if(i){var n=t[o],s=e.b2Island.s_impulse;s.count=n.pointCount;for(var r=0;r<n.pointCount;++r)s.normalImpulses[r]=n.points[r].normalImpulse,s.tangentImpulses[r]=n.points[r].tangentImpulse;this.m_listener.PostSolve(i,s)}}},e.b2Island.s_timer=new e.b2Timer,e.b2Island.s_solverData=new e.b2SolverData,e.b2Island.s_contactSolverDef=new e.b2ContactSolverDef,e.b2Island.s_contactSolver=new e.b2ContactSolver,e.b2Island.s_translation=new e.b2Vec2,e.b2Island.s_impulse=new e.b2ContactImpulse,e}(e,te,o,N,v,u),oe=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2JointFactory&&(e.b2JointFactory={}),e.b2JointFactory.Create=function(t){var o=null;switch(t.type){case e.b2JointType.e_distanceJoint:o=new e.b2DistanceJoint(t instanceof e.b2DistanceJointDef?t:null);break;case e.b2JointType.e_mouseJoint:o=new e.b2MouseJoint(t instanceof e.b2MouseJointDef?t:null);break;case e.b2JointType.e_prismaticJoint:o=new e.b2PrismaticJoint(t instanceof e.b2PrismaticJointDef?t:null);break;case e.b2JointType.e_revoluteJoint:o=new e.b2RevoluteJoint(t instanceof e.b2RevoluteJointDef?t:null);break;case e.b2JointType.e_pulleyJoint:o=new e.b2PulleyJoint(t instanceof e.b2PulleyJointDef?t:null);break;case e.b2JointType.e_gearJoint:o=new e.b2GearJoint(t instanceof e.b2GearJointDef?t:null);break;case e.b2JointType.e_wheelJoint:o=new e.b2WheelJoint(t instanceof e.b2WheelJointDef?t:null);break;case e.b2JointType.e_weldJoint:o=new e.b2WeldJoint(t instanceof e.b2WeldJointDef?t:null);break;case e.b2JointType.e_frictionJoint:o=new e.b2FrictionJoint(t instanceof e.b2FrictionJointDef?t:null);break;case e.b2JointType.e_ropeJoint:o=new e.b2RopeJoint(t instanceof e.b2RopeJointDef?t:null);break;case e.b2JointType.e_motorJoint:o=new e.b2MotorJoint(t instanceof e.b2MotorJointDef?t:null);break;case e.b2JointType.e_areaJoint:o=new e.b2AreaJoint(t instanceof e.b2AreaJointDef?t:null);break;default:e.ENABLE_ASSERTS&&e.b2Assert(!1)}return o},e.b2JointFactory.Destroy=function(){},e}(e,n,i,o),ie=function(t,e){return"undefined"==typeof e&&(e={}),"undefined"==typeof e.b2World&&(e.b2World={}),e.b2WorldFlag={e_none:0,e_newFixture:1,e_locked:2,e_clearForces:4},t.exportProperty(e.b2WorldFlag,"e_none",e.b2WorldFlag.e_none),t.exportProperty(e.b2WorldFlag,"e_newFixture",e.b2WorldFlag.e_newFixture),t.exportProperty(e.b2WorldFlag,"e_locked",e.b2WorldFlag.e_locked),t.exportProperty(e.b2WorldFlag,"e_clearForces",e.b2WorldFlag.e_clearForces),e.b2World=function(t){this.m_flags=e.b2WorldFlag.e_clearForces,this.m_contactManager=new e.b2ContactManager,this.m_gravity=t.Clone(),this.m_out_gravity=new e.b2Vec2,this.m_allowSleep=!0,this.m_destructionListener=null,this.m_debugDraw=null,this.m_warmStarting=!0,this.m_continuousPhysics=!0,this.m_subStepping=!1,this.m_stepComplete=!0,this.m_profile=new e.b2Profile,this.m_island=new e.b2Island,this.s_stack=new Array},e.b2World.prototype.m_flags=e.b2WorldFlag.e_none,e.b2World.prototype.m_contactManager=null,e.b2World.prototype.m_bodyList=null,e.b2World.prototype.m_jointList=null,e.b2World.prototype.m_bodyCount=0,e.b2World.prototype.m_jointCount=0,e.b2World.prototype.m_gravity=null,e.b2World.prototype.m_out_gravity=null,e.b2World.prototype.m_allowSleep=!0,e.b2World.prototype.m_destructionListener=null,e.b2World.prototype.m_debugDraw=null,e.b2World.prototype.m_inv_dt0=0,e.b2World.prototype.m_warmStarting=!0,e.b2World.prototype.m_continuousPhysics=!0,e.b2World.prototype.m_subStepping=!1,e.b2World.prototype.m_stepComplete=!0,e.b2World.prototype.m_profile=null,e.b2World.prototype.m_island=null,e.b2World.prototype.s_stack=null,e.b2World.prototype.m_controllerList=null,e.b2World.prototype.m_controllerCount=0,e.b2World.prototype.SetAllowSleeping=function(t){if(t!=this.m_allowSleep&&(this.m_allowSleep=t,0==this.m_allowSleep))for(var e=this.m_bodyList;e;e=e.m_next)e.SetAwake(!0)},e.b2World.prototype.GetAllowSleeping=function(){return this.m_allowSleep},e.b2World.prototype.SetWarmStarting=function(t){this.m_warmStarting=t},e.b2World.prototype.GetWarmStarting=function(){return this.m_warmStarting},e.b2World.prototype.SetContinuousPhysics=function(t){this.m_continuousPhysics=t},e.b2World.prototype.GetContinuousPhysics=function(){return this.m_continuousPhysics},e.b2World.prototype.SetSubStepping=function(t){this.m_subStepping=t},e.b2World.prototype.GetSubStepping=function(){return this.m_subStepping},e.b2World.prototype.GetBodyList=function(){return this.m_bodyList},e.b2World.prototype.GetJointList=function(){return this.m_jointList},e.b2World.prototype.GetContactList=function(){return this.m_contactManager.m_contactList},e.b2World.prototype.GetBodyCount=function(){return this.m_bodyCount},e.b2World.prototype.GetJointCount=function(){return this.m_jointCount},e.b2World.prototype.GetContactCount=function(){return this.m_contactManager.m_contactCount},e.b2World.prototype.SetGravity=function(t,e){if(e=e||!0,(this.m_gravity.x!==t.x||this.m_gravity.y!==t.y)&&(this.m_gravity.Copy(t),e))for(var o=this.m_bodyList;o;o=o.m_next)o.SetAwake(!0)},e.b2World.prototype.GetGravity=function(t){return t=t||this.m_out_gravity,t.Copy(this.m_gravity)},e.b2World.prototype.IsLocked=function(){return(this.m_flags&e.b2WorldFlag.e_locked)>0},e.b2World.prototype.SetAutoClearForces=function(t){t?this.m_flags|=e.b2WorldFlag.e_clearForces:this.m_flags&=~e.b2WorldFlag.e_clearForces},e.b2World.prototype.GetAutoClearForces=function(){return(this.m_flags&e.b2WorldFlag.e_clearForces)==e.b2WorldFlag.e_clearForces},e.b2World.prototype.GetContactManager=function(){return this.m_contactManager},e.b2World.prototype.GetProfile=function(){return this.m_profile},e.b2World.prototype.SetDestructionListener=function(t){this.m_destructionListener=t},e.b2World.prototype.SetContactFilter=function(t){this.m_contactManager.m_contactFilter=t},e.b2World.prototype.SetContactListener=function(t){this.m_contactManager.m_contactListener=t},e.b2World.prototype.SetDebugDraw=function(t){this.m_debugDraw=t},e.b2World.prototype.CreateBody=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.IsLocked()),this.IsLocked())return null;var o=new e.b2Body(t,this);return o.m_prev=null,o.m_next=this.m_bodyList,this.m_bodyList&&(this.m_bodyList.m_prev=o),this.m_bodyList=o,++this.m_bodyCount,o},e.b2World.prototype.DestroyBody=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(this.m_bodyCount>0),e.ENABLE_ASSERTS&&e.b2Assert(0==this.IsLocked()),!this.IsLocked()){for(var o=t.m_jointList;o;){var i=o;o=o.next,this.m_destructionListener&&this.m_destructionListener.SayGoodbyeJoint(i.joint),this.DestroyJoint(i.joint),t.m_jointList=o}t.m_jointList=null;for(var n=t.m_controllerList;n;){var s=n;n=n.nextController,s.controller.RemoveBody(t)}for(var r=t.m_contactList;r;){var a=r;r=r.next,this.m_contactManager.Destroy(a.contact)}t.m_contactList=null;for(var l=t.m_fixtureList;l;){var p=l;l=l.m_next,this.m_destructionListener&&this.m_destructionListener.SayGoodbyeFixture(p),p.DestroyProxies(this.m_contactManager.m_broadPhase),p.Destroy(),t.m_fixtureList=l,t.m_fixtureCount-=1}t.m_fixtureList=null,t.m_fixtureCount=0,t.m_prev&&(t.m_prev.m_next=t.m_next),t.m_next&&(t.m_next.m_prev=t.m_prev),t==this.m_bodyList&&(this.m_bodyList=t.m_next),--this.m_bodyCount}},e.b2World.prototype.CreateJoint=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.IsLocked()),this.IsLocked())return null;var o=e.b2JointFactory.Create(t,null);o.m_prev=null,o.m_next=this.m_jointList,this.m_jointList&&(this.m_jointList.m_prev=o),this.m_jointList=o,++this.m_jointCount,o.m_edgeA.joint=o,o.m_edgeA.other=o.m_bodyB,o.m_edgeA.prev=null,o.m_edgeA.next=o.m_bodyA.m_jointList,o.m_bodyA.m_jointList&&(o.m_bodyA.m_jointList.prev=o.m_edgeA),o.m_bodyA.m_jointList=o.m_edgeA,o.m_edgeB.joint=o,o.m_edgeB.other=o.m_bodyA,o.m_edgeB.prev=null,o.m_edgeB.next=o.m_bodyB.m_jointList,o.m_bodyB.m_jointList&&(o.m_bodyB.m_jointList.prev=o.m_edgeB),o.m_bodyB.m_jointList=o.m_edgeB;var i=t.bodyA,n=t.bodyB;if(0==t.collideConnected)for(var s=n.GetContactList();s;)s.other==i&&s.contact.FlagForFiltering(),s=s.next;return o},e.b2World.prototype.DestroyJoint=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.IsLocked()),!this.IsLocked()){var o=t.m_collideConnected;t.m_prev&&(t.m_prev.m_next=t.m_next),t.m_next&&(t.m_next.m_prev=t.m_prev),t==this.m_jointList&&(this.m_jointList=t.m_next);var i=t.m_bodyA,n=t.m_bodyB;if(i.SetAwake(!0),n.SetAwake(!0),t.m_edgeA.prev&&(t.m_edgeA.prev.next=t.m_edgeA.next),t.m_edgeA.next&&(t.m_edgeA.next.prev=t.m_edgeA.prev),t.m_edgeA==i.m_jointList&&(i.m_jointList=t.m_edgeA.next),t.m_edgeA.prev=null,t.m_edgeA.next=null,t.m_edgeB.prev&&(t.m_edgeB.prev.next=t.m_edgeB.next),t.m_edgeB.next&&(t.m_edgeB.next.prev=t.m_edgeB.prev),t.m_edgeB==n.m_jointList&&(n.m_jointList=t.m_edgeB.next),t.m_edgeB.prev=null,t.m_edgeB.next=null,e.b2JointFactory.Destroy(t,null),e.ENABLE_ASSERTS&&e.b2Assert(this.m_jointCount>0),--this.m_jointCount,0==o)for(var s=n.GetContactList();s;)s.other==i&&s.contact.FlagForFiltering(),s=s.next}},e.b2World.prototype.Solve=function(t){for(var o=this.m_controllerList;o;o=o.m_next)o.Step(t);this.m_profile.solveInit=0,this.m_profile.solveVelocity=0,this.m_profile.solvePosition=0;var i=this.m_island;i.Initialize(this.m_bodyCount,this.m_contactManager.m_contactCount,this.m_jointCount,null,this.m_contactManager.m_contactListener);for(var n=this.m_bodyList;n;n=n.m_next)n.m_flags&=~e.b2BodyFlag.e_islandFlag;for(var s=this.m_contactManager.m_contactList;s;s=s.m_next)s.m_flags&=~e.b2ContactFlag.e_islandFlag;for(var r=this.m_jointList;r;r=r.m_next)r.m_islandFlag=!1;for(var a=this.m_bodyCount,l=this.s_stack,p=this.m_bodyList;p;p=p.m_next)if(!(p.m_flags&e.b2BodyFlag.e_islandFlag)&&0!=p.IsAwake()&&0!=p.IsActive()&&p.GetType()!=e.b2BodyType.b2_staticBody){i.Clear();var m=0;for(l[m++]=p,p.m_flags|=e.b2BodyFlag.e_islandFlag;m>0;){var n=l[--m];if(e.ENABLE_ASSERTS&&e.b2Assert(1==n.IsActive()),i.AddBody(n),n.SetAwake(!0),n.GetType()!=e.b2BodyType.b2_staticBody){for(var _=n.m_contactList;_;_=_.next){var b=_.contact;if(!(b.m_flags&e.b2ContactFlag.e_islandFlag)&&0!=b.IsEnabled()&&0!=b.IsTouching()){var h=b.m_fixtureA.m_isSensor,c=b.m_fixtureB.m_isSensor;if(!h&&!c){i.AddContact(b),b.m_flags|=e.b2ContactFlag.e_islandFlag;var u=_.other;u.m_flags&e.b2BodyFlag.e_islandFlag||(e.ENABLE_ASSERTS&&e.b2Assert(a>m),l[m++]=u,u.m_flags|=e.b2BodyFlag.e_islandFlag)}}}for(var y=n.m_jointList;y;y=y.next)if(1!=y.joint.m_islandFlag){var u=y.other;0!=u.IsActive()&&(i.AddJoint(y.joint),y.joint.m_islandFlag=!0,u.m_flags&e.b2BodyFlag.e_islandFlag||(e.ENABLE_ASSERTS&&e.b2Assert(a>m),l[m++]=u,u.m_flags|=e.b2BodyFlag.e_islandFlag))}}}var d=new e.b2Profile;i.Solve(d,t,this.m_gravity,this.m_allowSleep),this.m_profile.solveInit+=d.solveInit,this.m_profile.solveVelocity+=d.solveVelocity,this.m_profile.solvePosition+=d.solvePosition;for(var f=0;f<i.m_bodyCount;++f){var n=i.m_bodies[f];n.GetType()==e.b2BodyType.b2_staticBody&&(n.m_flags&=~e.b2BodyFlag.e_islandFlag)}}for(var f=0;f<l.length&&l[f];++f)l[f]=null;for(var A=new e.b2Timer,n=this.m_bodyList;n;n=n.m_next)0!=(n.m_flags&e.b2BodyFlag.e_islandFlag)&&n.GetType()!=e.b2BodyType.b2_staticBody&&n.SynchronizeFixtures();this.m_contactManager.FindNewContacts(),this.m_profile.broadphase=A.GetMilliseconds()},e.b2World.prototype.SolveTOI=function(t){var o=this.m_island;if(o.Initialize(2*e.b2_maxTOIContacts,e.b2_maxTOIContacts,0,null,this.m_contactManager.m_contactListener),this.m_stepComplete){for(var i=this.m_bodyList;i;i=i.m_next)i.m_flags&=~e.b2BodyFlag.e_islandFlag,i.m_sweep.alpha0=0;for(var n=this.m_contactManager.m_contactList;n;n=n.m_next)n.m_flags&=~(e.b2ContactFlag.e_toiFlag|e.b2ContactFlag.e_islandFlag),n.m_toiCount=0,n.m_toi=1}for(;;){for(var s=null,r=1,n=this.m_contactManager.m_contactList;n;n=n.m_next)if(0!=n.IsEnabled()&&!(n.m_toiCount>e.b2_maxSubSteps)){var a=1;if(n.m_flags&e.b2ContactFlag.e_toiFlag)a=n.m_toi;else{var l=n.GetFixtureA(),p=n.GetFixtureB();if(l.IsSensor()||p.IsSensor())continue;var m=l.GetBody(),_=p.GetBody(),b=m.m_type,h=_.m_type;e.ENABLE_ASSERTS&&e.b2Assert(b==e.b2BodyType.b2_dynamicBody||h==e.b2BodyType.b2_dynamicBody);var c=m.IsAwake()&&b!=e.b2BodyType.b2_staticBody,u=_.IsAwake()&&h!=e.b2BodyType.b2_staticBody;if(0==c&&0==u)continue;var y=m.IsBullet()||b!=e.b2BodyType.b2_dynamicBody,d=_.IsBullet()||h!=e.b2BodyType.b2_dynamicBody;if(0==y&&0==d)continue;var f=m.m_sweep.alpha0;m.m_sweep.alpha0<_.m_sweep.alpha0?(f=_.m_sweep.alpha0,m.m_sweep.Advance(f)):_.m_sweep.alpha0<m.m_sweep.alpha0&&(f=m.m_sweep.alpha0,_.m_sweep.Advance(f)),e.ENABLE_ASSERTS&&e.b2Assert(1>f);var A=n.GetChildIndexA(),S=n.GetChildIndexB(),C=e.b2World.prototype.SolveTOI.s_toi_input;C.proxyA.SetShape(l.GetShape(),A),C.proxyB.SetShape(p.GetShape(),S),C.sweepA.Copy(m.m_sweep),C.sweepB.Copy(_.m_sweep),C.tMax=1;var v=e.b2World.prototype.SolveTOI.s_toi_output;e.b2TimeOfImpact(v,C);var x=v.t;a=v.state==e.b2TOIOutputState.e_touching?e.b2Min(f+(1-f)*x,1):1,n.m_toi=a,n.m_flags|=e.b2ContactFlag.e_toiFlag}r>a&&(s=n,r=a)}if(null==s||1-10*e.b2_epsilon<r){this.m_stepComplete=!0;break}var l=s.GetFixtureA(),p=s.GetFixtureB(),m=l.GetBody(),_=p.GetBody(),V=e.b2World.prototype.SolveTOI.s_backup1.Copy(m.m_sweep),g=e.b2World.prototype.SolveTOI.s_backup2.Copy(_.m_sweep);if(m.Advance(r),_.Advance(r),s.Update(this.m_contactManager.m_contactListener),s.m_flags&=~e.b2ContactFlag.e_toiFlag,++s.m_toiCount,0!=s.IsEnabled()&&0!=s.IsTouching()){m.SetAwake(!0),_.SetAwake(!0),o.Clear(),o.AddBody(m),o.AddBody(_),o.AddContact(s),m.m_flags|=e.b2BodyFlag.e_islandFlag,_.m_flags|=e.b2BodyFlag.e_islandFlag,s.m_flags|=e.b2ContactFlag.e_islandFlag;for(var B=0;2>B;++B){var w=0==B?m:_;if(w.m_type==e.b2BodyType.b2_dynamicBody)for(var M=w.m_contactList;M&&o.m_bodyCount!=o.m_bodyCapacity&&o.m_contactCount!=o.m_contactCapacity;M=M.next){var J=M.contact;if(!(J.m_flags&e.b2ContactFlag.e_islandFlag)){var P=M.other;if(P.m_type!=e.b2BodyType.b2_dynamicBody||0!=w.IsBullet()||0!=P.IsBullet()){var T=J.m_fixtureA.m_isSensor,D=J.m_fixtureB.m_isSensor;if(!T&&!D){var R=e.b2World.prototype.SolveTOI.s_backup.Copy(P.m_sweep);0==(P.m_flags&e.b2BodyFlag.e_islandFlag)&&P.Advance(r),J.Update(this.m_contactManager.m_contactListener),0!=J.IsEnabled()?0!=J.IsTouching()?(J.m_flags|=e.b2ContactFlag.e_islandFlag,o.AddContact(J),P.m_flags&e.b2BodyFlag.e_islandFlag||(P.m_flags|=e.b2BodyFlag.e_islandFlag,P.m_type!=e.b2BodyType.b2_staticBody&&P.SetAwake(!0),o.AddBody(P))):(P.m_sweep.Copy(R),P.SynchronizeTransform()):(P.m_sweep.Copy(R),P.SynchronizeTransform())}}}}}var I=e.b2World.prototype.SolveTOI.s_subStep;I.dt=(1-r)*t.dt,I.inv_dt=1/I.dt,I.dtRatio=1,I.positionIterations=20,I.velocityIterations=t.velocityIterations,I.warmStarting=!1,o.SolveTOI(I,m.m_islandIndex,_.m_islandIndex);for(var B=0;B<o.m_bodyCount;++B){var w=o.m_bodies[B];if(w.m_flags&=~e.b2BodyFlag.e_islandFlag,w.m_type==e.b2BodyType.b2_dynamicBody){w.SynchronizeFixtures();for(var M=w.m_contactList;M;M=M.next)M.contact.m_flags&=~(e.b2ContactFlag.e_toiFlag|e.b2ContactFlag.e_islandFlag)}}if(this.m_contactManager.FindNewContacts(),this.m_subStepping){this.m_stepComplete=!1;break}}else s.SetEnabled(!1),m.m_sweep.Copy(V),_.m_sweep.Copy(g),m.SynchronizeTransform(),_.SynchronizeTransform()}},e.b2World.prototype.SolveTOI.s_subStep=new e.b2TimeStep,e.b2World.prototype.SolveTOI.s_backup=new e.b2Sweep,e.b2World.prototype.SolveTOI.s_backup1=new e.b2Sweep,e.b2World.prototype.SolveTOI.s_backup2=new e.b2Sweep,e.b2World.prototype.SolveTOI.s_toi_input=new e.b2TOIInput,e.b2World.prototype.SolveTOI.s_toi_output=new e.b2TOIOutput,e.b2World.prototype.Step=function(t,o,i){var n=new e.b2Timer;this.m_flags&e.b2WorldFlag.e_newFixture&&(this.m_contactManager.FindNewContacts(),this.m_flags&=~e.b2WorldFlag.e_newFixture),this.m_flags|=e.b2WorldFlag.e_locked;var s=e.b2World.prototype.Step.s_step;s.dt=t,s.velocityIterations=o,s.positionIterations=i,s.inv_dt=t>0?1/t:0,s.dtRatio=this.m_inv_dt0*t,s.warmStarting=this.m_warmStarting;var r=new e.b2Timer;if(this.m_contactManager.Collide(),this.m_profile.collide=r.GetMilliseconds(),this.m_stepComplete&&s.dt>0){var r=new e.b2Timer;this.Solve(s),this.m_profile.solve=r.GetMilliseconds()}if(this.m_continuousPhysics&&s.dt>0){var r=new e.b2Timer;this.SolveTOI(s),this.m_profile.solveTOI=r.GetMilliseconds()}s.dt>0&&(this.m_inv_dt0=s.inv_dt),this.m_flags&e.b2WorldFlag.e_clearForces&&this.ClearForces(),this.m_flags&=~e.b2WorldFlag.e_locked,this.m_profile.step=n.GetMilliseconds()},e.b2World.prototype.Step.s_step=new e.b2TimeStep,e.b2World.prototype.ClearForces=function(){for(var t=this.m_bodyList;t;t=t.m_next)t.m_force.SetZero(),t.m_torque=0},e.b2World.prototype.QueryAABB=function(t,o){var i=this.m_contactManager.m_broadPhase,n=function(o){var n=i.GetUserData(o);e.ENABLE_ASSERTS&&e.b2Assert(n instanceof e.b2FixtureProxy);{var s=n.fixture;n.childIndex}return t instanceof e.b2QueryCallback?t.ReportFixture(s):t(s)};i.Query(n,o)},e.b2World.prototype.QueryShape=function(t,o,i){var n=this.m_contactManager.m_broadPhase,s=function(s){var r=n.GetUserData(s);e.ENABLE_ASSERTS&&e.b2Assert(r instanceof e.b2FixtureProxy);{var a=r.fixture;r.childIndex}return e.b2TestOverlapShape(o,0,a.GetShape(),0,i,a.GetBody().GetTransform())?t instanceof e.b2QueryCallback?t.ReportFixture(a):t(a):!0},r=e.b2World.prototype.QueryShape.s_aabb;o.ComputeAABB(r,i,0),n.Query(s,r)},e.b2World.prototype.QueryShape.s_aabb=new e.b2AABB,e.b2World.prototype.QueryPoint=function(t,o){var i=this.m_contactManager.m_broadPhase,n=function(n){var s=i.GetUserData(n);e.ENABLE_ASSERTS&&e.b2Assert(s instanceof e.b2FixtureProxy);{var r=s.fixture;s.childIndex}return r.TestPoint(o)?t instanceof e.b2QueryCallback?t.ReportFixture(r):t(r):!0},s=e.b2World.prototype.QueryPoint.s_aabb;s.lowerBound.Set(o.x-e.b2_linearSlop,o.y-e.b2_linearSlop),s.upperBound.Set(o.x+e.b2_linearSlop,o.y+e.b2_linearSlop),i.Query(n,s)},e.b2World.prototype.QueryPoint.s_aabb=new e.b2AABB,e.b2World.prototype.RayCast=function(t,o,i){var n=this.m_contactManager.m_broadPhase,s=function(s,r){var a=n.GetUserData(r);e.ENABLE_ASSERTS&&e.b2Assert(a instanceof e.b2FixtureProxy);var l=a.fixture,p=a.childIndex,m=e.b2World.prototype.RayCast.s_output,_=l.RayCast(m,s,p);if(_){var b=m.fraction,h=e.b2World.prototype.RayCast.s_point;return h.Set((1-b)*o.x+b*i.x,(1-b)*o.y+b*i.y),t instanceof e.b2RayCastCallback?t.ReportFixture(l,h,m.normal,b):t(l,h,m.normal,b)}return s.maxFraction},r=e.b2World.prototype.RayCast.s_input;r.maxFraction=1,r.p1.Copy(o),r.p2.Copy(i),n.RayCast(s,r)},e.b2World.prototype.RayCast.s_input=new e.b2RayCastInput,e.b2World.prototype.RayCast.s_output=new e.b2RayCastOutput,e.b2World.prototype.RayCast.s_point=new e.b2Vec2,e.b2World.prototype.RayCastOne=function(t,e){function o(t,e,o,s){return n>s&&(n=s,i=t),n}var i=null,n=1;return this.RayCast(o,t,e),i},e.b2World.prototype.RayCastAll=function(t,e,o){function i(t){return o.push(t),1}return o.length=0,this.RayCast(i,t,e),o},e.b2World.prototype.DrawShape=function(t,o){var i=t.GetShape();switch(i.m_type){case e.b2ShapeType.e_circleShape:var n=i instanceof e.b2CircleShape?i:null,s=n.m_p,r=n.m_radius,a=e.b2Vec2.UNITX;this.m_debugDraw.DrawSolidCircle(s,r,a,o);break;case e.b2ShapeType.e_edgeShape:var l=i instanceof e.b2EdgeShape?i:null,p=l.m_vertex1,m=l.m_vertex2;this.m_debugDraw.DrawSegment(p,m,o);break;case e.b2ShapeType.e_chainShape:var _=i instanceof e.b2ChainShape?i:null,b=_.m_count,h=_.m_vertices,p=h[0];this.m_debugDraw.DrawCircle(p,.05,o);for(var c=1;b>c;++c){var m=h[c];this.m_debugDraw.DrawSegment(p,m,o),this.m_debugDraw.DrawCircle(m,.05,o),p=m}break;case e.b2ShapeType.e_polygonShape:var u=i instanceof e.b2PolygonShape?i:null,y=u.m_count,h=u.m_vertices;this.m_debugDraw.DrawSolidPolygon(h,y,o)}},e.b2World.prototype.DrawJoint=function(t){var o=t.GetBodyA(),i=t.GetBodyB(),n=o.m_xf,s=i.m_xf,r=n.p,a=s.p,l=t.GetAnchorA(e.b2World.prototype.DrawJoint.s_p1),p=t.GetAnchorB(e.b2World.prototype.DrawJoint.s_p2),m=e.b2World.prototype.DrawJoint.s_color.SetRGB(.5,.8,.8);switch(t.m_type){case e.b2JointType.e_distanceJoint:this.m_debugDraw.DrawSegment(l,p,m);break;case e.b2JointType.e_pulleyJoint:var _=t instanceof e.b2PulleyJoint?t:null,b=_.GetGroundAnchorA(e.b2World.prototype.DrawJoint.s_s1),h=_.GetGroundAnchorB(e.b2World.prototype.DrawJoint.s_s2);this.m_debugDraw.DrawSegment(b,l,m),this.m_debugDraw.DrawSegment(h,p,m),this.m_debugDraw.DrawSegment(b,h,m);break;case e.b2JointType.e_mouseJoint:this.m_debugDraw.DrawSegment(l,p,m);break;default:this.m_debugDraw.DrawSegment(r,l,m),this.m_debugDraw.DrawSegment(l,p,m),this.m_debugDraw.DrawSegment(a,p,m)}},e.b2World.prototype.DrawJoint.s_p1=new e.b2Vec2,e.b2World.prototype.DrawJoint.s_p2=new e.b2Vec2,e.b2World.prototype.DrawJoint.s_color=new e.b2Color(.5,.8,.8),e.b2World.prototype.DrawJoint.s_s1=new e.b2Vec2,e.b2World.prototype.DrawJoint.s_s2=new e.b2Vec2,e.b2World.prototype.DrawDebugData=function(){if(null!=this.m_debugDraw){var t=this.m_debugDraw.GetFlags(),o=e.b2World.prototype.DrawDebugData.s_color.SetRGB(0,0,0);if(t&e.b2DrawFlags.e_shapeBit)for(var i=this.m_bodyList;i;i=i.m_next){var n=i.m_xf;this.m_debugDraw.PushTransform(n);for(var s=i.GetFixtureList();s;s=s.m_next)0==i.IsActive()?(o.SetRGB(.5,.5,.3),this.DrawShape(s,o)):i.GetType()==e.b2BodyType.b2_staticBody?(o.SetRGB(.5,.9,.5),this.DrawShape(s,o)):i.GetType()==e.b2BodyType.b2_kinematicBody?(o.SetRGB(.5,.5,.9),this.DrawShape(s,o)):0==i.IsAwake()?(o.SetRGB(.6,.6,.6),this.DrawShape(s,o)):(o.SetRGB(.9,.7,.7),this.DrawShape(s,o));this.m_debugDraw.PopTransform(n)}if(t&e.b2DrawFlags.e_jointBit)for(var r=this.m_jointList;r;r=r.m_next)this.DrawJoint(r);if(t&e.b2DrawFlags.e_aabbBit){o.SetRGB(.9,.3,.9);for(var a=this.m_contactManager.m_broadPhase,l=e.b2World.prototype.DrawDebugData.s_vs,i=this.m_bodyList;i;i=i.m_next)if(0!=i.IsActive())for(var s=i.GetFixtureList();s;s=s.m_next)for(var p=0;p<s.m_proxyCount;++p){var m=s.m_proxies[p],_=a.GetFatAABB(m.proxy);l[0].Set(_.lowerBound.x,_.lowerBound.y),l[1].Set(_.upperBound.x,_.lowerBound.y),l[2].Set(_.upperBound.x,_.upperBound.y),l[3].Set(_.lowerBound.x,_.upperBound.y),this.m_debugDraw.DrawPolygon(l,4,o)}}if(t&e.b2DrawFlags.e_centerOfMassBit)for(var i=this.m_bodyList;i;i=i.m_next){var n=e.b2World.prototype.DrawDebugData.s_xf;n.q.Copy(i.m_xf.q),n.p.Copy(i.GetWorldCenter()),this.m_debugDraw.DrawTransform(n)}if(t&e.b2DrawFlags.e_controllerBit)for(var b=this.m_controllerList;b;b=b.m_next)b.Draw(this.m_debugDraw)}},e.b2World.prototype.DrawDebugData.s_color=new e.b2Color(0,0,0),e.b2World.prototype.DrawDebugData.s_vs=e.b2Vec2.MakeArray(4),e.b2World.prototype.DrawDebugData.s_xf=new e.b2Transform,e.b2World.prototype.SetBroadPhase=function(t){var e=this.m_contactManager.m_broadPhase;this.m_contactManager.m_broadPhase=t;for(var o=this.m_bodyList;o;o=o.m_next)for(var i=o.m_fixtureList;i;i=i.m_next)i.m_proxy=t.CreateProxy(e.GetFatAABB(i.m_proxy),i)},e.b2World.prototype.GetProxyCount=function(){return this.m_contactManager.m_broadPhase.GetProxyCount()},e.b2World.prototype.GetTreeHeight=function(){return this.m_contactManager.m_broadPhase.GetTreeHeight()},e.b2World.prototype.GetTreeBalance=function(){return this.m_contactManager.m_broadPhase.GetTreeBalance()},e.b2World.prototype.GetTreeQuality=function(){return this.m_contactManager.m_broadPhase.GetTreeQuality()},e.b2World.prototype.ShiftOrigin=function(t){if(e.ENABLE_ASSERTS&&e.b2Assert(0==this.IsLocked()),!this.IsLocked()){for(var o=this.m_bodyList;o;o=o.m_next)o.m_xf.p.SelfSub(t),o.m_sweep.c0.SelfSub(t),o.m_sweep.c.SelfSub(t);for(var i=this.m_jointList;i;i=i.m_next)i.ShiftOrigin(t);this.m_contactManager.m_broadPhase.ShiftOrigin(t)}},e.b2World.prototype.Dump=function(){if(e.DEBUG){if((this.m_flags&e.b2WorldFlag.e_locked)==e.b2WorldFlag.e_locked)return;e.b2Log("/** @type {box2d.b2Vec2} */ var g = new box2d.b2Vec2(%.15f, %.15f);\n",this.m_gravity.x,this.m_gravity.y),e.b2Log("this.m_world.SetGravity(g);\n"),e.b2Log("/** @type {Array.<box2d.b2Body>} */ var bodies = new Array(%d);\n",this.m_bodyCount),e.b2Log("/** @type {Array.<box2d.b2Joint>} */ var joints = new Array(%d);\n",this.m_jointCount);for(var t=0,o=this.m_bodyList;o;o=o.m_next)o.m_islandIndex=t,o.Dump(),++t;t=0;for(var i=this.m_jointList;i;i=i.m_next)i.m_index=t,++t;for(var i=this.m_jointList;i;i=i.m_next)i.m_type!=e.b2JointType.e_gearJoint&&(e.b2Log("if (true)\n"),e.b2Log("{\n"),i.Dump(),e.b2Log("}\n"));for(var i=this.m_jointList;i;i=i.m_next)i.m_type==e.b2JointType.e_gearJoint&&(e.b2Log("if (true)\n"),e.b2Log("{\n"),i.Dump(),e.b2Log("}\n"))}},e.b2World.prototype.AddController=function(t){return e.ENABLE_ASSERTS&&e.b2Assert(null===t.m_world,"Controller can only be a member of one world"),t.m_world=this,t.m_next=this.m_controllerList,t.m_prev=null,this.m_controllerList&&(this.m_controllerList.m_prev=t),this.m_controllerList=t,++this.m_controllerCount,t},e.b2World.prototype.RemoveController=function(t){e.ENABLE_ASSERTS&&e.b2Assert(t.m_world===this,"Controller is not a member of this world"),t.m_prev&&(t.m_prev.m_next=t.m_next),t.m_next&&(t.m_next.m_prev=t.m_prev),this.m_controllerList==t&&(this.m_controllerList=t.m_next),--this.m_controllerCount,t.m_prev=null,t.m_next=null,t.m_world=null},e}(e,m,a,z,te,B,ee,oe,i,o,N,u);!function(t,e){return"undefined"==typeof e&&(e={}),e}(e,s,m,h,y,f,A,S,C,V,r,g,B,b,d,p,w,P,T,D,R,I,M,L,J,E,F,o,G,x,N,v,k,W,ie,u)}"undefined"!=typeof module&&module.exports?module.exports=t: true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return t}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof window&&(window.box2d=t)}();

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _player = __webpack_require__(18);
	
	Object.keys(_player).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _player[key];
	    }
	  });
	});
	
	var _debugMarker = __webpack_require__(19);
	
	Object.keys(_debugMarker).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _debugMarker[key];
	    }
	  });
	});
	
	var _ground = __webpack_require__(20);
	
	Object.keys(_ground).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ground[key];
	    }
	  });
	});
	
	var _train = __webpack_require__(21);
	
	Object.keys(_train).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _train[key];
	    }
	  });
	});
	
	var _office = __webpack_require__(22);
	
	Object.keys(_office).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _office[key];
	    }
	  });
	});
	
	var _textbox = __webpack_require__(23);
	
	Object.keys(_textbox).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _textbox[key];
	    }
	  });
	});
	
	var _fader = __webpack_require__(24);
	
	Object.keys(_fader).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _fader[key];
	    }
	  });
	});
	
	var _notepad = __webpack_require__(25);
	
	Object.keys(_notepad).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _notepad[key];
	    }
	  });
	});
	
	var _telephone = __webpack_require__(26);
	
	Object.keys(_telephone).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _telephone[key];
	    }
	  });
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Player = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var Player = exports.Player = function Player() {
	  var self = {
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	
	    x: 100,
	    y: -100,
	    w: 30,
	    h: 30,
	    parallax: 1,
	    type: "Player",
	    draw: function draw(shapes) {
	      shapes.drawColoredRect(_gfxutils.Colors.WHITE, 0, 0, self.w, self.h, 0.5);
	    },
	    step: function step() {
	      if (self.state.binds.left.isPressed()) {
	        self.x -= 2;
	      }
	      if (self.state.binds.right.isPressed()) {
	        self.x += 2;
	      }
	      if (self.state.binds.up.isPressed()) {
	        self.y -= 2;
	      }
	      if (self.state.binds.down.isPressed()) {
	        self.y += 2;
	      }
	    }
	  };
	  return self;
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.DebugMarker = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var DebugMarker = exports.DebugMarker = function DebugMarker(x, y, parallax) {
	  if (parallax == undefined) {
	    parallax = 1;
	  }
	  var self = {
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	
	    x: x,
	    y: y,
	    parallax: parallax,
	    w: 0,
	    h: 0,
	    noDebug: true,
	    type: "debug marker",
	    draw: function draw(shapes) {
	      shapes.drawColoredRect(_palette.colors.debugBox, -1, -10, 1, 10, 1);
	      shapes.drawColoredRect(_palette.colors.debugBox, -10, -1, 10, 1, 1);
	      self.state.drawDebugInfoBox(["(" + x + ", " + y + ") parallax " + parallax]);
	    }
	  };
	  return self;
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Ground = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var Ground = exports.Ground = function Ground() {
	  var self = {
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	
	    x: 0,
	    y: 0,
	    w: 3000,
	    h: 1000,
	    noDebug: true,
	    parallax: 1,
	    type: "ground",
	    draw: function draw(shapes) {
	      shapes.drawColoredRect(_gfxutils.Colors.WHITE, -self.w / 2, 0, self.w / 2, 30, 0.2);
	      shapes.drawColoredRect(_palette.colors.ground, -self.w / 2, 30, self.w / 2, self.h, 0.2);
	    }
	  };
	  return self;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Train = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var Train = exports.Train = function Train() {
	  var self = {
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	
	    x: -100,
	    y: -200,
	    w: 500,
	    h: 200,
	    parallax: 1,
	    type: "train",
	    draw: function draw(shapes) {
	      shapes.drawColoredRect(_palette.colors.trainBody, 0, 0, 500, 180, 0.1);
	    }
	  };
	  return self;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Office = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var Office = exports.Office = function Office() {
	  var drawStriped = function drawStriped(shapes, x1, y1, x2, y2) {
	    var stripeWidth = 10;
	    var gradient = x1 % (stripeWidth * 2);
	
	    var stripe = gradient < stripeWidth;
	
	    shapes.drawColoredRect(stripe ? _palette.colors.bgWall.stripeA : _palette.colors.bgWall.stripeB, x1, y1, x1 + stripeWidth - gradient / 2, y2, 0);
	
	    for (var x = x1 + stripeWidth - gradient / 2; x < x2; x += stripeWidth) {
	      stripe = !stripe;
	      shapes.drawColoredRect(stripe ? _palette.colors.bgWall.stripeA : _palette.colors.bgWall.stripeB, x, y1, Math.min(x + stripeWidth, x2), y2, 0.9);
	    }
	  };
	
	  var self = {
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	
	    x: 0,
	    y: 0,
	    w: 1280,
	    h: 720,
	    parallax: 1,
	    type: "office",
	    draw: function draw(shapes) {
	      drawStriped(shapes, 0, 0, 100, 720);
	      drawStriped(shapes, 680, 0, 1280, 720);
	      drawStriped(shapes, 100, 0, 680, 160);
	      drawStriped(shapes, 100, 590, 680, 720);
	
	      shapes.drawColoredRect(_palette.colors.window, 100, 160, 680, 590, 0);
	      //      shapes.drawColoredRect(colors.trim, 75, 137, 705, 160, 0);
	      //     shapes.drawColoredRect(colors.trimShadow, 75, 157, 705, 160, 0);
	      //    shapes.drawColoredRect(colors.trim, 100, 160, 75, 590, 0);
	
	      shapes.drawColoredRect(_palette.colors.carpet, 0, 640, 1280, 720, 0); // carpet
	    }
	  };
	  return self;
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.TextBox = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var TextBox = exports.TextBox = function TextBox() {
	  var font = void 0;
	
	  var blipmap = {
	    Avery: "male",
	    Andrea: "female",
	    Lina: "female",
	    Hale: "hale",
	    Telephone: "nobody"
	  };
	
	  var blipFor = function blipFor(person) {
	    if (person && blipmap[person] != undefined) {
	      return blipmap[person];
	    } else {
	      return "default";
	    }
	  };
	
	  var self = {
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
	    initialize: function initialize(state) {
	      self.state = state;
	      font = state.font;
	      self.clear();
	    },
	    skippable: function skippable() {
	      self.skippingEnabled = true;
	    },
	    unskippable: function unskippable() {
	      self.skippingEnabled = false;
	    },
	    display: function display(text) {
	      var updatePromises = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	      self.hidden = false;
	      self.mode = "text";
	      if (self.textPromise && !self.textPromise.resolved && updatePromises) {
	        self.textPromise.resolve();
	        //        self.textPromise.reject("interrupted");
	      }
	      text = self.text + text;
	      self.text = text;
	      self.characterAdvanceTimer = 30;
	      self.nodding = false;
	      self.color = _gfxutils.Colors.WHITE;
	      var lines = [];
	      var lastBreak = 0;
	      var lastI = 0;
	      var i = text.indexOf(" ");
	      while (i < text.length && i >= 0) {
	        if (font.computeWidth(text.slice(lastBreak, i)) > self.w / 3 - 40) {
	          lines.push(text.slice(lastBreak, lastI));
	          lastBreak = lastI + 1;
	        }
	        lastI = i;
	        i = text.indexOf(" ", i + 1);
	      }
	
	      if (font.computeWidth(text.slice(lastBreak)) > self.w / 3 - 40) {
	        lines.push(text.slice(lastBreak, lastI));
	        lastBreak = lastI + 1;
	      }
	
	      lines.push(text.slice(lastBreak));
	      self.lines = lines;
	
	      if (updatePromises) {
	        return new Promise(function (resolve, reject) {
	          self.textPromise = {
	            resolve: resolve, reject: reject, resolved: false
	          };
	        });
	      }
	    },
	    soliloquy: function soliloquy(text) {
	      var p = self.display(text);
	      self.color = _palette.colors.soliloquyText;
	      return p;
	    },
	    hide: function hide() {
	      self.hidden = true;
	      self.clear();
	    },
	    unhide: function unhide() {
	      self.hidden = false;
	    },
	    setPerson: function setPerson(person) {
	      self.person = person;
	      self.setVoice(blipFor(person));
	    },
	    setVoice: function setVoice(voice) {
	      if (voice == "nobody") {
	        self.voice = null;
	      } else {
	        self.voice = _assetmgr.AssetManager.getAsset("game.sfx.textblip." + voice);
	      }
	      return self.voice;
	    },
	    choices: function choices(_choices) {
	      self.hidden = false;
	      self.choiceList = _choices;
	      self.mode = "choices";
	      self.selectedChoice = 0;
	      self.choicesCooldown = 20;
	      return new Promise(function (resolve, reject) {
	        self.choicePromise = {
	          resolve: resolve, reject: reject, resolved: false
	        };
	      });
	    },
	    clear: function clear() {
	      self.text = "";
	      self.lines = [];
	      self.nodding = false;
	      self.displayCutoff = 0;
	    },
	    nod: function nod() {
	      console.log("nod");
	      this.nodding = true;
	      return new Promise(function (resolve, reject) {
	        self.nodPromise = {
	          resolve: resolve, reject: reject, resolved: false
	        };
	      });
	    },
	    draw: function draw(shapes, font, matrix, opMatrix) {
	      if (self.hidden) {
	        return;
	      }
	      shapes.drawColoredTriangle(_palette.colors.textbox.trim, 150, -31, 180, -1, 150, -1, 0);
	      shapes.drawColoredTriangle(_palette.colors.textbox.bg, 150, -30, 180, 0, 150, 0, 0);
	      shapes.drawColoredRect(_palette.colors.textbox.trim, -1, -1, 1182, 202, 0);
	      shapes.drawColoredRect(_palette.colors.textbox.trim, -1, -31, 150, 0, 0);
	      shapes.drawColoredRect(_palette.colors.textbox.bg, 0, -30, 150, -1, 0);
	      shapes.drawColoredRect(_palette.colors.textbox.bg, 0, 0, 1180, 200, 0);
	      shapes.flush();
	
	      opMatrix.load.scale(2, 2, 1);
	      matrix.multiply(opMatrix);
	      if (self.person) {
	        font.draw(_gfxutils.Colors.WHITE, 5, -12, 0, self.person);
	      }
	
	      opMatrix.load.scale(3 / 2, 3 / 2, 1);
	      matrix.multiply(opMatrix);
	
	      var y = 4;
	      switch (self.mode) {
	        case "text":
	          var cut = self.displayCutoff;
	          for (var i = 0; i < self.lines.length; i++) {
	            if (cut > 0) {
	              font.draw(self.color, 5, y, 0, self.lines[i].slice(0, cut));
	            }
	            cut -= self.lines[i].length + 1;
	            if (i == self.lines.length - 1 && self.nodding) {
	              var w = font.computeWidth(self.lines[i]) + 5;
	              shapes.drawColoredRect(self.color, w, y, w + 5, y + font.height - 1, 0);
	            }
	            y += font.height + 4;
	          }
	          break;
	        case "choices":
	          for (var _i = 0; _i < self.choiceList.length; _i++) {
	            if (_i == self.selectedChoice) {
	              font.draw(_gfxutils.Colors.WHITE, 5, y, 0, ">");
	            }
	            font.draw(self.choiceList[_i].visited ? _palette.colors.textbox.visited : _gfxutils.Colors.WHITE, 15, y, 0, self.choiceList[_i].content);
	            y += font.height + 4;
	          }
	          break;
	        default:
	          font.draw(_gfxutils.Colors.WHITE, 0, 0, 0, "invalid state '" + self.mode + "'");
	      }
	      font.flush();
	    },
	    tick: function tick(delta) {
	      if (self.nodding && self.state.binds.nod.justPressed()) {
	        self.display(" ", false);
	        self.nodding = false;
	        self.nodPromise.resolve();
	      }
	      if (self.mode == "choices") {
	        if (self.state.binds.down.justPressed() || self.state.binds.left.justPressed()) {
	          self.selectedChoice++;
	          self.selectedChoice %= self.choiceList.length;
	
	          self.state.game.sound.playSound(_assetmgr.AssetManager.getAsset("game.sfx.select"));
	        }
	        if (self.state.binds.up.justPressed() || self.state.binds.right.justPressed()) {
	          if (self.selectedChoice <= 0) {
	            self.selectedChoice = self.choiceList.length;
	          }
	          self.selectedChoice--;
	
	          self.state.game.sound.playSound(_assetmgr.AssetManager.getAsset("game.sfx.select"));
	        }
	        self.choicesCooldown--;
	        if (self.state.binds.nod.justPressed() && self.choicesCooldown <= 0) {
	          self.state.game.sound.playSound(_assetmgr.AssetManager.getAsset("game.sfx.confirm"));
	          self.clear();
	          self.choicePromise.resolve(self.choiceList[self.selectedChoice].callback());
	        }
	      }
	      if (self.mode == "text") {
	        if (self.state.binds.nod.justPressed() || self.state.binds.fasterText.justPressed()) {
	          self.characterAdvanceTimer -= 10;
	        }
	      }
	    },
	
	    speed: 1,
	    step: function step() {
	      self.characterAdvanceTimer -= (self.skippingEnabled && (self.state.binds.fasterText.isPressed() || self.state.binds.nod.isPressed()) ? 3 : 1) * self.speed;
	      while (self.characterAdvanceTimer <= 0 && self.displayCutoff < self.text.length) {
	        self.displayCutoff++;
	        var chr = self.text[self.displayCutoff];
	        switch (chr) {
	          case " ":
	            break;
	          default:
	            self.characterAdvanceTimer += 20;
	        }
	        chr = self.text[self.displayCutoff - 1];
	        if (chr && chr.match("[a-zA-Z0-9\\.,\!\?\-]")) {
	          self.blip = self.state.game.sound.playSound(self.voice);
	        }
	        if (self.displayCutoff >= self.text.length && self.textPromise) {
	          self.displayCutoff = self.text.length;
	          self.textPromise.resolve();
	          self.textPromise.resolved = true;
	        }
	      }
	    }
	  };
	  return self;
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Fader = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var Fader = exports.Fader = function Fader() {
	  var self = {
	    x: 0,
	    y: 0,
	    w: 1280,
	    h: 720,
	    parallax: 0,
	    type: "fader",
	    fadeColor: (0, _gfxutils.Color)(0, 0, 0, 0.5),
	    fadeAmount: 1.0,
	    fadeTarget: 1.0,
	    initialize: function initialize(state) {
	      self.state = state;
	    },
	    unfade: function unfade() {
	      self.fadeTarget = 0;
	    },
	    tick: function tick(delta) {
	      if (self.fadeAmount > self.fadeTarget) {
	        self.fadeAmount -= delta / 500.0;
	        if (self.fadeAmount < self.fadeTarget) {
	          self.fadeAmount = self.fadeTarget;
	        }
	      }
	      if (self.fadeAmount < self.fadeTarget) {
	        self.fadeAmount += delta / 500.0;
	        if (self.fadeAmount > self.fadeTarget) {
	          self.fadeAmount = self.fadeTarget;
	        }
	      }
	    },
	    draw: function draw(shapes, font, matrix, opMatrix) {
	      self.fadeColor.a = self.fadeAmount;
	      shapes.flush();
	      shapes.drawColoredRect(self.fadeColor, 0, 0, self.w, self.h, 0);
	    }
	  };
	  return self;
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Notepad = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var Notepad = exports.Notepad = function Notepad() {
	  var matStack = _math.Mat4Stack.create();
	
	  var font = void 0;
	  var textColor = (0, _gfxutils.Color)(0, 0, 0, 1);
	  var hoveredColor = (0, _gfxutils.Color)(0.5, 0.5, 0.7, 1);
	  var linesPerPage = 12;
	
	  var self = {
	    x: 50,
	    y: 30,
	    w: 350,
	    h: 430,
	    scale: 0.15,
	    scaleTgt: 1.0,
	    notes: [],
	    noteMap: {},
	    pages: [],
	    page: 0,
	    hoveredNote: 1,
	    evidencePromise: null,
	    pickingEvidence: false,
	    initialize: function initialize(state) {
	      self.state = state;
	      font = state.game.render.createFontRenderer(_assetmgr.AssetManager.getAsset("game.font.gunny"), _assetmgr.AssetManager.getAsset("base.shader.flat.texcolor"));
	      self.computeLinewrap();
	    },
	    pickEvidence: function pickEvidence() {
	      return new Promise(function (resolve, reject) {
	        self.pickingEvidence = true;
	        self.evidencePromise = { resolve: resolve, reject: reject };
	      });
	    },
	    computeLinewrap: function computeLinewrap() {
	      var pages = [];
	      var page = [];
	      for (var n = 0; n < self.notes.length; n++) {
	        var lines = [];
	        var text = self.notes[n].content;
	        var lastBreak = 0;
	        var lastI = 0;
	        var i = text.indexOf(" ");
	        while (i < text.length && i >= 0) {
	          if (font.computeWidth(text.slice(lastBreak, i)) > self.w - 20) {
	            lines.push({ content: text.slice(lastBreak, lastI), note: self.notes[n] });
	            lastBreak = lastI + 1;
	          }
	          lastI = i;
	          i = text.indexOf(" ", i + 1);
	        }
	
	        if (font.computeWidth(text.slice(lastBreak)) > self.w - 20) {
	          lines.push({ content: text.slice(lastBreak, lastI), note: self.notes[n] });
	          lastBreak = lastI + 1;
	        }
	
	        lines.push({ content: text.slice(lastBreak), note: self.notes[n] });
	        if (page.length + lines.length > linesPerPage) {
	          pages.push(page);
	          page = lines;
	        } else {
	          page = page.concat(lines);
	        }
	      }
	
	      pages.push(page);
	      self.pages = pages;
	    },
	    addNote: function addNote(note) {
	      if (!self.noteMap[note.id]) {
	        self.noteMap[note.id] = note;
	        self.notes.push(note);
	        self.computeLinewrap();
	      }
	    },
	    delNote: function delNote(id) {
	      var note = self.noteMap[id];
	      var i = self.notes.indexOf(note);
	      self.notes.splice(i, 1);
	      self.noteMap[id] = null;
	    },
	    step: function step() {
	      self.scale += (self.scaleTgt - self.scale) * 0.1;
	    },
	    tick: function tick(delta) {
	      if (self.pickingEvidence || self.state.mouse.x > self.x && self.state.mouse.y > self.y && self.state.mouse.x - self.x < self.w * self.scale && self.state.mouse.y - self.y < self.h * self.scale) {
	        self.scaleTgt = 1.0;
	      } else {
	        self.scaleTgt = 0.15;
	      }
	
	      if (self.isHovering(self.leftArrow) && self.page > 0 && self.state.game.mouse.justClicked()) {
	        self.page--;
	      }
	
	      if (self.isHovering(self.rightArrow) && self.page + 1 < self.pages.length && self.state.game.mouse.justClicked()) {
	        self.page++;
	      }
	
	      self.hoveredNote = null;
	      if (self.mx() > self.x && self.mx() < self.x + self.w) {
	        var lines = self.pages[self.page];
	        var y = 68;
	        for (var i = 0; i < lines.length; i++) {
	          if (self.my() > y && self.my() < y + 30 && self.mx() < font.computeWidth(lines[i].content) + 20) {
	            self.hoveredNote = lines[i].note;
	            if (self.state.game.mouse.justClicked() && self.pickingEvidence) {
	              self.evidencePromise.resolve(self.hoveredNote);
	              self.pickingEvidence = false;
	            }
	            break;
	          }
	          y += 30;
	        }
	      }
	    },
	
	    leftArrow: {
	      x: 350 - 10 - 25 - 10 - 25,
	      w: 25,
	      h: 25,
	      y: 430 - 10 - 15 - 2
	    },
	    rightArrow: {
	      x: 350 - 10 - 25,
	      w: 25,
	      h: 25,
	      y: 430 - 10 - 15 - 2
	    },
	    mx: function mx() {
	      return (self.state.mouse.x - self.x) * self.scale;
	    },
	    my: function my() {
	      return (self.state.mouse.y - self.y) * self.scale;
	    },
	    isHovering: function isHovering(arrow) {
	      return self.mx() > arrow.x && self.my() > arrow.y && self.mx() < arrow.x + arrow.w && self.my() < arrow.y + arrow.h;
	    },
	    draw: function draw(shapes, retrofont, matrix, opMatrix) {
	      opMatrix.load.scale(self.scale, self.scale, 1);
	      matrix.multiply(opMatrix);
	      shapes.drawColoredRect(_palette.colors.notepad, 0, 0, self.w, self.h, 0);
	      shapes.flush();
	
	      for (var _y = 70; _y < self.h; _y += 30) {
	        shapes.drawColoredRect(_palette.colors.notepadLines, 0, _y, self.w, _y + 1, 0);
	        shapes.drawColoredRect(textColor, 8, _y + 16.5, 12, _y + 20.5, 0);
	      }
	
	      if (self.page > 0) {
	        matStack.push(matrix);
	        opMatrix.load.translate(self.leftArrow.x, self.leftArrow.y, 0);
	        matrix.multiply(opMatrix);
	        opMatrix.load.scale(self.leftArrow.w, self.leftArrow.h, 0);
	        matrix.multiply(opMatrix);
	        var color = self.isHovering(self.leftArrow) ? _gfxutils.Colors.WHITE : _palette.colors.notepadLines;
	        shapes.drawColoredRect(color, 1 / 2, 1 / 3, 1, 2 / 3, 0);
	        shapes.drawColoredTriangle(color, 0, 1 / 2, 1 / 2, 0, 1 / 2, 1, 0);
	        matStack.pop(matrix);
	      }
	
	      if (self.page + 1 < self.pages.length) {
	        matStack.push(matrix);
	        opMatrix.load.translate(self.rightArrow.x + self.rightArrow.w, self.rightArrow.y, 0);
	        matrix.multiply(opMatrix);
	        opMatrix.load.scale(-self.rightArrow.w, self.rightArrow.h, 0);
	        matrix.multiply(opMatrix);
	        var _color = self.isHovering(self.rightArrow) ? _gfxutils.Colors.WHITE : _palette.colors.notepadLines;
	        shapes.drawColoredRect(_color, 1 / 2, 1 / 3, 1, 2 / 3, 0);
	        shapes.drawColoredTriangle(_color, 0, 1 / 2, 1 / 2, 0, 1 / 2, 1, 0);
	        matStack.pop(matrix);
	      }
	
	      shapes.flush();
	
	      textColor.a = self.scale;
	      hoveredColor.a = self.scale;
	      font.useMatrix(matrix);
	      font.draw(textColor, 5, 75 - font.height, 0, "Smith Manor Case");
	
	      var y = 70;
	      var lines = self.pages[self.page];
	      for (var i = 0; i < lines.length; i++) {
	        font.draw(self.pickingEvidence && self.hoveredNote == lines[i].note ? hoveredColor : textColor, 17, y - 2, 0, lines[i].content);
	
	        y += 30;
	      }
	
	      font.flush();
	    }
	  };
	  return self;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Telephone = undefined;
	
	var _assetmgr = __webpack_require__(7);
	
	var _gfxutils = __webpack_require__(10);
	
	var _math = __webpack_require__(8);
	
	var _palette = __webpack_require__(15);
	
	var _play = __webpack_require__(13);
	
	var Telephone = exports.Telephone = function Telephone() {
	  var matStack = _math.Mat4Stack.create();
	
	  var font = void 0;
	  var state = void 0;
	  var iconMaterial = void 0;
	  var textColor = (0, _gfxutils.Color)(0, 0, 0, 1);
	
	  var self = {
	    x: 1180,
	    y: 30,
	    w: 80,
	    h: 80,
	    bgRect: {},
	    calls: [],
	    callMap: {},
	    parallax: 0,
	    transition: 0,
	    target: 0,
	    initialize: function initialize(lstate) {
	      state = lstate;
	      iconMaterial = state.game.render.createMaterial(_assetmgr.AssetManager.getAsset("base.shader.flat.textured"), {
	        matrix: state.game.render.pixelMatrix,
	        tex: _assetmgr.AssetManager.getAsset("game.image.telephone")
	      });
	      font = state.game.render.createFontRenderer(_assetmgr.AssetManager.getAsset("game.font.gunny"), _assetmgr.AssetManager.getAsset("base.shader.flat.texcolor"));
	
	      //      self.addCall({
	      //        link: "foo",
	      //        title: "Hello, WOrld!",
	      //        id: "foo"
	      //      });
	    },
	    addCall: function addCall(call) {
	      if (!self.callMap[call.id]) {
	        self.calls.push(call);
	        self.callMap[call.id] = call;
	      }
	    },
	    modCall: function modCall(newCall) {
	      var i = self.calls.indexOf(self.callMap[newCall.id]);
	      self.calls[i] = newCall;
	      self.callMap[newCall.id] = newCall;
	    },
	    mx: function mx() {
	      return state.mouse.x - self.x;
	    },
	    my: function my() {
	      return state.mouse.y - self.y;
	    },
	    bx: function bx() {
	      return self.mx() - self.bgRect.x;
	    },
	    by: function by() {
	      return self.my() - self.bgRect.y;
	    },
	
	    enabled: true,
	    tick: function tick(delta) {
	      if (self.textbox.hidden && self.enabled && self.bx() > 0 && self.bx() < self.bgRect.w && self.by() > 0 && self.by() < self.bgRect.h) {
	        self.target = 1;
	      } else {
	        self.target = 0;
	      }
	      var i = 0;
	      var bgRect = self.bgRect;
	      self.hovered = -1;
	      for (var y = 80; y - bgRect.y < bgRect.h; y += 40) {
	        var by = Math.min(y + 40, bgRect.h + bgRect.y);
	        if (i >= self.calls.length) {
	          break;
	        }
	        if (self.bx() > 0 && self.bx() < self.bgRect.w && self.my() > y && self.my() < by) {
	          self.hovered = i;
	          break;
	        }
	        i++;
	      }
	      if (self.textbox.hidden && self.enabled && state.game.mouse.justClicked() && self.hovered >= 0) {
	        state.dialogue.begin(self.calls[self.hovered].link).then(function () {
	          self.textbox.hide();
	        });
	      }
	    },
	    step: function step() {
	      self.transition += (self.target - self.transition) * 0.1;
	      var bgRect = self.bgRect;
	      bgRect.x = (0, _play.lerp)(0, -300, self.transition);
	      bgRect.y = 0;
	      bgRect.w = (0, _play.lerp)(80, 380, self.transition);
	      bgRect.h = Math.max(80, (0, _play.lerp)(-50, 440, self.transition));
	    },
	    draw: function draw(shapes, retrofont, matrix, opMatrix) {
	      textColor.a = self.transition;
	      var bgRect = self.bgRect;
	      shapes.drawColoredRect(_gfxutils.Colors.WHITE, bgRect.x, bgRect.y, bgRect.x + bgRect.w, bgRect.y + bgRect.h, 0);
	      var stripe = true;
	      var i = 0;
	      for (var _y = 80; _y - bgRect.y < bgRect.h; _y += 40) {
	        var by = Math.min(_y + 40, bgRect.h + bgRect.y);
	        shapes.drawColoredRect(stripe ? self.hovered == i ? _palette.colors.contacts.hoveredA : _palette.colors.contacts.stripeA : self.hovered == i ? _palette.colors.contacts.hoveredB : _palette.colors.contacts.stripeB, bgRect.x, _y, bgRect.x + bgRect.w, by, 0);
	        stripe = !stripe;
	        i++;
	      }
	      shapes.flush();
	      font.useMatrix(matrix);
	      font.draw(textColor, (0, _play.lerp)(0, bgRect.x + 10, self.transition), 20, 0, "Contacts:");
	
	      var y = 80;
	      for (i = 0; i < self.calls.length; i++) {
	        font.draw(textColor, (0, _play.lerp)(100, bgRect.x + 10, self.transition), y, 0, self.calls[i].title);
	        y += 40;
	      }
	      font.flush();
	
	      shapes.useMaterial(iconMaterial, function () {
	        shapes.drawTexturedRect(3, 18, self.w - 3, 12 + self.h * 0.7, 0, 0, 1, 0.7, 0);
	      });
	    }
	  };
	  return self;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.DialogueInterpreter = exports.DialogueLoader = undefined;
	
	var _blobUtil = __webpack_require__(2);
	
	var BlobUtil = _interopRequireWildcard(_blobUtil);
	
	var _assetmgr = __webpack_require__(7);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var DialogueLoader = exports.DialogueLoader = function DialogueLoader() {
	  var loaders = {
	    dialogue: function dialogue(placeholder) {
	      return _assetmgr.AssetManager.getFile(placeholder.spec.src, placeholder.spec.link).then(function (blob) {
	        return BlobUtil.blobToBinaryString(blob);
	      }).then(function (str) {
	        return new DOMParser().parseFromString(str, "application/xml");
	      }).then(function (dom) {
	        if (dom.documentElement.nodeName == "parsererror") {
	          throw dom;
	        }
	        var root = dom.documentElement;
	        if (root.localName != "dialogues") {
	          throw "root node is node <dialogues>";
	        }
	        return root;
	      });
	    }
	  };
	  return {
	    canLoad: function canLoad(placeholder) {
	      return loaders[placeholder.spec.type] != undefined;
	    },
	    load: function load(placeholder) {
	      return loaders[placeholder.spec.type](placeholder);
	    }
	  };
	};
	
	var DialogueInterpreter = exports.DialogueInterpreter = function DialogueInterpreter() {
	  var tree = void 0,
	      textbox = void 0,
	      notepad = void 0;
	
	  var extraCommands = {};
	
	  var interpreter = {
	    visitedTrees: {},
	
	    loadTree: function loadTree(ltree) {
	      tree = ltree;
	    },
	    linkTextbox: function linkTextbox(ltextbox) {
	      textbox = ltextbox;
	    },
	    linkNotepad: function linkNotepad(lnotepad) {
	      notepad = lnotepad;
	    },
	    addCommand: function addCommand(name, func) {
	      extraCommands[name] = func;
	    },
	    interpret: function interpret(dialogue) {
	      while (dialogue && dialogue.nodeType == 3) {
	        dialogue = dialogue.nextSibling;
	      }
	
	      if (!dialogue) {
	        console.log("reached end of dialogue tree");
	        return Promise.resolve();
	      }
	
	      switch (dialogue.localName) {
	        case "person":
	          textbox.setPerson(dialogue.textContent.trim());
	          break;
	        case "voice":
	          textbox.setVoice(dialogue.textContent.trim());
	          break;
	        case "speed":
	          textbox.speed = parseFloat(dialogue.getAttribute("factor"));
	          break;
	        case "st":
	          return textbox.display(dialogue.textContent.trim()).then(function () {
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        case "soliloquy":
	          return textbox.soliloquy(dialogue.textContent.trim()).then(function () {
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        case "space":
	          return textbox.display(" ").then(function () {
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        case "nod":
	          return textbox.nod().then(function () {
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        case "clear":
	          textbox.clear();
	          break;
	        case "unskippable":
	          textbox.unskippable();
	          break;
	        case "skippable":
	          textbox.skippable();
	          break;
	        case "hide":
	          textbox.hide();
	          break;
	        case "unhide":
	          textbox.unhide();
	          break;
	        case "pause":
	          return new Promise(function (resolve, reject) {
	            setTimeout(resolve, dialogue.getAttribute("length"));
	          }).then(function () {
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        case "choices":
	          var choices = [];
	
	          var _loop = function _loop(i) {
	            var choice = dialogue.children[i];
	            if (choice.nodeType == 3) {
	              return "continue";
	            }
	
	            (function () {
	              switch (choice.localName) {
	                case "choice":
	                  if (!choice.hasAttribute("link")) {
	                    break;
	                  }
	                  choices.push({
	                    content: choice.textContent.trim(),
	                    visited: interpreter.visitedTrees[interpreter.getPathElement(interpreter.findTree(choice.getAttribute("link"), interpreter.findGroup(dialogue)))],
	                    callback: function callback() {
	                      return interpreter.begin(choice.getAttribute("link"), interpreter.findGroup(dialogue));
	                    }
	                  });
	                  break;
	                case "evidence":
	                  if (!choice.hasAttribute("note")) {
	                    break;
	                  }
	                  if (!choice.hasAttribute("correct")) {
	                    break;
	                  }
	                  if (!choice.hasAttribute("wrong")) {
	                    break;
	                  }
	                  var person = textbox.person;
	                  choices.push({
	                    content: choice.textContent.trim(),
	                    visited: interpreter.visitedTrees[interpreter.getPathElement(interpreter.findTree(choice.getAttribute("correct"), interpreter.findGroup(dialogue)))],
	                    callback: function callback() {
	                      return textbox.display(choice.textContent.trim()).then(function () {
	                        return notepad.pickEvidence().then(function (evidence) {
	                          if (evidence.id == choice.getAttribute("note")) {
	                            return interpreter.begin(choice.getAttribute("correct"), interpreter.findGroup(dialogue));
	                          } else {
	                            return interpreter.begin(choice.getAttribute("wrong"), interpreter.findGroup(dialogue)).then(function () {
	                              textbox.setPerson(person);
	                              return interpreter.interpret(dialogue); // go right back to the choices
	                            });
	                          }
	                        });
	                      });
	                    }
	                  });
	                  break;
	                default:
	                  choices.push({
	                    content: "<" + choice.localName + ">",
	                    callback: function callback() {
	                      return textbox.display(choice.outerXML);
	                    }
	                  });
	              }
	            })();
	          };
	
	          for (var i = 0; i < dialogue.children.length; i++) {
	            var _ret = _loop(i);
	
	            if (_ret === "continue") continue;
	          }
	          return textbox.choices(choices);
	          break;
	        case "jump":
	          console.log("jumping in to " + dialogue.getAttribute("link"));
	          return interpreter.begin(dialogue.getAttribute("link"), interpreter.findGroup(dialogue)).then(function () {
	            console.log("returned from " + dialogue.getAttribute("link"));
	            return interpreter.interpret(dialogue.nextSibling);
	          });
	        default:
	          if (extraCommands[dialogue.localName]) {
	            return extraCommands[dialogue.localName](dialogue).then(function () {
	              return interpreter.interpret(dialogue.nextSibling);
	            });
	          } else {
	            textbox.clear();
	            textbox.display("bad tag: " + dialogue.localName);
	          }
	      }
	      return interpreter.interpret(dialogue.nextSibling);
	    },
	    findGroup: function findGroup(element) {
	      if (!element.parentElement) {
	        return null;
	      }
	      if (element.parentElement.localName == "group") {
	        return element.parentElement;
	      }
	      return interpreter.findGroup(element.parentElement);
	    },
	    getPathElement: function getPathElement(element) {
	      var parts = [element.getAttribute("id")];
	      var group = interpreter.findGroup(element);
	      while (group) {
	        parts.push(group.getAttribute("id"));
	        group = interpreter.findGroup(group);
	      }
	      return parts.reverse().join(".");
	    },
	    findTree: function findTree(identifier, scope) {
	      if (!tree) {
	        throw "no dialogue tree has been loaded, you fool!";
	      }
	
	      if (!scope) {
	        scope = tree;
	      }
	
	      var parts = identifier.split(".");
	      var dialogue = scope;
	      var found = false;
	      for (var i = 0; i < parts.length; i++) {
	        found = false;
	        for (var j = 0; j < dialogue.children.length; j++) {
	          if (dialogue.children[j].getAttribute("id") == parts[i]) {
	            dialogue = dialogue.children[j];
	            found = true;
	            break;
	          }
	        }
	      }
	      if (!found) {
	        dialogue = tree;
	        found = false;
	        for (var _i = 0; _i < parts.length; _i++) {
	          found = false;
	          for (var _j = 0; _j < dialogue.children.length; _j++) {
	            if (dialogue.children[_j].getAttribute("id") == parts[_i]) {
	              dialogue = dialogue.children[_j];
	              found = true;
	              break;
	            }
	          }
	        }
	        if (!found) {
	          throw "could not find";
	        }
	      }
	      if (dialogue.localName != "dialogue") {
	        throw "path '" + identifier + "' does not refer to a <dialogue> tag. instead, it refers to a <" + dialogue.localName + "> tag";
	      }
	      return dialogue;
	    },
	    begin: function begin(identifier) {
	      var scope = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	
	      var dialogue = interpreter.findTree(identifier, scope);
	      interpreter.visitedTrees[interpreter.getPathElement(dialogue)] = true;
	      console.log("hey");
	      return interpreter.interpret(dialogue.children[0]);
	    }
	  };
	  return interpreter;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SoundEngine = undefined;
	
	var _blobUtil = __webpack_require__(2);
	
	var BlobUtil = _interopRequireWildcard(_blobUtil);
	
	var _assetmgr = __webpack_require__(7);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var SoundEngine = exports.SoundEngine = function SoundEngine(game) {
	  var ctx = new AudioContext();
	
	  var sfx = {
	    createAssetLoader: function createAssetLoader() {
	      var loaders = {
	        "sound": function sound(placeholder) {
	          return _assetmgr.AssetManager.getFile(placeholder.spec.src).then(function (blob) {
	            return BlobUtil.blobToArrayBuffer(blob);
	          }).then(function (ab) {
	            return ctx.decodeAudioData(ab);
	          }).then(function (audio) {
	            return audio;
	          });
	        },
	        "music": function music(placeholder) {
	          var tracks = {};
	          var promises = [];
	
	          var _loop = function _loop(name) {
	            var track = placeholder.spec.tracks[name];
	            tracks[name] = [];
	
	            var _loop2 = function _loop2(i) {
	              var media = new Audio();
	              media.loop = true;
	              tracks[name].push(media);
	              promises.push(new Promise(function (resolve, reject) {
	                //pre-buffer enough of the track
	                media.oncanplaythrough = resolve;
	                media.onerror = function () {
	                  reject(["!?!?!", "MEDIA_ERR_ABORTED", "MEDIA_ERR_NETWORK", "MEDIA_ERR_DECODE", "MEDIA_ERR_SRC_NOT_SUPPORTED"][media.error.code] + " on track '" + name + "', source " + i + " (" + track[i] + " -> " + _assetmgr.AssetManager.getURL(track[i]) + ")");
	                };
	                media.src = _assetmgr.AssetManager.getURL(track[i]);
	              }));
	            };
	
	            for (var i = 0; i < track.length; i++) {
	              _loop2(i);
	            }
	          };
	
	          for (var name in placeholder.spec.tracks) {
	            _loop(name);
	          }
	
	          return Promise.all(promises).then(function () {
	            return tracks;
	          });
	        }
	      };
	
	      return {
	        canLoad: function canLoad(placeholder) {
	          return loaders[placeholder.spec.type] != undefined;
	        },
	        load: function load(placeholder) {
	          return loaders[placeholder.spec.type](placeholder);
	        }
	      };
	    },
	    playSound: function playSound(buffer) {
	      if (buffer) {
	        var source = ctx.createBufferSource();
	        source.buffer = buffer;
	        source.connect(ctx.destination);
	        source.start(0);
	        return source;
	      }
	    },
	    createSound: function createSound(buffer) {
	      var source = ctx.createBufferSource();
	      source.buffer = buffer;
	      source.connect(ctx.destination);
	      return source;
	    },
	    playMusic: function playMusic(asset) {
	      var tracks = {};
	      var sources = [];
	      for (var _track in asset) {
	        var gain = ctx.createGain();
	        for (var i = 0; i < asset[_track].length; i++) {
	          var src = ctx.createMediaElementSource(asset[_track][i]);
	          src.connect(gain);
	          asset[_track][i].currentTime = 0;
	          asset[_track][i].play();
	          sources.push(asset[_track][i]);
	        }
	        gain.gain.value = 1;
	        gain.connect(ctx.destination);
	        tracks[_track] = gain;
	      }
	
	      var music = {
	        update: function update() {},
	        setTrackVolume: function setTrackVolume(name, gain) {
	          tracks[name].gain.value = gain;
	        },
	        stop: function stop() {
	          for (var _i = 0; _i < sources.length; _i++) {
	            sources[_i].pause();
	          }
	        }
	      };
	      return music;
	    }
	  };
	
	  return sfx;
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
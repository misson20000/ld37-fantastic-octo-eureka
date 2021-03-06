import * as BlobUtil from "blob-util";
import {AssetManager} from "../assetmgr.js";

export let DialogueLoader = () => {
  let loaders = {
    dialogue(placeholder) {
      return AssetManager.getFile(placeholder.spec.src, placeholder.spec.link).then((blob) => {
        return BlobUtil.blobToBinaryString(blob);
      }).then((str) => {
        return new DOMParser().parseFromString(str, "application/xml");
      }).then((dom) => {
        if(dom.documentElement.nodeName == "parsererror") {
          throw dom;
        }
        let root = dom.documentElement;
        if(root.localName != "dialogues") {
          throw "root node is node <dialogues>";
        }
        return root;
      })
    }
  };
  return {
    canLoad(placeholder) {
      return loaders[placeholder.spec.type] != undefined;
    },
    load(placeholder) {
      return loaders[placeholder.spec.type](placeholder);
    }
  };
};

export let DialogueInterpreter = () => {
  let tree, textbox, notepad;

  let extraCommands = {};
  
  let interpreter = {
    visitedTrees: {},
    flags: {},
    
    loadTree(ltree) {
      tree = ltree
    },
    linkTextbox(ltextbox) {
      textbox = ltextbox;
    },
    linkNotepad(lnotepad) {
      notepad = lnotepad;
    },
    addCommand(name, func) {
      extraCommands[name] = func;
    },
    interpret(dialogue) {
      while(dialogue && dialogue.nodeType == 3) {
        dialogue = dialogue.nextSibling;
      }
      
      if(!dialogue) {
        console.log("reached end of dialogue tree");
        return Promise.resolve();
      }

      switch(dialogue.localName) {
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
        return textbox.display(dialogue.textContent.trim()).then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "soliloquy":
        return textbox.soliloquy(dialogue.textContent.trim()).then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "space":
        return textbox.display(" ", true, false).then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "nod":
        return textbox.nod().then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "clear":
        textbox.clear();
        break;
      case "setFlag":
        interpreter.flags[dialogue.getAttribute("id")] = dialogue.textContent.trim();
        break;
      case "ifFlag":
        if(interpreter.flags[dialogue.getAttribute("id")] == dialogue.getAttribute("value")) {
          return interpreter.interpret(dialogue.children[0]).then(() => {
            return interpreter.interpret(dialogue.nextSibling);
          });
        }
        break;
      case "break":
        return Promise.resolve();
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
        return new Promise((resolve, reject) => {
          setTimeout(resolve, dialogue.getAttribute("length"));
        }).then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "choices":
        let choices = [];
        for(let i = 0; i < dialogue.children.length; i++) {
          let choice = dialogue.children[i];
          if(choice.nodeType == 3) {
            continue;
          }
          switch(choice.localName) {
          case "choice":
            if(!choice.hasAttribute("link")) {
              break;
            }
            choices.push({
              content: choice.textContent.trim(),
              visited: interpreter.visitedTrees[interpreter.getPathElement(interpreter.findTree(choice.getAttribute("link"), interpreter.findGroup(dialogue)))],
              callback: () => {
                return interpreter.begin(choice.getAttribute("link"), interpreter.findGroup(dialogue));
              }
            });
            break;
          case "evidence":
            if(!choice.hasAttribute("note")) {
              break;
            }
            if(!choice.hasAttribute("correct")) {
              break;
            }
            if(!choice.hasAttribute("wrong")) {
              break;
            }
            let person = textbox.person;
            choices.push({
              content: choice.textContent.trim(),
              visited: interpreter.visitedTrees[interpreter.getPathElement(interpreter.findTree(choice.getAttribute("correct"), interpreter.findGroup(dialogue)))],
              callback: () => {
                return textbox.display(choice.textContent.trim()).then(() => {
                  return notepad.pickEvidence().then((evidence) => {
                    if(evidence.id == choice.getAttribute("note")) {
                      return interpreter.begin(choice.getAttribute("correct"), interpreter.findGroup(dialogue));
                    } else {
                      return interpreter.begin(choice.getAttribute("wrong"), interpreter.findGroup(dialogue)).then(() => {
                        textbox.setPerson(person);
                        return interpreter.interpret(dialogue); // go right back to the choices
                      });
                    }
                  })
                });
              }
            });
            break;
          default:
            choices.push({
              content: "<" + choice.localName + ">",
              callback: () => {
                return textbox.display(choice.outerXML);
              }
            });
          }
        }
        return textbox.choices(choices);
        break;
      case "jump":
        console.log("jumping in to " + dialogue.getAttribute("link"));
        return interpreter.begin(dialogue.getAttribute("link"), interpreter.findGroup(dialogue)).then(() => {
          console.log("returned from " + dialogue.getAttribute("link"));
          return interpreter.interpret(dialogue.nextSibling);
        });
      default:
        if(extraCommands[dialogue.localName]) {
          return extraCommands[dialogue.localName](dialogue).then(() => {
            return interpreter.interpret(dialogue.nextSibling);
          });
        } else {
          textbox.clear();
          console.log("bad tag: " + dialogue.localName);
        }
      }
      return interpreter.interpret(dialogue.nextSibling);
    },
    findGroup(element) {
      if(!element.parentElement) {
        return null;
      }
      if(element.parentElement.localName == "group") {
        return element.parentElement;
      }
      return interpreter.findGroup(element.parentElement);
    },
    getPathElement(element) {
      let parts = [element.getAttribute("id")];
      let group = interpreter.findGroup(element);
      while(group) {
        parts.push(group.getAttribute("id"));
        group = interpreter.findGroup(group);
      }
      return parts.reverse().join(".");
    },
    findTree(identifier, scope) {
      if(!tree) {
        throw "no dialogue tree has been loaded, you fool!";
      }

      if(!scope) {
        scope = tree;
      }
      
      let parts = identifier.split(".");
      let dialogue = scope;
      let found = false;
      for(let i = 0; i < parts.length; i++) {
        found = false;
        for(let j = 0; j < dialogue.children.length; j++) {
          if(dialogue.children[j].getAttribute("id") == parts[i]) {
            dialogue = dialogue.children[j];
            found = true;
            break;
          }
        }
      }
      if(!found) {
        dialogue = tree;
        found = false;
        for(let i = 0; i < parts.length; i++) {
          found = false;
          for(let j = 0; j < dialogue.children.length; j++) {
            if(dialogue.children[j].getAttribute("id") == parts[i]) {
              dialogue = dialogue.children[j];
              found = true;
              break;
            }
          }
        }
        if(!found) {
          throw "could not find";
        }
      }
      if(dialogue.localName != "dialogue") {
        throw "path '" + identifier + "' does not refer to a <dialogue> tag. instead, it refers to a <" + dialogue.localName + "> tag";
      }
      return dialogue;
    },
    begin(identifier, scope = null) {
      let dialogue = interpreter.findTree(identifier, scope);
      interpreter.visitedTrees[interpreter.getPathElement(dialogue)] = true;
      console.log("hey");
      return interpreter.interpret(dialogue.children[0]);
    }
  };
  return interpreter;
};

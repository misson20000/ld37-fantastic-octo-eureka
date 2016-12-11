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
  let tree, textbox;

  let state = {
    currentNode: null
  };

  let extraCommands = {};
  
  let interpreter = {
    loadTree(ltree) {
      tree = ltree
    },
    linkTextbox(ltextbox) {
      textbox = ltextbox;
    },
    addCommand(name, func) {
      extraCommands[name] = func;
    },
    interpret(dialogue) {
      while(dialogue.nodeType == 3) {
        dialogue = dialogue.nextSibling;
      }
      switch(dialogue.localName) {
      case "person":
        textbox.person = dialogue.textContent.trim();
        break;
      case "st":
        return textbox.display(dialogue.textContent.trim()).then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "space":
        return textbox.display(" ").then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "nod":
        return textbox.nod().then(() => {
          return interpreter.interpret(dialogue.nextSibling);
        });
      case "clear":
        textbox.clear();
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
          if(choice.localName != "choice") {
            textbox.display("bad choices child");
          }
          if(!choice.hasAttribute("link")) {
            textbox.display("choice w/o link attribute");
          }
          choices.push({
            content: choice.textContent.trim(),
            callback: () => {
              return interpreter.begin(choice.getAttribute("link"), interpreter.findGroup(dialogue));
            }
          });
        }
        return textbox.choices(choices);
        break;
      default:
        if(extraCommands[dialogue.localName]) {
          return extraCommands[dialogue.localName](dialogue).then(() => {
            return interpreter.interpret(dialogue.nextSibling);
          });
        } else {
          textbox.clear();
          textbox.display("bad tag: " + dialogue.localName);
        }
      }
      return interpreter.interpret(dialogue.nextSibling);
    },
    findGroup(element) {
      if(element.localName == "group") {
        return element;
      }
      if(element.parentElement) {
        return interpreter.findGroup(element.parentElement);
      } else {
        throw "no group found";
      }
    },
    begin(identifier, scope = null) {
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
          throw "could not find"
        }
      }
      if(dialogue.localName != "dialogue") {
        throw "path '" + identifier + "' does not refer to a <dialogue> tag. instead, it refers to a <" + dialogue.localName + "> tag";
      }

      return interpreter.interpret(dialogue.children[0]);
    }
  };
  return interpreter;
};

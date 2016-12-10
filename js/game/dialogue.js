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
  
  let interpreter = {
    loadTree(ltree) {
      tree = ltree
    },
    linkTextbox(ltextbox) {
      textbox = ltextbox;
    },
    interpret(dialogue) {
      while(dialogue.nodeType == 3) {
        dialogue = dialogue.nextSibling;
      }
      switch(dialogue.localName) {
      case "person":
        //NYI
        break;
      case "st":
        return textbox.display(dialogue.textContent.trim()).then(() => {
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
      default:
        textbox.clear();
        textbox.display("bad tag: " + dialogue.localName);
      }
      return interpreter.interpret(dialogue.nextSibling);
    },
    begin(identifier) {
      if(!tree) {
        throw "no dialogue tree has been loaded, you fool!";
      }
      let parts = identifier.split(".");
      let dialogue = tree;
      for(let i = 0; i < parts.length; i++) {
        for(let j = 0; j < dialogue.children.length; j++) {
          if(dialogue.children[j].getAttribute("id") == parts[i]) {
            dialogue = dialogue.children[j];
          }
        }
      }
      if(dialogue.localName != "dialogue") {
        throw "path '" + identifier + "' does not refer to a <dialogue> tag. instead, it refers to a <" + dialogue.localName + "> tag";
      }

      interpreter.interpret(dialogue.children[0]);
    }
  };
  return interpreter;
};

declare var Phaser:any;

export class PHASER_TEXT_MANAGER {
  game:any;
  texts:any;

  constructor(){
    this.game = null;
    this.texts = {
      textsArray:[],
      textsObject:{}
    }
  }

  public assign(construct:any){
    this.game = construct.game;
  }

  public addText(data:any){
    let duplicateCheck = this.texts.textsArray.filter(( texts ) => {
      return texts.key === data.key;
    });

    if(duplicateCheck.length === 0){
      let newText = this.game.add.bitmapText(data.x, data.y, data.font, data.default, data.size);
          newText.key = data.key;
          newText.groupKey = data.groupKey || null;
      this.texts.textsArray.push(newText)
      this.texts.textsObject[data.key] = newText;
      return newText;
    }
    else{
      console.log(`Duplicate key name not allowed: ${data.key}`)
    }
  }

  public destroyText(key:string){
    let keys = [];
    // remove from array
    let deleteTextArray = this.texts.textsArray.filter(( sprite ) => {
      return sprite.key === key;
    });
    for(let text of deleteTextArray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.textsObject[key];

    // save as new array
    this.texts.textsArray = this.texts.textsArray.filter(( text ) => {
      return text.key !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroySpriteGroup(groupKey:string){
    let keys = [];
    // remove from array
    let deleteTextsArray = this.texts.textsArray.filter(( texts ) => {
      return texts.groupKey === groupKey;
    });
    for(let text of deleteTextsArray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.textsObject[groupKey];

    // save as new array
    this.texts.textsArray = this.texts.textsArray.filter(( text ) => {
      return text.groupKey !== groupKey;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public getText(key:string){
    return this.texts.textsObject[key]
  }

  public getGroup(groupKey:string){
    return this.texts.textsArray.filter(( text ) => {
      return text.groupKey === groupKey;
    });
  }


  public getAllTexts(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.texts.textsArray;
    }
    if(type == 'OBJECT'){
      return this.texts.textsObject;
    }
    return {object: this.texts.textsObject, array: this.texts.textsArray};
  }
}

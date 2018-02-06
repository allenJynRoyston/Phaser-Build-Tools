declare var Phaser:any;

export class PHASER_TEXT_MANAGER {
  game:any;
  texts:any;

  constructor(){
    this.game = null;
    this.texts = {
      array:[],
      object:{}
    }
  }

  public assign(construct:any){
    this.game = construct.game;
  }

  public add(data:any){
    let duplicateCheck = this.texts.array.filter(( texts ) => {
      return texts.key === data.key;
    });

    if(duplicateCheck.length === 0){
      let newText = this.game.add.bitmapText(data.x, data.y, data.font, data.default, data.size);
          newText.key = data.key;
          newText.groupKey = data.groupKey || null;
      this.texts.array.push(newText)
      this.texts.object[data.key] = newText;
      return newText;
    }
    else{
      console.log(`Duplicate key name not allowed: ${data.key}`)
    }
  }

  public destroy(key:string){
    let keys = [];
    // remove from array
    let deleteTextArray = this.texts.array.filter(( sprite ) => {
      return sprite.key === key;
    });
    for(let text of deleteTextArray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[key];

    // save as new array
    this.texts.array = this.texts.array.filter(( text ) => {
      return text.key !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroyGroup(groupKey:string){
    let keys = [];
    // remove from array
    let deletearray = this.texts.array.filter(( texts ) => {
      return texts.groupKey === groupKey;
    });
    for(let text of deletearray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[groupKey];

    // save as new array
    this.texts.array = this.texts.array.filter(( text ) => {
      return text.groupKey !== groupKey;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.texts.object[key]
  }

  public getGroup(groupKey:string){
    return this.texts.array.filter(( text ) => {
      return text.groupKey === groupKey;
    });
  }


  public getAll(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.texts.array;
    }
    if(type == 'OBJECT'){
      return this.texts.object;
    }
    return {object: this.texts.object, array: this.texts.array};
  }
}

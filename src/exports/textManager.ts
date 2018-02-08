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

  public add(construct:any){
    let duplicateCheck = this.texts.array.filter(( obj ) => {
      return obj.name === construct.name;
    });

    if(duplicateCheck.length === 0){
      let newText = this.game.add.bitmapText(construct.x, construct.y, construct.font, construct.default, construct.size);
          newText.name = construct.name;
          newText.group = construct.group || null;
      this.texts.array.push(newText)
      this.texts.object[construct.name] = newText;
      return newText;
    }
    else{
      console.log(`Duplicate key name not allowed: ${construct.name}`)
    }
  }

  public destroy(key:string){
    let keys = [];
    // remove from array
    let deleteArray = this.texts.array.filter(( obj ) => {
      return obj.name === name;
    });
    for(let text of deleteArray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[name];

    // save as new array
    this.texts.array = this.texts.array.filter(( obj ) => {
      return obj.name !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroyGroup(key:string){
    let keys = [];
    // remove from array
    let deletearray = this.texts.array.filter(( obj ) => {
      return obj.group === key;
    });
    for(let text of deletearray){
      keys.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[key];

    // save as new array
    this.texts.array = this.texts.array.filter(( obj ) => {
      return obj.group !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.texts.object[key]
  }

  public getGroup(key:string){
    return this.texts.array.filter(( obj ) => {
      return obj.group === key;
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

  public center(construct){
    if(this.texts.object[construct.name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[construct.name];
    text.x = construct.x - (text.width/2);
    text.y = construct.y - (text.height/2);
    return text;
  }
}

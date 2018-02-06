declare var Phaser:any;

export class PHASER_BUTTON_MANAGER {
  game:any;
  resources:any;

  constructor(){
    this.game = null;

    this.resources = {
      array:[],
      object:{}
    }
  }

  public assign(construct:any){
    this.game = construct.game;
  }

  public add(data:any){
    let duplicateCheck = this.resources.array.filter(( sprite ) => {
      return sprite.key === data.key;
    });
    if(duplicateCheck.length === 0){
      let newSprite = this.game.add.button(data.x, data.y, data.reference, data.onclick);
          newSprite.key = data.key;
          newSprite.groupKey = data.groupKey || null;
      this.resources.array.push(newSprite)
      this.resources.object[data.key] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${data.key}`)
    }
  }

  public destroy(key:string){
    let keys = [];
    // remove from array
    let deleteSpriteArray = this.resources.array.filter(( sprite ) => {
      return sprite.key === key;
    });
    for(let sprite of deleteSpriteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.resources.object[key];

    // save as new array
    this.resources.array = this.resources.array.filter(( sprite ) => {
      return sprite.key !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroyGroup(groupKey:string){
    let keys = [];
    // remove from array
    let deleteSpriteArray = this.resources.array.filter(( sprite ) => {
      return sprite.groupKey === groupKey;
    });
    for(let sprite of deleteSpriteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.resources.object[groupKey];

    // save as new array
    this.resources.array = this.resources.array.filter(( sprite ) => {
      return sprite.groupKey !== groupKey;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.resources.object[key]
  }

  public getGroup(groupKey:string){
    return this.resources.array.filter(( sprite ) => {
      return sprite.groupKey === groupKey;
    });
  }

  public getAll(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.resources.array;
    }
    if(type == 'OBJECT'){
      return this.resources.object;
    }
    return {object: this.resources.object, array: this.resources.array};
  }

}

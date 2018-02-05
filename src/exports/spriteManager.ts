declare var Phaser:any;

export class PHASER_SPRITE_MANAGER {
  game:any;
  resources:any;

  constructor(){
    this.game = null;

    this.resources = {
      spritesArray:[],
      spritesObject:{}
    }


  }

  public assign(construct:any){
    this.game = construct.game;
  }

  public addSprite(data:any){

    let duplicateCheck = this.resources.spritesArray.filter(( sprite ) => {
      return sprite.key === data.key;
    });
    if(duplicateCheck.length === 0){
      let newSprite = this.game.add.sprite(data.x, data.y, data.reference);
          newSprite.key = data.key;
          newSprite.groupKey = data.groupKey || null;
      this.resources.spritesArray.push(newSprite)
      this.resources.spritesObject[data.key] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${data.key}`)
    }
  }

  public destroySprite(key:string){
    let keys = [];
    // remove from array
    let deleteSpriteArray = this.resources.spritesArray.filter(( sprite ) => {
      return sprite.key === key;
    });
    for(let sprite of deleteSpriteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.resources.spritesObject[key];

    // save as new array
    this.resources.spritesArray = this.resources.spritesArray.filter(( sprite ) => {
      return sprite.key !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroySpriteGroup(groupKey:string){
    let keys = [];
    // remove from array
    let deleteSpriteArray = this.resources.spritesArray.filter(( sprite ) => {
      return sprite.groupKey === groupKey;
    });
    for(let sprite of deleteSpriteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.resources.spritesObject[groupKey];

    // save as new array
    this.resources.spritesArray = this.resources.spritesArray.filter(( sprite ) => {
      return sprite.groupKey !== groupKey;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public getSprite(key:string){
    return this.resources.spritesObject[key]
  }

  public getGroup(groupKey:string){
    return this.resources.spritesArray.filter(( sprite ) => {
      return sprite.groupKey === groupKey;
    });
  }


  public getAllSprites(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.resources.spritesArray;
    }
    if(type == 'OBJECT'){
      return this.resources.spritesObject;
    }
    return {object: this.resources.spritesObject, array: this.resources.spritesArray};
  }

}

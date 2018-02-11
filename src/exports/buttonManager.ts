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

  public assign(game:any){
    this.game = game.game;
  }

  public add(params:any){
    let duplicateCheck = this.resources.array.filter(( sprite ) => {
      return sprite.name === params.name;
    });
    if(duplicateCheck.length === 0){
      let newSprite = this.game.add.button(params.x, params.y, params.reference, params.onclick);
          newSprite.name = params.name;
          newSprite.group = params.group || null;
      this.resources.array.push(newSprite)
      this.resources.object[params.name] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
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

  public destroyGroup(group:string){
    let keys = [];
    // remove from array
    let deleteSpriteArray = this.resources.array.filter(( sprite ) => {
      return sprite.group === group;
    });
    for(let sprite of deleteSpriteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.resources.object[group];

    // save as new array
    this.resources.array = this.resources.array.filter(( sprite ) => {
      return sprite.group !== group;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.resources.object[key]
  }

  public getGroup(key:string){
    return this.resources.array.filter(( sprite ) => {
      return sprite.group === key;
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

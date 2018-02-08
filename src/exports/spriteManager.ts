declare var Phaser:any;

export class PHASER_SPRITE_MANAGER {
  game:any;
  sprites:any;

  constructor(){
    this.game = null;
    this.sprites = {
      array:[],
      object:{}
    }
  }

  public assign(construct:any){
    this.game = construct.game;
  }


  public addSprite(construct:any){

    let duplicateCheck = this.sprites.array.filter(( obj ) => {
      return obj.name === construct.name;
    });
    if(duplicateCheck.length === 0){
      let newSprite = this.game.add.sprite(construct.x, construct.y, construct.reference);
          // add custom properties
          newSprite.name = construct.name;
          newSprite.group = construct.group || null;
          newSprite.defaultPosition = {x: construct.x, y: construct.y}
          newSprite.setDefaultPositions = function(x,y){this.defaultPosition.x = x, this.defaultPosition.y = y};
          newSprite.getDefaultPositions = function(){return this.defaultPosition};
      this.sprites.array.push(newSprite)
      this.sprites.object[construct.name] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${construct.name}`)
    }
  }

  public destroy(key:string){
    let keys = [];
    // remove from array
    let deleteArray = this.sprites.array.filter(( sprite ) => {
      return sprite.name === name;
    });
    for(let obj of deleteArray){
      keys.push(obj.name)
      obj.destroy()
    }

    // remove from object
    delete this.sprites.object[key];

    // save as new array
    this.sprites.array = this.sprites.array.filter(( obj ) => {
      return obj.name !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroyGroup(key:string){
    let keys = [];
    // remove from array
    let deleteArray = this.sprites.array.filter(( obj ) => {
      return obj.group === key;
    });
    for(let sprite of deleteArray){
      keys.push(sprite.key)
      sprite.destroy()
    }

    // remove from object
    delete this.sprites.object[key];

    // save as new array
    this.sprites.array = this.sprites.array.filter(( obj ) => {
      return obj.group !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.sprites.object[key]
  }

  public getGroup(key:string){
    return this.sprites.array.filter(( obj ) => {
      return obj.group === key;
    });
  }


  public getAll(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.sprites.array;
    }
    if(type == 'OBJECT'){
      return this.sprites.object;
    }
    return {object: this.sprites.object, array: this.sprites.array};
  }


  public center(construct){
    if(this.sprites.object[construct.name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let sprite = this.sprites.object[construct.name];
    sprite.x = construct.x - (sprite.width/2);
    sprite.y = construct.y - (sprite.height/2);
    return sprite;
  }

}

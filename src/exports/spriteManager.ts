declare var Phaser:any;

export class PHASER_SPRITE_MANAGER {


  /* HOW TO USE */
  // 1.) Create a new instance of the PHASER_SPRITE_MANAGER in the init()
  //      --------------------------------------
  /*
       init(el:any, parent:any, options:any){
         const phaserSprites = new PHASER_SPRITE_MANAGER(),
               ...
       }
  */
  //      --------------------------------------
  // 2.) assign the game in the create()
  //      --------------------------------------
  /*
       function create(){
         ...
         phaserSprites.assign(game)  // must be called at the create() function to set everything up
         ...
       }
  */
  //      --------------------------------------

  // 3.) afterwhich, all public methods will be available:
  // AVAILABLE METHODS:
  /*
    phaserSprites.add({name: <string>, group: <string>(optional), reference: <string|object>, x: <number>, y: <number>})
    phaserSprites.destroy(name: <string>)
    phaserSprites.destroyGroup(name: <string>)
    phaserSprites.get(name: <string>)
    phaserSprites.getGroup(name: <string>)
    phaserSprites.getAll(type: <string | 'ARRAY', 'OBJECT', 'BOTH'(default)>(optional))
    phasersprites.centerWorld(name: <string>)
    phaserSprites.centerOnPoint(name:<string>, x: <number>, y:<number>)
  */
  //      --------------------------------------


  game:any;
  sprites:any;
  spriteCount:number;

  constructor(){
    this.game = null;
    this.sprites = {
      array:[],
      object:{}
    }
    this.spriteCount = 0;
  }

  public assign(game:any){
    this.game = game;
  }

  public add(params:any){

    let duplicateCheck = this.sprites.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){


      // create defaults if non exists
      params.x = params.x !== undefined ? params.x : 0;
      params.y = params.y !== undefined ? params.y : 0;
      params.group = params.group !== undefined ? params.group : null;
      params.visible = params.visible !== undefined ? params.visible : true;
      params.alpha = params.alpha !== undefined ? params.alpha : 1;
      params.width = params.width !== undefined ? params.width : null
      params.height = params.height !== undefined ? params.height : null

      let newSprite = this.game.add.sprite(params.x, params.y, params.reference);
          // add custom properties
          newSprite.name = params.name;
          newSprite.group = params.group;
          newSprite.defaultPosition = {x: params.x, y: params.y}
          newSprite.visible = params.visible
          newSprite.alpha = params.alpha
          if(params.width !== null){ newSprite.width = params.width}
          if(params.height !== null){ newSprite.height = params.height}
          newSprite.setDefaultPositions = function(x,y){this.defaultPosition.x = x, this.defaultPosition.y = y};
          newSprite.getDefaultPositions = function(){return this.defaultPosition};


          newSprite.init = function(){}
          newSprite.onUpdate = function(){}
          newSprite.reveal = function(){}
          newSprite.hide = function(){}

      this.sprites.array.push(newSprite)
      this.sprites.object[params.name] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public addFromAtlas(params:any){

    let duplicateCheck = this.sprites.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){

      // create defaults if non exists
      params.x = params.x !== undefined ? params.x : 0;
      params.y = params.y !== undefined ? params.y : 0;
      params.group = params.group !== undefined ? params.group : null;
      params.visible = params.visible !== undefined ? params.visible : true;
      params.alpha = params.alpha !== undefined ? params.alpha : 1;
      params.width = params.width !== undefined ? params.width : null
      params.height = params.height !== undefined ? params.height : null

      let newSprite = this.game.add.sprite(params.x, params.y, params.atlas, params.filename);
          // add custom properties
          newSprite.name = params.name;
          newSprite.group = params.group;
          newSprite.defaultPosition = {x: params.x, y: params.y}
          newSprite.visible = params.visible
          newSprite.alpha = params.alpha
          if(params.width !== null){ newSprite.width = params.width}
          if(params.height !== null){ newSprite.height = params.height}
          newSprite.setDefaultPositions = function(x,y){this.defaultPosition.x = x, this.defaultPosition.y = y};
          newSprite.getDefaultPositions = function(){return this.defaultPosition};

          newSprite.init = function(){}
          newSprite.onUpdate = function(){}
          newSprite.reveal = function(){}
          newSprite.hide = function(){}

      this.sprites.array.push(newSprite)
      this.sprites.object[params.name] = newSprite;

      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public addTilespriteFromAtlas(params:any){
    let duplicateCheck = this.sprites.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){

      // create defaults if non exists
      params.x = params.x !== undefined ? params.x : 0;
      params.y = params.y !== undefined ? params.y : 0;
      params.group = params.group !== undefined ? params.group : null;
      params.visible = params.visible !== undefined ? params.visible : true;
      params.alpha = params.alpha !== undefined ? params.alpha : 1;
      params.width = params.width !== undefined ? params.width : null
      params.height = params.height !== undefined ? params.height : null

      let newSprite = this.game.add.tileSprite(params.x, params.y, params.width, params.height, params.atlas, params.filename);
          // add custom properties
          newSprite.name = params.name;
          newSprite.group = params.group;
          newSprite.defaultPosition = {x: params.x, y: params.y}
          newSprite.visible = params.visible
          newSprite.alpha = params.alpha
          if(params.width !== null){ newSprite.width = params.width}
          if(params.height !== null){ newSprite.height = params.height}
          newSprite.setDefaultPositions = function(x,y){this.defaultPosition.x = x, this.defaultPosition.y = y};
          newSprite.getDefaultPositions = function(){return this.defaultPosition};

          newSprite.init = function(){}
          newSprite.onUpdate = function(){}
          newSprite.reveal = function(){}
          newSprite.hide = function(){}

      this.sprites.array.push(newSprite)
      this.sprites.object[params.name] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public addEmptySprite(params:any){

    let duplicateCheck = this.sprites.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){


      // create defaults if non exists
      params.x = params.x !== undefined ? params.x : 0;
      params.y = params.y !== undefined ? params.y : 0;
      params.group = params.group !== undefined ? params.group : null;
      params.visible = params.visible !== undefined ? params.visible : true;
      params.alpha = params.alpha !== undefined ? params.alpha : 1;
      params.width = params.width !== undefined ? params.width : null
      params.height = params.height !== undefined ? params.height : null

      let newSprite = this.game.add.sprite(params.x, params.y);
          // add custom properties
          newSprite.name = params.name;
          newSprite.group = params.group;
          newSprite.defaultPosition = {x: params.x, y: params.y}
          newSprite.visible = params.visible
          newSprite.alpha = params.alpha
          if(params.width !== null){ newSprite.width = params.width}
          if(params.height !== null){ newSprite.height = params.height}
          newSprite.setDefaultPositions = function(x,y){this.defaultPosition.x = x, this.defaultPosition.y = y};
          newSprite.getDefaultPositions = function(){return this.defaultPosition};

          newSprite.init = function(){}
          newSprite.onUpdate = function(){}
          newSprite.reveal = function(){}
          newSprite.hide = function(){}

      this.sprites.array.push(newSprite)
      this.sprites.object[params.name] = newSprite;
      return newSprite;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public addBasicMaskToSprite(sprite:any){
    let mask = this.game.add.graphics(0, 0);
        mask.beginFill(0xffffff);
        mask.drawRect(sprite.x, sprite.y, sprite.width, sprite.height);
    sprite.mask = mask;
    return mask;
  }

  public destroy(name:string){
    if(this.sprites.object[name] !== undefined){
      let destroyed = [];
      // remove from array
      let deleteArray = this.sprites.array.filter(( obj ) => {
        return obj.name === name;
      });

      for(let obj of deleteArray){
        destroyed.push(obj.name)
        obj.destroy()
      }

      // remove from object
      delete this.sprites.object[name];

      // save as new array
      this.sprites.array = this.sprites.array.filter(( obj ) => {
        return obj.name !== name;
      });

      // returns a list of destroyed sprites
      return destroyed;
    } else{
      console.log(`Cannot delete ${name} because it does not exist.`)
      return null
    }
  }

  public destroyGroup(name:string){
    let destroyed = [];
    // remove from array
    let deleteArray = this.sprites.array.filter(( obj ) => {
      return obj.group === name;
    });
    for(let sprite of deleteArray){
      destroyed.push(sprite.name)
      sprite.destroy()
    }

    // remove from object
    delete this.sprites.object[name];

    // save as new array
    this.sprites.array = this.sprites.array.filter(( obj ) => {
      return obj.group !== name;
    });

    // returns a list of destroyed sprites
    return destroyed;
  }

  public get(name:string){
    return this.sprites.object[name]
  }

  public getGroup(name:string){
    return this.sprites.array.filter(( obj ) => {
      return obj.group === name;
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

  public count(){
    this.spriteCount++;
    return {total: this.sprites.array.length, unique: this.spriteCount};
  }

  public centerWorld(name:string){
    if(this.sprites.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let obj = this.sprites.object[name];
    obj.alignIn(this.game.world.bounds, Phaser.CENTER);
    return obj;
  }

  public centerOnPoint(name:string, x:number, y:number){
    if(this.sprites.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let obj = this.sprites.object[name];
    obj.x = x - (obj.width/2);
    obj.y = y - (obj.height/2);
    return obj;
  }

}

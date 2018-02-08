declare var Phaser:any;

export class PHASER_BITMAPDATA_MANAGER {
  game:any;
  bmd:any;

  constructor(){
    this.game = null;
    this.bmd = {
      array:[],
      object:{}
    }

    this.bmd = {
      array:[],
      object:{}
    }
  }

  public assign(construct:any){
    this.game = construct.game;
  }

  public addGradient(construct:any){
    let duplicateCheck = this.bmd.array.filter(( obj ) => {
      return obj.key === construct.key;
    });
    if(duplicateCheck.length === 0){
      let tempBmd = this.game.make.bitmapData(construct.width, construct.height);
      let grd = tempBmd.context.createLinearGradient(0, 0, 0, construct.height);
          grd.addColorStop(0, construct.start);
          grd.addColorStop(1, construct.end);

      tempBmd.context.fillStyle = grd;
      tempBmd.context.fillRect(0, 0, construct.width, construct.height);

      let cacheRef = this.game.cache.addBitmapData(construct.name, tempBmd);

      let newBmd = this.game.make.bitmapData();
          newBmd.load(this.game.cache.getBitmapData(construct.name));
          if(construct.render){newBmd.addToWorld(construct.x, construct.y)}
          newBmd.name = construct.name
          newBmd.group = construct.group
          newBmd.cacheBitmapData = cacheRef;

      this.bmd.array.push(newBmd)
      this.bmd.object[construct.name] = newBmd;
      return newBmd;
    }
    else{
      console.log(`Duplicate key name not allowed: ${construct.name}`)
    }
  }

  public addImage(construct:any){

    let duplicateCheck = this.bmd.array.filter(( obj ) => {
      return obj.key === construct.key;
    });
    if(duplicateCheck.length === 0){
      let newBmd = this.game.make.bitmapData();
          newBmd.load(construct.reference);

          if(construct.render){newBmd.addToWorld(construct.x, construct.y)}
          newBmd.name = construct.name
          newBmd.group = construct.group
          newBmd.cacheBitmapData = construct.reference;

      this.bmd.array.push(newBmd)
      this.bmd.object[construct.name] = newBmd;
      return newBmd;
    }
    else{
      console.log(`Duplicate key name not allowed: ${construct.name}`)
    }
  }

  public destroy(key:string){
    let keys = [];
    // remove from array
    let destroyArray = this.bmd.array.filter(( obj ) => {
      return obj.key === key;
    });
    for(let obj of destroyArray){
      keys.push(obj.key)
      obj.destroy()
    }

    // remove from object
    delete this.bmd.object[key];

    // save as new array
    this.bmd.array = this.bmd.array.filter(( sprite ) => {
      return sprite.key !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public destroyGroup(key:string){
    let keys = [];
    // remove from array
    let destroyArray = this.bmd.array.filter(( obj ) => {
      return obj.group === key;
    });
    for(let obj of destroyArray){
      keys.push(obj.key)
      obj.destroy()
    }

    // remove from object
    delete this.bmd.object[key];

    // save as new array
    this.bmd.array = this.bmd.array.filter(( sprite ) => {
      return sprite.group !== key;
    });

    // returns a list of destroyed sprites
    return keys;
  }

  public get(key:string){
    return this.bmd.object[key]
  }

  public getGroup(key:string){
    return this.bmd.array.filter(( obj ) => {
      return obj.group === key;
    });
  }


  public getAll(type:string = 'BOTH'){
    if(type === 'ARRAY'){
      return this.bmd.array;
    }
    if(type == 'OBJECT'){
      return this.bmd.object;
    }
    return {object: this.bmd.object, array: this.bmd.array};
  }


  public center(construct){
    if(this.bmd.object[construct.name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let obj = this.bmd.object[construct.name];
    obj.x = construct.x - (obj.width/2);
    obj.y = construct.y - (obj.height/2);
    return obj;
  }

}

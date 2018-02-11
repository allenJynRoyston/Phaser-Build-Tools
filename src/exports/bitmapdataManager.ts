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
  }

  public assign(game:any){
    this.game = game;
  }

  public addGradient(params:any){
    let duplicateCheck = this.bmd.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){
      let tempBmd = this.game.make.bitmapData(params.width, params.height);
      let grd = tempBmd.context.createLinearGradient(0, 0, 0, params.height);
          grd.addColorStop(0, params.start);
          grd.addColorStop(1, params.end);

      tempBmd.context.fillStyle = grd;
      tempBmd.context.fillRect(0, 0, params.width, params.height);

      let cacheRef = this.game.cache.addBitmapData(params.name, tempBmd);

      let newBmd = this.game.make.bitmapData();
          newBmd.load(this.game.cache.getBitmapData(params.name));
          if(params.render){newBmd.addToWorld(params.x, params.y)}
          newBmd.name = params.name
          newBmd.group = params.group
          newBmd.cacheBitmapData = cacheRef;

      this.bmd.array.push(newBmd)
      this.bmd.object[params.name] = newBmd;
      return newBmd;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public addImage(params:any){

    let duplicateCheck = this.bmd.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){
      let newBmd = this.game.make.bitmapData();
          newBmd.load(params.reference);
          newBmd.addToWorld(params.x, params.y)

          if(!params.render){newBmd.cls()}
          newBmd.name = params.name
          newBmd.group = params.group
          newBmd.cacheBitmapData = params.reference;

      this.bmd.array.push(newBmd)
      this.bmd.object[params.name] = newBmd;
      return newBmd;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }


  public addEmpty(params:any){

    let duplicateCheck = this.bmd.array.filter(( obj ) => {
      return obj.name === params.name;
    });
    if(duplicateCheck.length === 0){
      let newBmd = this.game.make.bitmapData(params.width, params.height);
          newBmd.addToWorld(params.x, params.y)
          if(!params.render){newBmd.cls()}
          newBmd.name = params.name
          newBmd.group = params.group

      this.bmd.array.push(newBmd)
      this.bmd.object[params.name] = newBmd;
      return newBmd;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public destroy(name:string){
    let deleted = [];
    // remove from array
    let destroyArray = this.bmd.array.filter(( obj ) => {
      return obj.key === name;
    });
    for(let obj of destroyArray){
      deleted.push(obj.name)
      obj.destroy()
    }

    // remove from object
    delete this.bmd.object[name];

    // save as new array
    this.bmd.array = this.bmd.array.filter(( sprite ) => {
      return sprite.key !== name;
    });

    // returns a list of destroyed sprites
    return deleted;
  }

  public destroyGroup(key:string){
    let deleted = [];
    // remove from array
    let destroyArray = this.bmd.array.filter(( obj ) => {
      return obj.group === name;
    });
    for(let obj of destroyArray){
      deleted.push(obj.name)
      obj.destroy()
    }

    // remove from object
    delete this.bmd.object[name];

    // save as new array
    this.bmd.array = this.bmd.array.filter(( sprite ) => {
      return sprite.group !== name;
    });

    // returns a list of destroyed sprites
    return deleted;
  }

  public get(name:string){
    return this.bmd.object[name]
  }

  public getGroup(name:string){
    return this.bmd.array.filter(( obj ) => {
      return obj.group === name;
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


}

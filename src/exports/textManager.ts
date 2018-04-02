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

  public assign(game:any){
    this.game = game;
  }

  public add(params:any){
    let duplicateCheck = this.texts.array.filter(( obj ) => {
      return obj.name === params.name;
    });

    // create defaults if non exists
    params.x = params.x !== undefined ? params.x : 0;
    params.y = params.y !== undefined ? params.y : 0;
    params.group = params.group !== undefined ? params.group : null;
    params.size = params.size !== undefined ? params.size : 12;
    params.default = params.default !== undefined ? params.default : ''
    params.visible = params.visible !== undefined ? params.visible : true
    params.alpha = params.alpha !== undefined ? params.alpha : 1;

    if(duplicateCheck.length === 0){
      let newText = this.game.add.bitmapText(params.x, params.y, params.font, params.default, params.size);
          newText.name = params.name;
          newText.group = params.group;
          newText.visible = params.visible;
          newText.alpha = params.alpha;

          newText.init = function(){}
          newText.show = function(){
            this.visible = true
          }
          newText.hide = function(){
            this.visible = false
          }

      this.texts.array.push(newText)
      this.texts.object[params.name] = newText;
      return newText;
    }
    else{
      console.log(`Duplicate key name not allowed: ${params.name}`)
    }
  }

  public destroy(name:string){
    let destroyArray = [];
    // remove from array
    let deleteArray = this.texts.array.filter(( obj ) => {
      return obj.name === name;
    });

    for(let text of deleteArray){
      destroyArray.push(text.name)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[name];

    // save as new array
    this.texts.array = this.texts.array.filter(( obj ) => {
      return obj.name !== name;
    });

    // returns a list of destroyed sprites
    return destroyArray;
  }

  public destroyGroup(name:string){
    let destroyArray = [];
    // remove from array
    let deletearray = this.texts.array.filter(( obj ) => {
      return obj.group === name;
    });
    for(let text of deletearray){
      destroyArray.push(text.key)
      text.destroy()
    }

    // remove from object
    delete this.texts.object[name];

    // save as new array
    this.texts.array = this.texts.array.filter(( obj ) => {
      return obj.group !== name;
    });

    // returns a list of destroyed sprites
    return destroyArray;
  }

  public get(key:string){
    return this.texts.object[key]
  }

  public getGroup(key:string){
    return this.texts.array.filter(( obj ) => {
      return obj.group === key;
    });
  }

  public getManyGroups(names:Array<string>){
    let _return = [];

    for(let i = 0; i < names.length; i++){
      let _r = this.texts.array.filter(( obj ) => {
        return obj.group === names[i];
      });
      _return = [..._return, ..._r]
    }

    return _return;
  }

  public getAll(type:string = 'OBJECT'){
    if(type === 'ARRAY'){
      return this.texts.array;
    }
    if(type == 'OBJECT'){
      return this.texts.object;
    }
    return {object: this.texts.object, array: this.texts.array};
  }

  public getOnly(names:Array<string>){
    let _return = {};

    for(let i = 0; i < names.length; i++){
      let _r = this.texts.array.filter(( obj ) => {
        return obj.group === names[i] || obj.name === names[i];
      });

      _r.map(obj => {
          _return[obj.name] = obj
      })
    }

    return (_return as any);
  }

  public alignToBottomLeftCorner(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;
    text.x = padding;
    text.y = game.canvas.height - text.height - padding;
    return text;
  }

  public alignToBottomCenter(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;
    text.x = (game.canvas.width/2) - (text.width/2);
    text.y = game.canvas.height - text.height - padding;
    return text;
  }

  public alignToBottomRightCorner(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = game.canvas.width - text.width - padding;
    text.y = game.canvas.height - text.height - padding;
    return text;
  }

  public alignToCenterRight(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = game.canvas.width - text.width - padding;
    text.y = (game.canvas.height/2) - (text.height/2);
    return text;
  }

  public alignToTopRightCorner(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = game.canvas.width - text.width - padding;
    text.y = padding;
    return text;
  }

  public alignToTopCenter(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = (game.canvas.width/2) - (text.width/2) - padding;
    text.y = padding;
    return text;
  }


  public alignToTopLeftCorner(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = padding
    text.y = padding;
    return text;
  }


  public alignToCenterLeft(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x = padding
    text.y = (game.canvas.height/2) - (text.height/2);
    return text;
  }

  public alignToCenter(name: string, padding:number = 0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

    text.x =(game.canvas.width/2) - (text.width/2);
    text.y = (game.canvas.height/2) - (text.height/2);
    return text;
  }


  public center(name:string, offsetx:number =0, offsety:number=0){
    if(this.texts.object[name] === undefined){
      console.log('Error centering sprite:  key does not exists.')
      return null;
    }
    let text = this.texts.object[name],
        game = this.game;

        text.x =(game.canvas.width/2) - (text.width/2) + offsetx;
        text.y = (game.canvas.height/2) - (text.height/2) + offsety;
    return text;
  }
}

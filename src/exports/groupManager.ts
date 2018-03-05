declare var Phaser:any;

export class PHASER_GROUP_MANAGER {
  game:any;
  group:any;

  constructor(){
    this.game = null;
    this.group = {
      array:[],
      object:{}
    }
  }

  public assign(game:any, layers:number = 10){
    this.game = game;
    for(let i = 0; i <= layers; i++){
      let layer = game.add.group();
      this.group.object[`${i}`] = layer
      this.group.array.push(layer)
    }
  }

  public layer(key:number){
    return this.group.object[key]
  }

  public add(key:number, item:any){
    this.group.object[key].add(item)
  }

  public addMany(key:number, list:Array<string>){
    list.forEach((item) => {
        this.group.object[key].add(item)
    })
  }


}

declare var Phaser:any;

export class PHASER_MASTER {
  _game:any;
  resolution:any;
  states:any;
  currentState:string;
  inputDelay:any;
  variables:any;

  constructor(params:any){
    this._game = params.game;

    this.resolution = params.resolution;
    // default gameStates
    this.states = {
        BOOT: 'BOOT',
        PRELOAD: 'PRELOAD',
        READY: 'READY',
    }
    this.currentState = this.states[0];
    this.variables = {}
  }

  public let(key:string, value:any = null){
    if( (this.variables[key] === undefined)  ){
      return this.variables[key] = value
    }
    else{
      console.log(`Cannot LET duplicate key in PHASER_MASTER: ${key}`)
    }
  }

  public forceLet(key:string, value:any = null){
    return this.variables[key] = value
  }

  public delete(key:string){
    delete this.variables[key];
  }

  public get(key:string){
    if(this.variables[key] !== undefined){
      return this.variables[key]
    }
    else{
      console.log("Cannot GET a variable that does not exist in PHASER_MASTER.")
      return null
    }
  }

  public getAll(){
    return this.variables
  }

  public changeState(state:string = null){
    let _state = state.toUpperCase();
    let create = false;
    if(this.states[_state] === undefined){
      this.states[_state] = _state;
      create = true;
    }
    this.currentState = _state;
    return {created: create, state: this.currentState};
  }

  public getCurrentState(){
    return this.currentState;
  }

  public getStates(){
    return this.states;
  }

  public getResolution(){
    return this.resolution;
  }

  public checkState(state:string){
    return this.currentState === state.toUpperCase() ? true : false;
  }

  public game(){
    return this._game;
  }

}

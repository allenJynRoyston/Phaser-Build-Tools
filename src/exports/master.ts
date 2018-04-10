declare var Phaser:any;

export class PHASER_MASTER {
  _game:any;
  resolution:any;
  states:any;
  currentState:string;
  inputDelay:any;
  variables:any;
  element:any;

  constructor(params:any){
    this._game = params.game;

    this.element = params.element;

    this.resolution = params.resolution;
    // default gameStates
    this.states = {
        BOOT: 'BOOT',
        PRELOAD: 'PRELOAD',
        READY: 'READY',
    }
    this.currentState = this.states[0];
    this.variables = {}

    setTimeout(() => {
      this._game.time.pausedTimeTotal = 0
      this._game.time.addToPausedTime = (duration:number) => {
        this._game.time.pausedTimeTotal += duration;
      }
      this._game.time.returnTrueTime = () => {
        return (this._game.time.now - this._game.time.pausedTimeTotal)
      }
    }, 1)
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

  public getOnly(names:Array<string>){
    let _return = {};

    let toArray = []
    for (let key in this.variables) {
        toArray.push({key: key, data: this.variables[key]})
    }

    for(let i = 0; i < names.length; i++){
      let _r = toArray.filter(( obj ) => {
        return obj.key === names[i];
      });

      _r.map(obj => {
          _return[obj.key] = obj.data
      })
    }

    return (_return as any);
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

  public getElement(){
    return this.element
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

  public getState(){
    let _return = {currentState: this.currentState}
    return _return
  }

  public game(){
    return this._game;
  }

}

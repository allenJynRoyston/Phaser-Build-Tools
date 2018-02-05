declare var Phaser:any;

export class PHASER_MASTER {
  _game:any;
  resolution:any;
  states:any;
  currentState:string;
  inputDelay:any;

  constructor(construct:any){
    this._game = construct.game;

    this.resolution = construct.resolution;
    // default gameStates
    this.states = {
        BOOT: 'BOOT',
        PRELOAD: 'PRELOAD',
        READY: 'READY',
    }
    this.currentState = this.states[0];
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

  public getStates(){
    return this.states;
  }

  public getResolution(){
    return this.resolution;
  }

  public setState(state:string){
    this.currentState = state.toUpperCase();
  }

  public checkState(state:string){
    return this.currentState === state.toUpperCase() ? true : false;
  }

  public game(){
    return this._game;
  }

}

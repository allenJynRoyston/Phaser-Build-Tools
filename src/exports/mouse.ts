declare var Phaser:any;

export class PHASER_MOUSE {

  game:any;
  metrics:any;
  clickSensitvity:any;
  properties:any;
  mouseMap:any;
  mouseMapping:any;
  inputDelay:any;
  debugger:any;

  constructor(construct){
      this.game = null;
      this.clickSensitvity = {QUICK: 1, SHORT: 50, LONG: 150, SUPERLONG: 300}
      this.mouseMapping = [0, 1, 2]
      this.mouseMap = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2
      }
      this.metrics = {
        sensitivityPress: {},
        sensitivityBuffer: {},
        location:{},
        state: {}
      }
      this.properties = {
        allowDebugger: true,
        timingRefreshRate: 1
      }

      this.inputDelay = {
        delay: Array.apply(null, Array(2)).map(function() { return 0 })
      }

      this.debugger = {
        enabled: construct.showDebugger || true,
        text: {},
        pointer: null
      }
  }

  public assign(construct:any){
    this.game = construct.game;

    // 0,1,2 is for left, middle, right mouse buttons
    for (let key of this.mouseMapping) {
      this.metrics.sensitivityPress[key] = null; // stores the setInterval function
      this.metrics.sensitivityBuffer[key] = 0;   // value
      this.metrics.location[key] = {x: null, y:null};
      this.metrics.state[key] = () => {
        return this.getBtnPressType(this.metrics.sensitivityBuffer[key])
      }
    }

    // on button down
    this.game.input.onDown.add((e) => {
        let mouseKey = this.checkMouseClick();
        clearInterval(this.metrics.sensitivityPress[mouseKey]);
        this.metrics.sensitivityPress[mouseKey] = setInterval(() => {
          this.metrics.sensitivityBuffer[mouseKey] += 1
          this.metrics.location[mouseKey] = {x: e.x, y: e.y}
        }, this.properties.timingRefreshRate)
    })

    // on button release
    this.game.input.onUp.add((e) => {
        let mouseKey = this.checkMouseClick();
        this.clearAllControlIntervals();  // only mouse button is detected anyway
        this.metrics.sensitivityBuffer[mouseKey] = 0
    })

    // setup debugger and disabled states
    let style = { font: "12px Courier New", fill: "#fff", align: "left" }
    this.mouseMapping.forEach((btn, index) => {
      this.debugger.text[btn] = null; // must be null first since the property name doesn't exists yet
      this.debugger.text[btn] = this.game.add.text(5, this.game.height - 35 - (index * 15), "", style); // then add initial text
    })
    this.debugger.pointer = this.game.add.text(5, this.game.height - 20, "", style); // then add initial text

  }

  private checkMouseClick(){
    let mouseKey = 0;
    if(this.game.input.activePointer.leftButton.isDown){
      mouseKey = 0;
    }
    if(this.game.input.activePointer.middleButton.isDown){
      mouseKey = 1;
    }
    if(this.game.input.activePointer.rightButton.isDown){
      mouseKey = 2;
    }
    return mouseKey;
  }

  private debuggerString(mouseKey:string){
    return `Button_${mouseKey} | {x: ${this.metrics.location[mouseKey].x}, y: ${this.metrics.location[mouseKey].y}} | active: ${this.metrics.sensitivityBuffer[mouseKey] > 0 ? true: false} | state: ${this.metrics.state[mouseKey]().state} | duration: ${this.metrics.state[mouseKey]().val} | type: ${this.metrics.state[mouseKey]().type}`
  }

  public setDebugger(state:boolean = true){
    this.debugger.enabled = state;
  }

  public updateDebugger(){
    for (let btn of this.mouseMapping) {
      this.debugger.text[btn].setText(this.debugger.enabled ? this.debuggerString(btn) : '').bringToTop()
    }
    this.debugger.pointer.setText(this.debugger.enabled ? `Pointer: {x: ${this.game.input.mousePointer.x}, y: ${this.game.input.mousePointer.y}}` : '').bringToTop();
  }

  public clearAllControlIntervals(){
    for (let key of this.mouseMapping) {
      this.metrics.sensitivityBuffer[key] = 0;
      clearInterval(this.metrics.sensitivityPress[key]);
    }
  }

  public checkWithDelay(params:any){

    if(this.read(params.key).active === params.isActive){
      let mouseKey = this.mouseMap[params.key.toUpperCase()]
      if(this.game.time.now > this.inputDelay.delay[mouseKey]){
        this.inputDelay.delay[mouseKey] = params.delay + this.game.time.now;
        return true;
      }
      else{
        return false;
      }
    }
    return false;
  }

  public read(key:string = 'LEFT'){
    let mouseKey = this.mouseMap[key.toUpperCase()]
    return {
      id: mouseKey,
      x: this.metrics.location[mouseKey].x,
      y: this.metrics.location[mouseKey].y,
      active: this.metrics.sensitivityBuffer[mouseKey] > 0 ? true: false,
      duration: this.metrics.sensitivityBuffer[mouseKey],
      state: this.metrics.state[mouseKey]().state,
      type: this.metrics.state[mouseKey]().type
    }
  }

  private getBtnPressType(val:number){
    let _type = 'NONE', _state = 0, state = 0;
    Object.keys(this.clickSensitvity).forEach((key) => {
      state++;
      if(val > this.clickSensitvity[key]){
        _type = key;
        _state = state;
      }
    });
    return {val: val, type: _type, state: _state}
  }

}

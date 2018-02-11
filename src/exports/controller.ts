declare var Phaser:any;

export class PHASER_CONTROLS {

  /* HOW TO USE */
  // 1.) In your games init(), after game is declared, insert the following code:
  //      --------------------------------------
  /*
       init(el:any, parent:any, options:any){
         const game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update});
         const phaserControls = new IO_CONTROLS();
         let IO:any;
         ...
       }
  */
  //      --------------------------------------
  // 2.) in the create(), place this line of code:
  //      --------------------------------------
  /*
       function create(){
         phaserControls.assign(game)  // must be called at the create() function to set everything up
         ...
       }
  */
  //      --------------------------------------

  // 2.) anywhere after create(), all the public methods will be available
  //      --------------------------------------
  //      phaserControls.isReady()                            | returns boolean   | returns a [true/false] if all the controls have been mapped and the class is ready
  //      phaserControls.isDebuggerEnabled()                  | returns boolean   | retuns if a [true/false] based off if the debugger is visible
  //      phaserControls.updateDebugger()                     |                   | if the debugger is visible, will update the values.  Best to place in the update() function
  //      phaserControls.disableAllInput()                    |                   | will disable all controller inputs
  //      phaserControls.enableAllInput()                     |                   | will enable all controller inputs
  //      phaserControls.disableAllDirectionalButtons()       |                   | will enable all directional inputs (UP/DOWN/LEFT/RIGHT)
  //      phaserControls.disableAllTriggerButtons()           |                   | will enable all trigger inputs (L1/R1/L2/R2)
  //      phaserControls.enableAllTriggerButtons()            |                   | will enable all trigger inputs (L1/R1/L2/R2)
  //      phaserControls.disableAllActionButtons()            |                   | will enable all trigger inputs (A/B/X/Y)
  //      phaserControls.enableAllActionButtons()             |                   | will enable all trigger inputs (A/B/X/Y)
  //      phaserControls.disableAllSystemButtons()            |                   | will enable all trigger inputs (START/BACK)
  //      phaserControls.enableAllSystemButtons()             |                   | will enable all trigger inputs (START/BACK)
  //      phaserControls.setDisableKeyProperty('A', true)     |                   | pass the button name ['UP/B/L1/START'] and the boolean value [true/false] to enable/disable the button)
  //      phaserControls.getKeyDisabledValue('A')             | return boolean    | pass the button name ['UP/B/L1/START'] and it will return the value
  //      phaserControls.clearAllControlIntervals()           |                   | clear all setInterval timers involved with controls.  Useful in cases where a key is disabled programatically
  //      phaserControls.read('A')                            | return object     | returns the current state of the button: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}
  //      phaserControls.readMulti(['A', 'X'], 'OBJECT')      | return object     | returns as an object with multiple button states:
  //      phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 10})
  //                                                          | return boolean    | returns a true if the button is active/inactive every X miliseconds.  (See example below)
  /*
          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 250})){
            /* DO SOMETHING EVERY 250 miliseconds
          }
  */
  //
  //      phaserControls.getKeyId('A')                        | return number     | return a number with the key id (1-16)
  //                                                                              {X: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}, A: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}}
  //      phaserControls.readMulti(['A', 'X'], 'ARRAY')       | return array      | returns an an array with multiple button states:
  //                                                                              [{key: 'X', active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}, {key: 'A', active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}]
  //      phaserControls.mapKeys(keyMappings)                 |                   | see example below
  /*
          let keyMappings = {
              UP: {name: 'UP', code: 'ArrowUp'},
              DOWN: {name: 'DOWN', code: 'ArrowDown'},
              LEFT: {name: 'LEFT', code: 'ArrowLeft'},
              RIGHT: {name: 'RIGHT', code: 'ArrowRight'},
              A: {name: 'T', code: 'KeyT'},
              B: {name: 'S', code: 'KeyS'},
              X: {name: 'D', code: 'KeyD'},
              Y: {name: 'F', code: 'KeyF'},
              L1: {name: 'Q', code: 'KeyQ'},
              L2: {name: 'W', code: 'KeyW'},
              R1: {name: 'E', code: 'KeyE'},
              R2: {name: 'R', code: 'KeyR'},
              L3:{name: 'O', code: 'KeyO'},
              R3:{name: 'P', code: 'KeyP'},
              START: {name: 'ENTER', code: 'Enter'},
              BACK: {name: 'BACKSPACE', code: 'Backspace'}
            }
          phaserControls.mapKeys(keyMappings)
  */
  //      --------------------------------------




  // ***** GETTING FEEDBACK: ************
  // In your update() loop
  //
  /*
      function update() {

          // READ ONE KEY
          let theOutput = phaserControls.read('A');
          console.log(theOutput)

          // READ MANY KEYS
          let theOutput = phaserControls.readMulti(['A', 'UP'])
          console.log(theOutput)


          ...
      }
  */

  // ***** DEBUGGER ************
  //
  // Pressing the [`] (Backquote) key will activate the debugger
  //

  IO:any;
  game:any;
  buttonSensitivity:any;
  buttonMap:any;
  properties:any;
  directionalButtons:any;
  actionButtons:any;
  triggerButtons:any;
  systemButtons:any;
  buttonArray:any;
  buttonMapId:any;
  debugger:any;
  disabledButtons:any;
  inputDelay:any;

  constructor(){
    this.IO = null;
    this.game = null;

    /* BUTTON SENSITIVTY can be changed to whatever you want */
    this.buttonSensitivity = {QUICK: 1, SHORT: 50, LONG: 150, SUPERLONG: 300}

    /* CLASS PROPERTIES */
    this.properties = {
      isReady: false,
      allowDebugger: true,
      buttonDelay: 50,
      timingRefreshRate: 1  // 0 is the most accurate but resource intensive, 10 is less accurate but less resource intensive
    }

    /* MUST MATCH this.buttonMap */
    this.directionalButtons = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    this.actionButtons = ['A', 'B', 'X', 'Y']
    this.triggerButtons = ['L1', 'L2', 'R1', 'R2', 'L3', 'R3']
    this.systemButtons = ['START', 'BACK']
    this.buttonArray = [...this.directionalButtons, ...this.actionButtons, ...this.triggerButtons, ...this.systemButtons]

    this.buttonMap = {
      UP: {name: 'UP', code: 'ArrowUp'},
      DOWN: {name: 'DOWN', code: 'ArrowDown'},
      LEFT: {name: 'LEFT', code: 'ArrowLeft'},
      RIGHT: {name: 'RIGHT', code: 'ArrowRight'},
      A: {name: 'A', code: 'KeyA'},
      B: {name: 'S', code: 'KeyS'},
      X: {name: 'D', code: 'KeyD'},
      Y: {name: 'F', code: 'KeyF'},
      L1: {name: 'Q', code: 'KeyQ'},
      L2: {name: 'W', code: 'KeyW'},
      R1: {name: 'E', code: 'KeyE'},
      R2: {name: 'R', code: 'KeyR'},
      L3:{name: 'O', code: 'KeyO'},
      R3:{name: 'P', code: 'KeyP'},
      START: {name: 'ENTER', code: 'Enter'},
      BACK: {name: 'BACKSPACE', code: 'Backspace'},
    }

    this.buttonMapId = {
      UP: 1,
      DOWN: 2,
      LEFT: 3,
      RIGHT: 4,
      A: 5,
      B: 6,
      X: 7,
      Y: 8,
      L1: 9,
      L2: 10,
      R1: 11,
      R2: 12,
      L3: 13,
      R3: 14,
      START: 15,
      BACK: 16,
    }

    this.disabledButtons = {
      ALL: false,
      DIRECTIONAL: false,
      TRIGGER: false,
      ACTION: false,
      SYSTEM: false
      /* LEFT, RIGHT, UP, DOWN, A, B, X, Y, L1, L2, R1, R2, START and BACK added dynamically */
    }

    this.debugger = {
      enabled: false,
      text: {}
    }

    // set default input properties
    this.inputDelay = {
      delay: Array.apply(null, Array(20)).map(function() { return 0 })
    }

  }

  public assign(game:any){
    // stored for future reference
    this.game = game;

    // setup debugger and disabled states
    let style = { font: "12px Courier New", fill: "#fff", align: "left" }
    this.buttonArray.forEach((btn, index) => {
      this.debugger.text[btn] = null; // must be null first since the property name doesn't exists yet
      this.debugger.text[btn] = game.add.text(10, 10 + (index * 15), "", style); // then add initial text
      this.disabledButtons[btn] = false; // set disabled as false
    })

    // setup INPUT/OUTPUT
    const IO = {
      buttons:{},
      sensitivityPress:{},
      sensitivityBuffer:{},
      state: {}
    }

    // set default values for IO object
    for (let btn of this.buttonArray) {
      IO.buttons[btn] = game.input.keyboard.addKey(Phaser.Keyboard[this.buttonMap[btn].name]);
      IO.sensitivityPress[btn] = null; // stores the setInterval function
      IO.sensitivityBuffer[btn] = 0;   // value
      IO.state[btn] = () => {
        return this.getBtnPressType(this.IO.sensitivityBuffer[btn])
      }

    }

    // add button down behavior
    for (let btn of this.buttonArray) {
      IO.buttons[btn].onDown.add((e) => {
        // clear any intervals
        clearInterval(IO.sensitivityPress[btn]);
        // get type of button pressed
        let btnType, btnName;
        let buttonTypes = ['DIRECTIONAL', 'ACTION', 'TRIGGER', 'SYSTEM']
        Object.keys(this.buttonMap).forEach((key, value) => {
          if( this.buttonMap[key].code === e.event.code){
            for(let _type of buttonTypes){
              if(this[`${_type.toLowerCase()}Buttons`].indexOf(key) +1){
                btnType = _type;
                btnName = key;
              }
            }
          }
        });

        // check against disabled rules
        let isDisabled = false;
        if(this.disabledButtons.ALL){
          isDisabled = true;
        }

        // check for disable catagories
        for(let name of buttonTypes){
          if(this.disabledButtons[name] && btnType === name){
            isDisabled = true;
          }
        }

        // check to see if individual keypress is disabled
        Object.keys(this.buttonMap).forEach((key, value) => {
          if(this.disabledButtons[key] && btnName === key){
            isDisabled = true;
          }
        })

        // set new intervals
        if(!isDisabled){
          IO.sensitivityPress[btn] = setInterval(() => {
            IO.sensitivityBuffer[btn] += 1
          }, this.properties.timingRefreshRate)
        }
      }, this);
    }

    // add button release behavior
    game.input.keyboard.onUpCallback = (e) => {
        for (let btn of this.buttonArray) {
          if(e.code === this.buttonMap[btn].code){
              // clear intervals
              clearInterval(IO.sensitivityPress[btn]);
              // reset value
              IO.sensitivityBuffer[btn] = 0;
          }
        }
        // show/hide debugger (mapped to backdash key by default)
        if(e.code === 'Backquote' && this.properties.allowDebugger) {
          this.setDebugger(!this.debugger.enabled);
          this.updateDebugger();
        }
    }
    this.properties.isReady = true;
    this.IO = IO;
    return IO;
  }

  public mapKeys(map:any){
    this.properties.isReady = false
    this.destroyAll();

    setTimeout(() => {
      this.buttonMap = map
      this.properties.isReady = true;
      this.assign(this.game);
    }, 1)
  }

  public isReady(){
    return this.properties.isReady;
  }

  public checkWithDelay(params){
    if(this.read(params.key).active === params.isActive){
      if(this.game.time.now > this.inputDelay.delay[this.getKeyId(params.key)]){
        this.inputDelay.delay[this.getKeyId(params.key)] = params.delay + this.game.time.now;
        return true;
      }
      else{
        return false;
      }
    }
    return false;
  }

  public isDebuggerEnabled(){
    return this.debugger.enabled;
  }

  public setDebugger(state:boolean = true){
    this.debugger.enabled = state;
  }

  public updateDebugger(){
    if(this.properties.isReady){
      for (let btn of this.buttonArray) {
        this.debugger.text[btn].setText(this.debugger.enabled ? this.debuggerString(btn) : '').bringToTop()
      }
    }
  }

  public disableAllInput(){
    this.disabledButtons.ALL = true;
  }

  public enableAllInput(){
    this.disabledButtons.ALL = false;
  }

  public disableAllDirectionalButtons(){
    this.disabledButtons.DIRECTIONAL = true;
  }

  public enableAllDirectionalButtons(){
    this.disabledButtons.DIRECTIONAL = false;
  }

  public disableAllTriggerButtons(){
    this.disabledButtons.TRIGGER = true;
  }

  public enableAllTriggerButtons(){
    this.disabledButtons.TRIGGER = false;
  }

  public disableAllActionButtons(){
    this.disabledButtons.ACTION = true;
  }

  public enableAllActionButtons(){
    this.disabledButtons.ACTION = false;
  }

  public disableAllSystemButtons(){
    this.disabledButtons.SYSTEM = true;
  }

  public enableAllSystemButtons(){
    this.disabledButtons.SYSTEM = false;
  }

  public setDisableKeyProperty(name:string, value:boolean = true){
    if(this.properties.isReady){
      this.disabledButtons[name.toUpperCase()] = value
    }
  }

  public getKeyDisabledValue(name:string){
    if(this.properties.isReady){
      return this.disabledButtons[name.toUpperCase()]
    } else {
      return null;
    }
  }

  public clearAllControlIntervals(){
    if(this.properties.isReady){
      for (let btn of this.buttonArray) {
        clearInterval(this.IO.sensitivityPress[btn]);
      }
    }
  }

  public getKeyId(key:string){
    return this.buttonMapId[key.toUpperCase()]
  }

  public read(key:string){
    if(this.properties.isReady){
      let _return = {}
      return _return[key] = {id: this.buttonMapId[key.toUpperCase()], active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]}
    }
    return {};
  }

  public readMulti(keys:string[], returnAs:string = 'OBJECT'){
    if(this.properties.isReady){

      if(returnAs === 'OBJECT'){
        let _return = {}
        for(let key of keys){
          _return[key] = {id: this.buttonMapId[key.toUpperCase()], active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]}
        }
        return _return;
      }
      if(returnAs === 'ARRAY'){
        let _return = []
        for(let key of keys){
          _return.push({id: this.buttonMapId[key.toUpperCase()], key: key, active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]})
        }
        return _return;
      }

    }
  }

  private debuggerString(key:string){
    return `${key.toUpperCase()} (${this.buttonMap[key.toUpperCase()].name}/${this.buttonMap[key.toUpperCase()].code}) | id: ${this.buttonMapId[key.toUpperCase()]} duration: ${this.IO.state[key.toUpperCase()]().val} | state: ${this.IO.state[key.toUpperCase()]().state} | type: ${this.IO.state[key.toUpperCase()]().type} | disabled: ${this.disabledButtons[key.toUpperCase()]}`
  }

  private getBtnPressType(val:number){
    let _type = 'NONE', _state = 0, state = 0;
    Object.keys(this.buttonSensitivity).forEach((key) => {
      state++;
      if(val > this.buttonSensitivity[key]){
        _type = key;
        _state = state;
      }
    });
    return {val: val, type: _type, state: _state}
  }

  private destroyAll(){
    this.clearAllControlIntervals()
    Object.keys(this.debugger.text).forEach((key) => {
      this.debugger.text[key].destroy();
    })
  }

}

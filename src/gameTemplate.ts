declare var Phaser:any;

// imports must be added in gulpFile as well
//removeIf(gameBuild)
import {IO_CONTROLS} from './exports/controller'
import {IO_AUDIO} from './exports/audio'
import {PHASER_PRELOADER} from './exports/preloader'
//endRemoveIf(gameBuild)

class PhaserGameObject {
    // this properties
    global:any;
    game:any;

    constructor(){
      // accessible in gameObject as _this, accessible in class functions as this (obviously)
      this.game = null;
      this.global = {
        pause: false
      };
    }

    public init(el:any, parent:any, options:any){
      // declare variables BOILERPLATE
      const game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, update: update});

      // initiate control class
      const _IO_CONTROLS = new IO_CONTROLS();
      let IO:any; // assign input/output control reference;

      // define possible gameStates (can add more or less, but this is a good start)
      const gameStates = {
          BOOT: 'BOOT',
          PRELOAD: 'PRELOAD',
          READY: 'READY',
      }

      let properties = {
          state: gameStates.BOOT,
          input:{
            delay: 0,         // leave at 0
            delayValue: 100   // set if you need an input delay between input (higher number means it takes longer for the input to be recognized)
          }
      }

      let gameTitle:any;

      /******************/
      function preload(){
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('gametitle', 'src/assets/game/demo1/titles/100x100.jpg')

        // load music and sound effects into buffer
        game.load.audio('intro-music', ['src/assets/game/demo1/music/far-sight.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        (<any>window).WebFontConfig = {
            active(){ },
            google: {
              families: ['Press Start 2P']
            }
        };

        // change state
        properties.state = gameStates.PRELOAD;

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

      /******************/
      function preloadComplete(){
          // enable physics
          game.physics.startSystem(Phaser.Physics.ARCADE);
          // assign controls
          IO = _IO_CONTROLS.assignButtons(game)

          // DO SOMETHING BEFORE LOOP
          gameTitle = game.add.sprite(game.world.centerX - 50, game.world.centerY, 'gametitle');
          game.physics.enable( [ gameTitle ], Phaser.Physics.ARCADE);
          gameTitle.body.collideWorldBounds = true;
          gameTitle.body.bounce.y = 0.5;
          gameTitle.body.gravity.y = 200;

          // change state to ready
          properties.state = gameStates.READY
      }
      /******************/

      /******************/
      function update() {
        // leave to update control debugger
        if(_IO_CONTROLS.isDebuggerEnabled()){
          _IO_CONTROLS.updateDebugger();
        }

        //-----------------
        if(properties.state === gameStates.PRELOAD && !__phaser.global.pause){

        }
        //-----------------

        //-----------------
        if(properties.state === gameStates.READY && !__phaser.global.pause){

          // checkButtonDelay() good way to make sure your buttons are only pressed once every x seconds
          if(_IO_CONTROLS.read('A').active && checkButtonDelay()){
            updateButtonDelay();
          }
        }
        //-----------------

      }
      /******************/

      /******************/
      function checkButtonDelay(){
        return game.time.now > properties.input.delay;
      }

      function updateButtonDelay(){
        properties.input.delay = properties.input.delayValue + game.time.now;
      }
      /******************/

      /*  DO NOT TOUCH */
      parent.game = this;  // make game accessible to parent element
      this.game = game;    // make accessible to class functions
    }

    public destroy(){
      this.game.destroy();
    }

}

let __phaser = new PhaserGameObject();

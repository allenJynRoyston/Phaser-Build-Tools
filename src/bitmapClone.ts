declare var Phaser:any;

// imports must be added in gulpFile as well
//removeIf(gameBuild)
import {PHASER_MASTER} from './exports/master'
import {PHASER_CONTROLS} from './exports/controller'
import {PHASER_MOUSE} from './exports/mouse'
import {PHASER_AUDIO} from './exports/audio'
import {PHASER_PRELOADER} from './exports/preloader'
import {PHASER_SPRITE_MANAGER} from './exports/spriteManager'
import {PHASER_TEXT_MANAGER} from './exports/textManager'
import {PHASER_BUTTON_MANAGER} from './exports/buttonManager'
import {PHASER_BITMAPDATA_MANAGER} from './exports/bitmapdataManager'
//endRemoveIf(gameBuild)

class PhaserGameObject {
    // this properties
    global:any;
    game:any;

    /******************/
    constructor(){
      // accessible in gameObject as _this, accessible in class functions as this (obviously)
      this.game = null;
      this.global = {
        pause: false
      };
    }
    /******************/

    /******************/
    public init(el:any, parent:any, options:any){

      /******************/
      // declare variables BOILERPLATE
      // initiate control class
      const phaserMaster = new PHASER_MASTER({game: new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, update: update}), resolution: {width: options.width, height: options.height}}),
            phaserControls = new PHASER_CONTROLS(),
            phaserMouse = new PHASER_MOUSE({showDebugger: false}),
            phaserSprites = new PHASER_SPRITE_MANAGER(),
            phaserBmd = new PHASER_BITMAPDATA_MANAGER(),
            phaserTexts = new PHASER_TEXT_MANAGER(),
            phaserButtons = new PHASER_BUTTON_MANAGER();

      let button;
      /******************/


      /******************/
      function preload(){
        let game = phaserMaster.game();
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('ship', 'src/assets/game/demo1/images/ship.png')

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
        game.load.bitmapFont('gem', 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');

        // change state
        phaserMaster.setState('PRELOAD')

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();
          // enable physics
          //game.physics.startSystem(Phaser.Physics.ARCADE);

          // assign game to classes
          phaserControls.assign({game: game})
          phaserMouse.assign({game: game})
          phaserSprites.assign({game: game})
          phaserBmd.assign({game: game})
          phaserTexts.assign({game: game})
          phaserButtons.assign({game: game})


          // sprites
          phaserSprites.addSprite({x: game.world.centerX, y: game.world.centerY,  name: 'ship1', group: 'group1', reference: 'ship'})
          phaserSprites.center({name: 'ship1', x: game.world.centerX, y: game.world.centerY - 150})

          // add bitmap objects
          for(let i = 0; i < 5; i++){
            phaserBmd.addImage({name: `bmd${i}`, group: 'bmdGrp1', reference: 'ship', x:  50 + (i * 109), y: 250})
          }

          // texts
          phaserTexts.add({name: 'label1', group: 'instructions', font: 'gem', x:  10, y: 20,  size: 14, default: 'Original Sprite' })
          phaserTexts.center({name: 'label1', x: game.world.centerX, y: 20})

          phaserTexts.add({name: 'label2', group: 'instructions', font: 'gem', x:  10, y: 10,  size: 14, default: 'Bitmap Data Clones' })
          phaserTexts.center({name: 'label2', x: game.world.centerX, y: 220})

          phaserTexts.add({name: 'label3', group: 'instructions', font: 'gem', x:  10, y: 10,  size: 14, default: 'Press ENTER to change HSL' })
          phaserTexts.center({name: 'label3', x: game.world.centerX, y: 450})

          // change state
          phaserMaster.changeState('READY');
      }
      /******************/

      /******************/
      function update() {
        // leave to update control debugger
        if(phaserControls.isDebuggerEnabled()){
          phaserControls.updateDebugger();
        }
        phaserMouse.updateDebugger();

        //-----------------
        if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 100})){
            phaserBmd.get('bmd0').shiftHSL(0.1)
            phaserBmd.get('bmd1').shiftHSL(0.2)
            phaserBmd.get('bmd2').shiftHSL(0.3)
            phaserBmd.get('bmd3').shiftHSL(0.4)
            phaserBmd.get('bmd4').shiftHSL(0.5)
        }
        //-----------------


      }
      /******************/


      /******************/
      /*  DO NOT TOUCH */
      parent.game = this;                 // make game accessible to parent element
      this.game = phaserMaster.game();    // make accessible to class functions
      /******************/
    }
    /******************/

    /******************/
    public destroy(){
      this.game.destroy();
    }
    /******************/

}

let __phaser = new PhaserGameObject();

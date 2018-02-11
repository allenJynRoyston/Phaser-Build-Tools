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
import {PHASER_GROUP_MANAGER} from './exports/groupManager'
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
      const phaserMaster = new PHASER_MASTER({game: new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update}), resolution: {width: options.width, height: options.height}}),
            phaserControls = new PHASER_CONTROLS(),
            phaserMouse = new PHASER_MOUSE({showDebugger: false}),
            phaserSprites = new PHASER_SPRITE_MANAGER(),
            phaserBmd = new PHASER_BITMAPDATA_MANAGER(),
            phaserTexts = new PHASER_TEXT_MANAGER(),
            phaserButtons = new PHASER_BUTTON_MANAGER(),
            phaserGroup = new PHASER_GROUP_MANAGER();
      /******************/


      /******************/
      function preload(){
        let game = phaserMaster.game();
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('demoImage', 'src/assets/game/demo1/images/starfield.png')


        game.load.bitmapFont('gem', 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');

        // change state
        phaserMaster.changeState('PRELOAD')

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

      function create(){
        let game = phaserMaster.game();
        // assign game to classes
        phaserControls.assign(game)
        phaserMouse.assign(game)
        phaserSprites.assign(game)
        phaserBmd.assign(game)
        phaserTexts.assign(game)
        phaserButtons.assign(game)
        phaserGroup.assign(game)
      }

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();
          // enable physics
          //game.physics.startSystem(Phaser.Physics.ARCADE);


          // EXAMPLES OF BITMAPDATA STUFF:
          // 1.) CREATE A BITMAP AND USE THE cacheBitmapData to update all sprites built from it, in this case the background
          // create a gradient bmp -> turn it into a sprite -> manipulate the sprite width/height to fill screen
          phaserBmd.addImage({name: `bmdDemoImg`, group: 'bmd1', reference: 'demoImage', x:  65, y: 0, render: false})
          phaserMaster.let('shape', new Phaser.Rectangle(0, phaserBmd.get('bmdDemoImg').height, phaserBmd.get('bmdDemoImg').width, 1))
          phaserMaster.let('dropTime', game.time.now + 250);
          phaserMaster.let('beginFill', false);


          let padding = 15;
          // texts
          let header1 = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Control Manager Debugger'})
          phaserTexts.alignToTopCenter('header', 10)
          phaserGroup.layer(10).add(header1)

          let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:
`Press [ENTER] to begin fill.`
          })
          phaserTexts.get('instructions').maxWidth = game.canvas.width - padding
          phaserTexts.center('instructions', 0, 100)
          phaserGroup.layer(10).add(instructions)

          // create a gradient bmp -> turn it into a sprite -> manipulate the sprite width/height to fill screen
          phaserBmd.addGradient({name: 'bgGradient', start: '#0000FF', end: '#00008b', width: padding, height: padding, render: false})
          let instructionbox =  phaserSprites.add({x: instructions.x - padding, y: instructions.y - padding, name: `spriteBg1`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
              instructionbox.width = instructions.width + padding*2;
              instructionbox.height = instructions.height + padding*2;
          let headerbox =  phaserSprites.add({x: 0, y: 0, name: `spriteBg2`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
              headerbox.width = game.canvas.width;
              headerbox.height = header1.height + padding*2;

          phaserGroup.layer(9).add(instructionbox)
          phaserGroup.layer(9).add(headerbox)


          // change state
          phaserMaster.changeState('READY');
      }
      /******************/

      /******************/
      function generateHexColor() {
      	return '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
      }
      /******************/

      /******************/
      function update() {
        // leave to update control debugger
        if(phaserControls.isDebuggerEnabled()){
          phaserControls.updateDebugger();
        }
        phaserMouse.updateDebugger();

        let beginFill = phaserMaster.get('beginFill');
        if(beginFill){
          let shape = phaserMaster.get('shape'),
              dropTime = phaserMaster.get('dropTime');

          if (shape.y > 0 && phaserMaster.game().time.now > dropTime)
          {
            for (let y = 0; y < shape.y; y++){
                phaserBmd.get('bmdDemoImg').copyRect('demoImage', shape, 0, y);
            }
            shape.y--;
            dropTime = phaserMaster.game().time.now + 10;
          }
        }

        if(phaserControls.read('START').active){
          phaserMaster.forceLet('beginFill', true);
          phaserSprites.get('spriteBg1').visible = !phaserSprites.get('spriteBg1').visible
          phaserSprites.get('spriteBg2').visible = !phaserSprites.get('spriteBg2').visible
          phaserTexts.get('header').visible = false
          phaserTexts.get('instructions').visible = false
        }

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

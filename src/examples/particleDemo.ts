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
        game.load.image('gem', 'src/assets/game/demo1/images/gem.png')

        // font
        game.load.bitmapFont('gem', 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');

        // change state
        phaserMaster.changeState('PRELOAD')

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

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

        // texts
        let padding = 15;
        let header1 = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Particle FX Demo'})
        phaserTexts.alignToTopCenter('header', 10)
        phaserGroup.layer(10).add(header1)

        let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:
`Press [A] to add particles
Press [B] to add rotating particles`
        })
            instructions.maxWidth = game.canvas.width - padding
        phaserTexts.alignToBottomLeftCorner('instructions', 10)
        phaserGroup.layer(10).add(instructions)

        let spriteCount = phaserTexts.add({name: 'spriteCount', size: 14, font: 'gem', default:``})
            spriteCount.maxWidth = game.canvas.width - padding
        phaserTexts.alignToBottomRightCorner('spriteCount', 10)
        phaserGroup.layer(10).add(spriteCount)

        // create a gradient bmp -> turn it into a sprite -> manipulate the sprite width/height to fill screen
        phaserBmd.addGradient({name: 'bgGradient', start: '#0000FF', end: '#00008b', width: padding, height: padding, render: false})
        let instructionbox =  phaserSprites.add({x: 0, y: game.canvas.height - instructions.height - padding, name: `spriteBg1`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
            instructionbox.width = instructions.width + padding*2;
            instructionbox.height = instructions.height + padding*2;
        let headerbox =  phaserSprites.add({x: 0, y: 0, name: `spriteBg2`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
            headerbox.width = game.canvas.width;
            headerbox.height = header1.height + padding*2;

        phaserGroup.layer(9).add(instructionbox)
        phaserGroup.layer(9).add(headerbox)
      }
      /******************/

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();

          // enable physics
          game.physics.startSystem(Phaser.Physics.ARCADE);

          let emitter = phaserMaster.let('emitter', game.add.emitter(game, 0, 0, 100))
              emitter.makeParticles('gem');
              emitter.gravity = 200;
              phaserGroup.layer(1).add(emitter)

          let emitter2 = phaserMaster.let('emitter2', game.add.emitter(game, 0, 0, 100))
              emitter2.makeParticles('gem');
              emitter2.gravity = 200;
              phaserGroup.layer(1).add(emitter2)
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
        let game = phaserMaster.game();
        let emitter = phaserMaster.get('emitter');
        let emitter2 = phaserMaster.get('emitter2');

        if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 100})){
          emitter.x = game.world.randomX;
          emitter.y = game.world.randomY;
          emitter.start(true, 2000, null, 5);
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'B', delay: 100})){
          emitter2.x = game.world.randomX;
          emitter2.y = game.world.randomY;
          emitter2.setScale(-2, 2, 1, 1, 2000, Phaser.Easing.Sinusoidal.InOut, true);
          emitter2.start(true, 2000, null, 5);
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

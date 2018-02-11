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
        game.load.image('demoImage', 'src/assets/game/demo1/images/star.png')
        game.load.image('demoImage2', 'src/assets/game/demo1/images/ship.png')

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
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
      }
      /******************/

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();
          let padding = 15;
          // texts
          let header1 = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Sprite Class Manager Debugger'})
          phaserTexts.alignToTopCenter('header', 10)
          phaserGroup.layer(10).add(header1)

          let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:
`Press [A] to create a sprite in group 1.
Press [S] to create a sprite in group 2.
Press [D] to delete a sprite in group 1.
Press [F] to delete a sprite in group 2.
Press [Q] to delete all sprites in group 1.
Press [W] to delete all sprites in group 2.
Press [BACKSPACE] to toggle visiblity of all sprites.
Press [W] to delete all sprites in group 2.
`
          })
          phaserTexts.get('instructions').maxWidth = game.canvas.width - padding
          phaserTexts.alignToBottomLeftCorner('instructions', 10)
          phaserGroup.layer(10).add(instructions)

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

        let game = phaserMaster.game();

        // ADD SPRITE 1
        if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 100})){
          let newSprite = phaserSprites.add({name: `sprite_${phaserSprites.count().unique}`, group: 'spriteGroup1', reference: 'demoImage', x: game.world.randomX, y: game.world.randomY})
          phaserGroup.layer(0).add(newSprite)
        }

        // ADD SPRITE 2
        if(phaserControls.checkWithDelay({isActive: true, key: 'B', delay: 100})){
          let newSprite = phaserSprites.add({name: `sprite_${phaserSprites.count().unique}`, group: 'spriteGroup2', reference: 'demoImage2', x: game.world.randomX, y: game.world.randomY})
          phaserGroup.layer(1).add(newSprite)
        }

        // DELETE SPRITE 1
        if(phaserControls.checkWithDelay({isActive: true, key: 'X', delay: 100})){
          if(phaserSprites.getGroup('spriteGroup1').length > 0){
            phaserSprites.destroy(`${ phaserSprites.getGroup('spriteGroup1')[0].name }`)
          }
        }

        // DELETE SPRITE 2
        if(phaserControls.checkWithDelay({isActive: true, key: 'Y', delay: 100})){
          if(phaserSprites.getGroup('spriteGroup2').length > 0){
            phaserSprites.destroy(`${ phaserSprites.getGroup('spriteGroup2')[0].name }`)
          }
        }

        // DELETE IN ALL
        if(phaserControls.checkWithDelay({isActive: true, key: 'R1', delay: 100})){
          if(phaserSprites.count().total > 0){
            phaserSprites.destroy(`${phaserSprites.getAll('ARRAY')[0].name }`)
          }
        }

        // DELETE SPRITE GROUP 1
        if(phaserControls.checkWithDelay({isActive: true, key: 'L1', delay: 100})){
          phaserSprites.destroyGroup(`spriteGroup1`)
        }

        // DELETE SPRITE GROUP 2
        if(phaserControls.checkWithDelay({isActive: true, key: 'L2', delay: 100})){
          phaserSprites.destroyGroup(`spriteGroup2`)
        }

        // HIDE/SHOW SPRITES
        if(phaserControls.checkWithDelay({isActive: true, key: 'BACK', delay: 100})){
          let all = [...phaserSprites.getGroup('spriteGroup1'), ...phaserSprites.getGroup('spriteGroup2')]
          for(let sprite of all){
            phaserSprites.get(sprite.name).visible = !phaserSprites.get(sprite.name).visible;
          }
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

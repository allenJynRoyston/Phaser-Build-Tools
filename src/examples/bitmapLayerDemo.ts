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
        game.load.image('ship', 'src/assets/game/demo1/images/ship.png')


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
          phaserBmd.addGradient({name: 'bgGradient2', start: generateHexColor(), end: generateHexColor(), width: game.canvas.width/2, height: game.canvas.height, y: 0, render: true})
          let gradientSprite = phaserSprites.add({x: 0, y: 0, name: `spriteBgBlock`, reference: phaserBmd.get('bgGradient2').cacheBitmapData})
              gradientSprite.width = game.canvas.width
              gradientSprite.height = game.canvas.height

          phaserGroup.layer(0).add(gradientSprite)

          // 2.) CREATE A BITMAP AND USE THE cacheBitmapData to update all sprites built from it, in this case the floating sprites
          // create gradient bitmapData -> turn into multiple sprites -> get group of new sprites and add physics to it
          phaserBmd.addGradient({name: 'blockBmp', group: 'blockBmpGroup', start: generateHexColor(), end: generateHexColor(), width: 10, height: 10, render: false})
          for(let i = 0; i < 20; i++){
            let newBlock = phaserSprites.add({x: 200, y: 0, name: `blockSprites${i}`, group: 'blockSpritesGroup', reference: phaserBmd.get('blockBmp').cacheBitmapData})
            game.physics.arcade.enable(newBlock);
            newBlock.body.collideWorldBounds = true;
            newBlock.body.bounce.set(1);
          	newBlock.body.velocity.x = game.rnd.realInRange(-200, 200);
          	newBlock.body.velocity.y = game.rnd.realInRange(-200, 200);
            phaserGroup.layer(1).add(newBlock)
          }


          // 3.)  CREATEA  BITMAP from a loaded image and manipulate their color range (manipulates the object directly, not their cachedBitmapData)
          // add bitmap objects via image  (CANNOT BE PUT INTO A LAYER)
          for(let i = 0; i < 5; i++){
            let ship = phaserBmd.addImage({name: `bmd${i}`, group: 'shipGroups', reference: 'ship', x:  50 + (i * 111), y: 250, render: true})
          }



          let padding = 15;
          // texts
          let header1 = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Bitmap Layer Demo'})
              header1.maxWidth = 200 - padding
          phaserTexts.alignToTopRightCorner('header', 10)
          phaserGroup.layer(10).add(header1)

          let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:
`[A] to shift bitmap.
[S] bitmap sprite.
[D] block sprites.
[F] ships.
[ENTER] inverse sprites.
`
          })
          phaserTexts.get('instructions').maxWidth = 200 - padding
          phaserTexts.alignToBottomRightCorner('instructions', 10)
          phaserGroup.layer(10).add(instructions)

          phaserBmd.addGradient({name: 'bgGradient', start: '#0000FF', end: '#00008b', width: padding, height: padding, render: false})
          let instructionbox =  phaserSprites.add({x: 0, y: game.canvas.height - instructions.height - padding, name: `spriteBg1`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
              instructionbox.width = instructions.width + padding*2;
              instructionbox.height = instructions.height + padding*2;
              instructionbox.x = instructions.x - padding;
          let headerbox =  phaserSprites.add({x: 0, y: 0, name: `spriteBg2`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
              headerbox.width = header1.width + padding*2;
              headerbox.height = header1.height + padding*2;
              headerbox.x = header1.x - padding;

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


        phaserSprites.getGroup('group1').forEach((sprite, index) => {
          sprite.angle += 5
        })


        if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 500})){
            phaserBmd.get('bgGradient2').shiftHSL(0.3)
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'B', delay: 500})){
          let cbd = phaserBmd.get('bgGradient2').cacheBitmapData
          var grd = cbd.context.createLinearGradient(0, 0, 0, cbd.height);
              grd.addColorStop(0, generateHexColor());
              grd.addColorStop(1, generateHexColor());
          cbd.context.fillStyle = grd;
          cbd.context.fillRect(0, 0, cbd.width, cbd.height);
          cbd.dirty = true;
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'X', delay: 100})){
            let cbd = phaserBmd.get('blockBmp').cacheBitmapData
            var grd = cbd.context.createLinearGradient(0, 0, 0, cbd.height);
                grd.addColorStop(0, generateHexColor());
                grd.addColorStop(1, generateHexColor());
            cbd.context.fillStyle = grd;
            cbd.context.fillRect(0, 0, cbd.width, cbd.height);
            cbd.dirty = true;
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'Y', delay: 10})){
            phaserBmd.getGroup('shipGroups').forEach((item, index) => {
              item.shiftHSL(0.05 + (index * .05))
            })
        }


        if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 500})){

          phaserBmd.getGroup('shipGroups').forEach((item, index) => {
            item.processPixelRGB((pixel) => {
              pixel.r = 255 - pixel.r;
              pixel.g = 255 - pixel.g;
              pixel.b = 255 - pixel.b;
              return pixel;
            })
          })

          phaserBmd.get('bgGradient').processPixelRGB((pixel) => {
            pixel.r = 255 - pixel.r;
            pixel.g = 255 - pixel.g;
            pixel.b = 255 - pixel.b;
            return pixel;
          })
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

declare var Phaser:any;

// imports must be added in gulpFile as well
//removeIf(gameBuild)
import {PHASER_MASTER} from './exports/master'
import {PHASER_CONTROLS} from './exports/controller'
import {PHASER_AUDIO} from './exports/audio'
import {PHASER_PRELOADER} from './exports/preloader'
import {PHASER_SPRITE_MANAGER} from './exports/spriteManager'
import {PHASER_TEXT_MANAGER} from './exports/textManager'
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
            phaserSprites = new PHASER_SPRITE_MANAGER(),
            phaserTexts = new PHASER_TEXT_MANAGER();


      /******************/


      /******************/
      function preload(){
        let game = phaserMaster.game();
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('gameTitle', 'src/assets/game/demo1/titles/100x100.jpg')

        // load music and sound effects into buffer
        game.load.audio('intro-music', ['src/assets/game/demo1/music/far-sight.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
        /*
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        (<any>window).WebFontConfig = {
            active(){ },
            google: {
              families: ['Press Start 2P']
            }
        };
        */
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
          phaserSprites.assign({game: game})
          phaserTexts.assign({game: game})

          // sprites examples
          phaserSprites.addSprite({x: game.world.centerX - 150, y: game.world.centerY,  key: 'sprite1', groupKey: 'group1', reference: 'gameTitle'})
          phaserSprites.addSprite({x: game.world.centerX , y: game.world.centerY,  key: 'sprite2', groupKey: 'group1', reference: 'gameTitle'})
          phaserSprites.addSprite({x: game.world.centerX + 150, y: game.world.centerY,  key: 'sprite3', groupKey: 'group1', reference: 'gameTitle'})
          phaserSprites.getSprite('sprite1').anchor.set(0.5)
          phaserSprites.getSprite('sprite2').anchor.set(0.5)
          phaserSprites.getSprite('sprite3').anchor.set(0.5)

          // texts examples
          phaserTexts.addText({key: 'test1', groupKey: 'group1', font: 'gem', x: 10, y: 10, size: 16, default: 'I am the best in the whole world and the whole world should know it!' })
          phaserTexts.addText({key: 'test2', groupKey: 'group1', font: 'gem', x: 10, y: 50, size: 16, default: 'I am the second in the whole world and the whole world should know it!' })


          // change state to ready
          phaserMaster.setState('READY')
      }
      /******************/

      /******************/
      function update() {
        // leave to update control debugger
        if(phaserControls.isDebuggerEnabled()){
          phaserControls.updateDebugger();
        }

        //-----------------
        if(phaserMaster.checkState('PRELOAD') && !__phaser.global.pause){
          /* DO SOMETHING */

        }
        //-----------------

        //-----------------
        if(phaserMaster.checkState('READY') && !__phaser.global.pause){

          if(phaserControls.read('LEFT').active){
            for(let sprite of phaserSprites.getGroup('group1')){
              sprite.rotation -= .05
            }
          }

          if(phaserControls.read('RIGHT').active){
            for(let sprite of phaserSprites.getGroup('group1')){
              sprite.rotation += .05
            }
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'R1', delay: 100})){
            phaserTexts.getText('test2').text = 'CHANGE ONE'
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'R2', delay: 100})){
            for(let text of phaserTexts.getGroup('group1')){
              text.text = 'All changed!'
            }
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 100})){
            phaserSprites.getSprite('sprite1').tint = Math.random() * 0xffffff;
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'B', delay: 100})){
            phaserSprites.getSprite('sprite2').tint = Math.random() * 0xffffff;
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'X', delay: 250})){
            phaserSprites.getSprite('sprite3').tint = Math.random() * 0xffffff;
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'Y', delay: 300})){
            for(let sprite of phaserSprites.getGroup('group1')){
              sprite.tint = Math.random() * 0xffffff;
            }
          }

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

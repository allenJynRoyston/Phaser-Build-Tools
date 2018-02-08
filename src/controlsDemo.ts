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
        game.load.image('gameTitle', 'src/assets/game/demo1/titles/100x100.jpg')
        game.load.image('ship', 'src/assets/game/demo1/images/ship.png')
        game.load.image('orangeBtn', 'src/assets/game/demo1/images/orangeBtn.png')

        // load music and sound effects into buffer
        game.load.audio('intro-music', ['src/assets/game/demo1/music/far-sight.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
        // webfonts
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        (<any>window).WebFontConfig = {
            active(){ },
            google: {
              families: ['Press Start 2P']
            }
        };
        // font bitmap
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
          phaserTexts.assign({game: game})
          phaserButtons.assign({game: game})

          // sprites examples
          phaserSprites.addSprite({x: game.world.centerX - 150, y: game.world.centerY + 50,  name: 'sprite1', group: 'group1', reference: 'ship'})
          phaserSprites.addSprite({x: game.world.centerX , y: game.world.centerY + 50,  name: 'sprite2', group: 'group1', reference: 'ship'})
          phaserSprites.addSprite({x: game.world.centerX + 150, y: game.world.centerY + 50,  name: 'sprite3', group: 'group1', reference: 'ship'})
          phaserSprites.getGroup('group1').forEach((sprite, index) => {
            sprite.anchor.set(0.5)
            sprite.scale.setTo(1, 1)
            sprite.alpha = 1
          });

          // demo functions
          let setToRotate = () => {
            phaserMaster.setState('ROTATE');
            phaserTexts.get('state').text = `Current state: ${phaserMaster.getCurrentState()}`
            phaserTexts.get('instructions').maxWidth = game.canvas.width - 10
            phaserTexts.get('instructions').text = 'Rotate ships individually with A, S, D or use the directional arrows to move them all.  Pressing ENTER will reset them to their starting location.'
            phaserTexts.get('instructions').y = game.canvas.height - (phaserTexts.get('instructions').height + 15);
          }

          let setToScale = () => {
            phaserMaster.setState('SCALE');
            phaserTexts.get('state').text = `Current state: ${phaserMaster.getCurrentState()}`
            phaserTexts.get('instructions').maxWidth = game.canvas.width - 10
            phaserTexts.get('instructions').text = 'Scale ships individually with A, S, D or use the directional arrows to scale them all.  Pressing ENTER will reset them to their original size.'
            phaserTexts.get('instructions').y = game.canvas.height - (phaserTexts.get('instructions').height + 15);
          }

          let setToMove = () => {
            phaserMaster.setState('MOVE');
            phaserTexts.get('state').text = `Current state: ${phaserMaster.getCurrentState()}`
            phaserTexts.get('instructions').maxWidth = game.canvas.width - 10
            phaserTexts.get('instructions').text = 'Move each ship individually by holding A, S, D and a directional arrow or move all of them by using just the directional arrows.'
            phaserTexts.get('instructions').y = game.canvas.height - (phaserTexts.get('instructions').height + 15);
          }

          // create buttons and behavior
          phaserButtons.add({name: 'btn1', group: 'group1', x:  game.world.centerX - 175, y: 100, reference:'orangeBtn', onclick:() => { setToRotate(); }})
          phaserButtons.add({name: 'btn2', group: 'group1', x:  game.world.centerX, y: 100, reference:'orangeBtn', onclick:() => { setToScale(); }})
          phaserButtons.add({name: 'btn3', group: 'group1', x:  game.world.centerX + 175, y: 100, reference:'orangeBtn', onclick:() => { setToMove(); }})
          phaserButtons.getGroup('group1').forEach((btn, index) => {
            btn.anchor.set(0.5)
            btn.scale.setTo(.5, .5)
          });


          // texts examples
          phaserTexts.add({name: 'label1', group: 'instructions', font: 'gem', x:  game.world.centerX - 225, y: 85,  size: 32, default: 'ROTATE' })
          phaserTexts.add({name: 'label2', group: 'instructions', font: 'gem', x:  game.world.centerX - 40, y: 85, size: 32, default: 'SCALE' })
          phaserTexts.add({name: 'label3', group: 'instructions', font: 'gem', x:  game.world.centerX + 145, y: 85, size: 32, default: 'MOVE' })

          phaserTexts.add({name: 'status', group: 'instructions', font: 'gem', x: 10, y: 10, size: 16, default: 'Click on a button to change the action:' })
          phaserTexts.add({name: 'state', group: 'instructions', font: 'gem', x: 10, y: 30, size: 16, default: '' })
          phaserTexts.add({name: 'instructions', group: 'instructions', font: 'gem', x: 10, y: game.canvas.height - 80, size: 16, default: '' })

          // change state
          setToMove();
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
        if(phaserMaster.checkState('PRELOAD') && !__phaser.global.pause){
          /* DO SOMETHING */
        }
        //-----------------

        //-----------------
        if(phaserMaster.checkState('ROTATE') && !__phaser.global.pause){
          rotateLoop();
        }
        if(phaserMaster.checkState('SCALE') && !__phaser.global.pause){
          scaleLoop();
        }
        if(phaserMaster.checkState('MOVE') && !__phaser.global.pause){
          moveLoop();
        }

      }
      /******************/

      /******************/
      function rotateLoop(){
        if(phaserControls.read('A').active){
           phaserSprites.get('sprite1').angle += 5
        }
        if(phaserControls.read('B').active){
           phaserSprites.get('sprite2').angle += 5
        }
        if(phaserControls.read('X').active){
           phaserSprites.get('sprite3').angle += 5
        }

        if(phaserControls.read('LEFT').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.angle -= 5
           }
        }
        if(phaserControls.read('RIGHT').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.angle += 5
           }
        }
        if(phaserControls.read('UP').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.angle -= 10
           }
        }
        if(phaserControls.read('DOWN').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.angle += 10
           }
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 500})){
          let game = phaserMaster.game();
          for(let sprite of phaserSprites.getGroup('group1')){
            game.add.tween(sprite).to( { angle: 0 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite.scale).to( { y:1, x:1 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite).to( { y:  sprite.getDefaultPositions().y, x:  sprite.getDefaultPositions().x }, 500, Phaser.Easing.Bounce.Out, true);
          }
        }
      }
      /******************/

      /******************/
      function scaleLoop(){
        if(phaserControls.read('A').active){
           phaserSprites.get('sprite1').scale.setTo( phaserSprites.get('sprite1').scale.x += .025 , phaserSprites.get('sprite1').scale.y += .025)
        }
        if(phaserControls.read('B').active){
           phaserSprites.get('sprite2').scale.setTo( phaserSprites.get('sprite2').scale.x += .025 , phaserSprites.get('sprite2').scale.y += .025)
        }
        if(phaserControls.read('X').active){
           phaserSprites.get('sprite3').scale.setTo( phaserSprites.get('sprite3').scale.x += .025 , phaserSprites.get('sprite3').scale.y += .025)
        }

        if(phaserControls.read('UP').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.scale.setTo( sprite.scale.x += .05 , sprite.scale.y += .05)
           }
        }
        if(phaserControls.read('DOWN').active){
           for(let sprite of phaserSprites.getGroup('group1')){
             sprite.scale.setTo( sprite.scale.x -= .05 , sprite.scale.y -= .05)
           }
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 500})){
          let game = phaserMaster.game();
          for(let sprite of phaserSprites.getGroup('group1')){
            game.add.tween(sprite).to( { angle: 0 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite.scale).to( { y:1, x:1 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite).to( { y:  sprite.getDefaultPositions().y, x:  sprite.getDefaultPositions().x }, 500, Phaser.Easing.Bounce.Out, true);
          }
        }
      }
      /******************/

      /******************/
      function moveLoop(){
        if(phaserControls.read('A').active){
           if(phaserControls.read('UP').active){
             phaserSprites.get('sprite1').y -= 5
           }
           if(phaserControls.read('DOWN').active){
             phaserSprites.get('sprite1').y += 5
           }
           if(phaserControls.read('LEFT').active){
             phaserSprites.get('sprite1').x -= 5
           }
           if(phaserControls.read('RIGHT').active){
             phaserSprites.get('sprite1').x += 5
           }
        }
        if(phaserControls.read('B').active){
          if(phaserControls.read('UP').active){
            phaserSprites.get('sprite2').y -= 5
          }
          if(phaserControls.read('DOWN').active){
            phaserSprites.get('sprite2').y += 5
          }
          if(phaserControls.read('LEFT').active){
            phaserSprites.get('sprite2').x -= 5
          }
          if(phaserControls.read('RIGHT').active){
            phaserSprites.get('sprite2').x += 5
          }
        }
        if(phaserControls.read('X').active){
          if(phaserControls.read('UP').active){
            phaserSprites.get('sprite3').y -= 5
          }
          if(phaserControls.read('DOWN').active){
            phaserSprites.get('sprite3').y += 5
          }
          if(phaserControls.read('LEFT').active){
            phaserSprites.get('sprite3').x -= 5
          }
          if(phaserControls.read('RIGHT').active){
            phaserSprites.get('sprite3').x += 5
          }
        }

        if(!phaserControls.read('A').active && !phaserControls.read('B').active && !phaserControls.read('X').active){
          if(phaserControls.read('UP').active){
             for(let sprite of phaserSprites.getGroup('group1')){
               sprite.y -= 5
             }
          }
          if(phaserControls.read('DOWN').active){
             for(let sprite of phaserSprites.getGroup('group1')){
               sprite.y += 5
             }
          }
          if(phaserControls.read('LEFT').active){
             for(let sprite of phaserSprites.getGroup('group1')){
               sprite.x -= 5
             }
          }
          if(phaserControls.read('RIGHT').active){
             for(let sprite of phaserSprites.getGroup('group1')){
               sprite.x += 5
             }
          }
        }

        if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 500})){
          let game = phaserMaster.game();
          for(let sprite of phaserSprites.getGroup('group1')){
            game.add.tween(sprite).to( { angle: 0 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite.scale).to( { y:1, x:1 }, 500, Phaser.Easing.Bounce.Out, true);
            game.add.tween(sprite).to( { y:  sprite.getDefaultPositions().y, x:  sprite.getDefaultPositions().x }, 500, Phaser.Easing.Bounce.Out, true);
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

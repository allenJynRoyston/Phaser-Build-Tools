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
        game.load.image('texture', 'src/assets/game/demo1/images/cyberglow.png')

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
        let header1 = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Filter FX Demo'})
        phaserTexts.alignToTopCenter('header', 10)
        phaserGroup.layer(10).add(header1)

        let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:`Trippy!`})
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

          //  Shader by triggerHLM (https://www.shadertoy.com/view/lsfGDH)

          var fragmentSrc = [
              "precision mediump float;",
              "uniform float     time;",
              "uniform vec2      resolution;",
              "uniform sampler2D iChannel0;",
              "float speed = time * 0.2;",
              "float pi = 3.14159265;",
              "void main( void ) {",
                  "vec2 position = vec2(640.0/2.0+640.0/2.0*sin(speed*2.0), 360.0/2.0+360.0/2.0*cos(speed*3.0));",
                  "vec2 position2 = vec2(640.0/2.0+640.0/2.0*sin((speed+2000.0)*2.0), 360.0/2.0+360.0/2.0*cos((speed+2000.0)*3.0));",
                  "vec2 offset = vec2(640.0/2.0, 360.0/2.0) ;",
                  "vec2 offset2 = vec2(6.0*sin(speed*1.1), 3.0*cos(speed*1.1));",
                  "vec2 oldPos = (gl_FragCoord.xy-offset);",
                  "float angle = speed*2.0;",
                  "vec2 newPos = vec2(oldPos.x *cos(angle) - oldPos.y *sin(angle),",
                  "oldPos.y *cos(angle) + oldPos.x *sin(angle));",
                  "newPos = (newPos)*(0.0044+0.004*sin(speed*3.0))-offset2;",
                  "vec2 temp = newPos;",
                  "newPos.x = temp.x + 0.4*sin(temp.y*2.0+speed*8.0);",
                  "newPos.y = (-temp.y + 0.4*sin(temp.x*2.0+speed*8.0));",
                  "vec4 final = texture2D(iChannel0,newPos);",
                  "//final = texture2D(texCol,gl_FragCoord.xy*vec2(1.0/640, -1.0/360));",
                  "gl_FragColor = vec4(final.xyz, 1.0);",
              "}"
          ];

          let sprite = phaserMaster.let('sprite', game.add.sprite(0, 0, 'texture'));
              sprite.width = game.canvas.width;
              sprite.height = game.canvas.height;

          var customUniforms = {
              iChannel0: { type: 'sampler2D', value: sprite.texture, textureData: { repeat: true } }
          };

          let filter = phaserMaster.let('filter', new Phaser.Filter(game, customUniforms, fragmentSrc))
              filter.setResolution(800, 600);

          sprite.filters = [ filter ];
          phaserGroup.layer(1).add(sprite)


          // change state
          phaserMaster.changeState('READY');
      }
      /******************/



      /******************/
      function update() {
        let game = phaserMaster.game();
        let filter = phaserMaster.get('filter');

         filter.update();

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

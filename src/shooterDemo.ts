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
            phaserGroup = new PHASER_GROUP_MANAGER(),
            phaserBitmapdata = new PHASER_BITMAPDATA_MANAGER()
      /******************/


      /******************/
      function preload(){
        let game = phaserMaster.game();
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('winners', 'src/assets/game/demo1/images/winners.jpg')
        game.load.image('bullet', 'src/assets/game/demo1/images/bullet.png');
        game.load.image('bomb', 'src/assets/game/demo1/images/enemy-bullet.png');
        game.load.spritesheet('invader', 'src/assets/game/demo1/images/invader32x32x4.png', 32, 32);
        game.load.image('player', 'src/assets/game/demo1/images/ship.png');
        game.load.spritesheet('kaboom', 'src/assets/game/demo1/images/explode.png', 128, 128);
        game.load.image('starfield', 'src/assets/game/demo1/images/starfield.png');
        game.load.image('background', 'src/assets/game/demo1/images/tron.png');
        game.load.image('particlefx', 'src/assets/game/demo1/images/gem.png')

        // load music into buffer
        game.load.audio('music-main', ['src/assets/game/demo1/music/zombies-in-space.ogg']);
        game.load.audio('powerupfx', ['src/assets/game/demo1/sound/Powerup4.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);
        game.load.audio('smallExplosion', ['src/assets/game/demo1/sound/quietExplosion.ogg'])
        game.load.audio('bigExplosion', ['src/assets/game/demo1/sound/Explosion3.ogg'])
        game.load.audio('laser', ['src/assets/game/demo1/sound/Laser_Shoot78.ogg'])
        game.load.audio('hit', ['src/assets/game/demo1/sound/Hit_Hurt11.ogg'])

        // font
        game.load.bitmapFont('gem', 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');

        // change state
        phaserMaster.changeState('PRELOAD')

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

      /******************/
      function generateHexColor() {
        return '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
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
        phaserBitmapdata.assign(game)

        // game variables
        phaserMaster.let('score', 0)
        phaserMaster.let('roundTime', 30)
        phaserMaster.let('clock', game.time.create(false))
        phaserMaster.let('elapsedTime', 0)

        // pause behavior
        game.onPause.add(() => {
          pauseGame()
        }, this);
        game.onResume.add(() => {
          unpauseGame();
        }, this);

        // filter
        game.physics.startSystem(Phaser.Physics.ARCADE);
        /*
        var fragmentSrc = [
            "precision mediump float;",
            "uniform float     time;",
            "uniform vec2      resolution;",
            "uniform sampler2D iChannel0;",
            "void main( void ) {",
                "float t = time;",
                "vec2 uv = gl_FragCoord.xy / resolution.xy;",
                "vec2 texcoord = gl_FragCoord.xy / vec2(resolution.y);",
                "texcoord.y -= t*0.2;",
                "float zz = 1.0/(1.0-uv.y*1.7);",
                "texcoord.y -= zz * sign(zz);",
                "vec2 maa = texcoord.xy * vec2(zz, 1.0) - vec2(zz, 0.0) ;",
                "vec2 maa2 = (texcoord.xy * vec2(zz, 1.0) - vec2(zz, 0.0))*0.3 ;",
                "vec4 stone = texture2D(iChannel0, maa);",
                "vec4 blips = texture2D(iChannel0, maa);",
                "vec4 mixer = texture2D(iChannel0, maa2);",
                "float shade = abs(1.0/zz);",
                "vec3 outp = mix(shade*stone.rgb, mix(1.0, shade, abs(sin(t+maa.y-sin(maa.x))))*blips.rgb, min(1.0, pow(mixer.g*2.1, 2.0)));",
                "gl_FragColor = vec4(outp,1.0);",
            "}"
        ];

        //  Texture must be power-of-two sized or the filter will break
        let sprite =  phaserSprites.add({x: 0, y: 0, name: `filterBG`, group: 'filter', reference: 'background'})
            sprite.width = game.world.width;
            sprite.height = game.world.height;
        let filter = phaserMaster.let('filter', new Phaser.Filter(game, {iChannel0: { type: 'sampler2D', value: sprite.texture, textureData: { repeat: true } }}, fragmentSrc))
            filter.setResolution(1920, 1080);
        sprite.filters = [ filter ];
        phaserGroup.add(0, sprite)
        */

        // particles
        let particlesSprite = phaserBmd.addGradient({name: 'blockBmp', group: 'particles', start: '#ff0000', end: '#FF4500', width: 1, height: 1, render: false})
        let emitter = phaserMaster.let('emitter', game.add.emitter(game, 0, 0, 100))
            emitter.makeParticles(particlesSprite);
            emitter.gravity = 0;
            phaserGroup.layer(1).add(emitter)

        // stars
        let stars = phaserBmd.addGradient({name: 'starBmp', group: 'blockBmpGroup', start: '#ffffff', end: '#ffffff', width: 1, height: 1, render: false})
        for (var i = 0; i < 25; i++){
            let star = phaserSprites.add({name: `star_${i}`, group: 'movingStarField', x: game.rnd.integerInRange(0, game.world.width), y:game.rnd.integerInRange(0, game.world.height), reference: stars})
                star.starType = game.rnd.integerInRange(1, 3);
                star.scale.setTo(star.starType, star.starType);
                star.onUpdate = function(){
                  let momentum = 16 - (this.starType * 5)
                  if(this.y  > this.game.world.height){
                    this.y = 10
                  }
                  this.y += momentum
                }
                phaserGroup.layer(0).add(star)
        }

        //  TIME
        let timeSeconds = phaserTexts.add({name: 'timeSeconds', group: 'timeKeeper', font: 'gem', size: 65, default: `25`, visible: false})
            phaserTexts.alignToTopCenter('timeSeconds', 20)
            timeSeconds.onUpdate = function(){
              let totalTime = phaserMaster.get('elapsedTime');
              let elapsedTime = phaserMaster.get('elapsedTime');
                  elapsedTime += (phaserMaster.get('clock').elapsed * .001);
              phaserMaster.forceLet('elapsedTime', elapsedTime);
              let roundTime = phaserMaster.get('roundTime');

              let inSeconds = parseInt((roundTime - elapsedTime).toFixed(0))
              if(inSeconds >= 0){
                   this.setText(`${inSeconds}`)
              }
              else{
                endLevel()
              }
            }
            timeSeconds.reveal = function(){
              this.y = -200;
              this.visible = true
              this.game.add.tween(this).to( { y: 10 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }
            timeSeconds.hide = function(){
              this.game.add.tween(this).to( { y: -200 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }


        // SCORE
        let scoreText = phaserTexts.add({name: 'scoreText', group: 'ui', x:10, y:10,  font: 'gem', size: 18, default: `Score: ${phaserMaster.get('score')}`, visible: false})
            scoreText.onUpdate = function(){}
            scoreText.updateScore = function(){
              this.setText(`Score: ${phaserMaster.get('score')}`)
            }
            scoreText.reveal = function(){
              this.y = -this.height;
              this.visible = true
              game.add.tween(this).to( { y: 10 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }
            scoreText.hide = function(){
              game.add.tween(this).to( { y: -100 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }

        // LIVES
        let livesText = phaserTexts.add({name: 'livesText', group: 'ui', x:game.world.width - 100, y:10,  font: 'gem', size: 18, default: 'Lives', visible: false})
            livesText.onUpdate = function(){}
            livesText.reveal = function(){
              this.y = -this.height;
              this.visible = true
              this.game.add.tween(this).to( { y: 10 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }
            livesText.hide = function(){
              this.game.add.tween(this).to( { y: -100 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }


        // HEALTH TEXT
        let healthText = phaserTexts.add({name: 'healthText', group: 'ui', font: 'gem', size: 16, default: 'Planet', visible: false})
            phaserTexts.alignToBottomLeftCorner('healthText', 10)
            healthText.onUpdate = function(){}
            healthText.reveal = function(){
              this.x = -this.width;
              this.visible = true
              this.game.add.tween(this).to( { x: 25 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }
            healthText.hide = function(){
              this.game.add.tween(this).to( { x: -this.width }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }

        // DEBUGGER
        let debuggerText = phaserTexts.add({name: 'debuggerText', group: 'ui', font: 'gem', size: 16, default: 'Sprite count:', visible: false})
            phaserTexts.alignToBottomCenter('debuggerText', 10)
            debuggerText.onUpdate = function(){
              let count = [...phaserSprites.getGroup('trashes'), ...phaserSprites.getGroup('aliens')]
              debuggerText.setText(`Enemy count: ${count.length}`)
            }
            debuggerText.reveal = function(){
              this.y = this.game.canvas.height + this.height;
              this.visible = true
              this.game.add.tween(this).to( { y: this.game.canvas.height - this.height - 20 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }
            debuggerText.hide = function(){
              this.game.add.tween(this).to( { y: this.game.canvas.height + this.height }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            }

        // add texts to layers
        phaserGroup.addMany(9, [scoreText, livesText, debuggerText])

        // create healthbar
        let shape = phaserBitmapdata.addGradient({name: 'bmpHealthbar', group: 'ui', start: '#0000FF', end: '#33B5E5', width: 200, height: 20, render: false})
        let healthbar = phaserSprites.add({x: 5, y: game.canvas.height - 25, name: `healthbar`, group: 'ui', reference: shape.cacheBitmapData, visible: false})
            healthbar.scale.setTo(.5, 1)
            healthbar.onUpdate = function(){

            }
            healthbar.reveal = function(){
              this.x = -600
              this.visible = true
              this.game.add.tween(this).to( { x: 5 }, 1500, Phaser.Easing.Elastic.InOut, true, 0, 0, false);
            }
            healthbar.hide = function(){
              this.game.add.tween(this).to( { x: -600 }, 1500, Phaser.Easing.Elastic.InOut, true, 0, 0, false);
            }

        let shape2 = phaserBitmapdata.addGradient({name: 'bmpUnderbar', group: 'ui', start: '#2f3640', end: '#e84118', width: 200, height: 20, render: false})
        let underbar = phaserSprites.add({x: 5, y: game.canvas.height - 25, name: `underbar`, group: 'ui', reference: shape2.cacheBitmapData, visible: false})
            underbar.onUpdate = function(){

            }
            underbar.reveal = function(){
              this.x = -600
              this.visible = true
              this.game.add.tween(this).to( { x: 5 }, 1500, Phaser.Easing.Elastic.InOut, true, 0, 0, false);
            }
            underbar.hide = function(){
              this.game.add.tween(this).to( { x: -600 }, 1500, Phaser.Easing.Elastic.InOut, true, 0, 0, false);
            }
        phaserGroup.add(9, healthbar)
        phaserGroup.add(8, underbar)

      }
      /******************/

      /******************/
      function preloadComplete(){
        let game = phaserMaster.game();

        // create player
        let player = createPlayer();



        playSequence(['BEES?', '', '', 'NO!', 'RADIOACTIVE', 'KILLER', 'BEES'], ()=>{
          player.moveToStart();
          game.time.events.add(Phaser.Timer.SECOND*1.5, () => {
          playSequence([`${phaserMaster.get('roundTime')} SECONDS`, 'GO'], () => {

              phaserTexts.getGroup('timeKeeper').forEach((text) => {
                text.reveal();
              })

              game.time.events.add(Phaser.Timer.SECOND/2, () => {
                phaserTexts.getGroup('ui').forEach((text) => {
                  text.reveal()
                })

                phaserSprites.getGroup('ui').forEach((sprite) => {
                  sprite.reveal()
                })

              }).autoDestroy = true;

              // start clock
              phaserMaster.get('clock').start()
              // change state
              phaserMaster.changeState('READY');
            })
          })
        })

      }
      /******************/

      /******************/
      function playSequence(wordlist:Array<string>, callback:any){
        let game = phaserMaster.game();

          wordlist.forEach( (word, index) => {
            let splashText = phaserTexts.add({name: `splashText_${index}`, group: 'splash', font: 'gem', size: 18, default: word, visible: false})
                splashText.startSplash = function(){
                  this.visible = true;
                  this.scale.setTo(10, 10)
                  phaserTexts.alignToCenter(this.name)
                  game.add.tween(splashText.scale).to( { x:0.5, y:0.5}, 350, Phaser.Easing.Linear.In, true, 0);
                  game.add.tween(splashText).to( { x: this.game.world.centerX, y: this.game.world.centerY, alpha: 0.75}, 350, Phaser.Easing.Linear.In, true, 0)
                  setTimeout(() => {
                    phaserTexts.destroy(this.name)
                  }, 350)
                }
                game.time.events.add(Phaser.Timer.SECOND/2.5 * index, splashText.startSplash, splashText).autoDestroy = true;
          })

          game.time.events.add(Phaser.Timer.SECOND/2.5 * wordlist.length, callback, this).autoDestroy = true;

      }
      /******************/

      /******************/
      function createPlayer(){
        let game = phaserMaster.game();
        //  The hero!
        let player = phaserSprites.add({name: 'player', reference: 'player', visible: false})
            player.anchor.setTo(0.5, 0.5);
            player.scale.setTo(.5, .5)
            player.isInvincible = true;
            player.momentum = 0;
            game.physics.enable(player, Phaser.Physics.ARCADE);
            phaserGroup.add(8, player)

            player.moveToStart = function(){
              this.visible = true;
              this.x = this.game.world.centerX
              this.y = this.game.world.centerY + 550
              game.add.tween(this).to( { y: game.world.centerY + 200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
            }

            player.moveX = function(val:number){
              this.x += val
              this.checkLimits()
            }

            player.checkLimits = function(){
              if(this.x < 0){
                this.x = this.game.canvas.width + this.width
              }
              if(this.x > (this.game.canvas.width + this.width)){
                this.x = 0
              }
            }

            player.playEndSequence = function(callback:any){
              // scale and animate out!
              this.game.add.tween(this.scale).to( { x:2, y: 2 }, 1500, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
              this.game.add.tween(this).to( { x:this.game.world.centerX, y: this.game.world.centerY + 50 }, 1500, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  this.game.add.tween(this).to( { y: this.game.world.height + 200 }, 1500, Phaser.Easing.Exponential.InOut, true, 250, 0, false).
                    onComplete.add(() => {
                        this.game.add.tween(this).to( { y: -200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                          onComplete.add(() => {
                            callback()
                          }, this)
                    }, this)
                }, this)
            }


          return player;

      }
      /******************/

      /******************/
      function createAlien(options:any){
        let game = phaserMaster.game();

        let alien = phaserSprites.add({x: options.x, y: options.y, name: `alien_${game.rnd.integer()}`, group:'aliens', reference: 'invader', visible: true})
            alien.anchor.setTo(0.5, 0.5);
            alien.scale.setTo(1.5, 1.5);
            alien.animations.add('movement', [ 0, 1, 2, 3 ], 20, true);
            alien.play('movement')
            game.physics.enable(alien, Phaser.Physics.ARCADE);
            alien.body.velocity.y = options.iy
            alien.body.velocity.x = options.ix
            alien.angleMomentum = game.rnd.integerInRange(-5, 5)
            alien.body.bounce.setTo(1, 1);

            phaserGroup.add(3, alien)

            // damage it
            alien.damageIt = function(){
              let emitter = phaserMaster.get('emitter');
                  emitter.x = this.x;
                  emitter.y = this.y
                  emitter.start(true, 1500, null, 5);
              this.destroyIt()
            }



            alien.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            // destroy it
            alien.destroyIt = function(spawnMore = true){
                // add to score
                let score = phaserMaster.get('score');
                phaserMaster.forceLet('score', score += 100);
                let scoreText = phaserTexts.get('scoreText')
                    scoreText.updateScore();

                // animate it
                let tween = {
                  angle: game.rnd.integerInRange(-720, 720),
                  x: this.x - game.rnd.integerInRange(-25, 25),
                  y: this.y - game.rnd.integerInRange(5, 25),
                  alpha: .5
                }
                this.game.add.tween(this).to( tween, game.rnd.integerInRange(150, 500), Phaser.Easing.Linear.Out, true, 0, 0, false);
                this.body = null;

               // animate death and then explode
               game.time.events.add(Phaser.Timer.SECOND/2, () => {
                  createExplosion(this.x, this.y, 1)
                  if(spawnMore){
                   for(var i = 0; i < 5; i++){
                     createTrash({
                       x: this.x,
                       y: this.y,
                       ix: game.rnd.integerInRange(-100, 100),
                       iy: -game.rnd.integerInRange(20, 100)
                     })
                   }
                  }
                phaserSprites.destroy(this.name);
               }, this).autoDestroy = true;

            }

            alien.checkLocation = function(){
              this.angle += alien.angleMomentum
              if(this.angleMomentum > 0){
                this.angleMomentum -= 0.002
              }
              if(this.angleMomentum < 0){
                this.angleMomentum += 0.002
              }
              if(this.y > this.height){
                if(this.body !== null){
                  this.body.collideWorldBounds = true;
                }
              }
              if(this.y > this.game.canvas.height - 100){
                if(this.body !== null){
                  this.body.collideWorldBounds = false;
                }
              }
              if(this.y > this.game.canvas.height + this.height){
                this.removeIt();
              }
            }

            alien.onUpdate = function(){
              if(this.body !== null){
                if(this.body.velocity.y + 2 < 100){
                  this.body.velocity.y += 2
                }
                if(this.body.velocity.x > 0){
                  this.body.velocity.x -= 0.2
                }
                if(this.body.velocity.x < 0){
                  this.body.velocity.x += 0.2
                }
              }
              this.checkLocation();
            }
      }
      /******************/

      /******************/
      function createTrash(options:any){
        let game = phaserMaster.game();

        let trash = phaserSprites.add({x: options.x, y: options.y, name: `trash_${game.rnd.integer()}`, group:'trashes', reference: 'invader', visible: true})
            trash.anchor.setTo(0.5, 0.5);
            trash.scale.setTo(1, 1);
            trash.animations.add('movement', [ 0, 1, 2, 3 ], 20, true);
            trash.play('movement')
            game.physics.enable(trash, Phaser.Physics.ARCADE);
            trash.body.velocity.y = options.iy
            trash.body.velocity.x = options.ix
            trash.angleMomentum = game.rnd.integerInRange(-5, 5)
            trash.body.bounce.setTo(1, 1);

            phaserGroup.add(3, trash)

            // damage it
            trash.damageIt = function(){
              let emitter = phaserMaster.get('emitter');
                  emitter.x = this.x;
                  emitter.y = this.y
                  emitter.start(true, 1500, null, 5);
              this.destroyIt()
            }



            trash.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            // destroy it
            trash.destroyIt = function(){
                // add to score
                let score = phaserMaster.get('score');
                phaserMaster.forceLet('score', score += 25);
                let scoreText = phaserTexts.get('scoreText')
                    scoreText.updateScore();

                // animate it
                let tween = {
                  angle: game.rnd.integerInRange(-720, 720),
                  x: this.x - game.rnd.integerInRange(-25, 25),
                  y: this.y - game.rnd.integerInRange(5, 25),
                  alpha: .5
                }
                this.game.add.tween(this).to( tween, game.rnd.integerInRange(50, 200), Phaser.Easing.Linear.Out, true, 0, 0, false);
                this.body = null;

               // animate death and then explode
               game.time.events.add(Phaser.Timer.SECOND/3, () => {
                  createExplosion(this.x, this.y, 1)
                  phaserSprites.destroy(this.name);
               }, this).autoDestroy = true;
            }

            trash.checkLocation = function(){
              this.angle += trash.angleMomentum
              if(this.angleMomentum > 0){
                this.angleMomentum -= 0.002
              }
              if(this.angleMomentum < 0){
                this.angleMomentum += 0.002
              }
              if(this.y > this.height){
                if(this.body !== null){
                  this.body.collideWorldBounds = true;
                }
              }
              if(this.y > this.game.canvas.height - 100){
                if(this.body !== null){
                  this.body.collideWorldBounds = false;
                }
              }
              if(this.y > this.game.canvas.height + this.height){
                this.removeIt();
              }
            }

            trash.onUpdate = function(){
              if(this.body !== null){
                if(this.body.velocity.y + 2 < 100){
                  this.body.velocity.y += 2
                }
                if(this.body.velocity.x > 0){
                  this.body.velocity.x -= 0.2
                }
                if(this.body.velocity.x < 0){
                  this.body.velocity.x += 0.2
                }
              }
              this.checkLocation();
            }
      }
      /******************/

      /******************/
      function createBullet(x, y){
        let game = phaserMaster.game();
        let bulletCount = phaserSprites.getGroup('bullets').length;
        let bullet =  phaserSprites.add({x: x, y: y, name: `bullet_${game.rnd.integer()}`, group: 'bullets', reference: 'bullet'})
            game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.y = -100;
            phaserGroup.add(2, bullet)

            bullet.accelerate = function(){
              this.body.velocity.y -= 25;
            }

            bullet.destroyIt = function(){
              phaserSprites.destroy(this.name)
            }

            bullet.onUpdate = function(){
              // bullet speeds up
              this.accelerate();
              // destroy bullet
              if(this.y < 0){ this.destroyIt() }
              // check for bullet collision
              returnAllCollidables().forEach((target) => {
                target.game.physics.arcade.overlap(this, target, (bullet, target)=>{
                  bullet.destroyIt();
                  target.damageIt();
                }, null, this);
              })
           }
      }
      /******************/

      /******************/
      function createBomb(x, y){
        let game = phaserMaster.game();
        let bombCount = phaserSprites.getGroup('bombCount').length;
        let bomb =  phaserSprites.add({x: x, y: y, name: `bomb_${game.rnd.integer()}`, group: 'bombs', reference: 'bomb'})
            bomb.anchor.setTo(0.5, 0.5)
            bomb.scale.setTo(2, 2);
            game.physics.enable(bomb, Phaser.Physics.ARCADE);
            bomb.body.velocity.y = -400;
            phaserGroup.add(2, bomb)


            bomb.destroyIt = function(){
              createExplosion(this.x, this.y, 1.25)
              for(let i = 0; i < 25; i++){
                createBomblet({
                  x: this.x,
                  y: this.y,
                  ix: game.rnd.integerInRange(-400, 400),
                  iy: -game.rnd.integerInRange(-50, 400)
                })
              }
              phaserSprites.destroy(this.name)
            }


            bomb.onUpdate = function(){
              this.angle += 5;
              // bullet speeds up
              // destroy bullet
              if(this.y < 200){ this.destroyIt() }

              // check for bullet collision
              returnAllCollidables().forEach((target) => {
                target.game.physics.arcade.overlap(this, target, (bomb, target)=>{
                  bomb.destroyIt();
                  target.damageIt();
                }, null, this);
              })

           }
      }
      /******************/

      /******************/
      function createBomblet(options:any){
        let game = phaserMaster.game();
        let bombCount = phaserSprites.getGroup('bombCount').length;
        let bomblet =  phaserSprites.add({x: options.x, y: options.y, name: `bomblet_${game.rnd.integer()}`, group: 'bomblets', reference: 'bomb'})
            bomblet.anchor.setTo(0.5, 0.5)
            bomblet.scale.setTo(0.5, 0.5)
            game.physics.enable(bomblet, Phaser.Physics.ARCADE);
            bomblet.body.velocity.y = options.iy
            bomblet.body.velocity.x = options.ix
            bomblet.fuse = game.time.now;
            bomblet.detonate = game.time.now + game.rnd.integerInRange(1250, 1800)
            phaserGroup.add(2, bomblet)

            bomblet.destroyIt = function(){
              impactExplosion(this.x, this.y, 1)
              phaserSprites.destroy(this.name)
            }


            bomblet.onUpdate = function(){
              this.angle += 10;
              // detonate after 500 miliseconds
              if(this.game.time.now > bomblet.detonate){
                this.destroyIt();
              }
              // watch for collisions
              returnAllCollidables().forEach((target) => {
                target.game.physics.arcade.overlap(this, target, (bomb, target)=>{
                  bomblet.destroyIt();
                  target.damageIt();
                }, null, this);
              })

           }
      }
      /******************/

      /******************/
      function createExplosion(x, y, scale){
        let game = phaserMaster.game();
        let explosion = phaserSprites.add({name: `explosion_${game.rnd.integer()}`, group: 'explosions',  x: x, y: y, reference: 'kaboom'})
            explosion.scale.setTo(scale, scale)
            explosion.anchor.setTo(0.5, 0.5)
            explosion.animations.add('kaboom');
            explosion.play('kaboom', 30, false, true);
            phaserGroup.add(6, explosion)
            // destroy expolosion sprite
            game.time.events.add(Phaser.Timer.SECOND/2, () => {
              phaserSprites.destroy(explosion.name)
            }).autoDestroy = true;
      }
      /******************/

      /******************/
      function impactExplosion(x, y, scale){
        let game = phaserMaster.game();
        let impactExplosion = phaserSprites.add({name: `impactExplosion_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, reference: 'kaboom'})
            impactExplosion.scale.setTo(scale, scale)
            impactExplosion.anchor.setTo(0.5, 0.5)
            impactExplosion.animations.add('kaboom');
            impactExplosion.play('kaboom', 30, false, true);
            game.physics.enable(impactExplosion, Phaser.Physics.ARCADE);
            phaserGroup.add(6, impactExplosion)
            // destroy expolosion sprite
            game.time.events.add(Phaser.Timer.SECOND/2, () => {
              phaserSprites.destroy(impactExplosion.name)
            }).autoDestroy = true;

            impactExplosion.onUpdate = function(){
              // check for bullet collision
              returnAllCollidables().forEach((target) => {
                target.game.physics.arcade.overlap(this, target, (impactExplosion, target)=>{
                  target.damageIt();
                }, null, this);
              })

           }
      }
      /******************/

      /******************/
      function returnAllCollidables(){
        return [...  phaserSprites.getGroup('aliens'),   ...phaserSprites.getGroup('trashes')]
      }
      /******************/

      /******************/
      function pauseGame(){
        phaserMaster.get('clock').stop();
      }
      /******************/

      /******************/
      function unpauseGame(){
        phaserMaster.get('clock').start();
      }
      /******************/

      /******************/
      function update() {
        let game = phaserMaster.game();
        //let filter = phaserMaster.get('filter');
        //  filter.update();
        let player = phaserSprites.get('player')
        let debuggerText = phaserTexts.get('debuggerText')
            debuggerText.onUpdate()


        phaserSprites.getGroup('movingStarField').forEach(star => {
          star.onUpdate();
        })


        if(phaserMaster.checkState('READY')){

          // create a steady steam of aliens to shoot
          if( phaserSprites.getGroup('aliens').length < 5){
            createAlien({
              x: game.rnd.integerInRange(0, game.canvas.width),
              y: game.rnd.integerInRange(-50, -100),
              ix: game.rnd.integerInRange(-100, 100),
              iy: game.rnd.integerInRange(0, 150)
            });
          }

          phaserTexts.getGroup('timeKeeper').forEach((text) => {
            text.onUpdate();
          })

          // check bullet behavior
          phaserSprites.getGroup('bullets').forEach((bullet) => {
            bullet.onUpdate()
          })

          // check alient behavior
          phaserSprites.getGroup('aliens').forEach((alien) => {
            alien.onUpdate()
          })

          // check alient behavior
          phaserSprites.getGroup('trashes').forEach((trash) => {
            trash.onUpdate()
          })

          phaserSprites.getGroup('bombs').forEach((bomb) => {
            bomb.onUpdate()
          })

          phaserSprites.getGroup('bomblets').forEach((bomblet) => {
            bomblet.onUpdate()
          })

          phaserSprites.getGroup('impactExplosions').forEach((impactExplosion) => {
            impactExplosion.onUpdate()
          })

          // player controls
          if(phaserControls.read('RIGHT').active){
            player.moveX(5)
          }
          if(phaserControls.read('LEFT').active){
            player.moveX(-5)
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 500 - (phaserControls.read('A').state * 75) })){
            createBullet(player.x, player.y)
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'B', delay: 500 - (phaserControls.read('B').state * 75) })){
            createBomb(player.x, player.y)
          }
        }

      }
      /******************/

      /******************/
      function endLevel(){
        phaserMaster.changeState('ENDLEVEL');

        // hide UI text
        phaserTexts.getGroup('ui').forEach((text) => {
          text.hide();
        })

        // hide UI sprites
        phaserSprites.getGroup('ui').forEach((sprite) => {
          sprite.hide();
        })

        // hide time
        phaserTexts.getGroup('timeKeeper').forEach((text) => {
          text.hide();
        })

        // initiate player end sequence
        phaserSprites.get('player').playEndSequence(() => {



          // destroy all aliens
          phaserSprites.getGroup('aliens').forEach((alien) => {
            alien.destroyIt(false)
          })

          // destroy all trash
          phaserSprites.getGroup('trashes').forEach((trash) => {
            trash.destroyIt(false)
          })

        });

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

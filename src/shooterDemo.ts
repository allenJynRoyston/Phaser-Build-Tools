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
        game.load.image('enemyBullet', 'src/assets/game/demo1/images/enemy-bullet.png');
        game.load.spritesheet('invader', 'src/assets/game/demo1/images/invader32x32x4.png', 32, 32);
        game.load.image('player', 'src/assets/game/demo1/images/ship.png');
        game.load.spritesheet('kaboom', 'src/assets/game/demo1/images/explode.png', 128, 128);
        game.load.image('starfield', 'src/assets/game/demo1/images/starfield.png');
        game.load.image('background', 'src/assets/game/demo1/images/starfield.png');
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

        game.physics.startSystem(Phaser.Physics.ARCADE);

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

        // game variables
        phaserMaster.let('score', 0)

        // particles
        let particlesSprite = phaserBmd.addGradient({name: 'blockBmp', group: 'particles', start: '#fff000', end: '#ffffff', width: 2, height: 2, render: false})
        let emitter = phaserMaster.let('emitter', game.add.emitter(game, 0, 0, 100))
            emitter.makeParticles(particlesSprite);
            emitter.alpha = 0.5
            emitter.gravity = 0;
            phaserGroup.layer(1).add(emitter)

        // stars
        let stars = phaserBmd.addGradient({name: 'starBmp', group: 'blockBmpGroup', start: '#ffffff', end: '#ffffff', width: 1, height: 1, render: false})
        for (var i = 0; i < 100; i++){
            let star = phaserSprites.add({name: `star_${i}`, group: 'movingStarField', x: game.rnd.integerInRange(0, game.world.width), y:game.rnd.integerInRange(0, game.world.height), reference: stars})
                star.starType = game.rnd.integerInRange(1, 3);
                star.scale.setTo(star.starType, star.starType);
                star.onUpdate = function(){
                  let momentum = 10 - (this.starType * 3)
                  if(this.y  > this.game.world.height){
                    this.y = 10
                  }
                  this.y += momentum
                }
                phaserGroup.layer(0).add(star)
        }

        //  Texts
        let scoreText = phaserTexts.add({name: 'scoreText', group: 'topbar', x:10, y:10,  font: 'gem', size: 18, default: `Score: ${phaserMaster.get('score')}`, visible: false})
            scoreText.updateScore = function(){
              this.setText(`Score: ${phaserMaster.get('score')}`)
            }
        let livesText = phaserTexts.add({name: 'livesText', group: 'topbar', x:game.world.width - 100, y:10,  font: 'gem', size: 18, default: 'Lives', visible: false})
        let subText = phaserTexts.add({name: 'subText', group: 'mission', y:game.world.centerY - 50,  font: 'gem', size: 18, default: 'Sub text', visible: false})
            phaserTexts.center('subText', 0, 50)
        let debuggerText = phaserTexts.add({name: 'debuggerText', font: 'gem', size: 16, default: 'Sprite count: '})
            phaserTexts.alignToBottomCenter('debuggerText', 10)
        let healthText = phaserTexts.add({name: 'healthText', font: 'gem', size: 16, default: 'Heaalth'})
            phaserTexts.alignToBottomLeftCorner('healthText', 10)
        phaserGroup.addMany(9, [scoreText, livesText, subText, debuggerText])

        // create healthbar
        let shape = phaserBitmapdata.addGradient({name: 'bmpHealthbar', group: 'g1', start: '#0000FF', end: '#33B5E5', width: 200, height: 20, render: false})
        let healthbar = phaserSprites.add({x: 5, y: game.canvas.height - 25, name: `healthbar`, group: 'ui', reference: shape.cacheBitmapData, visible: false})
            healthbar.scale.setTo(.5, 1)

        let shape2 = phaserBitmapdata.addGradient({name: 'bmpUnderbar', group: 'g1', start: '#2f3640', end: '#e84118', width: 200, height: 20, render: false})
        let underbar = phaserSprites.add({x: 5, y: game.canvas.height - 25, name: `underbar`, group: 'ui', reference: shape2.cacheBitmapData, visible: false})

        phaserGroup.add(9, healthbar)
        phaserGroup.add(8, underbar)

      }
      /******************/

      /******************/
      function preloadComplete(){
        let game = phaserMaster.game();

        // create player
        let player = createPlayer();


        playSequence(['SAVE', 'THE', 'WORLD'], ()=>{

          player.moveToStart();
          // create first wave of enemies
          for(var i = 0; i < 5; i++){
            createAlien({
              x: game.rnd.integerInRange(50, game.canvas.width -50),
              y: game.rnd.integerInRange(-50, -200),
              ix: game.rnd.integerInRange(-100, 100),
              iy: game.rnd.integerInRange(0, 100)
            });
          }

          game.time.events.add(Phaser.Timer.SECOND*1, () => {
            phaserTexts.getGroup('topbar').forEach((text) => {
              text.y = -text.height;
              text.visible = true
              game.add.tween(text).to( { y: 10 }, 1000, Phaser.Easing.Back.InOut, true, 0, 0, false);
            })

            phaserSprites.getGroup('ui').forEach((sprite) => {
              sprite.x = -600
              sprite.visible = true
              game.add.tween(sprite).to( { x: 5 }, 1500, Phaser.Easing.Elastic.InOut, true, 0, 0, false);
            })

          }).autoDestroy = true;
        })


        // change state
        phaserMaster.changeState('READY');

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
              game.add.tween(player).to( { y: game.world.centerY + 200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
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

              let explosion = phaserSprites.add({name: `exp_${game.rnd.integer()}`, group: 'enemy_explosions',  x: this.x - this.width/2, y: this.y - this.height/2, reference: 'kaboom'})
                  explosion.scale.setTo(0.5, 0.5)
                  explosion.animations.add('kaboom');
                  explosion.play('kaboom', 30, false, true);
                  phaserGroup.add(6, explosion)
                  // destroy expolosion sprite
                  game.time.events.add(Phaser.Timer.SECOND/2, () => {
                    phaserSprites.destroy(explosion.name)
                  }).autoDestroy = true;

              this.destroyIt()
            }



            alien.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            // destroy it
            alien.destroyIt = function(){
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
                 let explosion = phaserSprites.add({name: `exp_${game.rnd.integer()}`, group: 'enemy_explosions',  x: this.x - this.width/2, y: this.y - this.height/2, reference: 'kaboom'})
                     explosion.scale.setTo(0.5, 0.5)
                     explosion.animations.add('kaboom');
                     explosion.play('kaboom', 30, false, true);
                     phaserGroup.add(7, explosion)

                     for(var i = 0; i < 3; i++){
                       createAlien({
                         x: this.x,
                         y: this.y,
                         ix: game.rnd.integerInRange(-100, 100),
                         iy: -game.rnd.integerInRange(20, 100)
                       })
                    }

                     // destroy expolosion sprite
                     game.time.events.add(Phaser.Timer.SECOND/2, () => {
                       phaserSprites.destroy(explosion.name)
                     })
                  phaserSprites.destroy(this.name);
               }, this).autoDestroy = true;
            }

            alien.pause = function(){
              if(this.body !== null){
                this.body.velocity.currentX = this.body.velocity.x
                this.body.velocity.x = 0;
                this.body.velocity.currentY = this.body.velocity.y
                this.body.velocity.y = 0;
              }
            }

            alien.unpause = function(){
              if(this.body !== null){
                this.body.velocity.y = this.body.velocity.currentY
                this.body.velocity.x = this.body.velocity.currentX
              }
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

            bullet.pause = function(){
              if(this.body !== null){
                this.body.velocity.currentX = this.body.velocity.x
                this.body.velocity.x = 0;
                this.body.velocity.currentY = this.body.velocity.y
                this.body.velocity.y = 0;
              }
            }

            bullet.unpause = function(){
              if(this.body !== null){
                this.body.velocity.y = this.body.velocity.currentY
                this.body.velocity.x = this.body.velocity.currentX
              }
            }

            bullet.onUpdate = function(){
              // bullet speeds up
              this.accelerate();
              // destroy bullet
              if(this.y < 0){ this.destroyIt() }
              // check for bullet collision
              phaserSprites.getGroup('aliens').forEach((alien) => {
                alien.game.physics.arcade.overlap(this, alien, (bullet, alien)=>{
                  bullet.destroyIt();
                  alien.damageIt();
                }, null, this);
              })
           }
      }
      /******************/


      /******************/
      function update() {
        let game = phaserMaster.game();
        let filter = phaserMaster.get('filter');
        let player = phaserSprites.get('player')
        let debuggerText = phaserTexts.get('debuggerText')
            debuggerText.setText(`Sprite count: ${phaserSprites.getAll("ARRAY").length}`)


            filter.update();

        phaserSprites.getGroup('movingStarField').forEach(star => {
          star.onUpdate();
        })


        if(phaserMaster.checkState('READY')){

          // create a steady steam of aliens to shoot
          if( phaserSprites.getGroup('aliens').length < 3){
            createAlien({
              x: game.rnd.integerInRange(50, game.canvas.width -50),
              y: game.rnd.integerInRange(-200, -game.canvas.height),
              ix: game.rnd.integerInRange(-100, 100),
              iy: game.rnd.integerInRange(0, 100)
            });
          }


          // check alient behavior
          phaserSprites.getGroup('aliens').forEach((alien) => {
            alien.onUpdate()
          })

          // check bullet behavior
          phaserSprites.getGroup('bullets').forEach((bullet) => {
            bullet.onUpdate()
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

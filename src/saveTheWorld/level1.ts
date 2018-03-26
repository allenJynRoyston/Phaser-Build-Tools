declare var Phaser:any;

// imports must be added in gulpFile as well
//removeIf(gameBuild)
import {PHASER_MASTER} from './../exports/master'
import {PHASER_CONTROLS} from './../exports/controller'
import {PHASER_MOUSE} from './../exports/mouse'
import {PHASER_AUDIO} from './../exports/audio'
import {PHASER_PRELOADER} from './../exports/preloader'
import {PHASER_SPRITE_MANAGER} from './../exports/spriteManager'
import {PHASER_TEXT_MANAGER} from './../exports/textManager'
import {PHASER_BUTTON_MANAGER} from './../exports/buttonManager'
import {PHASER_BITMAPDATA_MANAGER} from './../exports/bitmapdataManager'
import {PHASER_GROUP_MANAGER} from './../exports/groupManager'

import {WEAPON_MANAGER} from './required/weaponManager'
import {ENEMY_MANAGER} from './required/enemyManager'
import {PLAYER_MANAGER} from './required/playerManager'
import {UTILITY_MANAGER} from './required/utilityManager'
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
      let game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update});
          game.preserveDrawingBuffer = true;
      const phaserMaster = new PHASER_MASTER({game: game, resolution: {width: options.width, height: options.height}}),
            phaserControls = new PHASER_CONTROLS(),
            phaserMouse = new PHASER_MOUSE({showDebugger: false}),
            phaserSprites = new PHASER_SPRITE_MANAGER(),
            phaserBmd = new PHASER_BITMAPDATA_MANAGER(),
            phaserTexts = new PHASER_TEXT_MANAGER(),
            phaserButtons = new PHASER_BUTTON_MANAGER(),
            phaserGroup = new PHASER_GROUP_MANAGER(),
            phaserBitmapdata = new PHASER_BITMAPDATA_MANAGER(),
            weaponManager = new WEAPON_MANAGER(),
            enemyManager = new ENEMY_MANAGER(),
            playerManager = new PLAYER_MANAGER(),
            utilityManager = new UTILITY_MANAGER();

      const store = options.store;
      let gameDataCopy = JSON.stringify(store.getters._gameData());
      phaserMaster.let('gameData', JSON.parse(gameDataCopy))
      /******************/

      /******************/
      function saveData(prop:string, value:any){
        let gameData = phaserMaster.get('gameData')
          gameData[prop] = value;
      }

      /******************/
      function updateStore(){
        // save all data to store
        let gameData = phaserMaster.get('gameData')
        store.commit('setGamedata', gameData)
      }
      /******************/

      /******************/
      function preload(){
        let game = phaserMaster.game();
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        let folder = 'src/phaser/saveTheWorld/resources'
        game.load.image('background', `${folder}/images/starfield.png`);
        //game.load.atlas('atlas', `${folder}/spritesheets/heroSelect/heroSelectAtlas.png`, `${folder}/spritesheets/heroSelect/heroSelectAtlas.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

        game.load.atlas('atlas_main', `${folder}/spritesheets/main/main.png`, `${folder}/spritesheets/main/main.json`, Phaser.Loader.TEXTURE_atlas_main_JSON_HASH);
        game.load.atlas('atlas_weapons', `${folder}/spritesheets/weapons/weaponsAtlas.png`, `${folder}/spritesheets/weapons/weaponsAtlas.json`, Phaser.Loader.TEXTURE_atlas_main_JSON_HASH);
        game.load.atlas('atlas_large', `${folder}/spritesheets/large/large.png`, `${folder}/spritesheets/large/large.json`, Phaser.Loader.TEXTURE_atlas_main_JSON_HASH);

        // load music into buffer
        // game.load.audio('music-main', ['src/assets/game/demo1/music/zombies-in-space.ogg']);
        // game.load.audio('powerupfx', ['src/assets/game/demo1/sound/Powerup4.ogg']);
        // game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);
        // game.load.audio('smallExplosion', ['src/assets/game/demo1/sound/quietExplosion.ogg'])
        // game.load.audio('bigExplosion', ['src/assets/game/demo1/sound/Explosion3.ogg'])
        // game.load.audio('laser', ['src/assets/game/demo1/sound/Laser_Shoot78.ogg'])
        // game.load.audio('hit', ['src/assets/game/demo1/sound/Hit_Hurt11.ogg'])

        // json
        game.load.json('weaponData', `${folder}/json/weaponData.json`);

        // font
        game.load.bitmapFont('gem', `${folder}/fonts/gem.png`, `${folder}/fonts/gem.xml`);

        // change state
        phaserMaster.changeState('PRELOAD')

        // send to preloader class
        new PHASER_PRELOADER({game: game, delayInSeconds: 0, done: () => {preloadComplete()}})
      }
      /******************/

      /******************/
      function tweenTint(obj, startColor, endColor, time) {    // create an object to tween with our step value at 0
        let game = phaserMaster.game();
        let colorBlend = {step: 0};    // create the tween on this object and tween its step property to 100
        let colorTween = game.add.tween(colorBlend).to({step: 100}, time);
         // run the interpolateColor function every time the tween updates, feeding it the
         // updated value of our tween each time, and set the result as our tint
         colorTween.onUpdateCallback(() => {
           obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
         });
         // set the object to the start color straight away
         obj.tint = startColor;
          // start the tween
         colorTween.start();
      }

      /******************/

      /******************/
      function create(){
        let game = phaserMaster.game();
        let gameData = phaserMaster.get('gameData')
            game.physics.startSystem(Phaser.Physics.ARCADE);

        // assign game to classes
        phaserControls.assign(game)
        phaserMouse.assign(game)
        phaserSprites.assign(game)
        phaserBmd.assign(game)
        phaserTexts.assign(game)
        phaserButtons.assign(game)
        phaserGroup.assign(game, 20)
        phaserBitmapdata.assign(game)
        weaponManager.assign(game, phaserMaster, phaserSprites, phaserGroup, 'atlas_weapons')
        enemyManager.assign(game, phaserMaster, phaserSprites, phaserTexts, phaserGroup, weaponManager, 'atlas_main')
        playerManager.assign(game, phaserMaster, phaserSprites, phaserTexts, phaserGroup, phaserControls, weaponManager, 'atlas_main')
        utilityManager.assign(game, phaserSprites, phaserBitmapdata, phaserGroup, 'atlas_main')

        // game variables
        phaserMaster.let('roundTime', 2)
        phaserMaster.let('clock', game.time.create(false))
        phaserMaster.let('elapsedTime', 0)
        phaserMaster.let('devMode', false)
        phaserMaster.let('starMomentum', {x: 0, y:0})
        phaserMaster.let('pauseStatus', false)

        // weapon data
        let weaponData = phaserMaster.let('weaponData', game.cache.getJSON('weaponData'));
        let pw = phaserMaster.let('primaryWeapon', weaponData.primaryWeapons[gameData.primaryWeapon])
        let sw = phaserMaster.let('secondaryWeapon', weaponData.secondaryWeapons[gameData.secondaryWeapon])

        // pause behavior
        game.onPause.add(() => {
          pauseGame()
        }, this);
        game.onResume.add(() => {
          unpauseGame();
        }, this);

        // animate in
        utilityManager.buildOverlayBackground('#ffffff', '#ffffff', 19, true)
        utilityManager.buildOverlayGrid(80, 20, 'landmine.png')

        // create boundry
        let boundryObj = phaserBitmapdata.addGradient({name: 'boundryObj', start: '#ffffff', end: '#ffffff', width: 5, height: 5, render: false})
        let leftBoundry = phaserSprites.add({x: -9, y: -game.world.height/2, name: `leftBoundry`, group: 'boundries', width:10, height: game.world.height*2, reference: boundryObj.cacheBitmapData, alpha: 0})
        let rightBoundry = phaserSprites.add({x: game.world.width - 1, y: -game.world.height/2, name: `rightBoundry`, group: 'boundries', width:10, height: game.world.height*2, reference: boundryObj.cacheBitmapData, alpha: 0})
        game.physics.enable([leftBoundry,rightBoundry], Phaser.Physics.ARCADE);
        leftBoundry.body.immovable = true;
        rightBoundry.body.immovable = true;

        let background = phaserSprites.addTilespriteFromAtlas({ name: 'background', group: 'spaceGroup', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'spacebg.png' });
            background.count = 0;
            background.onUpdate = function () {
                this.count += 0.005;
                this.tilePosition.y -= Math.sin(this.count) * 0.2;
            };
        phaserGroup.add(0, background)

        // particles (from atlas)
        let emitter = phaserMaster.let('emitter', game.add.emitter(game, 0, 0, 5000))
            emitter.makeParticles('atlas_main', 'particle.png');
            emitter.gravity = 0;
            phaserGroup.layer(1).add(emitter)

        // stars
        //let stars = phaserBmd.addGradient({name: 'starBmp', group: 'blockBmpGroup', start: '#ffffff', end: '#ffffff', width: 1, height: 1, render: false})
        for (let i = 0; i < 25; i++){
            let star = phaserSprites.addFromAtlas({x: game.rnd.integerInRange(0, game.world.width), y:game.rnd.integerInRange(0, game.world.height), name: `star_${i}`, group: 'movingStarField', filename: `stars_layer_${game.rnd.integerInRange(1, 3)}.png`, atlas: 'atlas_main', visible: true})
                star.starType = game.rnd.integerInRange(1, 3);
                star.scale.setTo(star.starType/2, star.starType/2);
                star.onUpdate = function(){
                  let baseMomentum = 0.25 + (3 - star.starType)*5
                  let starMomentum = phaserMaster.get('starMomentum')
                  if(this.y  > this.game.world.height){
                    this.y = 10
                    this.x = game.rnd.integerInRange(-100, game.world.width)
                  }
                  if(this.x  > this.game.world.width){
                    this.x = 0
                  }
                  if(this.x  < 0){
                    this.x = this.game.world.width
                  }

                  if(starMomentum.x > 0){
                    starMomentum.x -= 0.05
                  }
                  if(starMomentum.x < 0){
                    starMomentum.x += 0.05
                  }
                  if(starMomentum.y > 0){
                    starMomentum.y -= 0.05
                  }
                  if(starMomentum.y < 0){
                    starMomentum.y += 0.05
                  }

                  this.x += (3 - star.starType)*starMomentum.x
                  this.y += (baseMomentum + ((3 - star.starType)*starMomentum.y))
                }
                star.fadeOut = function(){
                  this.game.add.tween(this).to( { alpha: 0 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).autoDestroy = true;
                }
                phaserGroup.layer(4 - star.starType).add(star)
        }

        let nebula1 = phaserSprites.addTilespriteFromAtlas({ name: 'nebula1', group: 'spaceGroup', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'Nebula1.png' });
            nebula1.count = 0;
            nebula1.onUpdate = function () {
                this.count += 0.005;
                this.tilePosition.x -= Math.sin(this.count) * 0.2;
            };

        let nebula2 = phaserSprites.addTilespriteFromAtlas({ name: 'nebula2', group: 'spaceGroup', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'Nebula2.png' });
            nebula2.count = 0;
            nebula2.onUpdate = function () {
                this.count += 0.005;
                this.tilePosition.y += 0.2
                this.tilePosition.x += 0.2
            };

        let earth = phaserSprites.addFromAtlas({x: this.game.world.centerX, y: this.game.canvas.height + 400, name: `earth`, group: 'spaceGroup', filename: 'earth.png', atlas: 'atlas_main', visible: true})
            earth.scale.setTo(2, 2)
            earth.anchor.setTo(0.5, 0.5)
            earth.onUpdate = function(){
              earth.angle +=0.01
            }
            earth.fadeOut = function(){
              this.game.add.tween(this).to( { y: this.y - 200 }, Phaser.Timer.SECOND*1, Phaser.Easing.Circular.In, true, 0, 0, false).autoDestroy = true;
              this.game.add.tween(this.scale).to( { x:2.5, y: 2.5 }, Phaser.Timer.SECOND*1, Phaser.Easing.Circular.In, true, 0, 0, false).autoDestroy = true;
            }
            earth.selfDestruct = function(){
              tweenTint(this, this.tint, 1*0xff0000, Phaser.Timer.SECOND*20);
              setTimeout(() => {
                this.tint = 1*0xff0000
              }, Phaser.Timer.SECOND*20+1)
              let endExplosion = setInterval(() => {
                  weaponManager.createExplosion(game.rnd.integerInRange(0, this.game.canvas.width), game.rnd.integerInRange(this.game.canvas.height - 200, this.game.canvas.height), 0.25, 6)
              }, 100)
              phaserMaster.let('endExplosion', endExplosion)
            }

            phaserGroup.addMany(2, [earth])
            phaserGroup.addMany(1, [nebula1, nebula2])


        //  UI
        let timeContainer = phaserSprites.addFromAtlas({name: `timerContainer`, group: 'ui', filename: 'ui_container1.png', atlas: 'atlas_main', visible: false})
            phaserSprites.centerOnPoint('timerContainer', this.game.world.centerX, -200)
            timeContainer.reveal = function(){
              this.visible = true
              this.game.add.tween(this).to( { y: 5 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  let timeKeeper = phaserTexts.add({y: 36, x: this.game.world.centerX, name: 'timeKeeper', group: 'ui_text', font: 'gem', size: 42, default: `00`, visible: false})
                      timeKeeper.anchor.setTo(0.5, 0.5)
                      timeKeeper.reveal = function(){
                        this.visible = true
                        this.alpha = 0
                        this.game.add.tween(this).to( { alpha: 1 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
                        phaserGroup.add(15, this)
                      }
                      timeKeeper.onUpdate = function(){
                        let {currentState} = phaserMaster.getState()
                        let {elapsedTime, clock, roundTime} = phaserMaster.getOnly(['elapsedTime', 'clock', 'roundTime']);
                        elapsedTime += (clock.elapsed * .001);
                        phaserMaster.forceLet('elapsedTime', elapsedTime);
                        let inSeconds = parseInt((roundTime - elapsedTime).toFixed(0))
                        if(inSeconds >= 0){
                             this.setText(`${inSeconds}`)
                        }
                        else{

                          if(phaserSprites.getGroup('boss').length === 0 && currentState === 'READY'){
                            phaserSprites.get('timerContainer').hide();
                            this.hide()
                            setTimeout(() => {
                              bossContainer.reveal();
                            }, 500)
                            createBoss({
                              x: game.rnd.integerInRange(100, game.canvas.width - 100),
                              y: game.rnd.integerInRange(-50, -100),
                              ix: game.rnd.integerInRange(-100, 100),
                              iy: 5,
                              layer: 4
                            });
                          }
                        }
                      }
                      timeKeeper.hide = function(){
                        this.game.add.tween(this).to( { alpha: 0 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.Out, true, 0, 0, false);
                      }
                      timeKeeper.reveal();
                })


            }
            timeContainer.hide = function(){
              this.game.add.tween(this).to( { y: -200 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
              phaserTexts.get('timeKeeper').hide();
            }

        let scoreContainer = phaserSprites.addFromAtlas({name: `scoreContainer`, group: 'ui', filename: 'ui_roundContainer.png', atlas: 'atlas_main', visible: false})
            scoreContainer.anchor.setTo(0.5, 0.5)
            scoreContainer.reveal = function(){
              this.x = this.game.world.width - this.width/2 - 10
              this.y = -200
              this.visible = true
              this.game.add.tween(this).to( { y: 20 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  scoreText.reveal(this.x, this.y);
                })
            }
            scoreContainer.hide = function(){
              this.game.add.tween(this).to( { y: -200 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
              phaserTexts.get('scoreText').hide();
            }

        let scoreText = phaserTexts.add({name: 'scoreText', group: 'ui_text', font: 'gem', size: 14, default: `${gameData.score}`, alpha: 0})
            scoreText.anchor.setTo(0.5, 0.5)
            scoreText.onUpdate = function(){}
            scoreText.updateScore = function(){
              this.setText(`${phaserMaster.get('gameData').score}`)
            }
            scoreText.reveal = function(x:number, y:number){
              this.x = scoreContainer.x
              this.y = scoreContainer.y
              this.game.add.tween(this).to( { alpha: 1 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
            }
            scoreText.hide = function(){
              this.game.add.tween(this).to( { alpha: 0 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
            }


        let statusContainer = phaserSprites.addFromAtlas({name: `statusContainer`, group: 'ui', filename: 'ui_statusContainer.png', atlas: 'atlas_main', visible: false})
            statusContainer.reveal = function(){
              this.x = -this.width;
              this.y = this.game.world.height - this.height - 10
              this.visible = true
              this.game.add.tween(this).to( { x: 10 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  let healthBar = phaserSprites.addFromAtlas({x: statusContainer.x + 7, y: statusContainer.y + 22, name: `healthBar`, group: 'ui_overlay', filename: 'ui_shieldBar.png', atlas: 'atlas_main', visible: true})
                  let maskhealth = phaserMaster.let('healthBar', phaserSprites.addBasicMaskToSprite(healthBar))
                      maskhealth.y = healthBar.height
                      updateShipHealthbar(gameData.player.health)

                  let specialBar = phaserSprites.addFromAtlas({x: statusContainer.x + 30, y: statusContainer.y + 206, name: `specialBar`, group: 'ui_overlay', filename: 'ui_specialBar.png', atlas: 'atlas_main', visible: true})
                  let maskspecial = phaserMaster.let('specialBar', phaserSprites.addBasicMaskToSprite(specialBar))
                      maskspecial.y = specialBar.height;
                      updateShipSpecial(100)

                  let specialWeapon = phaserSprites.addFromAtlas({x: statusContainer.x + 36, y: statusContainer.y + 305, name: `specialWeapon`, group: 'ui_overlay', filename: `${sw.spriteIcon}`, atlas: 'atlas_weapons', visible: false})
                      specialWeapon.anchor.setTo(0.5, 0.5)
                      specialWeapon.onUpdate = function(){
                        this.angle += 2
                      }
                      specialWeapon.reveal= function(){
                        this.visible = true
                        specialWeapon.scale.setTo(2, 2)
                        this.game.add.tween(this.scale).to( { x: 1.5, y:1.5 }, Phaser.Timer.SECOND, Phaser.Easing.Bounce.Out, true, 0, 0, false);
                      }
                      specialWeapon.hide= function(){
                        this.visible = false;
                      }
                      specialWeapon.reveal()
                      phaserGroup.addMany(14, [healthBar, specialBar, specialWeapon])
                })
            }
            statusContainer.hide = function(){
              updateShipSpecial(0)
              updateShipHealthbar(0)
              phaserSprites.getGroup('ui_overlay').map((obj) => {
                obj.hide();
              })
              this.game.add.tween(this).to( { y: this.game.world.height + this.height }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
            }

        let earthContainer = phaserSprites.addFromAtlas({name: `earthContainer`, group: 'ui', filename: 'ui_shield.png', atlas: 'atlas_main', visible: false})
            earthContainer.reveal = function(){
              this.x = this.game.world.width + this.width;
              this.y = this.game.world.height - this.height - 10
              this.visible = true
              this.game.add.tween(this).to( { x: this.game.world.width - this.width - 10 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  this.defaultPosition.x = this.x
                  this.defaultPosition.y = this.y

                  let earthBar = phaserSprites.addFromAtlas({x: earthContainer.x + 5, y: earthContainer.y + 5, name: `earthBar`, group: 'ui_overlay', filename: 'ui_healthBar.png', atlas: 'atlas_main', visible: true})
                  let maskhealth = phaserMaster.let('earthBar', phaserSprites.addBasicMaskToSprite(earthBar))
                      maskhealth.x = -earthBar.width;
                  let population = gameData.population
                  let damageTaken = 100 - ((population.killed/population.total) * 100)
                  updateEarthbar(damageTaken)
                })
            }
            earthContainer.hide = function(){
              updateEarthbar(0)
              this.game.add.tween(this).to( { y: this.game.world.height + this.height }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
            }
            earthContainer.takeDamage = function(){
              this.game.add.tween(this).to( { x: this.defaultPosition.x - 5 }, 50, Phaser.Easing.Bounce.In, true, 0, 0, false).
                onComplete.add(() => {
                  this.game.add.tween(this).to( { x: this.defaultPosition.x + 3 }, 50, Phaser.Easing.Bounce.Out, true, 0, 0, false)
                    .onComplete.add(() => {
                      this.game.add.tween(this).to( { x: this.defaultPosition.x }, 50, Phaser.Easing.Bounce.InOut, true, 0, 0, false)
                    })
                })
            }

        let bossContainer = phaserSprites.addFromAtlas({name: `bossContainer`, group: 'bosshealth', filename: 'ui_shield.png', atlas: 'atlas_main', visible: false})
            bossContainer.anchor.setTo(0.5, 0.5)
            bossContainer.reveal = function(){
              this.x = this.game.world.centerX ;
              this.y = -this.height;
              this.visible = true
              this.game.add.tween(this).to( { y: 20 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  this.defaultPosition.x = this.x
                  this.defaultPosition.y = this.y

                  let bossBar = phaserSprites.addFromAtlas({x: bossContainer.x - bossContainer.width/2 + 5, y: bossContainer.y - bossContainer.height/2 + 5, name: `bossBar`, group: 'bosshealth', filename: 'ui_BossHealthBar.png', atlas: 'atlas_main', visible: true})
                  let maskhealth = phaserMaster.let('bossBar', phaserSprites.addBasicMaskToSprite(bossBar))
                      maskhealth.x = -bossBar.width;
                  updateBossBar(100)
                })
            }
            bossContainer.hide = function(){
              updateBossBar(0)
              this.game.add.tween(this).to( { y: -this.height  }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
            }


          let portraitContainer = phaserSprites.addFromAtlas({x: 10, name: `portraitContainer`, group: 'ui', filename: 'ui_portraitContainer.png', atlas: 'atlas_main', visible: false})
              portraitContainer.reveal = function(){
                this.y = -this.height - 10
                this.visible = true
                this.game.add.tween(this).to( { y: 10 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                  onComplete.add(() => {
                    let characterPortrait = phaserSprites.addFromAtlas({x: this.x + 2, y: this.y + 2, name: `characterPortrait`, group: 'ui_overlay', filename: 'ui_portrait_1.png', atlas: 'atlas_main', alpha: 0})
                    characterPortrait.reveal = function(){
                      this.game.add.tween(this).to( { alpha: 1}, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false)
                    }
                    characterPortrait.hide = function(){
                      this.game.add.tween(this).to( { alpha: 0}, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false)
                    }
                    characterPortrait.reveal();


                    for(let i = 0; i < gameData.player.lives; i++){
                      let lifeIcon = phaserSprites.addFromAtlas({x: this.x + 12 + (i*20), y: this.y + this.height + 10, name: `lifeIcon_${i}`, group: 'ui_overlay', filename: 'ship_icon.png', atlas: 'atlas_main', alpha: 0})
                      lifeIcon.anchor.setTo(0.5, 0.5)
                      lifeIcon.reveal = function(){
                        this.game.add.tween(this).to( { alpha: 1}, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false)
                      }
                      lifeIcon.hide = function(){
                        this.game.add.tween(this).to( { alpha: 0}, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false)
                      }
                      lifeIcon.destroyIt = function(){
                        phaserSprites.destroy(this.name)
                      }
                      lifeIcon.reveal()
                    }



                    phaserGroup.addMany(12, [characterPortrait])
                  })
              }
              portraitContainer.hide = function(){
                this.game.add.tween(this).to( { y: -this.height }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
              }


              // BUILD MENU BUTTONS
              let menuButton1 = phaserSprites.addFromAtlas({ name: `menuButton1`, group: 'ui_buttons', x: game.world.centerX, y: game.world.centerY + 125, atlas: 'atlas_main', filename: 'ui_button.png', visible: false });
                  menuButton1.anchor.setTo(0.5, 0.5)
                  menuButton1.reveal = function(){
                    this.visible = true;
                  }
              let menuButton1Text = phaserTexts.add({name: 'menuButton1Text', group: 'ui',  font: 'gem', x: menuButton1.x, y: menuButton1.y,  size: 14, default: ``})
                  menuButton1Text.anchor.setTo(0.5, 0.5)


              let menuButton2 = phaserSprites.addFromAtlas({ name: `menuButton2`, group: 'ui_buttons', x: game.world.centerX, y: game.world.centerY + 175,  atlas: 'atlas_main', filename: 'ui_button.png', visible: false });
                  menuButton2.anchor.setTo(0.5, 0.5)
                  menuButton2.reveal = function(){
                    this.visible = true;
                  }
              let menuButton2Text = phaserTexts.add({name: 'menuButton2Text', group: 'ui',  font: 'gem', x: menuButton2.x, y: menuButton2.y,  size: 14, default: ``})
                  menuButton2Text.anchor.setTo(0.5, 0.5)
              let menuButtonCursor = phaserSprites.addFromAtlas({ name: `menuButtonCursor`, group: 'ui_buttons', x: game.world.centerX - 125, atlas: 'atlas_main', filename: 'ui_cursor.png', visible: false });
                  menuButtonCursor.anchor.setTo(0.5, 0.5)
                  menuButtonCursor.reveal = function(){
                    this.visible = true;
                  }
                  menuButtonCursor.updateLocation = function(val:number){
                    phaserMaster.forceLet('menuButtonSelection', val)
                    let button = phaserSprites.get(`menuButton${val}`)
                    this.y = button.y;
                  }
                  menuButtonCursor.updateLocation(1);



        // add to layers
        phaserGroup.addMany(12, [menuButton1, menuButton2, menuButtonCursor])
        phaserGroup.addMany(13, [timeContainer, statusContainer, scoreContainer, earthContainer, portraitContainer])

        let overlaybmd = phaserBitmapdata.addGradient({name: 'overlaybmd', start: '#2f2f2f', end: '#2f2f2f', width: 5, height: 5, render: false})
        let overlay = phaserSprites.add({x: 0, y: 0, name: `overlay`, width: game.canvas.width, height: game.canvas.height, reference: overlaybmd.cacheBitmapData, visible: true})

            overlay.fadeIn = function(duration:number, callback:any){
              game.add.tween(this).to( { alpha: 1 }, duration, Phaser.Easing.Linear.In, true, 0, 0, false);
              setTimeout(() => {
                callback();
              }, duration)
            }
            overlay.fadeOut = function(duration:number, callback:any){
              game.add.tween(this).to( { alpha: 0 }, duration, Phaser.Easing.Linear.Out, true, 0, 0, false);
              setTimeout(() => {
                callback();
              }, duration)
            }
            phaserGroup.addMany(10, [overlay])

      }
      /******************/

      /******************/
      function preloadComplete(){
        let game = phaserMaster.game();
        let isDevMode = phaserMaster.get('devMode')
        let {overlay} = phaserSprites.getOnly(['overlay']);
        let {clock, roundTime} = phaserMaster.getOnly(['clock', 'roundTime']);

        overlayControls('WIPEOUT', () => {

          utilityManager.overlayBGControls({transition: 'FADEOUT', delay: 0, speed: 250}, () => {

            // create player
            let player = createPlayer();

            overlay.fadeOut(isDevMode ? 0 : Phaser.Timer.SECOND/2, () => {

                playSequence('SAVE THE WORLD', ()=>{
                  player.moveToStart();
                  game.time.events.add(isDevMode ? Phaser.Timer.SECOND*0 : Phaser.Timer.SECOND*1, () => {
                  playSequence(`${roundTime} SECONDS GO`, () => {
                      game.time.events.add(isDevMode ? Phaser.Timer.SECOND*0 : Phaser.Timer.SECOND/2, () => {
                        phaserSprites.getGroup('ui').map((sprite) => {
                          sprite.reveal()
                          // change state
                          phaserMaster.changeState('READY');
                        })
                      }).autoDestroy = true;

                      // start clock
                      clock.start()

                    })
                  })
                })
            })

          })
        })
      }
      /******************/

      /******************/
      function overlayControls(transition:string, callback:any = ()=>{}){
        utilityManager.overlayControls({transition: transition, delay: 500, speed: 500, tileDelay: 15}, callback)
      }
      /******************/

      /******************/
      function updateShipHealthbar(remaining:number, immediate:boolean = false, duration:number = Phaser.Timer.SECOND/3){
        let game = phaserMaster.game();
        let bars = Math.ceil(30 * (remaining*.01))
        let {healthBar, healthBarTween} = phaserMaster.getAll();
        if(healthBarTween !== undefined){
          healthBarTween.stop()
        }
        phaserMaster.forceLet('healthBarTween', game.add.tween(healthBar).to( { y: 231 - (7.7*bars) }, immediate ? 1 : duration, Phaser.Easing.Linear.Out, true, 0, 0, false))
      }
      /******************/

      /******************/
      function updateShipSpecial(remaining:number, immediate:boolean = false, duration:number = Phaser.Timer.SECOND/3){
        let game = phaserMaster.game();
        let bars = Math.ceil(6 * (remaining*.01))
        let {specialBar, specialBarTween} = phaserMaster.getAll();
        if(specialBarTween !== undefined){
          specialBarTween.stop()
        }
        phaserMaster.forceLet('specialBarTween', game.add.tween(specialBar).to( { y: 48 - (8*bars) }, immediate ? 1 : duration, Phaser.Easing.Linear.Out, true, 0, 0, false))
      }
      /******************/

      /******************/
      function updateEarthbar(remaining:number, immediate:boolean = false, duration:number = Phaser.Timer.SECOND/3){
        let game = phaserMaster.game();
        let bars = (10 * (remaining*.01))
        let {earthBar, earthBarTween} = phaserMaster.getAll();
        if(earthBarTween !== undefined){
          earthBarTween.stop()
        }
        phaserMaster.forceLet('earthBarTween', game.add.tween(earthBar).to( { x: -244 + (24.4*bars) }, immediate ? 1 : duration, Phaser.Easing.Linear.Out, true, 0, 0, false))
      }
      /******************/

      /******************/
      function updateBossBar(remaining:number){
        let game = phaserMaster.game();
        let bars = (10 * (remaining*.01))
        let {bossBar} = phaserMaster.getAll();
        if(bossBar !== undefined){
          game.add.tween(bossBar).to( { x: -244 + (24.4*bars) }, 1, Phaser.Easing.Linear.Out, true, 0, 0, false)
        }
      }
      /******************/

      /******************/
      function earthTakeDamage(val:number){
        let {gameData} = phaserMaster.getAll();
        let {currentState} = phaserMaster.getState();
        let {earthContainer} = phaserSprites.getAll();

        let population = gameData.population
            population.killed += val
        let damageTaken = 100 - ((population.killed/population.total) * 100)

        if(damageTaken <= 0 && currentState !== 'GAMEOVER'){
          gameOver();
        }
        else{
          earthContainer.takeDamage();
          updateEarthbar(damageTaken, true)
          saveData('population', {total: population.total, killed: population.killed})
        }
      }
      /******************/

      /******************/
      function playSequence(wordString:String, callback:any){
        let game = phaserMaster.game();

          let wordlist = wordString.split(" ");

          wordlist.map( (word, index) => {
            let splashText = phaserTexts.add({name: `splashText_${game.rnd.integer()}`, group: 'splash', font: 'gem', size: 18, default: word, visible: false})
                splashText.startSplash = function(){
                  this.visible = true;
                  this.scale.setTo(10, 10)
                  phaserTexts.alignToCenter(this.name)
                  game.add.tween(this.scale).to( { x:0.5, y:0.5}, 350, Phaser.Easing.Linear.In, true, 0);
                  game.add.tween(this).to( { x: this.game.world.centerX, y: this.game.world.centerY, alpha: 0.75}, 350, Phaser.Easing.Linear.In, true, 0)
                  setTimeout(() => {
                    phaserTexts.destroy(this.name)
                  }, 350)
                }
                game.time.events.add((Phaser.Timer.SECOND/2.5 * index) + 100, splashText.startSplash, splashText).autoDestroy = true;
          })

          game.time.events.add(Phaser.Timer.SECOND/2.5 * wordlist.length, callback, this).autoDestroy = true;

      }
      /******************/

      /******************/
      function createPlayer(){
        let game = phaserMaster.game();

        let onUpdate = (player:any) => {
            let {currentState} = phaserMaster.getState();
            if(!player.isInvincible && (currentState !== 'ENDLEVEL')){
              let hasCollided = false;
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(player, target, (player, target)=>{
                  hasCollided = true;
                  target.damageIt(50);
                }, null, player);
              })
              if(hasCollided){
                player.isInvincible = true;
                player.takeDamage(10)
              }
            }
        }

        let updateHealth = (health:number) => {
          let {gameData} = phaserMaster.getOnly(['gameData'])
          updateShipHealthbar(health)
          saveData('player', {health: health, lives: gameData.player.lives})
        }

        let loseLife = (player:any) => {
          let {gameData} = phaserMaster.getOnly(['gameData'])
          gameData.player.lives--
          phaserSprites.get(`lifeIcon_${gameData.player.lives}`).destroyIt();
          if(gameData.player.lives > 0){
            saveData('player', {health: 100, lives: gameData.player.lives})
            phaserControls.clearAllControlIntervals()
            phaserControls.disableAllInput()
            player.isDestroyed()
          }
          else{
            gameOver();
          }
        }

        let player = playerManager.createShip1({name: 'player', group: 'playership', layer: 8}, updateHealth, loseLife, onUpdate);

        return player
      }
      /******************/

      /******************/
      function createEnemy(options:any){
        let game = phaserMaster.game();
        let onDestroy = (enemy:any) => {
            let {gameData} = phaserMaster.getOnly(['gameData'])
                 gameData.score += 100
            saveData('score', gameData.score)
            let {scoreText} = phaserTexts.getOnly(['scoreText'])
                scoreText.updateScore();
            for(let i = 0; i < 5; i++){
               createDebris({
                 x: enemy.x,
                 y: enemy.y,
                 ix: game.rnd.integerInRange(-100, 100),
                 iy: -game.rnd.integerInRange(-20, 20),
                 layer:3
               })
            }
        }
        let onDamage = () => {}
        let onFail = () => { earthTakeDamage(2)  }
        let onUpdate = () => {}
        let enemy = enemyManager.createAsteroid(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function createDebris(options:any){
        let onDestroy = () => {
            let {gameData} = phaserMaster.getOnly(['gameData'])
                 gameData.score += 25
            saveData('score', gameData.score)
            let {scoreText} = phaserTexts.getOnly(['scoreText'])
                scoreText.updateScore();
        }
        let onDamage = () => {}
        let onFail = () => { earthTakeDamage(1)  }
        let onUpdate = () => {}
        let enemy = enemyManager.createDebris(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function createBoss(options:any){
        let game = phaserMaster.game();
        let {bossContainer} = phaserSprites.getOnly(['bossContainer'])
        let onDestroy = (enemy:any) => {
            bossContainer.hide();
            let {gameData} = phaserMaster.getOnly(['gameData'])
                 gameData.score += 10000
            saveData('score', gameData.score)
            let {scoreText} = phaserTexts.getOnly(['scoreText'])
                scoreText.updateScore();
            endLevel()
        }
        let onDamage = (boss) => {
          let remainingHealth = Math.round(boss.health/boss.maxHealth*100)
          updateBossBar(remainingHealth)
        }
        let onFail = () => {
          phaserMaster.changeState('ENDLEVEL');
          bossContainer.hide();
          earthTakeDamage(50)
          setTimeout(() => {
            let {currentState} = phaserMaster.getState();
            if(currentState !== 'GAMEOVER'){
              endLevel()
            }
          }, 1000)
        }
        let onUpdate = () => {}
        let enemy = enemyManager.createGiantAsteroid(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function targetCheck(obj:any){
        returnAllCollidables().map(target => {
          target.game.physics.arcade.overlap(obj, target, (obj, target)=>{
            obj.pierceStrength -= target.pierceResistence
            target.damageIt(obj.damageAmount);
            if(obj.pierceStrength <= 0){
              obj.destroyIt()
            }
          }, null, obj);
        })
      }
      /******************/

      /******************/
      function fireBullet(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {gap, shots} = {gap: 10, shots: 2}
        let centerShots = (gap * (shots-1))/2

        for(let i = 0; i < shots; i++){
          setTimeout(() => {
            let onUpdate = (obj:any) => { targetCheck(obj) }
            let onDestroy = () => {}
            weaponManager.createBullet({name: `bullet_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x + (i * gap) - centerShots, y: player.y, spread: 0, layer: 3}, onDestroy, onUpdate)
         }, 25)
        }
      }
      /******************/

      /******************/
      function fireLasers(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {gap, shots} = {gap: 30, shots: 1}
        let centerShots = (gap * (shots-1))/2

        for(let i = 0; i < shots; i++){
          let onUpdate = (obj:any) => { targetCheck(obj) }
          let onDestroy = () => {}
          weaponManager.createLaser({name: `laser_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x + (i * gap) - centerShots, y: player.y - player.height/2, spread: 0, layer: 2}, onDestroy, onUpdate)
         }
      }
      /******************/

      /******************/
      function fireMissles(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {gap, shots} = {gap: 30, shots: 2}
        let centerShots = (gap * (shots-1))/2

        // always shoots two at a minimum
        for(let i = 0; i < shots; i++){
          let onUpdate = (obj:any) => { targetCheck(obj) }
          let onDestroy = (obj:any) => { impactExplosion(obj.x + obj.height, obj.y, 1.5, obj.damageAmount/2) }
          weaponManager.createMissle({name: `missle_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x + (i * gap) - centerShots, y: player.y - player.height/2, spread:(i % 2 === 0 ? -0.50 : 0.50), layer: 2}, onDestroy, onUpdate)
        }
      }
      /******************/

      /******************/
      function createClusterbomb(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);

        let onUpdate = (obj:any) => {  targetCheck(obj) }
        let onDestroy = (obj:any) => {
             for(let i = 0; i < obj.bomblets; i++){
               createBomblet({
                 x: obj.x,
                 y: obj.y,
                 ix: game.rnd.integerInRange(-400, 400),
                 iy: game.rnd.integerInRange(-400, 100),
                 damage: obj.damageAmount/4,
                 group: 'ship_weapons',
                 layer: 2
               })
            }
        }
        weaponManager.createClusterbomb({name: `clusterbomb_${game.rnd.integer()}`, group: 'ship_secondary_weapons', x: player.x, y: player.y, layer: 2}, onDestroy, onUpdate)
      }
      /******************/

      /******************/
      function createTriplebomb(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);

        let onUpdate = (obj:any) => { targetCheck(obj) }
        let onDestroy = (obj:any) => {}

        for(let i = 0; i < 3; i++){
          setTimeout(() => {
            weaponManager.createTriplebomb({name: `triplebomb_${game.rnd.integer()}`, group: 'ship_secondary_weapons', x: player.x, y: player.y, layer: 2}, onDestroy, onUpdate)
          }, i * 300)
        }

      }
      /******************/

      /******************/
      function createTurret(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);

        let onInit = (obj:any) => {
          let {gap, shots} = {gap: 10, shots: 3}
          let centerShots = (gap * (shots-1))/2
          obj.fireInterval = setInterval(() => {
            for(let i = 0; i < shots; i++){
              let onUpdate = (obj:any) => { targetCheck(obj) }
              let onDestroy = () => {}
              weaponManager.createBullet({name: `bullet_${game.rnd.integer()}`, group: 'ship_secondary_weapons', x: obj.x + (i * gap) - centerShots, y: obj.y, spread: 0, layer: 2}, onDestroy, onUpdate)
            }
          }, 200)
          obj.fireInterval;
        }
        let onUpdate = (obj:any) => {
          obj.x = player.x - obj.offset
          obj.y = player.y
        }
        let onDestroy = (obj:any) => {}

        weaponManager.createTurret({name: `turret_${game.rnd.integer()}`, group: 'ship_secondary_weapons', x: player.x, y: player.y, offset: 50, layer: 3}, onInit, onDestroy, onUpdate)
        weaponManager.createTurret({name: `turret_${game.rnd.integer()}`, group: 'ship_secondary_weapons', x: player.x, y: player.y, offset: -50, layer: 3}, onInit, onDestroy, onUpdate)

      }
      /******************/

      /******************/
      function createBomblet(options:any){
        let onUpdate = (obj:any) => { targetCheck(obj) }
        let onDestroy = (obj:any) => { impactExplosion(obj.x, obj.y, 0.5, obj.damageAmount)}
        let bomblet = weaponManager.createBomblet(options, onDestroy, onUpdate)
      }
      /******************/

      /******************/
      function createExplosion(x, y, scale, layer){
        weaponManager.createExplosion(x, y, scale, layer)
      }
      /******************/

      /******************/
      function impactExplosion(x, y, scale, damage){
        let onUpdate = (obj:any) => { targetCheck(obj) }
        let onDestroy = (obj:any) => { }
        let impactExplosion = weaponManager.createImpactExplosion(x, y, scale, 6, damage, onDestroy, onUpdate)
      }
      /******************/

      /******************/
      function returnAllCollidables(){
        return [...phaserSprites.getGroup('enemies'),   ...phaserSprites.getGroup('trashes'), ...phaserSprites.getGroup('boss')]
      }
      /******************/

      /******************/
      function pauseGame(){
        phaserMaster.get('clock').stop();
        phaserMaster.forceLet('pauseStatus', true)
      }
      /******************/

      /******************/
      function unpauseGame(){
        phaserMaster.get('clock').start();
        phaserMaster.forceLet('pauseStatus', false)
      }
      /******************/

      /******************/
      function update() {
        let game = phaserMaster.game();
        let {currentState} = phaserMaster.getState();
        let {starMomentum, primaryWeapon, secondaryWeapon, menuButtonSelection, elapsedTime} = phaserMaster.getOnly(['starMomentum', 'primaryWeapon', 'secondaryWeapon', 'menuButtonSelection', 'elapsedTime'])
        let {specialWeapon, player} = phaserSprites.getOnly(['specialWeapon', 'player']);
        let {DOWN, UP, LEFT, RIGHT, A, START} = phaserControls.getOnly(['DOWN', 'UP', 'LEFT', 'RIGHT', 'A', 'START'])

        if(elapsedTime !== undefined){
          elapsedTime = parseInt(elapsedTime.toFixed(0));
        }


        phaserSprites.getManyGroups(['spaceGroup', 'movingStarField', 'ship_weapons', 'ship_secondary_weapons', 'impactExplosions', 'playership']).map(obj => {
          obj.onUpdate()
        })


        if(currentState === 'READY'){

          // create a steady steam of aliens to shoot
          if(phaserSprites.getGroup('enemies').length < 5 && phaserSprites.getGroup('boss').length === 0){
            createEnemy({
              x: game.rnd.integerInRange(0, game.canvas.width),
              y: game.rnd.integerInRange(-50, -300),
              ix: game.rnd.integerInRange(-100, 100),
              iy: game.rnd.integerInRange(0, 80),
              layer: 3
            });
          }

          phaserSprites.getManyGroups(['ui_overlay', 'enemies', 'boss', 'trashes']).map(obj => {
            if(obj !== undefined){
              obj.onUpdate()
            }
          })

          phaserTexts.getManyGroups(['ui_text', 'timeKeeper']).map(obj => {
            if(obj !== undefined){
              obj.onUpdate();
            }
          })

          // player controls
          if(RIGHT.active){
            starMomentum.x = -2
            player.moveX(5)
          }

          if(LEFT.active){
            starMomentum.x = 2
            player.moveX(-5)
          }

          if(UP.active){
            starMomentum.y = 5
            player.moveY(-5)
          }
          if(DOWN.active){
            starMomentum.y = -2
            player.moveY(5)
          }

          if(!UP.active && !DOWN.active){
            starMomentum.y = 0
          }


          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: primaryWeapon.cooldown - (A.state * primaryWeapon.rapidFireSpd) })){
            switch(primaryWeapon.reference){
              case 'LASER':
                fireLasers()
                break
              case 'MISSLE':
                fireMissles();
                break
              case 'BULLET':
                fireBullet();
            }
          }

          if(phaserControls.checkWithDelay( {isActive: true, key: 'B', delay: secondaryWeapon.cooldown} )){
            if(specialWeapon !== undefined){
              // reset speciaal timer and start charge animation
              updateShipSpecial(0, true)
              game.time.events.add(50, () => {
                updateShipSpecial(100, false, secondaryWeapon.cooldown-50)
              }).autoDestroy = true;
            }

            switch(secondaryWeapon.reference){
              case 'CLUSTERBOMB':
                createClusterbomb()
                break
              case 'TRIPLEBOMB':
                createTriplebomb()
                break
              case 'TURRET':
                createTurret()
                break
              case 'BLASTRADIUS':

                break
            }
          }
        }



        if(currentState === 'VICTORYSTATE'){
          if(UP.active){
            phaserSprites.get('menuButtonCursor').updateLocation(1)
          }
          if(DOWN.active){
            phaserSprites.get('menuButtonCursor').updateLocation(2)
          }
          if(START.active){
            phaserMaster.changeState('LOCKED');
            phaserControls.disableAllInput()
            switch(menuButtonSelection){
              case 1:
                updateStore();
                nextLevel();
                break
              case 2:
                updateStore();
                saveAndQuit();
                break
            }
          }
        }

        if(currentState === 'GAMEOVERSTATE'){
          if(UP.active){
            phaserSprites.get('menuButtonCursor').updateLocation(1)
          }
          if(DOWN.active){
            phaserSprites.get('menuButtonCursor').updateLocation(2)
          }
          if(START.active){
            clearInterval(phaserMaster.get('endExplosion'))
            phaserMaster.changeState('LOCKED');
            phaserControls.disableAllInput()
            switch(menuButtonSelection){
              case 1:
                retryLevel();
                break
              case 2:
                resetGame();
                break
            }
          }
        }

        if(currentState === 'ENDLEVEL'){
            player.onUpdate()
        }
      }
      /******************/

      /******************/
      function endLevel(){
        let game = phaserMaster.game();
        let gameData = phaserMaster.get('gameData');
        phaserMaster.changeState('ENDLEVEL');

        // hide UI text
        phaserTexts.getGroup('ui_text').map(text => {
          text.hide();
        })

        phaserSprites.getGroup('ui').map(obj => {
          obj.hide();
        })
        phaserSprites.getGroup('ship_secondary_weapons').map(obj => {
          obj.destroyIt()
        })

        // initiate player end sequence
        phaserSprites.get('player').playEndSequence(() => {
          // // update level and save data
          let level = gameData.level++;
             level++;
          saveData('level', level)


          for(let i = 0; i < 20; i++){
            setTimeout(() => {
              createExplosion(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height), game.rnd.integerInRange(1, 4), 6)
            }, game.rnd.integerInRange(0, 50)*i)
          }

          setTimeout(() => {
            // destroy all aliens
            phaserSprites.getGroup('enemies').map((enemy) => {
              setTimeout(() => {
                  enemy.destroyIt(false)
              }, game.rnd.integerInRange(0, 500))
            })

            // destroy all trash
            phaserSprites.getGroup('trashes').map((trash) => {
              setTimeout(() => {
                trash.destroyIt(false)
              }, game.rnd.integerInRange(0, 500))
            })

            // destroy all aliens
            phaserSprites.getGroup('movingStarField').map((star) => {
              star.fadeOut()
            })


            setTimeout(() => {
              playSequence('NICE JOB HERO', ()=>{
                phaserSprites.get('earth').fadeOut()
                let blueBackground = phaserSprites.addTilespriteFromAtlas({ name: 'blue_bg', group: 'spaceGroup', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'motionBlur.jpg', alpha: 0 });
                    blueBackground.count = 0;
                    blueBackground.scale.setTo(2, 2)
                    blueBackground.anchor.setTo(0.5, 0.5)
                    blueBackground.onUpdate = function () {
                        this.tilePosition.y -= 25
                    };
                phaserGroup.add(11, blueBackground)

                game.add.tween(blueBackground).to( { alpha: 1 }, Phaser.Timer.SECOND, Phaser.Easing.Linear.In, true, 0, 0, false).
                  onComplete.add(() => {
                    let background = phaserSprites.addTilespriteFromAtlas({ name: 'victory_bg', group: 'spaceGroup', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'victory_bg.png', alpha: 1 });
                        background.onUpdate = function () {
                            this.tilePosition.x -= 3
                        };
                    phaserGroup.add(10, background)
                    game.add.tween(blueBackground).to( { alpha: 0 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false).
                      onComplete.add(() => {
                        victoryScreenSequence(() => {

                        })
                      })
                  })
              })
            },Phaser.Timer.SECOND*1.5)

          }, Phaser.Timer.SECOND/3)

        });
      }
      /******************/

      /******************/
      function victoryScreenSequence(callback:any){
        let game = phaserMaster.game();
        let gameData = phaserMaster.get('gameData');


        let victoryScreenContainer = phaserSprites.addFromAtlas({y: game.world.centerY - 100, name: `victoryScreenContainer`, group: 'ui_clear', filename: 'ui_clear.png', atlas: 'atlas_main', visible: false})
            victoryScreenContainer.anchor.setTo(0.5, 0.5)
            victoryScreenContainer.reveal = function(){
              this.x = -this.width - 100
              this.visible = true
              this.game.add.tween(this).to( { x: this.game.world.centerX }, Phaser.Timer.SECOND*1, Phaser.Easing.Bounce.Out, true, 0, 0, false).
                onComplete.add(() => {

                  let scoreContainer = phaserSprites.addFromAtlas({x: this.game.world.centerX, y: this.game.world.centerY, name: `scoreContainer2`, group: 'ui', filename: 'ui_roundContainer.png', atlas: 'atlas_main', visible: true})
                      scoreContainer.anchor.setTo(0.5, 0.5)
                  let scoreText = phaserTexts.add({name: 'scoreText2', group: 'ui_text', x:scoreContainer.x, y: scoreContainer.y,  font: 'gem', size: 14, default: `${gameData.score}`})
                      scoreText.anchor.setTo(0.5, 0.5)
                      scoreText.updateScore = function(){
                        this.setText(`${phaserMaster.get('gameData').score}`)
                      }
                      phaserGroup.addMany(12, [scoreContainer])
                      phaserGroup.addMany(13, [scoreText])

                  let population = phaserMaster.get('gameData').population
                  let leftText = phaserTexts.add({name: 'popLeft', group: 'ui', font: 'gem', x: this.x, y: this.y - 10,  size: 24, default: `PEOPLE SAVED:`, alpha: 0})
                      leftText.anchor.setTo(0.5, 0.5)
                      leftText.scale.setTo(2, 2)
                      leftText.game.add.tween(leftText.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
                      leftText.game.add.tween(leftText).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
                        .onComplete.add(() => {
                          setTimeout(() => {
                            let population = phaserMaster.get('gameData').population
                            let peopleCount = phaserTexts.add({name: 'popCount',  font: 'gem', x: this.x, y: this.y + 30,  size: 45, default: ``, alpha: 0})
                                peopleCount.anchor.setTo(0.5, 0.5)
                                peopleCount.scale.setTo(1.5, 1.5)
                                peopleCount.setText(`${(population.total - population.killed)* 700000}`)
                                peopleCount.game.add.tween(peopleCount.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
                                peopleCount.game.add.tween(peopleCount).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)

                                phaserGroup.addMany(13, [peopleCount])

                                let totalCount = (population.total - population.killed)* 700000;
                                let countBy = 543211
                                let medalsEarned = 0
                                let totalSaved = 0
                                let countInterval = setInterval(() => {
                                    if(!phaserMaster.get('pauseStatus')){
                                      if(countBy > totalCount){
                                        countBy = Math.round(countBy/2)
                                      }
                                      if(totalCount - countBy <= 0){
                                        peopleCount.setText(0)
                                        clearInterval(countInterval)


                                        setTimeout(() => {
                                          leftText.setText('MEDALS EARNED')
                                          phaserTexts.destroy('popCount')

                                          for(let i = 0; i < medalsEarned; i++){
                                            let medal = phaserSprites.addFromAtlas({ name: `medal_${i}`, group: 'medals', x: victoryScreenContainer.x + (i*20) - 80, y: victoryScreenContainer.y + 20, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_main', filename: 'medal_gold.png', alpha: 0 });
                                                medal.reveal = function(){
                                                  this.scale.setTo(2, 2)
                                                  this.game.add.tween(this.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
                                                  this.game.add.tween(this).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
                                                }
                                                phaserGroup.addMany(13, [medal])
                                                setTimeout(() => {
                                                  medal.reveal();
                                                }, i*50)
                                          }

                                          setTimeout(() =>{
                                            let {menuButton1Text, menuButton2Text} = phaserTexts.getOnly(['menuButton1Text', 'menuButton2Text'])
                                            phaserMaster.changeState('VICTORYSTATE');
                                            phaserSprites.getGroup('ui_buttons').map(obj => {
                                              obj.reveal()
                                            })

                                            menuButton1Text.setText('CONTINUE')
                                            menuButton2Text.setText('SAVE AND QUIT')
                                          }, medalsEarned*50 + 100)

                                          //callback();
                                        }, Phaser.Timer.SECOND)
                                      }
                                      else{
                                        totalSaved += countBy
                                        if(totalSaved > 10000000){
                                          saveData('score', Math.round(gameData.score + 2000))
                                          scoreText.updateScore();
                                          medalsEarned++
                                          totalSaved = 0;
                                        }
                                        totalCount -= countBy
                                        peopleCount.setText(totalCount)
                                      }
                                    }
                                }, 1)

                          }, Phaser.Timer.SECOND/2)
                        })

                  //phaserGroup.addMany(12, [characterPortrait])
                })
            }
            victoryScreenContainer.hide = function(){
              this.game.add.tween(this).to( { y: -this.height }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
            }
            victoryScreenContainer.reveal();
            phaserGroup.addMany(13, [victoryScreenContainer])
      }
      /******************/

      /******************/
      function gameOver(){
        phaserMaster.changeState('GAMEOVER');
        let player = phaserSprites.get('player')
        let earth = phaserSprites.get('earth')

        // hide UI text
        phaserTexts.getGroup('ui_text').map(text => {
          text.hide();
        })

        phaserSprites.getGroup('ui').map(obj => {
          obj.hide();
        })
        phaserSprites.getGroup('ship_secondary_weapons').map(obj => {
          obj.destroyIt()
        })


        player.selfDestruct()
        earth.selfDestruct()

        playSequence('DUDE IT WAS THE FIRST LEVEL JEEZE', ()=>{
          setTimeout(() => {
            phaserMaster.changeState('GAMEOVERSTATE');
            phaserSprites.getGroup('ui_buttons').map(obj => {
              obj.reveal()
            })
            phaserTexts.get('menuButton1Text').setText('RETRY')
            phaserTexts.get('menuButton2Text').setText('SAVE AND QUIT')
          }, 1500)
        })
      }
      /******************/

      /******************/
      function finalFadeOut(callback:any){
        utilityManager.overlayBGControls({transition: 'FADEIN', delay: 0, speed: 250}, () => {

            // hide UI text
            phaserTexts.getManyGroups(['ui', 'ui_text', 'ui_buttons']).map(text => {
              phaserTexts.destroy(text.name)
            })

            phaserSprites.getManyGroups(['ui', 'ui_buttons']).map(obj => {
              phaserSprites.destroy(obj.name)
            })

            overlayControls('WIPEIN', () => {
              setTimeout(() => {
                callback();
              }, 500)
            })
          })
      }

      function nextLevel(){
        finalFadeOut(() => {
          updateStore();
          parent.loadNextLevel()
        })
      }


      function retryLevel(){
        finalFadeOut(() => {
          parent.retry()
        })
      }

      function resetGame(){
        finalFadeOut(() => {
          parent.returnToTitle()
        })
      }

      function saveAndQuit(){
        finalFadeOut(() => {
          updateStore();
          parent.returnToTitle()
        })
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

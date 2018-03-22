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
            phaserBitmapdata = new PHASER_BITMAPDATA_MANAGER(),
            weaponManager = new WEAPON_MANAGER();

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

        // game variables
        phaserMaster.let('roundTime', 30)
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

        // var roundContainer = phaserSprites.addFromAtlas({name: `roundContainer`, group: 'ui', filename: 'ui_container2.png', atlas: 'atlas_main', visible: false})
        //     roundContainer.reveal = function(){
        //       this.x = this.game.world.width - this.width - 10
        //       this.y = -200
        //       this.visible = true
        //       this.game.add.tween(this).to( { y: 10 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
        //         onComplete.add(() => {
        //           let roundText = phaserTexts.add({name: 'roundText', group: 'ui_text', x:game.world.width - 45, y: 22,  font: 'gem', size: 12, boundsAlignH: "center", boundsAlignV: "middle", default: `Round ${gameData.level}`, visible: false})
        //               roundText.anchor.setTo(0.5, 0.5)
        //               roundText.reveal = function(){
        //                 this.visible = true
        //                 this.alpha = 0;
        //                 this.game.add.tween(this).to( { alpha: 1 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
        //                 phaserGroup.add(15, this)
        //               }
        //               roundText.hide = function(){
        //                 this.game.add.tween(this).to( { alpha: 0 }, Phaser.Timer.SECOND, Phaser.Easing.Linear.Out, true, 0, 0, false);
        //               }
        //               roundText.reveal();
        //         })
        //     }
        //     roundContainer.hide = function(){
        //       this.game.add.tween(this).to( { y: -200 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
        //       phaserTexts.get('roundText').hide();
        //     }

        let scoreContainer = phaserSprites.addFromAtlas({name: `scoreContainer`, group: 'ui', filename: 'ui_roundContainer.png', atlas: 'atlas_main', visible: false})
            scoreContainer.anchor.setTo(0.5, 0.5)
            scoreContainer.reveal = function(){
              this.x = this.game.world.width - this.width/2 - 10
              this.y = -200
              this.visible = true
              this.game.add.tween(this).to( { y: 20 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  let scoreText = phaserTexts.add({name: 'scoreText', group: 'ui_text', x:this.x, y: this.y,  font: 'gem', size: 14, default: `${gameData.score}`, alpha: 0})
                      scoreText.anchor.setTo(0.5, 0.5)
                      scoreText.onUpdate = function(){}
                      scoreText.updateScore = function(){
                        this.setText(`${phaserMaster.get('gameData').score}`)
                      }
                      scoreText.reveal = function(){
                        this.game.add.tween(this).to( { alpha: 1 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
                      }
                      scoreText.hide = function(){
                        this.game.add.tween(this).to( { alpha: 0 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 0, 0, false);
                      }
                      scoreText.reveal();
                })
            }
            scoreContainer.hide = function(){
              this.game.add.tween(this).to( { y: -200 }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
              phaserTexts.get('scoreText').hide();
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
              let menuButton1Text = phaserTexts.add({name: 'menuButton1Text',  font: 'gem', x: menuButton1.x, y: menuButton1.y,  size: 14, default: ``})
                  menuButton1Text.anchor.setTo(0.5, 0.5)


              let menuButton2 = phaserSprites.addFromAtlas({ name: `menuButton2`, group: 'ui_buttons', x: game.world.centerX, y: game.world.centerY + 175,  atlas: 'atlas_main', filename: 'ui_button.png', visible: false });
                  menuButton2.anchor.setTo(0.5, 0.5)
                  menuButton2.reveal = function(){
                    this.visible = true;
                  }
              let menuButton2Text = phaserTexts.add({name: 'menuButton2Text',  font: 'gem', x: menuButton2.x, y: menuButton2.y,  size: 14, default: ``})
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
                    })
                  }).autoDestroy = true;

                  // start clock
                  clock.start()
                  // change state
                  phaserMaster.changeState('READY');
                })
              })
            })
        })
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
      function createShipExhaust(){
        let shipExhaust = phaserSprites.addFromAtlas({name: 'exhaust', group: 'playership', atlas: 'atlas_main',  filename: 'exhaust_red_1.png', visible: false})
            shipExhaust.animations.add('exhaust_animation', Phaser.Animation.generateFrameNames('exhaust_red_', 1, 8, '.png'), 1, true)
            shipExhaust.animations.play('exhaust_animation', 30, true)
            phaserGroup.add(8, shipExhaust)
            shipExhaust.anchor.setTo(0.5, 0.5)
            shipExhaust.onUpdate = function(){
              let player = phaserSprites.get('player')
              let {x, width, height, y, visible, isDead} = player;
              this.visible = !phaserMaster.checkState('ENDLEVEL') ? visible : false;
              this.x = x
              this.y = y + 40;
              this.alpha = !phaserMaster.checkState('ENDLEVEL') && isDead ? 0 : 1
              this.scale.setTo(1, 1)
            }

            shipExhaust.updateCords = function(x, y){
              let starMomentum = phaserMaster.get('starMomentum')
              this.x = x

              if(starMomentum.y == 0){
                this.y = y + 40;
                this.scale.setTo(1, 1)
              }
              if(starMomentum.y > 0){
                this.y = y + 50;
                this.scale.setTo(1, 1.5)
              }
              if(starMomentum.y < 0){
                this.y = y + 25;
                this.scale.setTo(1, 0.25)
              }

            }

            shipExhaust.destroyIt = function(){
              phaserSprites.destroy('exhaust')
            }

      }
      /******************/

      /******************/
      function createPlayer(){
        let game = phaserMaster.game();

        //  The hero!
        let player = phaserSprites.addFromAtlas({name: 'player', group: 'playership', atlas: 'atlas_main',  filename: 'ship_body.png', visible: false})
            player.anchor.setTo(0.5, 0.5);
            player.scale.setTo(1, 1)
            player.isInvincible = false;
            player.isDead = false
            game.physics.enable(player, Phaser.Physics.ARCADE);
            phaserGroup.add(8, player)
            createShipExhaust();

            player.onUpdate = function(){
              if(this.visible && !player.isDead){
                player.createTrail();
              }

              if(!player.isInvincible && !phaserMaster.checkState('ENDLEVEL')){
                let hasCollided = false;
                returnAllCollidables().map((target) => {
                  target.game.physics.arcade.overlap(this, target, (player, target)=>{
                    hasCollided = true;
                    target.damageIt(50);
                  }, null, this);
                })
                if(hasCollided){
                  this.isInvincible = true;
                  player.takeDamage(10)
                }
              }
            }

            player.takeDamage = function(val:number){
              let gameData = phaserMaster.get('gameData');
              let health = gameData.player.health - val
              updateShipHealthbar(health)

              if(health > 0){
                saveData('player', {health: health, lives: gameData.player.lives})
                this.tint = 1 * 0xff0000;
                this.alpha = 0.75
                this.game.add.tween(this).to( {tint: 1 * 0xffffff, alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 100, 0, false).
                  onComplete.add(() => {
                    this.isInvincible = false;
                  })
              }
              else{
                gameData.player.lives--
                phaserSprites.get(`lifeIcon_${gameData.player.lives}`).destroyIt()
                if(gameData.player.lives > 0){
                  saveData('player', {health: 100, lives: gameData.player.lives})
                  phaserControls.clearAllControlIntervals()
                  phaserControls.disableAllInput()
                  this.isDestroyed()
                }
                else{
                  gameOver();
                }
              }
            }

            player.isDestroyed = function(){
              player.isDead = true;
              weaponManager.createExplosion(this.x, this.y, 1, 6)
              game.add.tween(this).to( { angle: game.rnd.integerInRange(-90, 90), alpha: 0}, 1000, Phaser.Easing.Linear.In, true, 0).
                onComplete.add(() => {
                  weaponManager.createExplosion(this.x, this.y, 1, 6)
                  this.visible = false;
                  setTimeout(() => {
                    updateShipHealthbar(100)
                    player.moveToStart();
                  }, 1000)
                })
            }


            player.createTrail = function(){
              let trailCount = phaserSprites.getGroup('trails').length;
              if(trailCount < phaserMaster.checkState('ENDLEVEL') ? 20 : 10){
                let trail = phaserSprites.addFromAtlas({name: `trail_${game.rnd.integer()}`, group:'trails', x: this.x, y: this.y, filename: 'ship_body.png', atlas: 'atlas_main', visible: true})
                    trail.anchor.setTo(0.5, 0.5)
                    trail.scale.setTo(this.scale.x - 0.2, this.scale.y - 0.2)
                    trail.alpha = 0.4
                    trail.angle = this.angle;
                    trail.tint = 1 * 0x0000ff;
                    phaserGroup.add(7, trail)
                    trail.destroySelf = function(){
                      this.game.add.tween(this).to( { alpha: 0}, phaserMaster.checkState('ENDLEVEL') ? 600 : 250, Phaser.Easing.Linear.In, true, 0).
                        onComplete.add(() => {
                          phaserSprites.destroy(this.name)
                        }, this);
                    }
                    trail.destroySelf();
               }

            }

            player.selfDestruct = function(){
              this.isInvincible = true;
              phaserSprites.get('exhaust').destroyIt();
              game.add.tween(this.scale).to( { x: 0.25, y: 0.25}, 3400, Phaser.Easing.Linear.In, true, 0).
              game.add.tween(this).to( { angle: 720}, 3400, Phaser.Easing.Linear.In, true, 0).
                onComplete.add(() => {
                  phaserSprites.destroy(this.name)
                  weaponManager.createExplosion(this.x, this.y, 0.5, 6)
                }, this);
            }

            player.moveToStart = function(){
              player.isDead = false;
              this.angle = 0;
              this.alpha = 1
              this.visible = true;
              this.isInvincible = true;
              this.x = this.game.world.centerX
              this.y = this.game.world.centerY + 550
              game.add.tween(this).to( { y: game.world.centerY + 200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  phaserControls.enableAllInput()
                  setTimeout(() => {
                    this.isInvincible = false;
                  }, 1000)
                })
            }

            player.moveX = function(val:number){
              this.x += val
              phaserSprites.get('exhaust').updateCords(this.x, this.y)
              this.checkLimits()
            }

            player.moveY = function(val:number){
              this.y += val
              phaserSprites.get('exhaust').updateCords(this.x, this.y)
              this.checkLimits()
            }

            player.checkLimits = function(){
              if(this.y - this.height < 0){
                this.y = this.height
              }

              if(this.y + this.height > this.game.canvas.height){
                this.y = this.game.canvas.height - this.height
              }

              if(this.x < 0){
                this.x = this.game.canvas.width + this.width
              }
              if(this.x > (this.game.canvas.width + this.width)){
                this.x = 0
              }
            }

            player.playEndSequence = function(callback:any){
              this.isInvincible = true;
              // scale and animate out!
              this.game.add.tween(this.scale).to( { x:2, y: 2 }, 750, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
              this.game.add.tween(this).to( { x:this.game.world.centerX, y: this.game.world.centerY + 50 }, 750, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  this.game.add.tween(this).to( { y: this.game.world.height + 200 }, 750, Phaser.Easing.Exponential.InOut, true, 100, 0, false).
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

        let alien = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `alien_${game.rnd.integer()}`, group:'aliens', atlas: 'atlas_main', filename: `asteroid_mid_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
            alien.anchor.setTo(0.5, 0.5);
            alien.scale.setTo(1.5, 1.5);
            game.physics.enable(alien, Phaser.Physics.ARCADE);
            alien.body.velocity.y = options.iy
            alien.body.velocity.x = options.ix
            alien.angleMomentum = game.rnd.integerInRange(-5, 5)
            alien.body.bounce.setTo(1, 1);
            alien.atTarget = false;
            alien.maxHealth = 150;
            alien.health = alien.maxHealth


            alien.fallThreshold = game.rnd.integerInRange(0, 75)

            phaserGroup.add(3, alien)

            // damage it
            alien.damageIt = function(val:number){
              if(!this.atTarget){
                // let emitter = phaserMaster.get('emitter');
                //     emitter.x = this.x;
                //     emitter.y = this.y
                //     emitter.start(false, 1500, 20);
                this.health -= val;

                this.tint = 1 * 0xff0000;
                this.game.add.tween(this).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);

                if(this.health <= 0){
                  this.destroyIt()
                }
              }
            }

            alien.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            // destroy it
            alien.destroyIt = function(spawnMore = true){
                // add to score
                let score = phaserMaster.get('gameData').score
                    score += 100
                saveData('score', score)

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
                  weaponManager.createExplosion(this.x, this.y, 1, 6)
                  if(spawnMore){
                   for(let i = 0; i < 5; i++){
                     createTrash({
                       x: this.x,
                       y: this.y,
                       ix: game.rnd.integerInRange(-100, 100),
                       iy: -game.rnd.integerInRange(-20, 20)
                     })
                   }
                  }
                phaserSprites.destroy(this.name);
               }, this).autoDestroy = true;
            }

            alien.fallToPlanet = function(){
              this.tint = 1 * 0x000000;
              this.atTarget = true;
              this.body = null;
              this.game.add.tween(this).to( {y: this.y + 60}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
              setTimeout(() => {
                this.game.add.tween(this.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*1, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
                  onComplete.add(() => {
                    this.removeIt();
                    earthTakeDamage(2);
                    weaponManager.createExplosion(this.x, this.y, 0.25, 6)
                  }).autoDestroy = true;
              }, 300)
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
              if(this.y > this.game.canvas.height - (75 + this.fallThreshold)){
                if(this.body !== null && !this.atTarget){
                  this.body.collideWorldBounds = false;
                  this.fallToPlanet();
                }
              }
            }

            alien.onUpdate = function(){
              game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], this);
              this.rotate += 2
              if(!alien.atTarget){
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
      }
      /******************/

      /******************/
      function createBoss(options:any){
        let game = phaserMaster.game();

        let obj = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `boss_${game.rnd.integer()}`, group:'boss', atlas: 'atlas_main', filename: `asteroid_large_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
            obj.anchor.setTo(0.5, 0.5);
            game.physics.enable(obj, Phaser.Physics.ARCADE);
            obj.body.velocity.y = options.iy
            obj.body.velocity.x = options.ix
            obj.angleMomentum = game.rnd.integerInRange(-5, 5)
            obj.body.bounce.setTo(1, 1);
            obj.atTarget = false;
            obj.maxHealth = 40000;
            obj.health = obj.maxHealth
            obj.fallThreshold = game.rnd.integerInRange(0, 75)

            phaserGroup.add(3, obj)

            // damage it
            obj.damageIt = function(val:number){
              if(!this.atTarget){
                this.health -= val;
                this.tint = 1 * 0xff0000;
                this.game.add.tween(this).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
                if(this.health <= 0){
                  this.destroyIt()
                }
              }
            }

            obj.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            // destroy it
            obj.destroyIt = function(spawnMore = true){
                // add to score
                let score = phaserMaster.get('gameData').score
                    score += 1000
                saveData('score', score)

                let scoreText = phaserTexts.get('scoreText')
                    scoreText.updateScore();

                // animate it
                let tween = {
                  angle: 720,
                  x: this.x - game.rnd.integerInRange(-10, 10),
                  y: this.y - game.rnd.integerInRange(10, 10),
                  alpha: .15
                }
                this.game.add.tween(this).to( tween, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.Out, true, 0, 0, false);
                this.game.add.tween(this.scale).to( {x: 0.5, y: 0.5}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.Out, true, 0, 0, false);
                this.body = null;

               // animate death and then explode
               game.time.events.add(Phaser.Timer.SECOND*2, () => {
                let {x, y} = this
                impactExplosion(x, y, 2, 100)
                phaserSprites.destroy(this.name);
               }, this).autoDestroy = true;
            }

            obj.fallToPlanet = function(){
              this.tint = 1 * 0x000000;
              this.atTarget = true;
              this.body = null;
              this.game.add.tween(this).to( {y: this.y + 60, angle: 720}, Phaser.Timer.SECOND*3, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
              setTimeout(() => {
                this.game.add.tween(this.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*3, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
                  onComplete.add(() => {
                    this.removeIt();
                    earthTakeDamage(10);
                    weaponManager.createExplosion(this.x, this.y, .85, 6)
                  }).autoDestroy = true;
              }, 300)
            }

            obj.checkLocation = function(){
              this.angle += obj.angleMomentum
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
              if(this.y > this.game.canvas.height - (75 + this.fallThreshold)){
                if(this.body !== null && !this.atTarget){
                  this.body.collideWorldBounds = false;
                  this.fallToPlanet();
                }
              }
            }

            obj.onUpdate = function(){
              game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], this);
              this.rotate += 2
              if(!this.atTarget){
                if(this.body !== null){
                  if(this.body.velocity.y + 1 < 25){
                    this.body.velocity.y += 1
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
      }
      /******************/

      /******************/
      function createTrash(options:any){
        let game = phaserMaster.game();

        let trash = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `trash_${game.rnd.integer()}`, group:'trashes', atlas: 'atlas_main', filename: `asteroid_small_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
            trash.anchor.setTo(0.5, 0.5);
            trash.scale.setTo(1, 1);
            game.physics.enable(trash, Phaser.Physics.ARCADE);
            trash.body.velocity.y = options.iy
            trash.body.velocity.x = options.ix
            trash.angleMomentum = game.rnd.integerInRange(-5, 5)
            trash.body.bounce.setTo(1, 1);
            trash.atTarget = false;
            trash.maxHealth = 50;
            trash.health = trash.maxHealth

            trash.fallThrehold = game.rnd.integerInRange(0, 75)
            phaserGroup.add(3, trash)

            // damage it
            trash.damageIt = function(val:number){
              // let emitter = phaserMaster.get('emitter');
              //     emitter.x = this.x;
              //     emitter.y = this.y
              //     emitter.start(true, 1500, null, 5);
              this.health -= val;

              this.tint = 1 * 0xff0000;
              this.game.add.tween(this).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);

              if(this.health <= 0){
                this.destroyIt()
              }
              else{

              }
            }

            trash.removeIt = function(){
              phaserSprites.destroy(this.name)
            }

            trash.fallToPlanet = function(){
              this.tint = 1 * 0x000000;
              this.atTarget = true;
              this.body = null;
              this.game.add.tween(this).to( {y: this.y + 60}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
              setTimeout(() => {
                this.game.add.tween(this.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*1, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
                  onComplete.add(() => {
                    this.removeIt();
                    earthTakeDamage(1);
                    weaponManager.createExplosion(this.x, this.y, 0.25, 6)
                  }).autoDestroy = true;
              }, 300)
            }

            // destroy it
            trash.destroyIt = function(){
                // add to score
                let score = phaserMaster.get('gameData').score
                    score += 25
                saveData('score', score)

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
                  weaponManager.createExplosion(this.x, this.y, 0.5, 6)
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
              if(this.y > this.game.canvas.height - (50 + this.fallThrehold)){
                if(this.body !== null && !this.atTarget){
                  this.body.collideWorldBounds = false;
                  this.fallToPlanet();
                }
              }
              if(this.y > this.game.canvas.height + this.height){
                this.removeIt();
              }
            }

            trash.onUpdate = function(){
              game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], this);
              this.rotate += 4
              if(this.body !== null){
                if(this.body.velocity.y + 1 < 50){
                  this.body.velocity.y += 1
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
      function fireBullet(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {weaponData} = phaserMaster.getOnly(['weaponData']);
        let weapon = weaponData.primaryWeapons.BULLET;
        let gap = 10
        let shots = 3

        for(let i = 0; i < shots; i++){
          setTimeout(() => {
            let bullet = weaponManager.createBullet({name: `bullet_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x - (gap*shots/2) + (i * gap), offset: 0, y: player.y, spread: 0, layer: 3})
            bullet.onUpdate = function(){
              // bullet speeds up
              this.accelerate();
              // destroy bullet
              if(this.y < 0){ this.destroyIt() }
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (bullet, target)=>{
                  if(!weapon.pierce){
                    bullet.destroyIt()
                  }
                  target.damageIt(weapon.damage);
                }, null, this);
              })

           }
         }, 25)
        }
      }
      /******************/

      /******************/
      function fireLasers(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {weaponData} = phaserMaster.getOnly(['weaponData']);
        let weapon = weaponData.primaryWeapons.BULLET;
        let gap = 50
        let shots = 3

        for(let i = 0; i < shots; i++){
          let bullet = weaponManager.createLaser({name: `laser_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x - gap + (i * gap), offset: 0, y: player.y - player.height/2, spread: 0, layer: 2})
              bullet.onUpdate = function(){
                this.accelerate();
                if(this.y < 0){ this.destroyIt() }
                returnAllCollidables().map(target => {
                  target.game.physics.arcade.overlap(this, target, (bullet, target)=>{
                    if(!weapon.pierce){
                      bullet.destroyIt()
                    }
                    target.damageIt(weapon.damage);
                  }, null, this);
                })
             }
         }
      }
      /******************/

      /******************/
      function fireMissles(){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {weaponData} = phaserMaster.getOnly(['weaponData']);
        let weapon = weaponData.primaryWeapons.MISSLE;
        let gap = 50
        let shots = 1

        // always shoots two at a minimum
        for(let i = 0; i < shots * 2; i++){
          let missle = weaponManager.createMissle({name: `missle_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x - gap/2 + (i * gap), offset: 0, y: player.y - player.height/2, spread: (i % 2 ? 0.25 : -0.25), layer: 2})
          missle.onUpdate = function(){
            if(missle.isActive){
              // bullet speeds up
              this.accelerate();
              // destroy bullet
              if(this.y < 0){ this.destroyIt() }
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (bullet, target)=>{
                  if(!weapon.pierce){
                    bullet.destroyIt()
                  }
                  target.damageIt(weapon.damage);
                }, null, this);
              })
            }
         }
        }
      }
      /******************/

      /******************/
      function createClusterbomb(options){
        let game = phaserMaster.game();
        let {player} = phaserSprites.getOnly(['player']);
        let {weaponData} = phaserMaster.getOnly(['weaponData']);
        let weapon = weaponData.secondaryWeapons.CLUSTERBOMB;

        let bomb = weaponManager.createClusterbomb({name: `clusterbomb_${game.rnd.integer()}`, group: 'ship_weapons', x: player.x, y: player.y, layer: 2})
        bomb.destroyIt = function(){
          weaponManager.createExplosion(this.x, this.y, 1.25, 6)
          phaserSprites.destroy(this.name)
          for(let i = 0; i < weapon.bomblets; i++){
            createBomblet({
              x: this.x,
              y: this.y,
              ix: game.rnd.integerInRange(-400, 400),
              iy: game.rnd.integerInRange(-400, 100),
              damage: options.damage/4,
              group: 'ship_weapons',
              layer: 2
            })
          }

        }

        bomb.onUpdate = function(){
          this.angle += 5;
          returnAllCollidables().map((target) => {
            target.game.physics.arcade.overlap(this, target, (bomb, target)=>{
              if(!bomb.hasDetonated){
                bomb.hasDetonated = true;
                bomb.destroyIt();
              }
              target.damageIt(options.damage);
            }, null, this);
          })

       }
      }
      /******************/

      /******************/
      function createTriplebomb(options){
        let game = phaserMaster.game();
        let bomb =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `secondary_${game.rnd.integer()}`, group: 'secondaryWpnSprite', atlas: 'atlas_main', filename: 'clusterBomb.png'})
            bomb.anchor.setTo(0.5, 0.5)
            game.physics.enable(bomb, Phaser.Physics.ARCADE);
            bomb.body.velocity.y = options.initialVelocity;
            phaserGroup.add(2, bomb)

            bomb.accelerate = function(){
              this.body.velocity.y -= (options.velocity * options.delay)
            }

            bomb.destroyIt = function(){
              impactExplosion(this.x, this.y, 2.5, options.damage)
              phaserSprites.destroy(this.name)
            }


            bomb.onUpdate = function(){
              this.accelerate();
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (bomb, target)=>{
                  bomb.destroyIt();
                  target.damageIt(options.damage);
                }, null, this);
              })

           }
      }
      /******************/

      /******************/
      function createTurret(options){
        let game = phaserMaster.game();
        let turret =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `secondary_${game.rnd.integer()}`, group: 'secondaryWpnSprite', atlas: 'atlas_main', filename: 'clusterBomb.png'})
            game.physics.enable(turret, Phaser.Physics.ARCADE);
            phaserGroup.add(2, turret)
            setTimeout(() => {
              turret.destroyIt();
            }, options.lifespan)


            turret.fireInterval = setInterval(() => {
              let {x, y, width} = turret;
              // fireBullet({x: x + width/2, offset: 0, y: y, spread: 0, damageMod: 1})
              // fireBullet({x: x + width/2 + 20, offset: 0, y: y, spread: 0, damageMod: 1})
              // fireBullet({x: x + width/2 - 20, offset: 0, y: y, spread: 0, damageMod: 1})
            }, 200)
            turret.fireInterval;

            turret.destroyIt = function(){
              impactExplosion(this.x, this.y, 2.5, options.damage)
              clearInterval(this.fireInterval)
              phaserSprites.destroy(this.name)
            }


            turret.onUpdate = function(){
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (turret, target)=>{
                  turret.destroyIt();
                  target.damageIt(options.damage);
                }, null, this);
              })
           }
      }
      /******************/

      /******************/
      function createMine(options){
        let game = phaserMaster.game();
        let mine =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `secondary_${game.rnd.integer()}`, group: 'secondaryWpnSprite', atlas: 'atlas_main', filename: 'clusterBomb.png'})
            mine.anchor.setTo(0.5, 0.5)
            mine.scale.setTo(1.5, 1.5);
            game.physics.enable(mine, Phaser.Physics.ARCADE);
            phaserGroup.add(2, mine)

            if(phaserSprites.getGroup('secondaryWpnSprite').length > options.limit){
              phaserSprites.getGroup('secondaryWpnSprite')[0].destroyIt();
            }

            mine.destroyIt = function(){
              let {x, y} = this
              impactExplosion(x, y, 3, options.damage)
              setTimeout(() => {
                impactExplosion(x, y, 2, options.damage)
              }, 500)
              clearInterval(this.fireInterval)
              phaserSprites.destroy(this.name)
            }

            mine.onUpdate = function(){
              this.angle += 5;
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (mine, target)=>{
                  mine.destroyIt();
                  target.damageIt(options.damage);
                }, null, this);
              })
           }
      }
      /******************/

      /******************/
      function createBomblet(options:any){
        let game = phaserMaster.game();

        let bomblet = weaponManager.createBomblet(options)

            bomblet.destroyIt = function(){
              impactExplosion(this.x, this.y, 0.5, options.damage)
              phaserSprites.destroy(this.name)
            }

            bomblet.onUpdate = function(){
              this.angle += 10;
              // detonate after 500 miliseconds
              if(this.game.time.now > bomblet.detonate){
                this.destroyIt();
              }
              // watch for collisions
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (bomblet, target)=>{
                  bomblet.destroyIt();
                  target.damageIt(options.damage);
                }, null, this);
              })
           }
      }
      /******************/

      /******************/
      function impactExplosion(x, y, scale, damage){
        let game = phaserMaster.game();

        let impactExplosion = weaponManager.createImpactExplosion(x, y, scale, 6)
            impactExplosion.onUpdate = function(){
              // check for bullet collision
              returnAllCollidables().map((target) => {
                target.game.physics.arcade.overlap(this, target, (impactExplosion, target)=>{
                  target.damageIt(damage);
                }, null, this);
              })

           }
      }
      /******************/

      /******************/
      function returnAllCollidables(){
        return [...phaserSprites.getGroup('aliens'),   ...phaserSprites.getGroup('trashes'), ...phaserSprites.getGroup('boss')]
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

        phaserSprites.getManyGroups(['spaceGroup', 'movingStarField', 'ship_weapons', 'secondaryWpnSprite', 'impactExplosions', 'playership']).map(obj => {
          obj.onUpdate()
        })

        if(currentState === 'READY'){


          // create a steady steam of aliens to shoot
          if(elapsedTime < 15 && phaserSprites.getGroup('aliens').length < 5){
            createAlien({
              x: game.rnd.integerInRange(0, game.canvas.width),
              y: game.rnd.integerInRange(-50, -300),
              ix: game.rnd.integerInRange(-100, 100),
              iy: game.rnd.integerInRange(0, 80)
            });
          }

          if(elapsedTime === 15 && phaserSprites.getGroup('boss').length === 0){
            createBoss({
              x: game.rnd.integerInRange(100, game.canvas.width - 100),
              y: game.rnd.integerInRange(-50, -100),
              ix: game.rnd.integerInRange(-100, 100),
              iy: 5
            });
          }


          phaserSprites.getManyGroups(['ui_overlay', 'aliens', 'boss', 'trashes']).map(obj => {
            if(obj !== undefined){
              obj.onUpdate()
            }
          })

          phaserTexts.getManyGroups(['ui', 'timeKeeper']).map(obj => {
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
              case 'LASER':
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

            if(secondaryWeapon.reference === 'CLUSTERBOMB'){
              let {x, y} = player
              createClusterbomb({x: x, y: y, velocity: secondaryWeapon.velocity, damage: secondaryWeapon.damage, bomblets: secondaryWeapon.bomblets})
            }

            if(secondaryWeapon.reference === 'TRIPLEBOMB'){
              let {x, y} = player
              createTriplebomb({x: x, y: y, initialVelocity: secondaryWeapon.initialVelocity, velocity: secondaryWeapon.velocity, damage: secondaryWeapon.damage, delay: 1})
              createTriplebomb({x: x, y: y, initialVelocity: secondaryWeapon.initialVelocity, velocity: secondaryWeapon.velocity, damage: secondaryWeapon.damage, delay: 2})
              createTriplebomb({x: x, y: y, initialVelocity: secondaryWeapon.initialVelocity, velocity: secondaryWeapon.velocity, damage: secondaryWeapon.damage, delay: 3})
            }

            if(secondaryWeapon.reference === 'TURRET'){
              let {x, y} = player
              createTurret({x: x, y: y, damage: secondaryWeapon.damage, lifespan: secondaryWeapon.lifespan})
            }

            if(secondaryWeapon.reference === 'MINES'){
              let {x, y} = player
              createMine({x: x, y: y, damage: secondaryWeapon.damage, limit: secondaryWeapon.limit})
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

            if(menuButtonSelection === 1){
              updateStore();
              nextLevel();
            }
            if(menuButtonSelection === 2){
              updateStore();
              saveAndQuit();
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

            if(menuButtonSelection === 1){
              retryLevel();
            }
            if(menuButtonSelection === 2){
              resetGame();
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
        phaserSprites.getGroup('secondaryWpnSprite').map(obj => {
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
              weaponManager.createExplosion(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height), game.rnd.integerInRange(1, 4), 6)
            }, game.rnd.integerInRange(0, 50)*i)
          }

          setTimeout(() => {
            // destroy all aliens
            phaserSprites.getGroup('aliens').map((alien) => {
              setTimeout(() => {
                  alien.destroyIt(false)
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
                  let leftText = phaserTexts.add({name: 'popLeft',  font: 'gem', x: this.x, y: this.y - 10,  size: 24, default: `PEOPLE SAVED:`, alpha: 0})
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
                                            phaserMaster.changeState('VICTORYSTATE');
                                            phaserSprites.getGroup('ui_buttons').map(obj => {
                                              obj.reveal()
                                            })
                                            phaserTexts.get('menuButton1Text').setText('CONTINUE')
                                            phaserTexts.get('menuButton2Text').setText('SAVE AND QUIT')
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
        phaserSprites.getGroup('secondaryWpnSprite').map(obj => {
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
        let game = phaserMaster.game();
        let overlaybmd = phaserBitmapdata.addGradient({name: 'overlayFadeout', start: '#ffffff', end: '#ffffff', width: 5, height: 5, render: false})
        let overlay = phaserSprites.add({x: 0, y: 0, name: `overlayFinal`, width: game.world.width, height: game.world.height, reference: overlaybmd.cacheBitmapData, alpha: 0})
        phaserGroup.add(20, overlay)
        game.add.tween(overlay).to( { alpha: 1 }, Phaser.Timer.SECOND, Phaser.Easing.Linear.In, true, 0, 0, false).
          onComplete.add(() => {
            setTimeout(() => {
              callback();
            }, 500)
          })
      }

      function nextLevel(){
        updateStore();
        parent.loadNextLevel()
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

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
import {ITEMSPAWN_MANAGER} from './required/itemspawnManager'
import {UTILITY_MANAGER} from './required/utilityManager'
//endRemoveIf(gameBuild)

class PhaserGameObject {
    // this properties
    global:any;
    game:any;
    devMode: any
    /******************/
    constructor(){
      // accessible in gameObject as _this, accessible in class functions as this (obviously)
      this.game = null;
      this.global = {
        pause: false
      };
      this.devMode = {
        skip: {
          intro: true
        }
      }
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
            enemyManager = new ENEMY_MANAGER({showHitbox: false}),
            playerManager = new PLAYER_MANAGER(),
            itemManager = new ITEMSPAWN_MANAGER(),
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
        game.load.image('example', `${folder}/images/earth.png`);
        //game.load.atlas('atlas', `${folder}/spritesheets/heroSelect/heroSelectAtlas.png`, `${folder}/spritesheets/heroSelect/heroSelectAtlas.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

        game.load.atlas('atlas_main', `${folder}/textureAtlas/main/main.png`, `${folder}/textureAtlas/main/main.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('atlas_weapons', `${folder}/textureAtlas/weapons/weaponsAtlas.png`, `${folder}/textureAtlas/weapons/weaponsAtlas.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('atlas_large', `${folder}/textureAtlas/large/large.png`, `${folder}/textureAtlas/large/large.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('atlas_enemies', `${folder}/textureAtlas/enemies/enemies.png`, `${folder}/textureAtlas/enemies/enemies.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('atlas_ships', `${folder}/textureAtlas/ships/ships.png`, `${folder}/textureAtlas/ships/ships.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

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
      function tweenTint(obj, startColor, endColor, time, callback) {    // create an object to tween with our step value at 0
        let game = phaserMaster.game();
        let colorBlend = {step: 0};    // create the tween on this object and tween its step property to 100
        let colorTween = game.add.tween(colorBlend).to({step: 100}, time);
         // run the interpolateColor function every time the tween updates, feeding it the
         // updated value of our tween each time, and set the result as our tint
         colorTween.onUpdateCallback(() => {
           obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
         });

         // if you passed a callback, add it to the tween on complete
         if (callback) {
             colorTween.onComplete.add(callback, game);
         }
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
        itemManager.assign(game, phaserMaster, phaserSprites, phaserGroup, 'atlas_main')
        enemyManager.assign(game, phaserMaster, phaserSprites, phaserTexts, phaserGroup, weaponManager, 'atlas_enemies', 'atlas_weapons')
        playerManager.assign(game, phaserMaster, phaserSprites, phaserTexts, phaserGroup, phaserControls, weaponManager, 'atlas_ships', 'atlas_weapons')
        utilityManager.assign(game, phaserSprites, phaserBitmapdata, phaserGroup, 'atlas_main')

        // game variables
        phaserMaster.let('roundTime', 60)
        phaserMaster.let('clock', game.time.create(false))
        phaserMaster.let('elapsedTime', 0)
        phaserMaster.let('inGameSeconds', 0)
        phaserMaster.let('devMode', false)
        phaserMaster.let('starMomentum', {x: 0, y:0})
        phaserMaster.let('pauseStatus', false)
        phaserMaster.let('bossHealth', null)
        phaserMaster.let('powerupTimer', 0)
        phaserMaster.let('bossMode', false)           // turn on for when the boss is available
        phaserMaster.let('showWarningBand', false)    // turn on to show warning band

        // weapon data
        let weaponData = phaserMaster.let('weaponData', game.cache.getJSON('weaponData'));
        let pw = phaserMaster.let('primaryWeapon', weaponData.primaryWeapons[gameData.primaryWeapon])
        let sw = phaserMaster.let('secondaryWeapon', weaponData.secondaryWeapons[gameData.secondaryWeapon])
        let perk = phaserMaster.let('perk', weaponData.perks[gameData.perk])

        // pause behavior
        game.onPause.add(() => {
          pauseGame()
        }, this);
        game.onResume.add(() => {
          unpauseGame();
        }, this);


        buildTransitionScreen()
        buildBackground()
        buildScore()
        buildMenuAndButtons();
        buildBossWarning();

        buildHealthbar_player()
        buildPow_player()
        buildPortrait_player()
        buildHealthbar_boss()
      }
      /******************/

      /******************/
      function buildTransitionScreen(){
        let game = phaserMaster.game();
            game.physics.startSystem(Phaser.Physics.ARCADE);
        // animate in
        utilityManager.buildOverlayBackground('#ffffff', '#ffffff', 19, true)
        utilityManager.buildOverlayGrid(240, 132, 20, 'logo_small')

        // create boundry
        let boundryObj = phaserBitmapdata.addGradient({name: 'boundryObj', start: '#ffffff', end: '#ffffff', width: 5, height: 5, render: false})
        let leftBoundry = phaserSprites.add({x: -9, y: -game.world.height/2, name: `leftBoundry`, group: 'boundries', width:10, height: game.world.height*2, reference: boundryObj.cacheBitmapData, alpha: 0})
        let rightBoundry = phaserSprites.add({x: game.world.width - 1, y: -game.world.height/2, name: `rightBoundry`, group: 'boundries', width:10, height: game.world.height*2, reference: boundryObj.cacheBitmapData, alpha: 0})
        game.physics.enable([leftBoundry,rightBoundry], Phaser.Physics.ARCADE);
        leftBoundry.body.immovable = true;
        rightBoundry.body.immovable = true;
      }
      /******************/

      /******************/
      function buildBackground(){
        let starMomentum = phaserMaster.get('starMomentum')

        let background1 = phaserSprites.addTilespriteFromAtlas({ name: 'bg1', group: 'backgrounds', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'Nebula3' });
            //background1.count = 0;
            background1.onUpdate = () =>  {
                //background1.count += 0.005;
                //Math.sin(background1.count) * 0.2;
                background1.tilePosition.y += 1
                background1.tilePosition.x += starMomentum.x/4
            };

        let background2 = phaserSprites.addTilespriteFromAtlas({ name: 'bg2', group: 'backgrounds', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'Nebula1' });
            background2.tilePosition.x = 500
            background2.onUpdate = () => {
                background2.tilePosition.y += 5
                background2.tilePosition.x += starMomentum.x/2
            };
        phaserGroup.addMany(1, [background1, background2])

        let foreground1 = phaserSprites.addTilespriteFromAtlas({ name: 'fg1', group: 'backgrounds', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_large', filename: 'Nebula2', alpha: 0.25});
            foreground1.tilePosition.x = 300
            foreground1.onUpdate = () => {
                foreground1.tilePosition.y += 10
                foreground1.tilePosition.x += starMomentum.x
            };
        phaserGroup.addMany(10, [foreground1])


        // // stars
        //let stars = phaserBmd.addGradient({name: 'starBmp', group: 'blockBmpGroup', start: '#ffffff', end: '#ffffff', width: 1, height: 1, render: false})
        for (let i = 0; i < 10; i++){
            let star = phaserSprites.addFromAtlas({x: game.rnd.integerInRange(0, game.world.width), y:game.rnd.integerInRange(0, game.world.height), name: `star_${i}`, group: 'starfield', filename: `stars_layer_${game.rnd.integerInRange(1, 3)}`, atlas: 'atlas_main', visible: true})
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

                phaserGroup.layer(0).add(star)
        }

      }
      /******************/

      /******************/
      function buildMenuAndButtons(){
          // BUILD MENU BUTTONS
          let menuButton1 = phaserSprites.addFromAtlas({ name: `menuButton1`, group: 'menuButtons', x: game.world.centerX, y: game.world.centerY + 125, atlas: 'atlas_main', filename: 'ui_button', visible: true });
              menuButton1.anchor.setTo(0.5, 0.5)
              menuButton1.init = () => {
                menuButton1.visible = false
              }
              menuButton1.reveal = function(){
                this.visible = true;
              }
          let menuButton1Text = phaserTexts.add({name: 'menuButton1Text', group: 'ui',  font: 'gem', x: menuButton1.x, y: menuButton1.y,  size: 14, default: ``})
              menuButton1Text.anchor.setTo(0.5, 0.5)

          let menuButton2 = phaserSprites.addFromAtlas({ name: `menuButton2`, group: 'menuButtons',  x: game.world.centerX, y: game.world.centerY + 175,  atlas: 'atlas_main', filename: 'ui_button', visible: true });
              menuButton2.anchor.setTo(0.5, 0.5)
              menuButton2.init = () => {
                menuButton2.visible = false
              }
              menuButton2.reveal = function(){
                this.visible = true;
              }
          let menuButton2Text = phaserTexts.add({name: 'menuButton2Text', group: 'ui',  font: 'gem', x: menuButton2.x, y: menuButton2.y,  size: 14, default: ``})
              menuButton2Text.anchor.setTo(0.5, 0.5)

          let menuButtonCursor = phaserSprites.addFromAtlas({ name: `menuButtonCursor`, group: 'menuButtons', x: game.world.centerX - 125, atlas: 'atlas_main', filename: 'ui_cursor', visible: true });
              menuButtonCursor.anchor.setTo(0.5, 0.5)
              menuButtonCursor.init = () => {
                menuButtonCursor.visible = false
              }
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
      }
      /******************/

      /******************/
      function buildBossWarning(){
        let warningBand = phaserSprites.addTilespriteFromAtlas({ name: 'showWarningBand', group: 'boss_ui', x: 0, y: game.world.centerY - 100, width: game.canvas.width, height: 100, atlas: 'atlas_main', filename: 'warning_band', alpha: 0 });
            warningBand.cosWave = {data: game.math.sinCosGenerator(150, 100 , 0, 1).cos, count: 0}
            warningBand.onUpdate = () => {
                let {showWarningBand} = phaserMaster.getOnly(['showWarningBand'])
                if(showWarningBand){
                  warningBand.cosWave.count++
                  if(warningBand.cosWave.count > warningBand.cosWave.data.length - 1){ warningBand.cosWave.count = 0}
                  warningBand.alpha = Math.round(warningBand.cosWave.data[warningBand.cosWave.count])
                  warningBand.tilePosition.x += 10
                }
                else{
                  if(warningBand.cosWave.count !== 0){
                    warningBand.cosWave.count++
                    if(warningBand.cosWave.count > warningBand.cosWave.data.length - 1){ warningBand.cosWave.count = 0}
                    warningBand.alpha = Math.round(warningBand.cosWave.data[warningBand.cosWave.count])
                    warningBand.tilePosition.x += 10
                  }
                }
            };

      }
      /******************/

      /******************/
      function buildScore(){
        let game = phaserMaster.game();

        let scoreContainer = phaserSprites.addFromAtlas({name: `scoreContainer`, group: 'uiScore', org: 'ui', filename: 'ui_roundContainer', atlas: 'atlas_main', visible: true})
        scoreContainer.anchor.setTo(0.5, 0.5)
        phaserSprites.centerOnPoint('scoreContainer', game.world.width/2 + scoreContainer.width/2, scoreContainer.height/2 + scoreContainer.height/2 + 20)
        phaserGroup.addMany(10, [scoreContainer])
        scoreContainer.setDefaultPositions()

        //states
        scoreContainer.init = () => {
          scoreContainer.y  = -100
        }
        scoreContainer.reveal = () => {
          let y = scoreContainer.getDefaultPositions().y
          scoreContainer.setDefaultPositions();
          game.add.tween(scoreContainer).to( { y: y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }
        scoreContainer.hide = () => {
          game.add.tween(scoreContainer).to( { y: scoreContainer.getDefaultPositions().y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }


        // text
        let scoreText = phaserTexts.add({name: `scoreText`, group: 'uiScore', font: 'gem', size: 18, default: '1100', visible: true})
        scoreText.anchor.setTo(0.5, 0.5)
        scoreContainer.addChild(scoreText)

        // text states
        scoreText.init = () => {
            scoreText.updateScore()
        }
        scoreText.updateScore = () => {
          scoreText.setText(`${phaserMaster.get('gameData').score}`)
        }

      }
      /******************/

      /******************/
      function buildPortrait_player(){
        let game = phaserMaster.game();

        let container = phaserSprites.addEmptySprite({name: `portraitContainer`, group: 'player_portrait', org: 'ui'})
        phaserSprites.centerOnPoint('portraitContainer', container.width/2 + 20, game.world.height - container.height/2 - 75)
        phaserGroup.addMany(10, [container])
        container.setDefaultPositions()

        // children
        let mockPortrait = phaserSprites.addFromAtlas({x: 3, y: 3, name: `mockPortrait`, filename: 'ui_portrait_1', atlas: 'atlas_main', visible: true})
        container.addChild(mockPortrait)

        let staticContainer = phaserSprites.addFromAtlas({name: `staticContainer`,  filename: 'portrait_static_1', atlas: 'atlas_main', visible: true, alpha: 0.4})
        let staticAnimation = [...Phaser.Animation.generateFrameNames('portrait_static_', 1, 4), ...Phaser.Animation.generateFrameNames('portrait_static_', 3, 1)]
        staticContainer.animations.add('static', staticAnimation, 1, true)
        staticContainer.setStaticLevel = (type:string) => {
          staticContainer.animations.stop('static')
          let {framerate, alpha} = {framerate: 12, alpha: 0.5}
          switch(type){
              case 'HEAVY':
                framerate = 18
                alpha = 0.3
              break
              case 'MED':
                framerate = 12
                alpha = 0.2
              break
              case 'LIGHT':
                framerate = 6
                alpha = 0.1
              break
          }
          staticContainer.alpha = alpha;
          staticContainer.animations.play('static', framerate, true)
        }
        container.addChild(staticContainer)

        let portraitFrame = phaserSprites.addFromAtlas({name: `portraitFrame`, filename: 'ui_portraitContainer', atlas: 'atlas_main', visible: true})
        container.addChild(portraitFrame)

        //states
        container.init = () => {
          container.y  = container.y + 200
        }
        container.reveal = () => {
          let y = container.getDefaultPositions().y
          container.setDefaultPositions();
          game.add.tween(container).to( { y: y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }
        container.hide = () => {
          game.add.tween(container).to( { y: container.getDefaultPositions().y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }



      }
      /******************/

      /******************/
      function buildHealthbar_player(){
        let game = phaserMaster.game();
        let healthbar_player = phaserSprites.addFromAtlas({y: 100, name: `healthbar_player`, group: 'player_healthbar', org:'ui', filename: 'healthbar_player', atlas: 'atlas_main', visible: true})
        phaserSprites.centerOnPoint('healthbar_player', 300, game.world.height - healthbar_player.height/2 - 10)
        phaserGroup.addMany(10, [healthbar_player])
        healthbar_player.setDefaultPositions()

        // children
        // damagebar
        let unit_damage_player = phaserSprites.addFromAtlas({x: 5, y: 3,  width: healthbar_player.width - 10, name: `unit_damage_player`, filename: 'unit_damage', atlas: 'atlas_main', visible: true})
            unit_damage_player.maxHealth = unit_damage_player.width - 10;
        healthbar_player.addChild(unit_damage_player)
        unit_damage_player.init = () => {}
        unit_damage_player.updateHealth = (remaining:number) => {
          let healthRemaining = remaining/100
          let {damageBar} = phaserMaster.getAll();
          if(damageBar !== undefined){
            damageBar.stop()
          }
          phaserMaster.forceLet('damageBar',game.add.tween(unit_damage_player).to( { width: unit_damage_player.maxHealth * healthRemaining }, 500, Phaser.Easing.Linear.In, true, 500, 0, false))
        }

        // healthbar
        let unit_health_player = phaserSprites.addFromAtlas({x: 5, y: 3, width: healthbar_player.width - 10, name: `unit_health_player`, filename: 'unit_health', atlas: 'atlas_main', visible: true})
            healthbar_player.maxHealth = healthbar_player.width - 10;
        healthbar_player.addChild(unit_health_player)
        unit_health_player.init = () => {
          let {gameData} = phaserMaster.getOnly(['gameData']);
          let health = gameData.player.health
          updateShipHealthbar(health)
        }
        unit_health_player.updateHealth = (remaining:number) => {
          let healthRemaining = remaining/100
          unit_health_player.width = healthbar_player.maxHealth * healthRemaining;
        }

        // states
        healthbar_player.init = () => {
          healthbar_player.y  = healthbar_player.y + 200
        }
        healthbar_player.reveal = () => {
          let y = healthbar_player.getDefaultPositions().y
          healthbar_player.setDefaultPositions();
          game.add.tween(healthbar_player).to( { y: y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {
              healthbar_player.buildLives()
            })
        }
        healthbar_player.hide = () => {
          game.add.tween(healthbar_player).to( { y: healthbar_player.getDefaultPositions().y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }


        // life icons
        healthbar_player.buildLives = () => {
          let {gameData} = phaserMaster.getOnly(['gameData']);
          for(let i = 0; i < gameData.player.lives; i++){
              let lifeIcon = phaserSprites.addFromAtlas({x: 0 + (25 * i), y: -20, name: `life_icon_${game.rnd.integer()}`, group: 'playerLives', filename: 'ship_icon', atlas: 'atlas_main', alpha: 0})
              healthbar_player.addChild(lifeIcon)
              game.add.tween(lifeIcon).to( { alpha: 1 }, 250, Phaser.Easing.Linear.In, true, (i*250), 0, false)
              lifeIcon.destroyIt = () => {
                game.add.tween(lifeIcon).to( { y: lifeIcon.y - 10, alpha: 0 }, 250, Phaser.Easing.Linear.In, true, 1, 0, false).
                  onComplete.add(() => {
                    phaserSprites.destroy(lifeIcon.name)
                  })
              }
          }
        }
        healthbar_player.loseLife = () => {
          let lives = phaserSprites.getGroup('playerLives');
          let life = lives[lives.length - 1]
              life.destroyIt();
        }

        // let unit_health_player = phaserSprites.addFromAtlas({x: 5, y: 3, width: 150, name: `unit_health_player`, filename: 'unit_health', atlas: 'atlas_main', visible: true})
        // healthbar_player.addChild(unit_health_player)
      }
      /******************/

      /******************/
      function buildPow_player(){
        let game = phaserMaster.game();
        let powerbar = phaserSprites.addFromAtlas({name: `powerbar`, group: 'player_pow', org:'ui', filename: 'powerbar', atlas: 'atlas_main', visible: true})
        phaserSprites.centerOnPoint('powerbar', game.world.width - 140, game.world.height - powerbar.height/2 - 10)
        phaserGroup.addMany(10, [powerbar])
        powerbar.setDefaultPositions()

        // children
        powerbar.setup = () => {
          //setup bars
          let useBar = 1
          for(let i = 0; i < 30; i++){
            let bar = phaserSprites.addFromAtlas({x:i * 8 + 5, y: 9, name: `powerbar_pow_${i}`, filename: `powerbar_level_${Math.floor(i/5) + 1}`, group: 'powerbar_bars', atlas: 'atlas_main', visible: true})
            bar.anchor.setTo(0.5, 0.5)
            bar.popOut = (delay:number) => {
              game.time.events.add(delay, () => {
                bar.scale.setTo(1.5, 1.5)
                game.add.tween(bar.scale).to( { x:1, y:1 }, 350, Phaser.Easing.Back.InOut, true, 1, 0, false)
              }).autoDestroy = true
            }

            bar.popLost = () => {
              game.add.tween(bar).to( { y: bar.y - 5, alpha: 0.5 }, 350, Phaser.Easing.Linear.In, true, 1, 0, false).
                onComplete.add(() => {
                  bar.y = bar.getDefaultPositions().y
                  bar.alpha = 1
                  bar.visible = false
                })
            }

            powerbar.addChild(bar)
          }
          // icon
          let powerbar_pow = phaserSprites.addFromAtlas({x: -20, y: 0, name: `powerbar_pow`, filename: 'powerbar_pow', atlas: 'atlas_main', visible: true})
          powerbar.addChild(powerbar_pow)
        }

        powerbar.updatePowerbar = () => {
          let {gameData} = phaserMaster.getOnly(['gameData']);
          let val = gameData.player.powerup
          let bars = phaserSprites.getGroup('powerbar_bars');
          for(let i = 0; i < bars.length; i++ ){

            bars[i].visible = true
            bars[i].popOut(i*35)
          }
          for(let i = val; i < bars.length; i++ ){
            bars[i].visible = false
            bars[i].popLost(i*35)
          }
        }

        powerbar.animateFull = () => {
          let bars = phaserSprites.getGroup('powerbar_bars');
          for(let i = 0; i < 30; i++ ){
            bars[i].visible = true
            bars[i].popOut(i*25)
          }
        }

        // states
        powerbar.init = () => {
          powerbar.y  = powerbar.y + 200
          powerbar.setup()
          powerbar.updatePowerbar()
        }
        powerbar.reveal = () => {
          let y = powerbar.getDefaultPositions().y
          powerbar.setDefaultPositions();
          game.add.tween(powerbar).to( { y: y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }
        powerbar.hide = () => {
          game.add.tween(powerbar).to( { y: powerbar.getDefaultPositions().y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }

        // SPECIAL ATTACKS
        let staticAnimation = [...Phaser.Animation.generateFrameNames('special_', 1, 5), 'special_1']
        for(let i = 0; i < 8; i++){
          let icon = phaserSprites.addFromAtlas({x:powerbar.width - 15 - (i * 30), y: -20, name: `special_icon_${i}`, group: 'special_icons', filename: `${staticAnimation[0]}`, atlas: 'atlas_main', visible: true})
          icon.anchor.setTo(0.5, 0.5)
          icon.animateInterval = game.time.now
          icon.index = i;
          icon.animations.add('animate', staticAnimation, 1, true)


          icon.onUpdate = () => {
            // add to powerupbar every 2 seconds
            if(game.time.now > icon.animateInterval){
              icon.animateInterval = game.time.now + 5000
              game.time.events.add(icon.index * 500, () => {
                icon.animations.play('animate', 10, false)
              }).autoDestroy = true
            }
          }


          powerbar.addChild(icon)
        }
      }
      /******************/

      /******************/
      function buildHealthbar_boss(){
        let game = phaserMaster.game();
        let healthbar_boss = phaserSprites.addFromAtlas({ name: `healthbar_boss`, group: 'boss_healthbar',  filename: 'healthbar_boss', atlas: 'atlas_main', visible: true})
        phaserSprites.centerOnPoint('healthbar_boss', game.world.width/2, 25)
        phaserGroup.addMany(10, [healthbar_boss])
        healthbar_boss.setDefaultPositions()

        // children
        let unit_damage_boss = phaserSprites.addFromAtlas({x: 5, y: 3, width: healthbar_boss.width - 10, name: `unit_damage_boss`, filename: 'unit_damage', atlas: 'atlas_main', visible: true})
        unit_damage_boss.maxHealth = unit_damage_boss.width;
        unit_damage_boss.fillComplete = false;
        healthbar_boss.addChild(unit_damage_boss)
        unit_damage_boss.init = () => { unit_damage_boss.width = 0 }
        unit_damage_boss.updateHealth = (remaining:number) => {
          let healthRemaining = remaining/100
          let {enemyDamageBar} = phaserMaster.getAll();
          if(enemyDamageBar !== undefined){
            enemyDamageBar.stop()
          }
          phaserMaster.forceLet('enemyDamageBar',game.add.tween(unit_damage_boss).to( { width: unit_damage_boss.maxHealth * healthRemaining }, 500, Phaser.Easing.Linear.In, true, 500, 0, false))
        }
        unit_damage_boss.fill = (remaining:number) => {
          let healthRemaining = remaining/100
          game.add.tween(unit_damage_boss).to( { width: unit_damage_boss.maxHealth * healthRemaining}, Phaser.Timer.SECOND, Phaser.Easing.Exponential.Out, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {
              unit_damage_boss.fillComplete = true;
            })
        }


        let unit_health_boss = phaserSprites.addFromAtlas({x: 5, y: 3, width: healthbar_boss.width - 10,  name: `unit_health_boss`, filename: 'unit_health', atlas: 'atlas_main', visible: true})
        unit_health_boss.maxHealth = unit_health_boss.width;
        unit_health_boss.fillComplete = false;
        healthbar_boss.addChild(unit_health_boss)
        unit_health_boss.init = () => { unit_health_boss.width = 0 }
        unit_health_boss.updateHealth = (remaining:number) => {
          if(unit_health_boss.fillComplete){
            let healthRemaining = remaining/100
            unit_health_boss.width = unit_health_boss.maxHealth * healthRemaining;
          }
        }
        unit_health_boss.fill = (remaining:number, callback:any = () => {}) => {
          let healthRemaining = remaining/100
          game.add.tween(unit_health_boss).to( { width: unit_health_boss.maxHealth * healthRemaining}, Phaser.Timer.SECOND, Phaser.Easing.Exponential.Out, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {
              unit_health_boss.fillComplete = true;
              callback()
            })
        }

        let bossbar_portrait = phaserSprites.addFromAtlas({x: 0, y: -2, name: `bossbar_portrait`, filename: 'bossbar_picture', atlas: 'atlas_main', visible: true})
        healthbar_boss.addChild(bossbar_portrait)

        // states
        healthbar_boss.init = () => {
          healthbar_boss.y  = -200
        }
        healthbar_boss.reveal = () => {
          let y = healthbar_boss.getDefaultPositions().y
          healthbar_boss.setDefaultPositions();
          game.add.tween(healthbar_boss).to( { y: y  }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {
              fillEnemyhealth(phaserMaster.get('bossHealth'))
            })
        }
        healthbar_boss.hide = () => {
          game.add.tween(healthbar_boss).to( { y: healthbar_boss.getDefaultPositions().y }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, game.rnd.integerInRange(0, 500), 0, false).
            onComplete.add(() => {})
        }



      }
      /******************/

      /******************/
      function preloadComplete(){
        let game = phaserMaster.game();
        let isDevMode = phaserMaster.get('devMode')
        let {overlay} = phaserSprites.getOnly(['overlay']);
        let {clock, roundTime} = phaserMaster.getOnly(['clock', 'roundTime']);
        let skipAnimation = false

        // run init on all ui elements to put them in their initial place
        phaserSprites.getAll('ARRAY').map(obj => {
          obj.init()
        })

        phaserTexts.getAll('ARRAY').map(obj => {
          obj.init()
        })

        // update specials
        updateSpecials()

        overlayControls('WIPEOUT', () => {
          utilityManager.overlayBGControls({transition: 'FADEOUT', delay: 0, speed: skipAnimation ? 1 : 250}, () => {

            phaserSprites.getGroup('ui').map(obj => {
              obj.reveal()
            })

            let player = createPlayer();
                player.moveToStart();

            // LEAVE FOR TESTING
            game.time.events.add(Phaser.Timer.SECOND * 1*5, () => {
                //endLevel();
                addSpecial()
            }).autoDestroy = true;


            clock.start()
            phaserMaster.changeState('READY');

          })
        })
      }
      /******************/

      /******************/
      function overlayControls(transition:string, callback:any = ()=>{}){
        let skipAnimation = false
        utilityManager.overlayControls(
          { transition: transition,
            delay: skipAnimation ? 0 : 1000,
            speed: skipAnimation ? 0 : 250,
            tileDelay: skipAnimation ? 0 : 5}, callback)
      }
      /******************/

      /******************/
      function updateShipHealthbar(remaining:number){
        let {unit_damage_player, unit_health_player} = phaserSprites.getOnly(['unit_damage_player', 'unit_health_player'])
        checkStaticLevels(remaining)
        unit_damage_player.updateHealth(remaining)
        unit_health_player.updateHealth(remaining)
      }

      function addHealth(amount:number){
        let {gameData} = phaserMaster.getOnly(['gameData']);
        let health = gameData.player.health + amount
        if(health > 100){ health = 100  }
        saveData('player', {health: health, lives: gameData.player.lives, powerup: gameData.player.powerup, special: gameData.player.special})
        fillShipHealthbar(health)
      }

      function fillShipHealthbar(remaining:number){
        let {unit_damage_player, unit_health_player} = phaserSprites.getOnly(['unit_damage_player', 'unit_health_player'])
        checkStaticLevels(remaining)
        unit_damage_player.updateHealth(remaining)
        unit_health_player.updateHealth(remaining)
      }

      function checkStaticLevels(health:number){
        let {staticContainer} = phaserSprites.getOnly(['staticContainer'])
        if(health > 0 && health < 15){ staticContainer.setStaticLevel('HEAVY') }
        if(health > 15 && health < 35){ staticContainer.setStaticLevel('MED') }
        if(health > 35){ staticContainer.setStaticLevel('LIGHT') }
      }
      /******************/

      /******************/
      function updateEnemyHealth(remaining:number){
        let {unit_damage_boss, unit_health_boss} = phaserSprites.getOnly(['unit_damage_boss', 'unit_health_boss'])
        unit_damage_boss.updateHealth(remaining)
        unit_health_boss.updateHealth(remaining)
      }

      function fillEnemyhealth(remaining:number){
        let {unit_damage_boss, unit_health_boss} = phaserSprites.getOnly(['unit_damage_boss', 'unit_health_boss'])
        unit_health_boss.fill(remaining, () => {
            unit_damage_boss.updateHealth(remaining)
        })
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
                  game.time.events.add(350, () => {
                    phaserTexts.destroy(this.name)
                  }).autoDestroy = true;
                }
                game.time.events.add((Phaser.Timer.SECOND/2.5 * index) + 100, splashText.startSplash, splashText).autoDestroy = true;
          })

          game.time.events.add(Phaser.Timer.SECOND/2.5 * wordlist.length, callback, this).autoDestroy = true;

      }
      /******************/

      /******************/
      function addPowerup(){
        let {gameData} = phaserMaster.getOnly(['gameData']);
        let {powerbar} = phaserSprites.getOnly(['powerbar'])
        let val = gameData.player.powerup + 1
        if(val > 30){
          val = 30
          powerbar.animateFull()
        }
        else{
          saveData('player', {health: gameData.player.health, lives: gameData.player.lives, powerup: val, special: gameData.player.special})
          powerbar.updatePowerbar();
        }
      }
      /******************/

      /******************/
      function losePowerup(){
        let {gameData} = phaserMaster.getOnly(['gameData']);
        let {powerbar} = phaserSprites.getOnly(['powerbar'])
        let val = gameData.player.powerup - 1
        if(val < 0){ val = 0 }
        saveData('player', {health: gameData.player.health, lives: gameData.player.lives, powerup: val, special: gameData.player.special})
        phaserSprites.get(`powerbar_pow_${val}`).popLost()
      }
      /******************/

      /******************/
      function addSpecial(){
        let {gameData} = phaserMaster.getOnly(['gameData']);
        let val = gameData.player.special + 1
        if(val > 9){val = 9}
        saveData('player', {health: gameData.player.health, lives: gameData.player.lives, powerup: gameData.player.powerup, special: val})
        updateSpecials()
      }
      /******************/

      /******************/
      function loseSpecial(){
        let {gameData} = phaserMaster.getOnly(['gameData']);
        let val = gameData.player.special - 1
        if(val < 0){val = 0}
        saveData('player', {health: gameData.player.health, lives: gameData.player.lives, powerup: gameData.player.powerup, special: val})
        updateSpecials()
      }
      /******************/

      /******************/
      function updateSpecials(){
          let {gameData} = phaserMaster.getOnly(['gameData']);
          let val = gameData.player.special
          let icons = phaserSprites.getGroup('special_icons');
          for(let i = 0; i < icons.length; i++ ){
            icons[i].visible = true
          }
          for(let i = val; i < icons.length; i++ ){
            icons[i].visible = false
          }
      }
      /******************/

      /******************/
      function createPlayer(){
        let game = phaserMaster.game();
        let {gameData, primaryWeapon, secondaryWeapon, perk} = phaserMaster.getOnly(['gameData', 'primaryWeapon', 'secondaryWeapon', 'perk'])


        let onUpdate = (player:any) => {

        }

        let onDamage = (player:any) => {
          shakeHealth();
          losePowerup();
        }

        let updateHealth = (health:number) => {
          let {gameData} = phaserMaster.getOnly(['gameData'])
          updateShipHealthbar(health)
          saveData('player', {health: health, lives: gameData.player.lives, powerup: gameData.player.powerup, special: gameData.player.special})
        }

        let loseLife = (player:any) => {
          let {gameData} = phaserMaster.getOnly(['gameData'])
               gameData.player.lives--
          let {healthbar_player} = phaserSprites.getOnly(['healthbar_player'])
              healthbar_player.loseLife()

          if(gameData.player.lives > 0){
            saveData('player', {health: 100, lives: gameData.player.lives, powerup: 0, special: gameData.player.special})
            phaserControls.clearAllControlIntervals()
            phaserControls.disableAllInput()
            game.time.events.add(Phaser.Timer.SECOND, () => {
              updateHealth(100)
              player.moveToStart();
            }).autoDestroy = true
          }
          else{
            gameOver();
          }
        }

        let player = playerManager.createShip({name: 'player', group: 'playership', org: 'gameobjects', layer: 6, shipId: gameData.pilot, primaryWeapon: primaryWeapon.reference, secondaryWeapon: secondaryWeapon.reference, perk: perk.reference}, updateHealth, onDamage, loseLife, onUpdate);

        return player
      }
      /******************/

      /******************/
      function createBigEnemy(options){
        let game = phaserMaster.game();
        let onDestroy = (enemy:any) => {
            let {gameData} = phaserMaster.getOnly(['gameData'])
                 gameData.score += 200
            saveData('score', gameData.score)
            let {scoreText} = phaserTexts.getOnly(['scoreText'])
                 scoreText.updateScore();
        }
        let onDamage = () => {}
        let onFail = () => { }
        let onUpdate = () => {}
        let enemy = enemyManager.createBigEnemy1(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function createSmallEnemy(options){
        let game = phaserMaster.game();
        let onDestroy = (enemy:any) => {
            let {gameData} = phaserMaster.getOnly(['gameData'])
                 gameData.score += 200
            saveData('score', gameData.score)
            let {scoreText} = phaserTexts.getOnly(['scoreText'])
                scoreText.updateScore();
            if(game.rnd.integerInRange(0, 10) < 2){ spawnPowerup(enemy.x, enemy.y) }
        }
        let onDamage = () => {}
        let onUpdate = () => {}
        let enemy = enemyManager.createSmallEnemy1(options, onDamage, onDestroy, onUpdate)
      }
      /******************/

      /******************/
      function createAsteroid(options:any){
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
        let onFail = () => {   }
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
        let onFail = () => {  }
        let onUpdate = () => {}
        let enemy = enemyManager.createDebris(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function createBoss(options:any){
        // let game = phaserMaster.game();
        // let {bossContainer} = phaserSprites.getOnly(['bossContainer'])
        // let onDestroy = (enemy:any) => {
        //     bossContainer.hide();
        //     let {gameData} = phaserMaster.getOnly(['gameData'])
        //          gameData.score += 10000
        //     saveData('score', gameData.score)
        //     let {scoreText} = phaserTexts.getOnly(['scoreText'])
        //          scoreText.updateScore();
        //     endLevel()
        // }
        // let onDamage = (boss) => {
        //   let remainingHealth = Math.round(boss.health/boss.maxHealth*100)
        //   updateBossBar(remainingHealth)
        // }
        // let onFail = () => {
        //   phaserMaster.changeState('ENDLEVEL');
        //   bossContainer.hide();
        //   setTimeout(() => {
        //     let {currentState} = phaserMaster.getState();
        //     if(currentState !== 'GAMEOVER'){
        //       endLevel()
        //     }
        //   }, 1000)
        // }
        // let onUpdate = () => {}
        // let enemy = enemyManager.createGiantAsteroid(options, onDamage, onDestroy, onFail, onUpdate)
      }
      /******************/

      /******************/
      function shakeWorld(){
        game.camera.shake(0.005, 5000);
      }
      /******************/

      /******************/
      function shakeHealth(){
        let healthbar = phaserSprites.get('healthbar_player')
        // define the camera offset for the quake
        // we need to move according to the camera's current position
        let properties = {
          x: healthbar.x + game.rnd.integerInRange(-2, 2),
          y: healthbar.y + game.rnd.integerInRange(-2, 2)
        };
        // we make it a relly fast movement
        let duration = 45;
        let repeat = 1;
        let ease = Phaser.Easing.Bounce.InOut;
        let autoStart = false;
        let delay = 1;
        let yoyo = true;
        let quake = game.add.tween(healthbar).to(properties, duration, ease, autoStart, delay, 4, yoyo);
        quake.start();
      }
      /******************/

      /******************/
      function shakeUI(){
        let layer = phaserGroup.layer(10)
        // define the camera offset for the quake
        // we need to move according to the camera's current position
        let properties = {
          x: layer.x + game.rnd.integerInRange(-5, 5),
          y: layer.y + game.rnd.integerInRange(-5, 5)
        };
        // we make it a relly fast movement
        let duration = 50;
        let repeat = 2;
        let ease = Phaser.Easing.Bounce.InOut;
        let autoStart = false;
        let delay = 1;
        let yoyo = true;
        let quake = game.add.tween(layer).to(properties, duration, ease, autoStart, delay, 4, yoyo);
        quake.start();
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
      function spawnHealthpack(x:number, y:number){
        let onPickup = () => {
          addHealth(25)
        }
        itemManager.spawnHealthpack(x, y, 6, onPickup)
      }
      /******************/

      /******************/
      function spawnPowerup(x:number, y:number){
        let onPickup = () => {
          addPowerup()
        }
        itemManager.spawnPowerup(x, y, 6, onPickup)
      }
      /******************/

      /******************/
      function spawnSpecial(x:number, y:number){
        let onPickup = () => {
          addSpecial()
        }
        itemManager.spawnSpecial(x, y, 6, onPickup)
      }
      /******************/

      /******************/
      function incrementTime(duration:number){
        let {inGameSeconds} = phaserMaster.getOnly(['inGameSeconds'])
             inGameSeconds += duration
        phaserMaster.forceLet('inGameSeconds', inGameSeconds)
        return inGameSeconds
      }
      /******************/

      /******************/
      function director(){
        let {bossMode} = phaserMaster.getOnly(['bossMode'])
        let inGameSeconds = incrementTime(0.5)

        if(inGameSeconds === 30){
          startBossBattle()
        }

        if(!bossMode){
          if(inGameSeconds % 5 === 0){
            spawnSpecial(game.rnd.integerInRange(0 + 100, game.canvas.width - 100), 0)
          }

          // create a steady steam of aliens to shoot
          if(inGameSeconds % 1 === 0){
              createSmallEnemy({
                x: game.rnd.integerInRange(0 + 100, game.canvas.width - 100),
                y: game.rnd.integerInRange(100, 400),
                iy: game.rnd.integerInRange(0, 80),
                layer: 3
              });
          }
        }

      }
      /******************/

      /******************/
      function startBossBattle(){
         let game = phaserMaster.game();
         let {scoreContainer, player, healthbar_boss} = phaserSprites.getOnly(['scoreContainer', 'player', 'healthbar_boss']);
         phaserMaster.forceLet('bossMode', true)
         phaserMaster.forceLet('showWarningBand', true)
         shakeWorld()

         // get boss info - assign
         let boss = {
          name: 'BOSS',
          health: 100
        }
         phaserMaster.forceLet('bossHealth', boss.health)

         player.moveTo(game.world.centerX, game.world.centerY + game.world.centerY/2, 4000, () => {
           game.time.events.add(Phaser.Timer.SECOND * 2, () => {
             scoreContainer.hide();
             healthbar_boss.reveal()

             phaserMaster.forceLet('showWarningBand', false)
           }, this).autoDestroy = true;
         })
      }
      /******************/

      /******************/
      function update() {
        let game = phaserMaster.game();
        let {currentState} = phaserMaster.getState();
        let {starMomentum, primaryWeapon, secondaryWeapon, menuButtonSelection, elapsedTime, powerupTimer, gameData} = phaserMaster.getOnly(['starMomentum', 'primaryWeapon', 'secondaryWeapon', 'menuButtonSelection', 'elapsedTime', 'powerupTimer', 'gameData'])
        let {player, menuButtonCursor} = phaserSprites.getOnly(['player', 'menuButtonCursor']);
        let {DOWN, UP, LEFT, RIGHT, A, START} = phaserControls.getOnly(['DOWN', 'UP', 'LEFT', 'RIGHT', 'A', 'START'])

        //console.log(game.time.suggestedFps)

        if(currentState !== 'VICTORYSTATE' && currentState !== 'GAMEOVERSTATE' && currentState !== 'ENDLEVEL'){
          phaserSprites.getManyGroups(['backgrounds', 'starfield', 'playership', 'special_icons', 'itemspawns', 'boss_ui']).map(obj => {
            obj.onUpdate()
          })
        }


        if(currentState === 'READY'){

          // add to powerupbar every 2 seconds
          if(game.time.now > powerupTimer){
            phaserMaster.forceLet('powerupTimer', gameData.player.powerup < 30 ? game.time.now + (Phaser.Timer.SECOND*0.5) : game.time.now + (Phaser.Timer.SECOND/2) )
            addPowerup();
          }

          // update director EVERY 1/2 second
          if(game.time.now > elapsedTime){
            phaserMaster.forceLet('elapsedTime', game.time.now + (Phaser.Timer.SECOND/2) )
            director()
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
            player.fireWeapon()
          }

          if(phaserControls.checkWithDelay( {isActive: true, key: 'B', delay:  500} ) && gameData.player.special > 0){
            loseSpecial()
            player.fireSubweapon()
            // if(specialWeapon !== undefined){
            //   // reset speciaal timer and start charge animation
            //   // updateShipSpecial(0, true)
            //   // game.time.events.add(50, () => {
            //   //   updateShipSpecial(100, false, secondaryWeapon.cooldown-50)
            //   // }).autoDestroy = true;
            // }
            //
            // switch(secondaryWeapon.reference){
            //   case 'CLUSTERBOMB':
            //     createClusterbomb()
            //     break
            //   case 'TRIPLEBOMB':
            //     createTriplebomb()
            //     break
            //   case 'TURRET':
            //     createTurret()
            //     break
            //   case 'BLASTRADIUS':
            //
            //     break
            // }
          }
        }



        if(currentState === 'VICTORYSTATE'){
          if(phaserControls.checkWithDelay({isActive: true, key: 'UP', delay: 100 })){
            menuButtonCursor.updateLocation(1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'DOWN', delay: 100 })){
            menuButtonCursor.updateLocation(2)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 250 })){
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
          if(phaserControls.checkWithDelay({isActive: true, key: 'UP', delay: 100 })){
            menuButtonCursor.updateLocation(1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'DOWN', delay: 100 })){
            menuButtonCursor.updateLocation(2)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 100 })){
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
            //player.onUpdate()
        }
      }
      /******************/

      /******************/
      function endLevel(){
        let game = phaserMaster.game();
        let gameData = phaserMaster.get('gameData');
        phaserControls.disableAllInput();

        phaserSprites.getGroup('ui').map(obj => {
          obj.hide()
        })

        phaserSprites.getGroup('ship_secondary_weapons').map(obj => {
          obj.destroyIt()
        })


        phaserSprites.get('player').playEndSequence(() => {
            phaserMaster.changeState('ENDLEVEL');

            // add any last second images
            //createExplosion(game.world.centerX, game.world.centerY, 4, 8)

            // minor delay to capture them
            game.time.events.add(150, () => {
              let bmd = game.add.bitmapData(game.width, game.height);
                  bmd.drawFull(game.world);
              var bmdImage = bmd.addToWorld(game.world.centerX + 100, game.world.centerY + 100, 0.5, 0.5, 2, 2);
              phaserGroup.add(5, bmdImage)


              phaserSprites.getManyGroups(['backgrounds', 'starfield', 'gameobjects']).map(obj => {
                obj.destroy()
              })

              utilityManager.overlayBGControls({transition: 'FLASHWHITE', delay: 0, speed: 600}, () => {

                bmdImage.scale.setTo(0.5, 0.5)
                bmdImage.x = 0
                bmdImage.y = 0

                let newsPaper = phaserSprites.addFromAtlas({x: game.world.centerX, y: game.world.centerY, width: game.world.width, height: game.world.height, name: `newspaper`, group: 'gameobjects', filename: 'newspaper', atlas: 'atlas_main', visible: true})
                    newsPaper.anchor.setTo(0.5, 0.5)
                    newsPaper.scale.setTo(3, 3)
                    newsPaper.addChild(bmdImage)
                    phaserGroup.add(6, newsPaper)

                tweenTint(bmdImage, 0x000000, 0xffffff, 3000, () => {
                  phaserControls.enableAllInput();

                  let {menuButton1Text, menuButton2Text} = phaserTexts.getOnly(['menuButton1Text', 'menuButton2Text'])
                  phaserMaster.changeState('VICTORYSTATE');
                  phaserSprites.getGroup('menuButtons').map(obj => {
                    obj.reveal()
                  })

                  menuButton1Text.setText('NEXT STAGE')
                  menuButton2Text.setText('SAVE AND QUIT')

                });
                game.add.tween(newsPaper.scale).to( { x: 1, y: 1 }, Phaser.Timer.SECOND*1.5, Phaser.Easing.Bounce.Out, true, 0, 0, false)
                game.add.tween(newsPaper).to( { angle: 35, y: newsPaper.y - 50 }, Phaser.Timer.SECOND*1.5, Phaser.Easing.Linear.InOut, true, 0, 0, false)
              })
            }).autoDestroy = true;
        })
      }
      /******************/

      /******************/
      function victoryScreenSequence(callback:any){
        // let game = phaserMaster.game();
        // let gameData = phaserMaster.get('gameData');
        //
        //
        // let victoryScreenContainer = phaserSprites.addFromAtlas({y: game.world.centerY - 100, name: `victoryScreenContainer`, group: 'ui_clear', filename: 'ui_clear', atlas: 'atlas_main', visible: false})
        //     victoryScreenContainer.anchor.setTo(0.5, 0.5)
        //     victoryScreenContainer.reveal = function(){
        //       this.x = -this.width - 100
        //       this.visible = true
        //       this.game.add.tween(this).to( { x: this.game.world.centerX }, Phaser.Timer.SECOND*1, Phaser.Easing.Bounce.Out, true, 0, 0, false).
        //         onComplete.add(() => {
        //
        //           let scoreContainer = phaserSprites.addFromAtlas({x: this.game.world.centerX, y: this.game.world.centerY, name: `scoreContainer2`, group: 'ui', filename: 'ui_roundContainer', atlas: 'atlas_main', visible: true})
        //               scoreContainer.anchor.setTo(0.5, 0.5)
        //           let scoreText = phaserTexts.add({name: 'scoreText2', group: 'ui_text', x:scoreContainer.x, y: scoreContainer.y,  font: 'gem', size: 14, default: `${gameData.score}`})
        //               scoreText.anchor.setTo(0.5, 0.5)
        //               scoreText.updateScore = function(){
        //                 this.setText(`${phaserMaster.get('gameData').score}`)
        //               }
        //               phaserGroup.addMany(12, [scoreContainer])
        //               phaserGroup.addMany(13, [scoreText])
        //
        //           let population = phaserMaster.get('gameData').population
        //           let leftText = phaserTexts.add({name: 'popLeft', group: 'ui', font: 'gem', x: this.x, y: this.y - 10,  size: 24, default: `PEOPLE SAVED:`, alpha: 0})
        //               leftText.anchor.setTo(0.5, 0.5)
        //               leftText.scale.setTo(2, 2)
        //               leftText.game.add.tween(leftText.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //               leftText.game.add.tween(leftText).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //                 .onComplete.add(() => {
        //                   setTimeout(() => {
        //                     let population = phaserMaster.get('gameData').population
        //                     let peopleCount = phaserTexts.add({name: 'popCount',  font: 'gem', x: this.x, y: this.y + 30,  size: 45, default: ``, alpha: 0})
        //                         peopleCount.anchor.setTo(0.5, 0.5)
        //                         peopleCount.scale.setTo(1.5, 1.5)
        //                         peopleCount.setText(`${(population.total - population.killed)* 700000}`)
        //                         peopleCount.game.add.tween(peopleCount.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //                         peopleCount.game.add.tween(peopleCount).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //
        //                         phaserGroup.addMany(13, [peopleCount])
        //
        //                         let totalCount = (population.total - population.killed)* 700000;
        //                         let countBy = 543211
        //                         let medalsEarned = 0
        //                         let totalSaved = 0
        //                         let countInterval = setInterval(() => {
        //                             if(!phaserMaster.get('pauseStatus')){
        //                               if(countBy > totalCount){
        //                                 countBy = Math.round(countBy/2)
        //                               }
        //                               if(totalCount - countBy <= 0){
        //                                 peopleCount.setText(0)
        //                                 clearInterval(countInterval)
        //
        //
        //                                 setTimeout(() => {
        //                                   leftText.setText('MEDALS EARNED')
        //                                   phaserTexts.destroy('popCount')
        //
        //                                   for(let i = 0; i < medalsEarned; i++){
        //                                     let medal = phaserSprites.addFromAtlas({ name: `medal_${i}`, group: 'medals', x: victoryScreenContainer.x + (i*20) - 80, y: victoryScreenContainer.y + 20, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas_main', filename: 'medal_gold', alpha: 0 });
        //                                         medal.reveal = function(){
        //                                           this.scale.setTo(2, 2)
        //                                           this.game.add.tween(this.scale).to( { x: 1, y: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //                                           this.game.add.tween(this).to( { alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 0)
        //                                         }
        //                                         phaserGroup.addMany(13, [medal])
        //                                         setTimeout(() => {
        //                                           medal.reveal();
        //                                         }, i*50)
        //                                   }
        //

        //                               }
        //                               else{
        //                                 totalSaved += countBy
        //                                 if(totalSaved > 10000000){
        //                                   saveData('score', Math.round(gameData.score + 2000))
        //                                   scoreText.updateScore();
        //                                   medalsEarned++
        //                                   totalSaved = 0;
        //                                 }
        //                                 totalCount -= countBy
        //                                 peopleCount.setText(totalCount)
        //                               }
        //                             }
        //                         }, 1)
        //
        //                   }, Phaser.Timer.SECOND/2)
        //                 })
        //
        //           //phaserGroup.addMany(12, [characterPortrait])
        //         })
        //     }
        //     victoryScreenContainer.hide = function(){
        //       this.game.add.tween(this).to( { y: -this.height }, Phaser.Timer.SECOND, Phaser.Easing.Back.InOut, true, 500, 0, false)
        //     }
        //     victoryScreenContainer.reveal();
        //     phaserGroup.addMany(13, [victoryScreenContainer])
      }
      /******************/

      /******************/
      function gameOver(){
        phaserMaster.changeState('GAMEOVER');
        let player = phaserSprites.get('player')
        let earth = phaserSprites.get('earth')
        phaserControls.disableAllInput();
        phaserMaster.changeState('GAMEOVERSTATE');

        phaserSprites.getGroup('ui').map(obj => {
          obj.hide();
        })

        // minor delay to capture them
        game.time.events.add(Phaser.Timer.SECOND * 3, () => {

          let bmd = game.add.bitmapData(game.width, game.height);
              bmd.drawFull(game.world);
          var bmdImage = bmd.addToWorld(game.world.centerX + 100, game.world.centerY + 100, 0.5, 0.5, 2, 2);
          phaserGroup.add(5, bmdImage)


          phaserSprites.getManyGroups(['backgrounds', 'starfield', 'gameobjects']).map(obj => {
            obj.destroy()
          })

          utilityManager.overlayBGControls({transition: 'FLASHWHITE', delay: 0, speed: 600}, () => {

            bmdImage.scale.setTo(0.5, 0.5)
            bmdImage.x = 0
            bmdImage.y = 0

            let newsPaper = phaserSprites.addFromAtlas({x: game.world.centerX, y: game.world.centerY, width: game.world.width, height: game.world.height, name: `newspaper`, group: 'gameobjects', filename: 'newspaper', atlas: 'atlas_main', visible: true})
                newsPaper.anchor.setTo(0.5, 0.5)
                newsPaper.scale.setTo(3, 3)
                newsPaper.addChild(bmdImage)
                phaserGroup.add(6, newsPaper)

            tweenTint(bmdImage, 0x000000, 0xffffff, 3000, () => {
              phaserControls.enableAllInput();

              let {menuButton1Text, menuButton2Text} = phaserTexts.getOnly(['menuButton1Text', 'menuButton2Text'])
              phaserSprites.getGroup('menuButtons').map(obj => {
                obj.reveal()
              })

              phaserTexts.get('menuButton1Text').setText('RETRY')
              phaserTexts.get('menuButton2Text').setText('SAVE AND QUIT')

            });
            game.add.tween(newsPaper.scale).to( { x: 1, y: 1 }, Phaser.Timer.SECOND*1.5, Phaser.Easing.Bounce.Out, true, 0, 0, false)
            game.add.tween(newsPaper).to( { angle: 35, y: newsPaper.y - 50 }, Phaser.Timer.SECOND*1.5, Phaser.Easing.Linear.InOut, true, 0, 0, false)
          })
        }).autoDestroy = true;
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
              game.time.events.add(300, () => {
                callback();
              }).autoDestroy = true;
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

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

      const store = options.store;
      phaserMaster.let('gameData', store.getters._gameData())
      /******************/

      /******************/
      function saveData(prop:string, value:any){
        let gameData = phaserMaster.get('gameData')
          gameData[prop] = value;
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
        let folder = 'src/phaser/saveTheWorld/resources'

        // atlas
        game.load.atlas('atlas', `${folder}/spritesheets/sprites.png`, `${folder}/spritesheets/sprites.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

        // font
        game.load.bitmapFont('gem', `${folder}/fonts/gem.png`, `${folder}/fonts/gem.xml`);

        // json
        game.load.json('weaponData', `${folder}/json/weaponData.json`);


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
        phaserGroup.assign(game, 10)


        // variables
        phaserMaster.let('selected', 0)

        // // fetch and assign waepon data
        var weaponData = game.cache.getJSON('weaponData');
        let weaponList = [];
        for(let weapon in weaponData.primaryWeapons){
          weaponList.push(weaponData.primaryWeapons[weapon])
        }
        for(let weapon in weaponData.secondaryWeapons){
          weaponList.push(weaponData.secondaryWeapons[weapon])
        }
        phaserMaster.let('weaponList', weaponList)


        // overlay
        let overlaybmd = phaserBmd.addGradient({name: 'overlaybmd', start: '#2f2f2f', end: '#2f2f2f', width: 5, height: 5, render: false})
        let overlay = phaserSprites.add({x: 0, y: 0, name: `overlay`, reference: overlaybmd.cacheBitmapData, visible: true})
            overlay.width = game.canvas.width;
            overlay.height = game.canvas.height;
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


        // background
        let tilebg1 = phaserSprites.addTilespriteFromAtlas({name: 'tilebg1', group: 'ui', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas', filename: 'asteroidsbg.png'})
        phaserGroup.add(1, tilebg1)
        tilebg1.count = 0;
        tilebg1.onUpdate = function(){
          this.count += 0.005;
          this.tilePosition.x -= Math.sin(this.count) * 4;
          this.tilePosition.y -= Math.cos(this.count) * 4;
        }

        let tilebg2 = phaserSprites.addTilespriteFromAtlas({name: 'tilebg2', group: 'ui', x: 0, y: 0, width: game.canvas.width, height: game.canvas.height, atlas: 'atlas', filename: 'asteroidsbg.png'})
        tilebg2.count = 0;
        tilebg2.onUpdate = function(){
          this.count += 0.005;
          this.tilePosition.x += Math.sin(this.count) * 2;
          this.tilePosition.y += Math.cos(this.count) * 2;
        }
        phaserGroup.add(2, tilebg2)

        // texts
        let padding = 15;
        let header = phaserTexts.add({name: 'header', font: 'gem', size: 18, default: 'Purchase Powerups!'})
        phaserTexts.alignToTopCenter('header', 10)

        let instructions = phaserTexts.add({name: 'instructions', size: 14, font: 'gem', default:`Trippy!`})
            instructions.maxWidth = game.canvas.width - padding
        phaserTexts.alignToBottomLeftCorner('instructions', 10)



        // create a gradient bmp -> turn it into a sprite -> manipulate the sprite width/height to fill screen
        phaserBmd.addGradient({name: 'bgGradient', start: '#0000FF', end: '#00008b', width: padding, height: padding, render: false})
        let instructionbox =  phaserSprites.add({x: 0, y: game.canvas.height - instructions.height - padding, name: `spriteBg1`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
            instructionbox.width = game.canvas.width
            instructionbox.height = game.canvas.height
        let headerbox =  phaserSprites.add({x: 0, y: 0, name: `spriteBg2`, reference: phaserBmd.get('bgGradient').cacheBitmapData})
            headerbox.width = game.canvas.width;
            headerbox.height = header.height + padding*2;

        // create a popupBox
        let popupBox =  phaserSprites.add({name: `popupBox`, group: 'popupBoxGroup', reference: phaserBmd.get('bgGradient').cacheBitmapData, visible: false})
            popupBox.popUp = function(message:string, callback:any = ()=>{}){
                let padding = 50;
                let popupText = phaserTexts.add({name: 'popupText', group: 'popupBoxGroup', font: 'gem', size: 18, default: `${message}`, visible: true})
                phaserTexts.center('popupText')
                popupText.alpha = 0;
                this.visible = true;
                this.width = popupText.width + padding;
                this.height = popupText.height + padding;
                this.x = popupText.x - padding/2;
                this.y = popupText.y - padding/2 - 20;
                this.game.add.tween(this).to( { y: this.y + 20, alpha: 1 }, 100, Phaser.Easing.Linear.In, true, 0, 0, false).
                  onComplete.add(() => {
                    this.game.add.tween(popupText).to( { alpha: 1}, 100, Phaser.Easing.Linear.In, true, 0, 0, false).
                    onComplete.add(() => {
                      callback();
                    })
                  })
            }
            popupBox.popOut = function(callback:any = () => {}){
              let popupText = phaserTexts.get('popupText')
              this.game.add.tween(popupText).to( { alpha: 0}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false).
                onComplete.add(() => {
                  phaserTexts.destroy('popupText')
                  this.game.add.tween(this).to( { alpha: 0 }, 100, Phaser.Easing.Linear.Out, true, 0, 0, false).
                    onComplete.add(() => {
                      callback()
                    })
                })
            }


        phaserGroup.addMany(10, [overlay])
        phaserGroup.addMany(9, [header, instructions])
        phaserGroup.addMany(8, [instructionbox, headerbox, popupBox])




        // create grid of objects
        let desiredColumns = 4;
        phaserMaster.let('columns', desiredColumns)
        let rows = 0;
        let columns = 0;
        let centerX;
        weaponList.forEach((weapon, index) => {

          let sprite =  phaserSprites.addFromAtlas({name: `powerUp_${index}`, atlas: 'atlas', group: 'powerup', filename: `${weapon.spriteIcon}.png`})
              sprite.scale.setTo(0.5, 0.5)
              centerX = (game.canvas.width/desiredColumns)*(columns) + ((game.canvas.width/desiredColumns)/2) - (sprite.width/2)
              sprite.x = centerX;
              sprite.y = (rows * 200) + 100;

          let equippedSprite =  phaserSprites.add({name: `equippedIcon_${index}`, group: 'e', reference: `equipped`, visible: false})
              centerX = (game.canvas.width/desiredColumns)*(columns) + ((game.canvas.width/desiredColumns)/2) - (equippedSprite.width/2)
              equippedSprite.x = centerX;
              equippedSprite.y = (rows * 200) + 80

          let purchasedSprites =  phaserSprites.add({name: `purchasedIcon_${index}`, group: 'p', reference: `purchased`, visible: false})
              centerX = (game.canvas.width/desiredColumns)*(columns) + ((game.canvas.width/desiredColumns)/2) - (purchasedSprites.width/2)
              purchasedSprites.x = centerX;
              purchasedSprites.y = (rows * 200) + 150

          columns++;
          if(index === ((desiredColumns*1)-1) || index === ((desiredColumns*2)-1)){
            rows ++;
            columns = 0;
          }

          phaserGroup.add(5, sprite)
          phaserGroup.addMany(6, [equippedSprite, purchasedSprites])
        })


        // add pointer
        let pointer = phaserSprites.addFromAtlas({x: 0, y: 0, name: `pointer`, atlas: 'atlas', filename: `pointer.png`})
        phaserGroup.add(6, pointer)
        checkForEquipped();
        checkForPurchases();
        updatePointer(0)
        updateDescription(0)
      }
      /******************/

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();

          // change state
          phaserSprites.get('overlay').fadeOut(Phaser.Timer.SECOND/2, () => {
            phaserMaster.changeState('READY');
          })
      }
      /******************/

      /******************/
      function checkForEquipped(){
        let weaponList = phaserMaster.get('weaponList')
        let gameData = phaserMaster.get('gameData')

        phaserSprites.getGroup('e').forEach((item) => {
          item.visible = false;
        })

        weaponList.forEach( (item, index) => {
          if(item.id === gameData.primaryWeapon.id){
            phaserSprites.get(`equippedIcon_${index}`).visible = true;
          }

          if(item.id === gameData.secondaryWeapon.id){
            phaserSprites.get(`equippedIcon_${index}`).visible = true;
          }
        })
      }
      /******************/

      /******************/
      function checkForPurchases(){
        let weaponList = phaserMaster.get('weaponList')
        let gameData = phaserMaster.get('gameData')

        // check against purchase list
        let purchaseHistory = phaserMaster.get('gameData').purchaseHistory;
        weaponList.forEach( (item, index) => {
          item.purchased = false;
          item.canPurchase = (gameData.money >= item.price)
          for(let id of purchaseHistory){
            if(item.id === id){
                item.purchased = true;
                item.canPurchase = false;
                phaserSprites.get(`purchasedIcon_${index}`).visible = true;
            }
          }
        })
        phaserMaster.forceLet('weaponList', weaponList)
      }
      /******************/

      /******************/
      function updatePointer(index:number){
        let powerUp = phaserSprites.get(`powerUp_${index}`)
        let pointer = phaserSprites.get('pointer')
            pointer.x = powerUp.x - 32
            pointer.y = powerUp.y + 30
      }
      /******************/

      /******************/
      function updateDescription(index:number){
        let weaponList = phaserMaster.get('weaponList')
        let descriptionText = phaserTexts.get('instructions')
            if(weaponList[index].purchased){
              descriptionText.setText(`[PURCHASED] ${weaponList[index].description}.`)
            }
            else{
              descriptionText.setText(`${weaponList[index].description}.`)
            }
      }
      /******************/

      /******************/
      function updateColumn(inc:number){
        let selected = phaserMaster.get('selected')
        let weaponsList = phaserMaster.get('weaponList')
        selected += inc;

        if(selected > weaponsList.length - 1){
          selected = weaponsList.length - 1
        }

        if(selected < 0){
          selected = 0
        }
        updatePointer(selected)
        updateDescription(selected)
        phaserMaster.forceLet('selected', selected)
      }
      /******************/

      /******************/
      function popupMessage(message:string, duration:number){
        phaserMaster.changeState('FREEZE')
        let popupBox = phaserSprites.get(`popupBox`);
          popupBox.popUp(message);
          setTimeout(() => {
            popupBox.popOut(() => {
              phaserMaster.changeState('READY')
            });
          }, duration)
      }
      /******************/

      /******************/
      function makePurchaseOrEquip(){
        let selected = phaserMaster.get('selected');
        let weaponsList = phaserMaster.get('weaponList')
        let selectedItem = weaponsList[selected];
        let gameData = phaserMaster.get('gameData')

        // equip
        if(selectedItem.purchased){
          gameData[selectedItem.type] = selectedItem
          saveData(selectedItem.type, gameData[selectedItem.type])
          checkForEquipped();
        }

        // purchase
        else if(selectedItem.canPurchase){
          gameData.money -= selectedItem.price;
          gameData.purchaseHistory.push(selectedItem.id)
          updatePointer(selected)
          updateDescription(selected)
          saveData('purchaseHistory', gameData.purchaseHistory)
          gameData[selectedItem.type] = selectedItem
          saveData(selectedItem.type, gameData[selectedItem.type])
          checkForPurchases();
          checkForEquipped();
          popupMessage(`Purchased ${selectedItem.name}`, 1500)
        }
        else{
          popupMessage(`Insufficient funds`, 800)
        }


      }
      /******************/

      /******************/
      function update() {
        let game = phaserMaster.game();

        phaserSprites.getGroup('ui').forEach((sprite) => {
          sprite.onUpdate()
        })

        if(phaserMaster.checkState('READY')){
          if(phaserControls.checkWithDelay({isActive: true, key: 'LEFT', delay: 150})){
            updateColumn(-1);
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'RIGHT', delay: 150})){
            updateColumn(1);
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'UP', delay: 150})){
            updateColumn(-(phaserMaster.get('columns')));
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'DOWN', delay: 150})){
            updateColumn((phaserMaster.get('columns')));
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 150})){
            makePurchaseOrEquip()
          }

          if(phaserControls.checkWithDelay({isActive: true, key: 'BACK', delay: 150})){
            end()
          }
        }

      }
      /******************/

      /******************/
      function end(){
        parent.test()
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

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
            phaserBitmapdata = new PHASER_BITMAPDATA_MANAGER();

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
        game.stage.backgroundColor = '#10212c';
        let folder = 'src/phaser/saveTheWorld/resources'

        // atlas
        game.load.atlas('atlas', `${folder}/spritesheets/heroSelect/textures.png`, `${folder}/spritesheets/heroSelect/textures.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

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
        phaserGroup.assign(game, 15)
        phaserBitmapdata.assign(game)

        // phaserMaster
        let currentSelection = phaserMaster.let('currentSelection', 0)
        let pilotSelection = phaserMaster.let('pilotSelection', 0)
        let loadoutSelection = phaserMaster.let('loadoutSelection', 0)
        let primaryWeaponSelection = phaserMaster.let('primaryWeaponSelection', 0)
        let subWeaponSelection = phaserMaster.let('subWeaponSelection', 0)
        let perkSelection = phaserMaster.let('perkSelection', 0)
        let weaponData = phaserMaster.let('weaponData', game.cache.getJSON('weaponData'));
        let profilePictures = [
          {
            image: 'ui_mockphoto.png',
            age: 36,
            name: 'PILOT 1',
            firerate: 'FAST',
            subweaponRecharge: 'AVERAGE',
            health: 'AVERAGE',
            movement: 'AVERAGE',
          },
          {
            image: 'ui_mockphoto.png',
            age: 29,
            name: 'PILOT 2',
            description: 'LOREM IPSUM SOMETHING LOREM IPSUM SOMETHING LOREM IPSUM SOMETHING',
            firerate: 'AVERAGE',
            subweaponRecharge: 'FAST',
            health: 'AVERAGE',
            movement: 'AVERAGE',
          },
          {
            image: 'ui_mockphoto.png',
            age: 62,
            name: 'PILOT 3',
            description: 'LOREM IPSUM SOMETHING LOREM IPSUM SOMETHING LOREM IPSUM SOMETHING',
            firerate: 'AVERAGE',
            subweaponRecharge: 'FAST',
            health: 'LOW',
            movement: 'FAST',
          }
        ]

        // frames
        let verticleFrame = phaserSprites.addFromAtlas({x: 373, y: 0, height: game.world.height, name: `verticleFrame`, group: 'ui_frame', filename: 'ui_frame_v.png', atlas: 'atlas'})
        let dividerFrame1 = phaserSprites.addFromAtlas({x: 0, y: 315, width: verticleFrame.x, name: `dividerFrame1`, group: 'ui_frame', filename: 'ui_frame_h.png', atlas: 'atlas'})

        // mask containers
        let bmd = phaserBitmapdata.addGradient({name: 'overlayFadeout', start: '#ffffff', end: '#ffffff', width: 1, height: 1, render: false})
        let container_1 = phaserSprites.add({x: 0, y: 0, name: `container_1`, width: 373, height: 315, reference: bmd.cacheBitmapData, visible: false})
        let container_2 = phaserSprites.add({x: 0, y: 325, name: `container_2`, width: 373, height: 315, reference: bmd.cacheBitmapData, visible: false})
        let container_3 = phaserSprites.add({x: 375, y: 0, name: `container_3`, width: 262, height: game.world.height, reference: bmd.cacheBitmapData, visible: false})


        // backgrounds
        let bg_clouds = phaserSprites.addTilespriteFromAtlas({ name: 'bg_clouds', group: 'ui_bg', x: container_1.x, y: container_1.y, width: container_1.width, height: container_1.height, atlas: 'atlas', filename: 'bg_clouds.png'});
            bg_clouds.onUpdate = function () {
                if(phaserMaster.get('currentSelection') === 0){
                  this.tilePosition.x -= 3
                }
            };
        let bg_cityscape = phaserSprites.addTilespriteFromAtlas({ name: 'bg_cityscape', group: 'ui_bg', x: container_2.x, y: container_2.y, width: container_2.width, height: container_2.height, atlas: 'atlas', filename: 'bg_cityscape.png'});
            bg_cityscape.onUpdate = function () {
                if(phaserMaster.get('currentSelection')  === 1){
                  this.tilePosition.x -= 0.25
                }
            };
        let bg_cityscape_1 = phaserSprites.addTilespriteFromAtlas({ name: 'bg_cityscape_1', group: 'ui_bg', x: container_2.x, y: container_2.y + 50, width: container_2.width, height: container_2.height, atlas: 'atlas', filename: 'bg_cityscape_1.png'});
            bg_cityscape_1.onUpdate = function () {
                if(phaserMaster.get('currentSelection')  === 1){
                  this.tilePosition.x -= 0.5
                }
            };
        let bg_cityscape_2 = phaserSprites.addTilespriteFromAtlas({ name: 'bg_cityscape_2', group: 'ui_bg', x: container_2.x, y: container_2.y + 115, width: container_2.width, height: container_2.height, atlas: 'atlas', filename: 'bg_cityscape_2.png'});
            bg_cityscape_2.onUpdate = function () {
                if(phaserMaster.get('currentSelection')  === 1){
                  this.tilePosition.x -= 1
                }
            };
        let bg_cityscape_3 = phaserSprites.addTilespriteFromAtlas({ name: 'bg_cityscape_3', group: 'ui_bg', x: container_2.x, y: container_2.y + 200, width: container_2.width, height: container_2.height, atlas: 'atlas', filename: 'bg_cityscape_3.png'});
            bg_cityscape_3.onUpdate = function () {
                if(phaserMaster.get('currentSelection')  === 1){
                  this.tilePosition.x -= 2
                }
            };
        let bg_space = phaserSprites.addTilespriteFromAtlas({ name: 'bg_space', group: 'ui_bg', x: container_3.x, y: container_3.y, width: container_3.width, height: container_3.height, atlas: 'atlas', filename: 'bg_space.png'});
            bg_space.onUpdate = function () {
                if(phaserMaster.get('currentSelection')  === 2){
                  this.tilePosition.y -= 1
                }
            };

        let pointer = phaserSprites.addFromAtlas({ name: 'pointer', group: 'ui', atlas: 'atlas', filename: 'ui_pointer.png'});
            pointer.anchor.setTo(0.5, 0.5)
            pointer.hide = function(){
              this.visible = false
            }
            pointer.show = function(){
              this.visible = true
            }
            pointer.updateLocation = function(val:number){
              phaserMaster.forceLet('currentSelection', val)
              let {x, y} = phaserSprites.get(`textbox${val}`)
              this.x = x - 90
              this.y = y
            }


        let downarrow = phaserSprites.addFromAtlas({ name: 'downarrow', group: 'ui', atlas: 'atlas', filename: 'ui_downarrow.png', visible: false});
            downarrow.anchor.setTo(0.5, 0.5)
            downarrow.hide = function(){
              this.visible = false
            }
            downarrow.show = function(){
              this.visible = true
            }
            downarrow.updateLocation = function(x:number, y:number){
              this.x = x
              this.y = y
            }

        // placards
        let textbox0 = phaserSprites.addFromAtlas({ name: 'textbox0', group: 'ui_textholders', atlas: 'atlas', filename: 'ui_textbox.png', alpha: 1});
            textbox0.anchor.setTo(0.5, 0.5)
            phaserSprites.centerOnPoint('textbox0', container_1.width/2 + textbox0.width/2, container_1.y + 40);
        let text0 = phaserTexts.add({name: 'text0', group: 'ui_text', x:textbox0.x, y: textbox0.y,  font: 'gem', size: 12, default: `SELECT PILOT`})
            text0.anchor.setTo(0.5, 0.5)

        let textbox1 = phaserSprites.addFromAtlas({ name: 'textbox1', group: 'ui_textholders', atlas: 'atlas', filename: 'ui_textbox.png', alpha: 1});
            textbox1.anchor.setTo(0.5, 0.5)
            phaserSprites.centerOnPoint('textbox1', container_2.width/2 + textbox1.width/2, container_2.y + 40);
        let text1 = phaserTexts.add({name: 'text1', group: 'ui_text', x:textbox1.x, y: textbox1.y,  font: 'gem', size: 12, default: `LOADOUT`})
            text1.anchor.setTo(0.5, 0.5)

        let textbox2 = phaserSprites.addFromAtlas({ name: 'textbox2', group: 'ui_textholders', atlas: 'atlas', filename: 'ui_textbox.png', alpha: 1});
            textbox2.anchor.setTo(0.5, 0.5)
            phaserSprites.centerOnPoint('textbox2', container_3.x + container_3.width/2 + textbox2.width/2, container_3.y + 40);
        let text2 = phaserTexts.add({name: 'text2', group: 'ui_text', x:textbox2.x, y: textbox2.y,  font: 'gem', size: 12, default: `START`})
            text2.anchor.setTo(0.5, 0.5)

        let pilotDescriptionBox = phaserSprites.addFromAtlas({ name: 'pilotDescriptionBox', group: 'ui_textholders', atlas: 'atlas', filename: 'ui_descriptionbox.png', alpha: 1});
            pilotDescriptionBox.anchor.setTo(0.5, 0.5)
            phaserSprites.centerOnPoint('pilotDescriptionBox', container_1.width/2 + pilotDescriptionBox.width/2, container_1.y + 295);
        let padding = 20;
        let pilotDescriptionText = phaserTexts.add({name: 'pilotDescriptionText', group: 'ui_text', x:pilotDescriptionBox.x - pilotDescriptionBox.width/2 + padding, y: pilotDescriptionBox.y - pilotDescriptionBox.height/2,  font: 'gem', size: 14, default: ``})
            pilotDescriptionText.maxWidth = pilotDescriptionBox.width - padding*2
            pilotDescriptionText.updateThisText = function(val:number){
              this.setText(`
NAME:               ${profilePictures[val].name}

FIRING RATE:        ${profilePictures[val].firerate}
SUBWEAPON RECHARGE: ${profilePictures[val].subweaponRecharge}
HEALTH:             ${profilePictures[val].health}
MOVEMENT:           ${profilePictures[val].movement}
              `)
            }

        // profiles
        for(let i = 0; i < profilePictures.length; i++){
          let profile = phaserSprites.addFromAtlas({ name: `profile${i}`, group: 'ui_profiles', y: container_1.y + 110, atlas: 'atlas', filename: `${profilePictures[i].image}`, alpha: 0});
              profile.anchor.setTo(0.5, 0.5)
              let gap = profile.width/2*(profilePictures.length-1)
              profile.x = (container_1.x + (i*profile.width) + container_1.width/2) - gap
              profile.alpha = 1
        }
        let profileSelector = phaserSprites.addFromAtlas({ name: `profileSelector`, group: 'ui_profiles', atlas: 'atlas', filename: 'ui_pictureframe.png', alpha: 0});
            profileSelector.anchor.setTo(0.5, 0.5)
            profileSelector.updateLocation = function(val:number){
              phaserMaster.forceLet('pilotSelection', val)
              phaserSprites.getGroup('ui_profiles').forEach(obj => {
                obj.alpha = 0.5
              })
              let profile =  phaserSprites.get(`profile${val}`);
                  profile.alpha = 1
              let {x, y} = profile
              this.x = x
              this.y = y
              downarrow.updateLocation(x,y - profile.height/2 - 8)
            }
            profileSelector.inc = function(){
              pilotSelection += 1
              if(pilotSelection > profilePictures.length - 1){
                pilotSelection = 0
              }
              updateProfileSelection(pilotSelection)
            }
            profileSelector.dec = function(){
              pilotSelection -= 1
              if(pilotSelection < 0){
                pilotSelection = profilePictures.length - 1
              }
              updateProfileSelection(pilotSelection)
            }

        // loadout
        let i;

        i = 0
        for (let key of Object.keys(weaponData.primaryWeapons)) {
          let boxPadding = 5;
          let item = weaponData.primaryWeapons[key]
          let box = phaserSprites.addFromAtlas({ name: `box_pw_${i}`, group: 'ui_loadout', y: container_2.y + 90, atlas: 'atlas', filename: `ui_box_unselected.png`, alpha: 0});
              box.anchor.setTo(0.5, 0.5)
          let gap = (box.width + boxPadding)/2 *(returnSizeOfObject(weaponData.primaryWeapons)-1)
          box.x = (container_2.x + (i*box.width) + container_2.width/2) - gap + (i * boxPadding)
          box.alpha = 1
          i++;
        }

        i = 0;
        for (let key of Object.keys(weaponData.secondaryWeapons)) {
          let boxPadding = 5;
          let item = weaponData.secondaryWeapons[key]
          let box = phaserSprites.addFromAtlas({ name: `box_sw_${i}`, group: 'ui_loadout', y: container_2.y + 150, atlas: 'atlas', filename: `ui_box_unselected.png`, alpha: 0});
              box.anchor.setTo(0.5, 0.5)
          let gap = (box.width + boxPadding)/2 *(returnSizeOfObject(weaponData.secondaryWeapons)-1)
          box.x = (container_2.x + (i*box.width) + container_2.width/2) - gap + (i * boxPadding)
          box.alpha = 1
          i++;
        }

        i = 0
        for (let key of Object.keys(weaponData.perks)) {
          let boxPadding = 5;
          let item = weaponData.perks[key]
          let box = phaserSprites.addFromAtlas({ name: `box_sp_${i}`, group: 'ui_loadout', y: container_2.y + 210, atlas: 'atlas', filename: `ui_box_unselected.png`, alpha: 0});
              box.anchor.setTo(0.5, 0.5)
          let gap = (box.width + boxPadding)/2 *(returnSizeOfObject(weaponData.perks)-1)
          box.x = (container_2.x + (i*box.width) + container_2.width/2) - gap + (i * boxPadding)
          box.alpha = 1
          i++;
        }

        let loadoutCatagorySelector = phaserSprites.addFromAtlas({ name: `loadoutCatagorySelector`, group: 'ui_loadout', atlas: 'atlas', filename: 'ui_pointer.png', visible: false, alpha: 0});
            loadoutCatagorySelector.anchor.setTo(0.5, 0.5)
            loadoutCatagorySelector.show = function(){
              this.visible = true;
            }
            loadoutCatagorySelector.hide = function(){
              this.visible = false;
            }
            loadoutCatagorySelector.updateLocation = function(val:number){
              let {primaryWeaponSelection, subWeaponSelection, perkSelection} = phaserMaster.getAll()

              let box;
              if(val === 0){
                box =  phaserSprites.get(`box_pw_${primaryWeaponSelection}`);
                let {x, y} = box
                downarrow.updateLocation(x,y - 30)
              }
              if(val === 1){
                box =  phaserSprites.get(`box_sw_${subWeaponSelection}`);
                let {x, y} = box
                downarrow.updateLocation(x,y - 30)
              }
              if(val === 2){
                box =  phaserSprites.get(`box_sp_${perkSelection}`);
                let {x, y} = box
                downarrow.updateLocation(x,y - 30)
              }
              let {x, y} = box
              this.x = 40
              this.y = y
              this.visible
            }

        let loadoutDescription = phaserSprites.addFromAtlas({ name: 'loadoutDescription', group: 'ui_textholders', atlas: 'atlas', filename: 'ui_descriptionbox_small.png', alpha: 1});
            loadoutDescription.anchor.setTo(0.5, 0.5)
            phaserSprites.centerOnPoint('loadoutDescription', container_2.width/2 + loadoutDescription.width/2, container_2.y + 295);
        let loadoutDescriptionText = phaserTexts.add({name: 'loadoutDescriptionText', group: 'ui_text', x:loadoutDescription.x, y: loadoutDescription.y,  font: 'gem', size: 14, default: ``})
            loadoutDescriptionText.anchor.setTo(0.5, 0.5)
            loadoutDescriptionText.maxWidth = loadoutDescription.width - padding*2

        //phaserGroup.addMany(0, [container_1])
        phaserGroup.addMany(1, [bg_clouds, bg_cityscape, bg_cityscape_1, bg_cityscape_2, bg_cityscape_3, bg_space])
        phaserGroup.addMany(3, [verticleFrame, dividerFrame1])
        phaserGroup.addMany(4, [textbox0, downarrow])


      }
      /******************/

      /******************/
      function preloadComplete(){
          let game = phaserMaster.game();
          let {pointer} = phaserSprites.getAll('OBJECT');

          // setDefault
          pointer.updateLocation(0)
          updateProfileSelection(0)

          // change state
          phaserMaster.changeState('MAINMENU');

      }
      /******************/

      /******************/
      function updateProfileSelection(val:number) {
        let {profileSelector, loadoutCatagorySelector} = phaserSprites.getAll('OBJECT');
        let {pilotDescriptionText} = phaserTexts.getAll('OBJECT')
        profileSelector.updateLocation(val)
        pilotDescriptionText.updateThisText(val)
      }
      /******************/

      /******************/
      function updateLoadoutCatagory(val:number){
        let {loadoutSelection} = phaserMaster.getAll()
        let {downarrow, loadoutCatagorySelector} = phaserSprites.getAll('OBJECT')

        loadoutSelection += val
        if(val > 0){
          if(loadoutSelection > 2){
            loadoutSelection = 0
          }
        }

        if(val < 0){
          if(loadoutSelection < 0){
            loadoutSelection = 2
          }
        }

        phaserMaster.forceLet('loadoutSelection', loadoutSelection)
        loadoutItemSelector(null)
        loadoutCatagorySelector.updateLocation(loadoutSelection)
      }
      /******************/

      /******************/
      function loadoutItemSelector(val:number){
        let {weaponData, loadoutSelection, primaryWeaponSelection, subWeaponSelection, perkSelection} = phaserMaster.getAll()
        let {downarrow, loadoutCatagorySelector} = phaserSprites.getAll('OBJECT')
        let {loadoutDescriptionText} = phaserTexts.getAll('OBJECT');

        if(loadoutSelection === 0){
          primaryWeaponSelection += val
          if(val > 0){
            if(primaryWeaponSelection >= returnSizeOfObject(weaponData.primaryWeapons)){
               primaryWeaponSelection = 0
            }
            phaserMaster.forceLet('primaryWeaponSelection', primaryWeaponSelection)
          }
          if(val < 0){
            if(primaryWeaponSelection < 0){
               primaryWeaponSelection = returnSizeOfObject(weaponData.primaryWeapons) - 1
            }
            phaserMaster.forceLet('primaryWeaponSelection', primaryWeaponSelection)
          }
          loadoutDescriptionText.setText(`primaryWeaponSelection ${primaryWeaponSelection}` )
        }

        if(loadoutSelection === 1){
          subWeaponSelection += val
          if(val > 0){
            if(subWeaponSelection >= returnSizeOfObject(weaponData.secondaryWeapons)){
               subWeaponSelection = 0
            }
            phaserMaster.forceLet('subWeaponSelection', subWeaponSelection)
          }
          if(val < 0){
            if(subWeaponSelection < 0){
               subWeaponSelection = returnSizeOfObject(weaponData.secondaryWeapons) - 1
            }
            phaserMaster.forceLet('subWeaponSelection', subWeaponSelection)
          }
          loadoutDescriptionText.setText(`subWeaponSelection ${subWeaponSelection}` )
        }

        if(loadoutSelection === 2){
          perkSelection += val
          if(val > 0){
            if(perkSelection >= returnSizeOfObject(weaponData.perks)){
               perkSelection = 0
            }
            phaserMaster.forceLet('perkSelection', perkSelection)
          }
          if(val < 0){
            if(perkSelection < 0){
               perkSelection = returnSizeOfObject(weaponData.perks) - 1
            }
            phaserMaster.forceLet('perkSelection', perkSelection)
          }
          loadoutDescriptionText.setText(`perkSelection ${perkSelection}` )
        }

        let box;
        if(loadoutSelection === 0){
          box =  phaserSprites.get(`box_pw_${primaryWeaponSelection}`);
          let {x, y} = box
          downarrow.updateLocation(x,y - 30)
        }
        if(loadoutSelection === 1){
          box =  phaserSprites.get(`box_sw_${subWeaponSelection}`);
          let {x, y} = box
          downarrow.updateLocation(x,y - 30)
        }
        if(loadoutSelection === 2){
          box =  phaserSprites.get(`box_sp_${perkSelection}`);
          let {x, y} = box
          downarrow.updateLocation(x,y - 30)
        }

        loadoutCatagorySelector.updateLocation(loadoutSelection)
      }
      /******************/

      /******************/
      function returnSizeOfObject(obj:any) {
        var size = 0
        for (let key of Object.keys(obj)) {size++}
        return size;
      }
      /******************/

      /******************/
      function update() {
        let game = phaserMaster.game();
        let {currentSelection, pilotSelection, loadoutSelection} = phaserMaster.getAll();
        let {profileSelector, loadoutCatagorySelector, pointer, downarrow} = phaserSprites.getAll('OBJECT');

        phaserSprites.getGroup('ui_bg').forEach(obj => {
          obj.onUpdate()
        })

        if(phaserControls.checkWithDelay({isActive: true, key: 'BACK', delay: 250})){
          phaserMaster.forceLet('loadoutSelection', 0)
          downarrow.hide();
          pointer.show()
          loadoutCatagorySelector.hide();
          phaserMaster.changeState('MAINMENU');
        }


        // MAIN MENU CONTROLS
        if(phaserMaster.checkState('MAINMENU')){

          if(phaserControls.checkWithDelay({isActive: true, key: 'UP', delay: 250})){
            if(currentSelection !== 2){
              pointer.updateLocation(0)
            }
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'DOWN', delay: 250})){
            if(currentSelection !== 2){
              pointer.updateLocation(1)
            }
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'RIGHT', delay: 250})){
            if(currentSelection === 0){
              pointer.updateLocation(2)
            }
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'LEFT', delay: 250})){
            if(currentSelection === 2){
              pointer.updateLocation(0)
            }
          }

          // if(phaserControls.checkWithDelay({isActive: true, key: 'START', delay: 250})){
          //   downarrow.hide();
          //   pointer.show()
          //   loadoutCatagorySelector.hide();
          //   pointer.updateLocation(2)
          // }

          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 250})){
            let state;
            if(currentSelection === 0){
              updateProfileSelection(pilotSelection)
              downarrow.show();
              pointer.hide()
              state = 'PILOTSELECT'
            }
            if(currentSelection === 1){
              pointer.hide()
              downarrow.show();
              loadoutCatagorySelector.show();
              loadoutCatagorySelector.updateLocation(loadoutSelection)
              loadoutItemSelector(loadoutSelection)
              state = 'LOADOUTSELECT'
            }
            if(currentSelection === 2){
              pointer.hide()
              state = "STARTGAME"
              phaserMaster.forceLet('currentSelection', null)
              alert("start game")
            }
            phaserMaster.changeState(state);
          }
        }

        // PILOT SELECT
        if(phaserMaster.checkState('PILOTSELECT')){
          if(phaserControls.checkWithDelay({isActive: true, key: 'LEFT', delay: 250})){
            profileSelector.dec()
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'RIGHT', delay: 250})){
            profileSelector.inc()
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 250})){
            downarrow.hide();
            pointer.show()
            phaserMaster.changeState('MAINMENU');
          }
        }

        // LOADOUT SELECT
        if(phaserMaster.checkState('LOADOUTSELECT')){

          if(phaserControls.checkWithDelay({isActive: true, key: 'DOWN', delay: 250})){
            updateLoadoutCatagory(1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'UP', delay: 250})){
            updateLoadoutCatagory(-1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'RIGHT', delay: 250})){
            loadoutItemSelector(1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'LEFT', delay: 250})){
            loadoutItemSelector(-1)
          }
          if(phaserControls.checkWithDelay({isActive: true, key: 'A', delay: 250})){
            phaserMaster.forceLet('loadoutSelection', 0)
            pointer.show()
            downarrow.hide();
            loadoutCatagorySelector.hide();
            phaserMaster.changeState('MAINMENU');
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

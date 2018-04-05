declare var Phaser:any;

export class PLAYER_MANAGER {
  game:any;
  phaserSprites:any;
  phaserMaster:any;
  phaserTexts:any;
  phaserGroup:any
  phaserControls:any;
  weaponManager:any;
  atlas:any;
  weaponAtlas:any
  player:any
  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, phaserControls:any, weaponManager:any, atlas:string, weaponAtlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.phaserControls = phaserControls;
    this.weaponManager = weaponManager;
    this.atlas = atlas
    this.weaponAtlas = weaponAtlas
    this.player = null;
  }

  /******************/
  public createShip(params:any, updateHealth:any = () => {}, onDamage:any = () => {}, loseLife:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let shipId = params.shipId + 1
    let shieldFrames = [...Phaser.Animation.generateFrameNames(`ship_${shipId}_shield_`, 1, 6), ...Phaser.Animation.generateFrameNames(`ship_${shipId}_shield_`, 1, 6).reverse()]
    let healFrames =   [...Phaser.Animation.generateFrameNames(`ship_${shipId}_heal_`, 1, 6),   ...Phaser.Animation.generateFrameNames(`ship_${shipId}_heal_`, 1, 6).reverse()]
    //  The hero!
    let player = this.phaserSprites.addFromAtlas({name: params.name, group: params.group, org: params.org, atlas: this.atlas,  filename: `ship_${shipId}`, visible: false})
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(1, 1)
        player.isInvincible = false;
        player.isDead = false
        player.isDamaged = false
        player.isForceMoved = false
        player.ignoreBoundaries = null
        player.onLayer = params.layer
        player.primaryWeapon = params.primaryWeapon
        player.secondaryWeapon = params.secondaryWeapon
        player.perk = params.perk
        player.weaponSystems = []
        player.xCapture = []
        player.yCapture = []


        game.physics.enable(player, Phaser.Physics.ARCADE);
        this.phaserGroup.add(params.layer, player)
        this.createShipExhaust(player, params);



        //------------------------
        player.onUpdate = () => {
          // move
          if(player.xCapture.length > 0){
            player.x += player.xCapture[0]
            player.xCapture.shift()
          }
          if(player.yCapture.length > 0){
            player.y += player.yCapture[0]
            player.yCapture.shift()
          }

          if(!player.ignoreBoundaries){
            player.checkLimits()
          }

          if(!player.isForceMoved){
            player.alpha = (player.isInvincible && !player.isDead) ? 0.5 : 1
          }

          // update emitter
          let {starMomentum} = this.phaserMaster.getOnly(['starMomentum'])
          // update weapon (check for collison)
          player.weaponSystems.map( weaponSystem => {
            weaponSystem.onUpdate()
          })

          onUpdate(player)
        }
        //------------------------

        //------------------------
        player.restoreHealth = (val:number) => {
          let {gameData} = this.phaserMaster.getOnly(['gameData'])
          let health = gameData.player.health + val
          if(health > 100){
            health = 100
          }
          updateHealth(health)
          // add health restoration animation
        }
        //------------------------

        //------------------------
        player.takeDamage = (val:number) => {
          onDamage(player)
          let {gameData} = this.phaserMaster.getOnly(['gameData'])
          let health = gameData.player.health - val
          updateHealth(health)
          if(health > 0){

            player.isDamaged = true
            setTimeout(() => {
              player.isDamaged = false
            }, 250)

            player.tint = 1 * 0xff0000;
            player.alpha = 0.75
            player.game.add.tween(player).to( {tint: 1 * 0xffffff, alpha: 1}, 100, Phaser.Easing.Linear.Out, true, 100, 0, false).
              onComplete.add(() => {
                setTimeout(() => {
                  player.isInvincible = false;
                }, 500)
              })
          }
          else{
            loseLife(player);
          }
        }
        //------------------------

        //------------------------
        player.isDestroyed = (respawn:boolean = true) => {
          // change player states
          player.isDead = true;
          player.isInvincible = true;

          // destroy weapon systems
          player.destroyWeaponSystems();

          // play animation
          this.weaponManager.createExplosion(player.x, player.y, 1, 6)
          game.add.tween(this).to( { angle: game.rnd.integerInRange(-90, 90), alpha: 0}, 1000, Phaser.Easing.Linear.In, true, 0).
            onComplete.add(() => {
              this.weaponManager.createExplosion(player.x, player.y, 1, 6)
              player.visible = false;
              if(respawn){
                setTimeout(() => {
                  updateHealth(100)
                  player.moveToStart();
                }, 1000)
              }
            })
        }
        //------------------------

        //------------------------
        player.destroyWeaponSystems = () => {
          player.weaponSystems.map(weaponSystem => {
            // play destroy animation
            weaponSystem.destroyIt()
            // destroy ammo attached to weapon system
            weaponSystem.ammo.destroy()
          })
          // blank out the array
          player.weaponSystems = [];
        }
        //------------------------

        // //------------------------
        // player.selfDestruct = () => {
        //
        //   player.isDead = true;
        //   player.isInvincible = true;
        //
        //   // destroy weapon systems
        //   player.destroyWeaponSystems();
        //   //this.phaserSprites.get('exhaust').destroyIt();
        //   //game.add.tween(player.scale).to( { x: 0.25, y: 0.25}, 3400, Phaser.Easing.Linear.In, true, 0).
        //   game.add.tween(player).to( { angle: 720}, 3400, Phaser.Easing.Linear.In, true, 0).
        //   onComplete.add(() => {
        //     this.phaserSprites.destroy(player.name)
        //     this.weaponManager.createExplosion(player.x, player.y, 0.5, 6)
        //   }, this);
        // }
        // //------------------------

        //------------------------
        player.attachPerk = (type:string) => {
          this.attachPerk(player, params, type)
        }
        //------------------------

        //------------------------
        player.attachWeapon = (weaponType:string) => {
          this.attachWeaponSprite(player, params, weaponType)
        }
        //------------------------

        //------------------------
        player.attachSubweapon = (weaponType:string) => {
          this.attachSubWeaponSprite(player, params, weaponType)
        }
        //------------------------

        //------------------------
        player.fireWeapon = () => {
          player.weaponSystems.map( obj => {
            obj.fire()
          })
        }
        //------------------------

        //------------------------
        player.fireSubweapon = () => {
          this.phaserSprites.get(`${params.name}_ship_subweapon`).fireWeapon()
        }
        //------------------------

        //------------------------
        player.regenerateHealth = (active:Boolean = false) => {
          //console.log("regenerating health..." + active)
        }
        //------------------------

        //------------------------
        player.moveX = (val:number) => {
          player.xCapture[0] = val
        }
        //------------------------

        //------------------------
        player.moveY = (val:number) => {
          player.yCapture[0] = val
        }
        //------------------------

        //------------------------
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

          player.weaponSystems.map( obj => {
            obj.sync(this)
          })
        }
        //------------------------

        //------------------------
        player.moveTo = (x:number, y:number, duration:number, callback:any = () => {}) => {
          player.isInvincible = true;
          player.isForceMoved = true
          // player.ignoreBoundaries = true
          this.phaserControls.disableAllInput()
          game.add.tween(player).to( { x: x, y: y }, duration, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
            onComplete.add(() => {
              player.isInvincible = false;
              player.isForceMoved = false
              this.phaserControls.enableAllInput()
              callback()
            })
        }
        //------------------------

        //------------------------
        player.moveToStart = (callback:any = () => {}) => {
          player.isDead = false;
          player.isInvincible = true;
          player.ignoreBoundaries = true
          player.x = this.game.world.centerX
          player.y = this.game.world.height*2

          setTimeout(() => {
              player.alpha = 1
              player.visible = true;

              game.add.tween(player).to( { y: game.world.centerY + 100 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  player.ignoreBoundaries = false
                  // enable controls
                  this.phaserControls.enableAllInput()
                  // attach weapons
                  player.attachWeapon(player.primaryWeapon)

                  //console.log(player.primaryWeapon)
                  // player.attachPerk(params.primaryWeapon)
                  // player.attachSubweapon(params.perks)
                  setTimeout(() => {
                    player.isInvincible = false;
                    callback()
                  }, 1000)
                })
          }, 100)
        }
        //------------------------

        //------------------------
        player.playEndSequence = (callback:any) => {

          player.isInvincible = true;
          // scale and animate out!
          player.game.add.tween(player.scale).to( { x:2, y: 2 }, 750, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
          player.game.add.tween(player).to( { x:game.world.centerX, y: game.world.centerY + 50 }, 750, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
            onComplete.add(() => {
              player.game.add.tween(player).to( { y: game.world.height + 200 }, 750, Phaser.Easing.Exponential.InOut, true, 100, 0, false).
                onComplete.add(() => {
                    player.game.add.tween(player).to( { y: -200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                      onComplete.add(() => {
                          callback()
                      }, player)
                }, player)
            }, player)
        }
        //------------------------



      this.player = player;
      return player;

  }
  /******************/

  /******************/
  public createShipExhaust(player:any, params:any){
    let shipExhaust = this.phaserSprites.addFromAtlas({name: `${params.name}_exhaust`, group: params.group,  x: player.x, y: player.y + player.height/2 + 10, atlas: this.atlas,  filename: 'exhaust_red_1', visible: true})
        shipExhaust.animations.add('exhaust_animation', Phaser.Animation.generateFrameNames('exhaust_red_', 1, 8), 1, true)
        shipExhaust.animations.play('exhaust_animation', 30, true)
        shipExhaust.anchor.setTo(0.5, 0.5)
        player.addChild(shipExhaust)
        shipExhaust.onUpdate = () => {}
        shipExhaust.updateCords = (x, y) => {}
        shipExhaust.destroyIt = () => {this.phaserSprites.destroy(shipExhaust.name)}
  }
  /******************/


  /******************/
  private attachPerk(player:any, params:any, type:string){
    let animationSprites;
    let framerate
    let onLayer
    switch(type){
      case 'FIREPOWER':
        animationSprites = [...Phaser.Animation.generateFrameNames('firepower_', 1, 8), ...Phaser.Animation.generateFrameNames('firepower_', 1, 8).reverse()]
        framerate = 30;
        break
      case 'ARMORPLATING':
        animationSprites = ['armor_plating']
        framerate = 30;
        break
      case 'REGEN':
        animationSprites = [...Phaser.Animation.generateFrameNames('shield_layer_', 1, 8)]
        framerate = 30;
        break
    }

    if(this.phaserSprites.get(`${params.name}_ship_perk`) !== undefined){
      this.phaserSprites.destroy(`${params.name}_ship_perk`)
    }

    let shipPerk
    if(type === 'REGEN'){
      shipPerk = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_perk`, group: params.group, atlas: this.atlas,  filename: animationSprites[0], alpha: 0.5})
      shipPerk.anchor.setTo(0.5, 0.5)
      shipPerk.scale.set(1.25, 1.25)


      shipPerk.tweenFadeIn = () => {
        this.game.add.tween(shipPerk).to( {alpha: 0.8}, 1000, Phaser.Easing.Linear.In, true, 8000).onComplete.add(() => {
          player.regenerateHealth(true)
          shipPerk.tweenFadeOut()
        })
      }
      shipPerk.tweenFadeOut = () => {
        this.game.add.tween(shipPerk).to( {alpha: 0.0}, 1000, Phaser.Easing.Linear.In, true, 1000).onComplete.add(() => {
          player.regenerateHealth(false)
          shipPerk.tweenFadeIn()
        })
      }

      setTimeout(() => {
        if(shipPerk !== undefined){
          shipPerk.tweenFadeOut();
        }
      },  500)

      shipPerk.animations.add('animate', animationSprites, 1, true)
      shipPerk.animations.play('animate', framerate, true)
      player.addChild(shipPerk)
    }
    else{
      shipPerk = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_perk`, group: params.group, atlas: this.atlas,  filename: animationSprites[0], visible: true})
      shipPerk.anchor.setTo(0.5, 0.5)
      shipPerk.animations.add('animate', animationSprites, 1, true)
      shipPerk.animations.play('animate', framerate, true)
      player.addChild(shipPerk)
      }
  }
  /******************/

  /******************/
  private attachSubWeaponSprite(player:any, params:any, weaponType:string){
    // let animationSprites;
    // let framerate
    // let onLayer
    // switch(weaponType){
    //   case 'CLUSTERBOMB':
    //     animationSprites = [...Phaser.Animation.generateFrameNames('cannon_fire_', 1, 8)]
    //     framerate = 20;
    //     break
    //   case 'TRIPLEBOMB':
    //     animationSprites = [...Phaser.Animation.generateFrameNames('cannon2_fire_', 1, 7), ...['cannon2_fire_1']]
    //     framerate = 60;
    //     break
    //   case 'TURRET':
    //     animationSprites = ['turret_base']
    //     framerate = 30;
    //     break
    // }
    //
    //
    // if(this.phaserSprites.get(`${params.name}_ship_subweapon`) !== undefined){
    //   this.phaserSprites.destroy(`${params.name}_ship_subweapon`)
    // }
    //
    // let shipSubweapon = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_subweapon`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
    //     shipSubweapon.anchor.setTo(0.5, 0.5)
    //     shipSubweapon.animations.add('fireWeapon', animationSprites, 1, true)
    //
    //     shipSubweapon.fireWeapon = () => {
    //       shipSubweapon.animations.play('fireWeapon', framerate, false)
    //     }
    //     player.addChild(shipSubweapon)
  }
  /******************/

  /******************/
  private attachWeaponSprite(player:any, params:any, weaponType:string){
      //-----------------
      switch(weaponType){
        case 'BULLET':
          this.attachBullet(player, params, weaponType)
          break
        case 'SPREAD':
          this.attachSpread(player, params, weaponType)
          break
        case 'LASER':
          this.attachLaser(player, params, weaponType)
          break
        case 'MISSLE':
          this.attachMissle(player, params, weaponType)
          break
        case 'SHOTGUN':
          this.attachShotgun(player, params, weaponType)
          break
        case 'GATLING':
          this.attachGatling(player, params, weaponType)
          break
      }
  }
  /******************/

  /******************/
  public attachLaser(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('laser_fire_', 1, 6)]
    let gap = 35;
    let turrets = 5
    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0]})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)

            if(powerupLvl == 0 && (weaponSystem.index === 2)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl == 1 && (weaponSystem.index === 1 || weaponSystem.index === 3)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl == 2 && (weaponSystem.index === 1 || weaponSystem.index === 2 || weaponSystem.index === 3)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl == 3 && (weaponSystem.index === 0 || weaponSystem.index === 1 || weaponSystem.index === 3 || weaponSystem.index === 4)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 4) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            //
            // if(powerupLvl == 5  && (weaponSystem.index === 2 || weaponSystem.index === 12)) {
            //   ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
            //   weaponSystem.animations.play('fireWeapon', 60, false)
            // }
            // if(powerupLvl == 6 && (weaponSystem.index === 1 || weaponSystem.index === 13)) {
            //   ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
            //   weaponSystem.animations.play('fireWeapon', 60, false)
            // }

          }

      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 4
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }

      let stagger
      switch(i){
        case 0:
          stagger = 0
          break
        case 1:
          stagger = -20
          break
        case 2:
          stagger = -40
          break
        case 3:
          stagger = -20
          break
        case 4:
          stagger = 0
          break
      }

      ammo.trackSprite(weaponSystem, 0 , stagger);
      //-----------------



      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/

  /******************/
  public attachShotgun(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let gap = 20;
    let turrets = 1
    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0]})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)
            for(let n = 0; n < 10 + (5*(powerupLvl+1)); n++){
              ammo.fire(weaponSystem, null, weaponSystem + 1);
            }
            weaponSystem.animations.play('fireWeapon', 60, false)
          }

      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 60
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }
      ammo.trackSprite(weaponSystem, 0, -20);
      //-----------------



      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/


  /******************/
  public attachBullet(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let gap = 20;
    let turrets = 15
    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0]})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)

            if(powerupLvl >= 0 && (weaponSystem.index === 6 || weaponSystem.index === 8)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 1 && (weaponSystem.index === 7)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 2 && (weaponSystem.index === 5 || weaponSystem.index === 9)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 3 && (weaponSystem.index === 4 || weaponSystem.index === 10)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 4 && (weaponSystem.index === 3 || weaponSystem.index === 11)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >=5  && (weaponSystem.index === 2 || weaponSystem.index === 12)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }
            if(powerupLvl >= 6 && (weaponSystem.index === 1 || weaponSystem.index === 13)) {
              ammo.fireOffset(weaponSystem.x, weaponSystem.y - 32);
              weaponSystem.animations.play('fireWeapon', 60, false)
            }

          }

      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 4
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }
      ammo.trackSprite(weaponSystem, 0, -20);
      //-----------------



      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/

  /******************/
  public attachSpread(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor(gameData.player.powerup / 5)
    let turrets = powerupLvl === 5 ? 2 : 1
    let gap = 20;

    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0]})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)
            //emitter.fire(weaponSystem.x, weaponSystem.y)
            ammo.fire(weaponSystem, null, weaponSystem + 1);
            if(powerupLvl >= 0){
              ammo.fire(weaponSystem, weaponSystem.x + (1 * 30), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (1 * 30), weaponSystem.y - (200));
            }
            if(powerupLvl >= 1){
              ammo.fire(weaponSystem, weaponSystem.x + (2 * 30), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (2 * 30), weaponSystem.y - (200));
            }
            if(powerupLvl >= 2){
              ammo.fire(weaponSystem, weaponSystem.x + (3 * 30), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (3 * 30), weaponSystem.y - (200));
            }
            if(powerupLvl >= 3){
              ammo.fire(weaponSystem, weaponSystem.x + (4 * 30), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (4 * 30), weaponSystem.y - (200));
            }
            weaponSystem.animations.play('fireWeapon', 60, false)
          }


      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = ((powerupLvl+2) * 6)
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }

      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/

  /******************/
  public attachMissle(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('missle_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor(gameData.player.powerup / 5)
    let turrets = powerupLvl === 5 ? 2 : 1
    let gap = 20;

    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)
            //emitter.fire(weaponSystem.x, weaponSystem.y)
            ammo.fire(weaponSystem, null, weaponSystem + 1);
            if(powerupLvl >= 0){
              ammo.fire(weaponSystem, weaponSystem.x + (1 * 10), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (1 * 10), weaponSystem.y - (200));
            }
            if(powerupLvl >= 1){
              ammo.fire(weaponSystem, weaponSystem.x + (2 * 10), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (2 * 10), weaponSystem.y - (200));
            }
            if(powerupLvl >= 2){
              ammo.fire(weaponSystem, weaponSystem.x + (3 * 10), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (3 * 10), weaponSystem.y - (200));
            }
            if(powerupLvl >= 3){
              ammo.fire(weaponSystem, weaponSystem.x + (4 * 10), weaponSystem.y - (200));
              ammo.fire(weaponSystem, weaponSystem.x - (4 * 10), weaponSystem.y - (200));
            }
            weaponSystem.animations.play('fireWeapon', 60, false)
          }


      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = ((powerupLvl+2) * 8)
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }

      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/

  /******************/
  public attachGatling(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('missle_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor(gameData.player.powerup / 5)
    let turrets = 1
    let gap = 20;

    //-----------------  attach particle emitter
    // let emitter = this.game.add.emitter();
    //     emitter.makeParticles(this.atlas, `exhaust_trail`);
    //     // emitter.setXSpeed(0, 0);
    //     // emitter.setYSpeed(0, 0);
    //     // emitter.setRotation(0, 0);
    //     emitter.setAlpha(0.5, 0.2, 500);
    //     emitter.setScale(1, 0.5, 1, 0.5, 500, Phaser.Easing.Quintic.Out);
    //     emitter.fire = (x, y) => {
    //       emitter.emitX = weaponSystem.x;
    //       emitter.emitY = weaponSystem.y;
    //       emitter.start(true, 500, null, 2);
    //     }
    // this.phaserGroup.add(params.layer + 1, emitter)
    //-----------------

    //-----------------
    for(let i = 0; i < turrets; i++){
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
          weaponSystem.anchor.setTo(0.5, 0.5)
          weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.weaponManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor(gameData.player.powerup / 5)
            //emitter.fire(weaponSystem.x, weaponSystem.y)
            ammo.fire(weaponSystem, null, weaponSystem + 1);
            if(powerupLvl >= 1){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem + 20);
              }, 50)
            }
            if(powerupLvl >= 2){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem - 20);
              }, 100)
            }
            if(powerupLvl >= 3){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem + 20);
              }, 150)
            }
            if(powerupLvl >= 4){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem - 20);
              }, 200)
            }
            if(powerupLvl >= 5){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem - 20);
              }, 250)
            }
            if(powerupLvl >= 6){
              setTimeout(() => {
                ammo.fire(weaponSystem, null, weaponSystem - 20);
              }, 300)
            }
            weaponSystem.animations.play('fireWeapon', 60, false)
          }


      this.phaserGroup.add(params.layer + 1, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 45
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {
        this.bulletCollisionWithEnemies(ammo, weaponType)
      }

      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }
  }
  /******************/



  /******************/
  public bulletCollisionWithEnemies(ammo:any, type:any){
    let enemies = [...this.phaserSprites.getGroup('enemy_hitboxes')]
    this.game.physics.arcade.overlap(enemies, ammo.bullets, (enemy, bullet) => {
      let e = enemy.parent;
      if(!e.isDestroyed){
        let {weaponData} = this.phaserMaster.getOnly(['weaponData'])
        let wpn = weaponData.primaryWeapons[type]

        if((!e.isDamaged && !e.isDestroyed) || (wpn.ignoreDamageState && !e.isDestroyed)){
          if(type === 'LASER'){
            this.weaponManager.electricDischarge(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1)
          }
          if(type === 'SPREAD'){
            this.weaponManager.blueImpact(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1)
          }
          if(type === 'SHOTGUN'){
            this.weaponManager.pelletImpact(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1)
          }
          if(type === 'GATLING'){
            this.weaponManager.pelletImpact(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1)
          }
          if(type === 'BULLET'){
            this.weaponManager.orangeImpact(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1)
          }
          if(type === 'MISSLE'){
            this.weaponManager.createImpactExplosion(bullet.x, bullet.y - bullet.height, 1, e.onLayer + 1, Math.round(wpn.damage/2))
          }
          e.damageIt(wpn.damage)
        }
        if(!bullet.pierce){
          bullet.destroyIt(e.onLayer - 1)
        }
      }
    });
  }
  /******************/

  /******************/
  public destroyShip(name:string){
    this.phaserSprites.destroy(name)
    this.phaserSprites.destroy(`${name}_exhaust`)
    this.phaserSprites.getGroup(`${name}_trails`).map(obj => {
      obj.destroySelf();
    })
  }
  /******************/

}

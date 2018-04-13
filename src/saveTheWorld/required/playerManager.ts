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
  effectsManager:any;
  player:any
  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, phaserControls:any, weaponManager:any, effectsManager:any, atlas:string, weaponAtlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.phaserControls = phaserControls;
    this.weaponManager = weaponManager;
    this.effectsManager = effectsManager;
    this.atlas = atlas
    this.weaponAtlas = weaponAtlas
    this.player = null;
  }

  /******************/
  public createShip(params:any, updateHealth:any = () => {}, onDamage:any = () => {}, loseLife:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let shipId = params.shipId + 1
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let {starMomentum} = this.phaserMaster.getOnly(['starMomentum'])

    //  The hero!
    let player = this.phaserSprites.addFromAtlas({x: this.game.world.centerX, y: 2000, name: params.name, group: params.group, org: params.org, atlas: this.atlas,  filename: `ship_base_form`})
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(1, 1)
        player.isInvincible = false;
        player.isDead = true
        player.isDamaged = false
        player.isForceMoved = false
        player.ignoreBoundaries = null
        player.onLayer = params.layer
        player.primaryWeapon = params.primaryWeapon
        player.secondaryWeapon = params.secondaryWeapon
        player.perk = params.perk
        player.explodeInterval = null;
        player.weaponSystems = []
        player.subweaponSystems = []
        player.attachments = []
        player.xCapture = []
        player.yCapture = []
        player.clearEnemyBulletsInterval;
        player.collidables = {
          primaryWeapon: [],
          secondaryWeapon: []
        }

        // add animations
        let shipStart = [...Phaser.Animation.generateFrameNames(`ship_start_`, 1, 7)]
        let shipDamage = ['ship_damage', 'ship_damage', 'ship_damage', 'ship_damage', 'ship_start_7']
        let preExplode =   [...Phaser.Animation.generateFrameNames(`ship_explode_`, 1, 5)]
        let preExplodeLoop =   [...Phaser.Animation.generateFrameNames(`ship_explode_`, 6, 7)]
        player.animations.add('shipDamage', shipDamage, 1, true)
        player.animations.add('shipStart', shipStart, 1, true)
        player.animations.add('preExplode', preExplode, 1, true)
        player.animations.add('preExplodeLoop', preExplodeLoop, 1, true)

        // add physics
        game.physics.enable(player, Phaser.Physics.ARCADE);
        this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER, player)

        // attach hitboxes
        //----------------------------  HITBOX
        let hitboxes = [`ship_hitbox_1`, `ship_hitbox_2`]
        hitboxes.map( (obj, index) => {
          let p_hitbox = this.phaserSprites.addFromAtlas({y: 10, name: `player_hitbox_${game.rnd.integer()}`, group:'player_hitboxes', atlas: this.atlas, filename: obj, alpha: 0})
              p_hitbox.anchor.setTo(0.5, 0.5)
              game.physics.enable(p_hitbox, Phaser.Physics.ARCADE);
              player.addChild(p_hitbox)
        })
        //----------------------------

        //----------------------------  setup targeting box
        let targetingBox = this.phaserSprites.addFromAtlas({name: `mock_trackingbox_${game.rnd.integer()}`, group:'player_trackingBox', atlas: this.atlas, filename: hitboxes[0], width: 10, height: 10, alpha: 0})
        targetingBox.sync = () => {
          targetingBox.x = player.x - targetingBox.width/2
          targetingBox.y = player.y - game.canvas.height/2
        }
        player.defaultTargetingBox = targetingBox
        player.targetBox = targetingBox;
        //----------------------------

        // full power animation
        let fullPowerAnimation = [...Phaser.Animation.generateFrameNames(`ship_fullpower_`, 1, 7), ...Phaser.Animation.generateFrameNames(`ship_fullpower__`, 1, 7).reverse()]
        let fullpower = this.phaserSprites.addFromAtlas({name: 'ship_fullpower_addon', atlas: this.atlas,  filename: fullPowerAnimation[0], visible: false})
            fullpower.anchor.setTo(0.5, 0.5)
            fullpower.animations.add('fullpower', fullPowerAnimation, 1, true)
            fullpower.animations.play('fullpower', 45, true)
        player.addChild(fullpower)


        // // attach exhaust
        // let exhaustAnimation = Phaser.Animation.generateFrameNames('exhaust_', 1, 3);
        // let bottomExhaust = this.phaserSprites.addFromAtlas({y: 45, name: `bottom_exhaust`, atlas: this.atlas,  filename: exhaustAnimation[0], alpha: 1})
        //     bottomExhaust.anchor.setTo(0.5, 0.5)
        //     bottomExhaust.animations.add('animate', exhaustAnimation, 1, true)
        //     bottomExhaust.animations.play('animate', 12, true)
        //     bottomExhaust.sync = (player) => {
        //         let {x, y, angle, alpha, isDead} = player;
        //         bottomExhaust.x = x
        //         bottomExhaust.y = y + 40
        //         bottomExhaust.angle = angle
        //         bottomExhaust.alpha = !isDead ? alpha : 0
        //         bottomExhaust.visible = starMomentum.y >= 0 ? true : false
        //     }
        // player.attachments.push(bottomExhaust)
        // this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_UNDER, bottomExhaust)
        //
        // let topExhaust = this.phaserSprites.addFromAtlas({y: 0, name: `top_exhaust`, atlas: this.atlas,  filename: exhaustAnimation[0], alpha: 1})
        //     topExhaust.anchor.setTo(0.5, 0.5)
        //     topExhaust.angle = 180;
        //     topExhaust.animations.add('animate', exhaustAnimation, 1, true)
        //     topExhaust.animations.play('animate', 12, true)
        //     topExhaust.sync = (player) => {
        //         let {x, y, angle, alpha} = player;
        //         topExhaust.x = x
        //         topExhaust.y = y
        //         topExhaust.angle = angle
        //         topExhaust.alpha = !player.isDead ? alpha : 0
        //         topExhaust.visible = starMomentum.y < 0 ? true : false
        //     }
        // player.attachments.push(topExhaust)
        // this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_UNDER, topExhaust)

        //------------------------
        player.clearAllEnemyBullets = (duration:number) => {
          player.clearEnemyBulletsInterval = game.time.returnTrueTime() + duration
        }
        //------------------------

        //------------------------ targeting box properties
        player.assignTarget = (enemy:any) => {
          player.targetBox = enemy;
        }

        player.removeTarget = () => {
          player.isForceMoved = true;
          player.game.add.tween(player).to( {angle: 0}, 500, Phaser.Easing.Linear.Out, true, 100, 0, false).
              onComplete.add(() => {
                player.targetBox = targetingBox;
                player.isForceMoved = false
              })
        }

        player.getDistanceFromTargetingBox = () => {
          return Math.round(Phaser.Math.distance(player.x, player.y, player.defaultTargetingBox.x, player.defaultTargetingBox.y))
        }
        //------------------------

        //------------------------
        player.onUpdate = () => {

          // fullpowered
          fullpower.visible = gameData.player.powerup >= 30 ? true : false;

          // player faces enemy
          if(!!player.targetBox && !player.isForceMoved){
            player.angle = Math.ceil( (360 / (2 * Math.PI)) * game.math.angleBetween(player.x, player.y, player.targetBox.x, player.targetBox.y) + 90 )
          }

          if(!player.isForceMoved){
            player.alpha = (player.isInvincible && !player.isDead) ? 0.5 : 1
          }

          // sync targetingbox
          targetingBox.sync();


          // movement
          if(!player.isDead){
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
          }


          // collision detection
          let collidables = []
          // update weapon (check for collison)
          let weaponSystems = [...player.weaponSystems, ...player.subweaponSystems]
              weaponSystems.map( weaponSystem => {
                weaponSystem.angle = player.angle
                weaponSystem.onUpdate()
                weaponSystem.sync(player)
                collidables.push(weaponSystem.ammo.bullets)
              })


          this.bulletCollisionDetection()

          // go through attachments and sync their location
          player.attachments.map(attachments => {
            attachments.sync(player)
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
            player.animations.play('shipDamage', 45, false)
            player.isDamaged = true
            game.time.events.add(250, () => {
              player.isDamaged = false
            }, this).autoDestroy = true;
            player.tint = 1 * 0xff0000;
            player.alpha = 0.75
            player.game.add.tween(player).to( {tint: 1 * 0xffffff, alpha: 1}, 10, Phaser.Easing.Linear.Out, true, 100, 0, false).
              onComplete.add(() => {
                game.time.events.add(500, () => {
                  player.isInvincible = false;
                }, this).autoDestroy = true;
              })
          }
          else{
            player.isDestroyed()
            game.time.events.add(500, () => {
              loseLife(player);
            }).autoDestroy = true
          }
        }
        //------------------------

        //------------------------
        player.isDestroyed = (respawn:boolean = true) => {

          if(!player.isDead){
          // change player states
          player.isDead = true;
          player.isInvincible = true;
          // destroy weapon systems
          player.destroyWeaponSystems();
          // // get last call
          player.onUpdate();
          player.explodeInterval = game.time.events.loop( 250, () => {
            this.effectsManager.createExplosion(player.x + game.rnd.integerInRange(-player.width/2, player.width/2), player.y + game.rnd.integerInRange(-player.height/2, player.height/2), 1, player.onLayer + 1)
          })

          // play animation
          this.effectsManager.createExplosion(player.x, player.y, 1, 6)
          game.add.tween(this).to( { angle: game.rnd.integerInRange(-90, 90), alpha: 0}, 1000, Phaser.Easing.Linear.In, true, 0).
            onComplete.add(() => {
              this.weaponManager.createExplosionVacuum(player.x, player.y, 1.5, player.onLayer + 1, 10)
              let debris = this.effectsManager.debris(100);
              debris = debris;
              debris.customFire(player)
              game.time.events.remove(player.explodeInterval)
              player.visible = false;
            })
          }
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


        //------------------------
        player.attachPerk = (type:string) => {
          this.attachPerk(player, params, type)
        }
        //------------------------

        //------------------------
        player.attachWeapon = (weaponType:string) => {
          let weaponSystems;
          switch(weaponType){
            case 'BULLET':
              weaponSystems = this.attachBullet(player, params, weaponType)
              break
            case 'SPREAD':
              weaponSystems = this.attachSpread(player, params, weaponType)
              break
            case 'LASER':
              weaponSystems = this.attachLaser(player, params, weaponType)
              break
            case 'MISSLE':
              weaponSystems = this.attachMissle(player, params, weaponType)
              break
            case 'SHOTGUN':
              weaponSystems = this.attachShotgun(player, params, weaponType)
              break
            case 'GATLING':
              weaponSystems = this.attachGatling(player, params, weaponType)
              break
          }
          player.collidables.primaryWeapon = [];
          weaponSystems.map(weaponSystem => {
             player.collidables.primaryWeapon.push(weaponSystem.ammo.bullets)
          })

        }
        //------------------------

        //------------------------
        player.attachSubweapon = (weaponType:string) => {
          let weaponSystems;

          switch(weaponType){
            case 'CLUSTERBOMB':
              weaponSystems = this.attachClusterbomb(player, params, weaponType)
              break
          }

          player.collidables.secondaryWeapon = [];
          weaponSystems.map(weaponSystem => {
             player.collidables.secondaryWeapon.push(weaponSystem.ammo.bullets)

             // add bomblets to group - typically only in clusterbomb
             if(!!weaponSystem.ammo.bomblets){
               weaponSystem.ammo.bomblets.map(bomblet => {
                  player.collidables.secondaryWeapon.push(bomblet.bullets)
               })
             }
          })
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
          player.subweaponSystems.map( obj => {
            obj.fire()
          })
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

          if(this.y + this.height > this.game.world.height){
            this.y = this.game.world.height - this.height
          }

          if(this.x < 0){
            this.x = 0
          }
          if(this.x > (this.game.world.width + this.width)){
            this.x = (this.game.world.width + this.width)
          }
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


          game.time.events.add(150, () => {
              player.alpha = 1
              player.visible = true;

              game.add.tween(player).to( { y: game.world.centerY + 100 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
                onComplete.add(() => {
                  player.ignoreBoundaries = false
                  // enable controls
                  this.phaserControls.enableAllInput()
                  // attach weapons
                  player.attachWeapon(player.primaryWeapon)
                  player.attachSubweapon(player.secondaryWeapon)

                  player.animations.play('shipStart', 12, false)

                  game.time.events.add(1000, () => {
                    player.isInvincible = false;
                    callback()
                  }).autoDestroy = true;
                })
          }).autoDestroy = true;
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
      shipPerk = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_perk`,  atlas: this.atlas,  filename: animationSprites[0], alpha: 0.5})
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

      this.game.time.events.add(1000, () => {
        if(shipPerk !== undefined){
          shipPerk.tweenFadeOut();
        }
      }).autoDestroy = true;

      shipPerk.animations.add('animate', animationSprites, 1, true)
      shipPerk.animations.play('animate', framerate, true)
      player.addChild(shipPerk)
    }
    else{
      shipPerk = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_perk`,  atlas: this.atlas,  filename: animationSprites[0], visible: true})
      shipPerk.anchor.setTo(0.5, 0.5)
      shipPerk.animations.add('animate', animationSprites, 1, true)
      shipPerk.animations.play('animate', framerate, true)
      player.addChild(shipPerk)
      }
  }
  /******************/


  //------------------ PRIMARY WEAPONS
  /******************/
  public attachLaser(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('laser_fire_', 1, 1)]
    let gap = 15;
    let turrets = 7
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;
          weaponSystem.onUpdate = () => {}

          weaponSystem.sync = (player) => {
            let {x, y, angle} = player;
            let coords = this.weaponManager.calculateRotateCoords(weaponSystem.offset, player.targetBox)
            weaponSystem.x = x + coords.x
            weaponSystem.y = y + coords.y
          }

          weaponSystem.destroyIt = () => {
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            if(animationSprites.length > 0){ weaponSystem.animations.play('fireWeapon', 60, false) }
            ammo.fireAngle  = 270+weaponSystem.angle

            if(powerupLvl === 0 && (weaponSystem.index === 3)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl === 1 && (weaponSystem.index === 2 || weaponSystem.index === 4)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl === 2 && (weaponSystem.index === 2 || weaponSystem.index === 3 || weaponSystem.index === 4)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl === 3 && (weaponSystem.index === 1 || weaponSystem.index === 2 || weaponSystem.index === 4 || weaponSystem.index === 5)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl === 4 && (weaponSystem.index === 1 || weaponSystem.index === 2 || weaponSystem.index === 3 || weaponSystem.index === 4 || weaponSystem.index === 5)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl === 5){
              ammo.fireOffset(0, 0);
            }
          }

      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 3
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {}
      ammo.trackSprite(weaponSystem, 0 , 0);
      //-----------------

      // attach to player
      ammo.weaponSystem = weaponSystem;
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

    return player.weaponSystems;
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            let coords = this.weaponManager.calculateRotateCoords(weaponSystem.offset, player.targetBox)
            weaponSystem.x = x + coords.x
            weaponSystem.y = y + coords.y
          }

          weaponSystem.destroyIt = () => {
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            for(let n = 0; n < 5*(powerupLvl+1); n++){
              ammo.fireAngle  = 270+weaponSystem.angle
              ammo.fire(weaponSystem, null, weaponSystem + 1);
            }
            if(animationSprites.length > 0){ weaponSystem.animations.play('fireWeapon', 60, false) }
          }

      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 60
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {

      }
      ammo.trackSprite(weaponSystem, 0, 0);
      //-----------------



      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

    return player.weaponSystems;
  }
  /******************/

  /******************/
  public attachBullet(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let gap = 15;
    let turrets = 12
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))
          weaponSystem.index = i;

          weaponSystem.onUpdate = () => {}

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            let coords = this.weaponManager.calculateRotateCoords(weaponSystem.offset, player.targetBox)
            weaponSystem.x = x + coords.x
            weaponSystem.y = y + coords.y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.effectsManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            let coords = this.weaponManager.calculateRotateCoords(30, player.targetBox)
            ammo.fireAngle  = 270+weaponSystem.angle

            if(powerupLvl >= 0 && (weaponSystem.index === 5 || weaponSystem.index === 6)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl >= 1 && (weaponSystem.index === 4 || weaponSystem.index === 7)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl >= 2 && (weaponSystem.index === 3 || weaponSystem.index === 8)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl >= 3 && (weaponSystem.index === 2 || weaponSystem.index === 9)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl >= 4 && (weaponSystem.index === 1 || weaponSystem.index === 10)) {
              ammo.fireOffset(0, 0);
            }
            if(powerupLvl >=5  && (weaponSystem.index === 0 || weaponSystem.index === 11)) {
              ammo.fireOffset(0, 0);
            }
          }

      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 3
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {}
      ammo.trackSprite(weaponSystem);
      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

    return player.weaponSystems;
  }
  /******************/

  /******************/
  public attachSpread(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`,  atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {
            ammo.onUpdate();
          }

          weaponSystem.sync = (player) => {
            let {x, y, angle} = player;
            weaponSystem.x = x + weaponSystem.offset
            weaponSystem.y = y
            weaponSystem.angle = angle
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
            this.effectsManager.blueImpact(x, y, 1, player.onLayer)
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            let coords;
            if(animationSprites.length > 0){ weaponSystem.animations.play('fireWeapon', 60, false) }
            let spreadFactor = Math.abs(player.getDistanceFromTargetingBox() / Math.round(Phaser.Math.distance(player.x, player.y, player.targetBox.x, player.targetBox.y)))

            if(powerupLvl >= 0){
              ammo.fire(weaponSystem, player.targetBox.x, player.targetBox.y - 1)
            }
            if(powerupLvl >= 1){
              coords = this.weaponManager.calculateSpread(50, player.targetBox)
              ammo.fire(weaponSystem, coords.x1, coords.y1);
              ammo.fire(weaponSystem, coords.x2, coords.y2);
            }
            if(powerupLvl >= 2){
              coords = this.weaponManager.calculateSpread(100 / spreadFactor, player.targetBox)
              ammo.fire(weaponSystem, coords.x1, coords.y1);
              ammo.fire(weaponSystem, coords.x2, coords.y2);
            }
            if(powerupLvl >= 3){
              coords = this.weaponManager.calculateSpread(150 / spreadFactor, player.targetBox)
              ammo.fire(weaponSystem, coords.x1, coords.y1);
              ammo.fire(weaponSystem, coords.x2, coords.y2);
            }
            if(powerupLvl >= 4){
              coords = this.weaponManager.calculateSpread(200 / spreadFactor, player.targetBox)
              ammo.fire(weaponSystem, coords.x1, coords.y1);
              ammo.fire(weaponSystem, coords.x2, coords.y2);
            }
            if(powerupLvl >= 5){
              coords = this.weaponManager.calculateSpread(250 / spreadFactor, player.targetBox)
              ammo.fire(weaponSystem, coords.x1, coords.y1);
              ammo.fire(weaponSystem, coords.x2, coords.y2);
            }
          }


      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = ((powerupLvl+2) * 12)
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {  }
      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

      return player.weaponSystems;
  }
  /******************/

  /******************/
  public attachMissle(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('missle_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`,  atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {}

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            let coords = this.weaponManager.calculateRotateCoords(weaponSystem.offset, player.targetBox)
            weaponSystem.x = x + coords.x
            weaponSystem.y = y + coords.y
          }

          weaponSystem.destroyIt = () => {
            let {x, y} = weaponSystem;
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            if(animationSprites.length > 0){ weaponSystem.animations.play('fireWeapon', 60, false) }
            //emitter.fire(weaponSystem.x, weaponSystem.y)
            ammo.fireAngle  = 270+weaponSystem.angle
            ammo.fire(weaponSystem);
            if(powerupLvl === 0){
              ammo.fire(weaponSystem);
              ammo.fire(weaponSystem);
            }
            if(powerupLvl >= 1){
              ammo.fire(weaponSystem);
              ammo.fire(weaponSystem);
            }
            if(powerupLvl >= 3){
              ammo.fire(weaponSystem);
              ammo.fire(weaponSystem);
            }
            if(powerupLvl >= 4){
              ammo.fire(weaponSystem);
              ammo.fire(weaponSystem);
            }
            if(powerupLvl >= 5){
              ammo.fire(weaponSystem);
              ammo.fire(weaponSystem);
            }
          }

      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = ((powerupLvl+2) * 8)
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {  }
      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

    return player.weaponSystems;
  }
  /******************/

  /******************/
  public attachGatling(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('missle_fire_', 1, 4)]
    let {gameData} = this.phaserMaster.getOnly(['gameData']);
    let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
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
      let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`,  atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
          weaponSystem.anchor.setTo(0.5, 0.5)
          if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }
          weaponSystem.offset = (gap * i) - ((gap/2) * (turrets-1))

          weaponSystem.onUpdate = () => {}

          weaponSystem.sync = (player) => {
            let {x, y} = player;
            let coords = this.weaponManager.calculateRotateCoords(weaponSystem.offset, player.targetBox)
            weaponSystem.x = x + coords.x
            weaponSystem.y = y + coords.y
          }

          weaponSystem.destroyIt = () => {
            this.phaserSprites.destroy(weaponSystem.name)
          }

          weaponSystem.fire = () => {
            let {gameData} = this.phaserMaster.getOnly(['gameData']);
            let powerupLvl = Math.floor( (gameData.player.powerup-1) / 5)
            if(animationSprites.length > 0){ weaponSystem.animations.play('fireWeapon', 60, false) }
            ammo.fireAngle  = 270+weaponSystem.angle
            //emitter.fire(weaponSystem.x, weaponSystem.y)
            if(powerupLvl == 0){
              ammo.fire(weaponSystem);
            }
            if(powerupLvl >= 1){
              this.game.time.events.add(50, () => {
                ammo.fire(weaponSystem);
              }).autoDestroy = true;
            }
            if(powerupLvl >= 2){
              this.game.time.events.add(100, () => {
                ammo.fire(weaponSystem);
              }).autoDestroy = true;
            }
            if(powerupLvl >= 3){
              this.game.time.events.add(150, () => {
                ammo.fire(weaponSystem);
              }).autoDestroy = true;
            }
            if(powerupLvl >= 4){
              this.game.time.events.add(200, () => {
                ammo.fire(weaponSystem);
              }).autoDestroy = true;
            }
            if(powerupLvl >= 5){
              this.game.time.events.add(50, () => {
                ammo.fire(weaponSystem);
              }).autoDestroy = true;
            }
          }


      this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)
      //-----------------

      //-----------------
      let maxBulletsOnscreen = 12
      let ammo = this.weaponManager.playerBullets(maxBulletsOnscreen, weaponType);
      ammo.checkOrientation(weaponSystem.angle)
      ammo.onUpdate = () => {}
      //-----------------

      // attach to player
      weaponSystem.ammo = ammo;
      player.weaponSystems.push(weaponSystem)
    }

    return player.weaponSystems;
  }
  /******************/
  //------------------



  //------------------ SECONDARY WEAPONS
  /******************/
  private attachClusterbomb(player:any, params:any, weaponType:string){
    let animationSprites = [...Phaser.Animation.generateFrameNames('laser_fire_', 1, 6)]
    let gap = 35;
    let turrets = 5

    let weaponSystem = this.phaserSprites.addFromAtlas({name: `ship_weapon_${this.game.rnd.integer()}`, atlas: this.weaponAtlas,  filename: animationSprites[0], alpha: 0})
        weaponSystem.anchor.setTo(0.5, 0.5)
        if(animationSprites.length > 0){ weaponSystem.animations.add('fireWeapon', animationSprites, 1, true) }

        weaponSystem.onUpdate = () => {
          ammo.onUpdate()
        }

        weaponSystem.sync = (player) => {
          let {x, y} = player;
          weaponSystem.x = x
          weaponSystem.y = y
        }

        weaponSystem.destroyIt = () => {
          let {x, y} = weaponSystem;
        }

        weaponSystem.fire = () => {
          ammo.fire(weaponSystem, player.targetBox.x, player.targetBox.y - 1)
          //ammo.fireOffset(0, - 32)
        }

        this.phaserGroup.add(this.phaserMaster.get('layers').PLAYER_OVER, weaponSystem)

        //-----------------
        let maxBulletsOnscreen = 4
        let onKill = () => {
          player.clearAllEnemyBullets(Phaser.Timer.SECOND * 2)
        }
        let ammo = this.weaponManager.createClusterbomb(maxBulletsOnscreen, onKill);

        ammo.onUpdate = () => {

        }
        //ammo.trackSprite(weaponSystem, 0 , 0);
        //-----------------


        // attach to player
        weaponSystem.ammo = ammo;
        player.subweaponSystems.push(weaponSystem)

    return player.subweaponSystems
  }
  /******************/
  //------------------

  /******************/
  public damgePopup(target:any, amount:number){
    let {x, y, width, height} = target;
    this.game.time.events.add(this.game.rnd.integerInRange(0, 150), () => {
      let damageAmount = this.phaserTexts.add({name: `enemy_${this.game.rnd.integer()}`, group: 'ui',  font: 'gem', x: x + this.game.rnd.integerInRange(-20, 20), y: y + this.game.rnd.integerInRange(-20, 20),  size: 12, default: amount})
      this.game.add.tween(damageAmount.scale).to( {x: 1.5, y:1.5}, 250, Phaser.Easing.Back.In, true, 0, 0, false)
      this.game.add.tween(damageAmount).to( {y: damageAmount.y + 10}, 250, Phaser.Easing.Back.In, true, 0, 0, false).
        onComplete.add(() => {
          this.game.add.tween(damageAmount).to( {y: damageAmount.y - 10, alpha: 0}, 250, Phaser.Easing.Bounce.Out, true, 0, 0, false).
            onComplete.add(() => {
              this.phaserTexts.destroy(damageAmount.name)
            })
        })
    }, this).autoDestroy = true;

  }
  /******************/

  /******************/
  public bulletCollisionDetection(){
    let enemies = [...this.phaserSprites.getGroup('enemy_hitboxes')]

    // if(this.player.clearEnemyBulletsInterval > this.game.time.returnTrueTime()){
    //   let enemyBullets = enemies.map(enemy => {
    //     return enemy.parent.weaponSystems.map(weaponSystems => {
    //         return weaponSystems.ammo.bullets.children.map(bullet => {
    //           return bullet
    //         })
    //     })
    //   })
    //
    //   enemyBullets.map(bullets => {
    //     bullets.map(bullet => {
    //       bullet.map(b => {
    //         if(b.alive){
    //           b.destroyIt()
    //         }
    //       })
    //     })
    //   })
    // }

    // get all ammo from primary weapons and secondary Weapons
    let collidables = [...this.player.collidables.primaryWeapon, ...this.player.collidables.secondaryWeapon]

    // add any impact explosions
    this.phaserSprites.getManyGroups(['impactExplosions']).map(obj => {
      collidables.push(obj)
    })

    // check against enemies
    this.game.physics.arcade.overlap(enemies, collidables, (enemy, collidable) => {
      let e = enemy.parent;

      if(!e.isDestroyed){
        let weaponData = collidable.weaponData

        if((!e.isDamaged && !e.isDestroyed) || (weaponData.ignoreDamageState && !e.isDestroyed)){
          if(weaponData.reference === 'LASER'){
            let coords = this.weaponManager.calculateRotateCoords(0, this.player.targetBox)
            this.effectsManager.electricDischarge(e.x + this.game.rnd.integerInRange(-10, 10), e.y + this.game.rnd.integerInRange(-10, 10), 1, e.onLayer + 1)
          }
          if(weaponData.reference === 'SPREAD'){
            this.effectsManager.blueImpact(collidable.x, collidable.y, 1, e.onLayer + 1)
          }
          if(weaponData.reference === 'SHOTGUN'){
            this.effectsManager.pelletImpact(collidable.x, collidable.y, 1, e.onLayer + 1)
          }
          if(weaponData.reference === 'GATLING'){
            this.effectsManager.pelletImpact(collidable.x, collidable.y, 1, e.onLayer + 1)
          }
          if(weaponData.reference === 'BULLET'){
            this.effectsManager.orangeImpact(collidable.x, collidable.y, 1, e.onLayer + 1)
          }
          if(weaponData.reference === 'MISSLE'){
            this.weaponManager.createExplosionBasic(collidable.x, collidable.y, 1, e.onLayer + 1, Math.round(weaponData.damage/2))
          }
          this.damgePopup(e, weaponData.damage)
          e.damageIt(weaponData.damage)
        }

        if(!weaponData.pierce && !weaponData.completeAnimation){
          collidable.destroyIt(e.onLayer - 1)
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

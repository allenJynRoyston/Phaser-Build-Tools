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
  public createShip(params:any, updateHealth:any = () => {}, loseLife:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let shipId = params.shipId + 1
    let shieldFrames = [...Phaser.Animation.generateFrameNames(`ship_${shipId}_shield_`, 1, 6), ...Phaser.Animation.generateFrameNames(`ship_${shipId}_shield_`, 1, 6).reverse()]
    let healFrames =   [...Phaser.Animation.generateFrameNames(`ship_${shipId}_heal_`, 1, 6),   ...Phaser.Animation.generateFrameNames(`ship_${shipId}_heal_`, 1, 6).reverse()]
    //  The hero!
    let player = this.phaserSprites.addFromAtlas({name: params.name, group: params.group, atlas: this.atlas,  filename: `ship_${shipId}`, visible: false})
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(1, 1)
        player.isInvincible = false;
        player.isDead = false
        player.onLayer = params.layer
        player.exhaustPoints = {
          center: 40,
          top: 25,
          bottom: 50
        }
        game.physics.enable(player, Phaser.Physics.ARCADE);
        this.phaserGroup.add(params.layer, player)
        this.createShipExhaust(player, params);

        // player.animations.add('shields', healFrames, 1, true)
        // player.animations.play('shields', 10, true)

        player.onUpdate = () => {
          onUpdate(player)
          if(player.visible && !player.isDead){
            player.createTrail();
          }
        }

        player.takeDamage = (val:number) => {
          let {gameData} = this.phaserMaster.getOnly(['gameData'])
          let health = gameData.player.health - val
          updateHealth(health)
          if(health > 0){
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

        player.isDestroyed = () => {
          player.isDead = true;
          this.weaponManager.createExplosion(player.x, player.y, 1, 6)
          game.add.tween(this).to( { angle: game.rnd.integerInRange(-90, 90), alpha: 0}, 1000, Phaser.Easing.Linear.In, true, 0).
            onComplete.add(() => {
              this.weaponManager.createExplosion(player.x, player.y, 1, 6)
              player.visible = false;
              setTimeout(() => {
                updateHealth(100)
                player.moveToStart();
              }, 1000)
            })
        }


        player.createTrail = () => {
          // let {currentState} = this.phaserMaster.getState();
          // let trailCount = this.phaserSprites.getGroup(`${params.name}_trails`).length;
          // if(trailCount < (currentState === 'ENDLEVEL') ? 20 : 10){
          //   let trail = this.phaserSprites.addFromAtlas({name: `${params.name}_trail_${game.rnd.integer()}`, group:`${params.name}_trails`, x: player.x, y: player.y, filename: 'ship_body', atlas: 'atlas_main', visible: true})
          //       trail.anchor.setTo(0.5, 0.5)
          //       trail.scale.setTo(player.scale.x - 0.2, player.scale.y - 0.2)
          //       trail.alpha = 0.4
          //       trail.angle = player.angle;
          //       trail.tint = 1 * 0x0000ff;
          //       this.phaserGroup.add(params.layer - 1, trail)
          //       trail.destroySelf = () => {
          //         trail.game.add.tween(trail).to( { alpha: 0}, (currentState === 'ENDLEVEL') ? 600 : 250, Phaser.Easing.Linear.In, true, 0).
          //           onComplete.add(() => {
          //             this.phaserSprites.destroy(trail.name)
          //           }, trail);
          //       }
          //       trail.destroySelf();
          //  }
        }

        player.selfDestruct = () => {
          player.isInvincible = true;
          this.phaserSprites.get('exhaust').destroyIt();
          //game.add.tween(player.scale).to( { x: 0.25, y: 0.25}, 3400, Phaser.Easing.Linear.In, true, 0).
          game.add.tween(player).to( { angle: 720}, 3400, Phaser.Easing.Linear.In, true, 0).
          onComplete.add(() => {
            this.phaserSprites.destroy(player.name)
            this.weaponManager.createExplosion(player.x, player.y, 0.5, 6)
          }, this);
        }

        player.moveToStart = () => {
          player.isDead = false;
          player.angle = 0;
          player.alpha = 1
          player.visible = true;
          player.isInvincible = true;
          player.x = this.game.world.centerX
          player.y = this.game.world.centerY + 550
          game.add.tween(player).to( { y: game.world.centerY + 200 }, 1000, Phaser.Easing.Exponential.InOut, true, 0, 0, false).
            onComplete.add(() => {
              this.phaserControls.enableAllInput()
              setTimeout(() => {
                player.isInvincible = false;
              }, 1000)
            })
        }

        player.fireWeapon = () => {
          this.phaserSprites.get(`${params.name}_ship_weapon`).fireWeapon()
        }

        player.fireSubweapon = () => {
          this.phaserSprites.get(`${params.name}_ship_subweapon`).fireWeapon()
        }

        player.regenerateHealth = (active:Boolean = false) => {
          //console.log("regenerating health..." + active)
        }

        player.moveX = (val:number) => {
          player.x += val
          player.checkLimits()
        }

        player.moveY = (val:number) => {
          player.y += val
          player.checkLimits()
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

        player.attachPerk = (type:string) => {
          this.attachPerk(player, params, type)
        }

        player.attachWeapon = (weaponType:string) => {
          this.attachWeaponSprite(player, params, weaponType)
        }

        player.attachSubweapon = (weaponType:string) => {
          this.attachSubWeaponSprite(player, params, weaponType)
        }

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
    let animationSprites;
    let framerate
    let onLayer
    switch(weaponType){
      case 'CLUSTERBOMB':
        animationSprites = [...Phaser.Animation.generateFrameNames('cannon_fire_', 1, 8)]
        framerate = 20;
        break
      case 'TRIPLEBOMB':
        animationSprites = [...Phaser.Animation.generateFrameNames('cannon2_fire_', 1, 7), ...['cannon2_fire_1']]
        framerate = 60;
        break
      case 'TURRET':
        animationSprites = ['turret_base']
        framerate = 30;
        break
    }

    if(this.phaserSprites.get(`${params.name}_ship_subweapon`) !== undefined){
      this.phaserSprites.destroy(`${params.name}_ship_subweapon`)
    }

    let shipSubweapon = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_subweapon`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
        shipSubweapon.anchor.setTo(0.5, 0.5)
        shipSubweapon.animations.add('fireWeapon', animationSprites, 1, true)

        shipSubweapon.fireWeapon = () => {
          shipSubweapon.animations.play('fireWeapon', framerate, false)
        }
        player.addChild(shipSubweapon)
  }
  /******************/

  /******************/
  private attachWeaponSprite(player:any, params:any, weaponType:string){
    let animationSprites;
    let framerate
    switch(weaponType){
      case 'BULLET':
        animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
        framerate = 60;
        break
      case 'LASER':
        animationSprites = [...Phaser.Animation.generateFrameNames('laser_fire_', 1, 6)]
        framerate = 60;
        break
      case 'MISSLE':
        animationSprites = [...Phaser.Animation.generateFrameNames('missle_fire_', 1, 6)]
        framerate = 30;
        break
    }

    if(this.phaserSprites.get(`${params.name}_ship_weapon`) !== undefined){
      this.phaserSprites.destroy(`${params.name}_ship_weapon`)
    }

    let shipWeapon = this.phaserSprites.addFromAtlas({name: `${params.name}_ship_weapon`, group: params.group, atlas: this.weaponAtlas,  filename: animationSprites[0], visible: true})
        shipWeapon.anchor.setTo(0.5, 0.5)
        shipWeapon.animations.add('fireWeapon', animationSprites, 1, true)

        shipWeapon.fireWeapon = () => {
          shipWeapon.animations.play('fireWeapon', framerate, false)
        }
        player.addChild(shipWeapon)
  }
  /******************/


  /******************/
  public createShipExhaust(player:any, params:any){
    let shipExhaust = this.phaserSprites.addFromAtlas({name: `${params.name}_exhaust`, group: params.group,  x: player.x, y: player.y + player.height/2 + 10, atlas: this.atlas,  filename: 'exhaust_red_1', visible: true})
        shipExhaust.animations.add('exhaust_animation', Phaser.Animation.generateFrameNames('exhaust_red_', 1, 8), 1, true)
        shipExhaust.animations.play('exhaust_animation', 30, true)
        shipExhaust.anchor.setTo(0.5, 0.5)
        player.addChild(shipExhaust)

        shipExhaust.onUpdate = () => {

        }
        shipExhaust.updateCords = (x, y) => {}

        shipExhaust.destroyIt = () => {
          this.phaserSprites.destroy(shipExhaust.name)
        }

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

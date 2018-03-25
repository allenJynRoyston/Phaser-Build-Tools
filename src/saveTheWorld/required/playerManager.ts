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

  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, phaserControls:any, weaponManager:any, atlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.phaserControls = phaserControls;
    this.weaponManager = weaponManager;
    this.atlas = atlas
  }

  /******************/
  public createShip1(updateHealth:any = () => {}, loseLife:any = () => {}, onUpdate:any = () => {}){
    let game = this.game

    //  The hero!
    let player = this.phaserSprites.addFromAtlas({name: 'player', group: 'playership', atlas: 'atlas_main',  filename: 'ship_body.png', visible: false})
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(1, 1)
        player.isInvincible = false;
        player.isDead = false
        player.exhaustPoints = {
          center: 40,
          top: 25,
          bottom: 50
        }
        game.physics.enable(player, Phaser.Physics.ARCADE);
        this.phaserGroup.add(8, player)
        this.createShipExhaust(player);


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
          let {currentState} = this.phaserMaster.getState();
          let trailCount = this.phaserSprites.getGroup('trails').length;
          if(trailCount < (currentState === 'ENDLEVEL') ? 20 : 10){
            let trail = this.phaserSprites.addFromAtlas({name: `trail_${game.rnd.integer()}`, group:'trails', x: player.x, y: player.y, filename: 'ship_body.png', atlas: 'atlas_main', visible: true})
                trail.anchor.setTo(0.5, 0.5)
                trail.scale.setTo(player.scale.x - 0.2, player.scale.y - 0.2)
                trail.alpha = 0.4
                trail.angle = player.angle;
                trail.tint = 1 * 0x0000ff;
                this.phaserGroup.add(7, trail)
                trail.destroySelf = () => {
                  trail.game.add.tween(trail).to( { alpha: 0}, (currentState === 'ENDLEVEL') ? 600 : 250, Phaser.Easing.Linear.In, true, 0).
                    onComplete.add(() => {
                      this.phaserSprites.destroy(trail.name)
                    }, trail);
                }
                trail.destroySelf();
           }
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

        player.syncExhaust = () => {
          let {player, exhaust} = this.phaserSprites.getOnly(['player', 'exhaust'])
          if(exhaust !== undefined && player !== undefined){
            exhaust.updateCords(player.x, player.y)
          }
        }


        player.moveX = (val:number) => {
          player.x += val
          player.syncExhaust();
          player.checkLimits()
        }

        player.moveY = (val:number) => {
          player.y += val
          player.syncExhaust();
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


      return player;

  }
  /******************/

  /******************/
  public createShipExhaust(player:any){
    let shipExhaust = this.phaserSprites.addFromAtlas({name: 'exhaust', group: 'playership', atlas: 'atlas_main',  filename: 'exhaust_red_1.png', visible: false})
        shipExhaust.animations.add('exhaust_animation', Phaser.Animation.generateFrameNames('exhaust_red_', 1, 8, '.png'), 1, true)
        shipExhaust.animations.play('exhaust_animation', 30, true)
        this.phaserGroup.add(8, shipExhaust)
        shipExhaust.anchor.setTo(0.5, 0.5)
        shipExhaust.onUpdate = () => {
          let {currentState} = this.phaserMaster.getState();
          let {x, width, height, y, visible, isDead} = player;
          shipExhaust.visible = (currentState !== 'ENDLEVEL') ? player.visible : false;
          shipExhaust.x = x
          shipExhaust.y = y + player.exhaustPoints.center;
          shipExhaust.alpha = (currentState === 'ENDLEVEL') && player.isDead ? 0 : 1
          shipExhaust.scale.setTo(1, 1)
        }

        shipExhaust.updateCords = (x, y) => {
          let {starMomentum} = this.phaserMaster.getOnly(['starMomentum'])
          shipExhaust.x = x
          if(starMomentum.y == 0){
            shipExhaust.y = y + player.exhaustPoints.center;
            shipExhaust.scale.setTo(1, 1)
          }
          if(starMomentum.y > 0){
            shipExhaust.y = y + player.exhaustPoints.bottom;
            shipExhaust.scale.setTo(1, 1.5)
          }
          if(starMomentum.y < 0){
            shipExhaust.y = y + player.exhaustPoints.top;
            shipExhaust.scale.setTo(1, 0.25)
          }

        }

        shipExhaust.destroyIt = () => {
          this.phaserSprites.destroy(shipExhaust.name)
        }

  }
  /******************/

}

declare var Phaser:any;

export class EFFECTS_MANAGER {
  game:any;
  phaserSprites:any;
  phaserMaster:any;
  phaserGroup:any
  atlas:any;

  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserGroup:any, atlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserGroup = phaserGroup;
    this.atlas = atlas
  }


  /******************/
  public debris(bulletPoolTotal:any = 5){
    let game = this.game
    let {phaserMaster} = this;
    let {onscreenDebrisCount} = phaserMaster.getOnly(['onscreenDebrisCount'])
    let animationSprites = Phaser.Animation.generateFrameNames('debrs__', 1, 9)
    let onscreenCap = 200;

    // debri will limit itself if too many on screen at one time
    if(onscreenDebrisCount > onscreenCap){
      bulletPoolTotal = 5
    }

    let weapon = game.add.weapon(bulletPoolTotal, this.atlas, animationSprites[0])
        weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS ;
        weapon.bulletSpeed = 200
        weapon.bulletSpeedVariance = 500;
        weapon.multiFire = true;
        this.phaserGroup.add(this.phaserMaster.get('layers').DEBRIS, weapon.bullets )

        // map animation on each individual bullet
        weapon.bullets.children.map( bullet => {
          bullet.animations.add('explosion', animationSprites, 30, true)
        })

        // when called, will execute animation and then destroy each bullet before finally destroying the weapon object itself
        weapon.customFire = (target) => {
          for(let i = 0; i < bulletPoolTotal; i++){
            weapon.fire(target, target.x + game.rnd.integerInRange(-360, 360), target.y + game.rnd.integerInRange(-360, 360))
          }
          // add to debris count
          onscreenDebrisCount += bulletPoolTotal
          phaserMaster.forceLet('onscreenDebrisCount', onscreenDebrisCount)
          weapon.bullets.children.map( (bullet, index) => {
            game.time.events.add(index*15, () => {
              bullet.animations.play('explosion', 30, true)
              game.add.tween(bullet).to( { alpha: 0}, 500, Phaser.Easing.Linear.In, true, 500).
                onComplete.add(() => {
                  // remove from debri count
                  onscreenDebrisCount--
                  phaserMaster.forceLet('onscreenDebrisCount', onscreenDebrisCount)
                  bullet.destroy()
                })
            }).autoDestroy = true;
          })

          game.time.events.add(Phaser.Timer.SECOND * 4, () => {
            weapon.destroy()
          })
        }
    return weapon
  }
  /******************/




  /******************
  //
    NOT COLLIDABLE - JUST FOR SHOW
  //
  /******************
  /*******************/
  public createExplosion(x:number, y:number, scale:number, layer:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('explosion2_layer_', 1, 12)
    }

    let explosion = phaserSprites.addFromAtlas({name: `explosion_${game.rnd.integer()}`, group: 'noimpactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)

        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);


        explosion.destroyIt = () => {
          phaserSprites.destroy(explosion.name)
        }

    phaserGroup.add(layer ===  undefined ? this.phaserMaster.get('layers').VISUALS : layer, explosion)

    return explosion;
  }
  /******************/

  /******************/
  public pelletImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('sparks_', 1, 5)
    }

    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'noimpactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);

    explosion.destroyIt = () => {
      phaserSprites.destroy(explosion.name)
    }

    phaserGroup.add(layer ===  undefined ? this.phaserMaster.get('layers').BULLET_IMPACT : layer, explosion)

    game.physics.enable(explosion, Phaser.Physics.ARCADE);
    return explosion;
  }
  /******************/

  /******************/
  public blueImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('blue_explosion_small_layer_', 1, 7)
    }

    let frames = Phaser.Animation.generateFrameNames('blue_explosion_small_layer_', 1, 7);
    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'noimpactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);

    explosion.destroyIt = () => {
      phaserSprites.destroy(explosion.name)
    }

    phaserGroup.add(layer ===  undefined ? this.phaserMaster.get('layers').BULLET_IMPACT : layer, explosion)

    return explosion;
  }
  /******************/

  /******************/
  public orangeImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('orange_ring_explosion_layer_', 1, 7)
    }

    let frames = Phaser.Animation.generateFrameNames('orange_ring_explosion_layer_', 1, 7);
    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'noimpactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
    explosion.scale.setTo(scale, scale)
    explosion.anchor.setTo(0.5, 0.5)
    game.physics.enable(explosion, Phaser.Physics.ARCADE);
    explosion.animations.add('explosion', data.spriteAnimation, 1, true)
    explosion.animations.play('explosion', 30, false).onComplete.add(() => {
        explosion.destroyIt()
    }, explosion);

    explosion.destroyIt = () => {
      phaserSprites.destroy(explosion.name)
    }

    phaserGroup.add(layer ===  undefined ? this.phaserMaster.get('layers').BULLET_IMPACT : layer, explosion)

    return explosion;
  }
  /******************/

  /******************/
  public electricDischarge(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('disintegrate', 1, 10)
    }

    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'noimpactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);

    explosion.destroyIt = () => {
      phaserSprites.destroy(explosion.name)
    }

    phaserGroup.add(layer ===  undefined ? this.phaserMaster.get('layers').BULLET_IMPACT : layer, explosion)

    return explosion;
  }
  /******************/


}

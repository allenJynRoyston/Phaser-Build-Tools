declare var Phaser:any;

export class WEAPON_MANAGER {
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
  public createBullet(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.primaryWeapons.BULLET;

    let ammo =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          ammo.animations.add('animate', weapon.spriteAnimation, 1, true)
          ammo.animations.play('animate', 30, true)
        }
        ammo.anchor.setTo(0.5, 0.5)
        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.body.velocity.y = weapon.initialVelocity;
        ammo.pierceStrength = weapon.pierceStrength
        ammo.damageAmount = weapon.damage

        ammo.destroyIt = () => {
          this.orangeImpact(ammo.x + this.game.rnd.integerInRange(-5, 5), ammo.y + this.game.rnd.integerInRange(-5, 15), 1, options.layer + 1)
          onDestroy(ammo)
          phaserSprites.destroy(ammo.name)
        }

        ammo.onUpdate = function(){
          // ammo speeds up
          // destroy ammo
          if(this.y < -this.height || this.y > this.game.canvas.height ){ this.destroyIt() }
          onUpdate(ammo)
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo)
       }

    return ammo;
  }
  /******************/


  /******************/
  public createMissle(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.primaryWeapons.MISSLE;

    let ammo = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          ammo.animations.add('animate', weapon.spriteAnimation, 1, true)
          ammo.animations.play('animate', 30, true)
        }
        ammo.anchor.setTo(0.5, 0.5)
        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.body.velocity.y = weapon.initialVelocity;
        ammo.isActive = true
        ammo.pierceStrength = weapon.pierceStrength
        ammo.damageAmount = weapon.damage

        ammo.accelerate = () => {
          if(ammo.body !== null){
            ammo.body.velocity.y -= weapon.velocity;
            ammo.body.velocity.x += options.spread
          }
        }

        ammo.removeIt = () => {
          ammo.isActive = false;
          phaserSprites.destroy(ammo.name)
        }

        ammo.destroyIt = () => {
          onDestroy(ammo)
          ammo.isActive = false;
          phaserSprites.destroy(ammo.name)
        }

        ammo.onUpdate = () => {
          // ammo speeds up
          ammo.accelerate();
          // destroy ammo
          if(ammo.y < -ammo.height){ ammo.removeIt() }
          onUpdate(ammo)
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo)
       }

    return ammo;
  }
  /******************/

  /******************/
  public createLaser(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.primaryWeapons.LASER;

    let ammo = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          ammo.animations.add('animate', weapon.spriteAnimation, 1, true)
          ammo.animations.play('animate', 30, true)
        }
        ammo.anchor.setTo(0.5, 0.5)

        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.body.velocity.y = weapon.initialVelocity;
        ammo.pierceStrength = weapon.pierceStrength
        ammo.damageAmount = weapon.damage

        ammo.accelerate = () => {
          if(ammo.body !== null){
            ammo.body.velocity.y -= weapon.velocity;
            ammo.body.velocity.x += options.spread
          }
        }

        ammo.destroyIt = () => {
          this.electricDischarge(ammo.x + this.game.rnd.integerInRange(-5, 5), ammo.y + this.game.rnd.integerInRange(-5, 15), 1, options.layer + 1)
          onDestroy(ammo)
          phaserSprites.destroy(ammo.name)
        }

        ammo.onUpdate = () => {
          // ammo speeds up
          ammo.accelerate();
          // destroy ammo
          if(ammo.y < -ammo.height){ ammo.destroyIt() }
          onUpdate(ammo);
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo)
       }

    return ammo;
  }
  /******************/

  /******************/
  public createClusterbomb(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.secondaryWeapons.CLUSTERBOMB;

    let ammo = phaserSprites.addFromAtlas({x: options.x, y: options.y,  name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          ammo.animations.add('animate', weapon.spriteAnimation, 1, true)
          ammo.animations.play('animate', 30, true)
        }
        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.anchor.setTo(0.5, 0.5)
        ammo.body.velocity.y = weapon.initialVelocity;
        ammo.angle = 90;
        ammo.hasDetonated = false;
        ammo.bomblets  = weapon.bomblets
        ammo.pierceStrength = weapon.pierceStrength
        ammo.damageAmount = weapon.damage

        setTimeout(() => {
          if(!ammo.hasDetonated){
            ammo.hasDetonated = true;
            ammo.destroyIt();
          }
        }, 800)

        ammo.accelerate = () => {
          if(ammo.body !== null){
            if(ammo.body.velocity.y > -400){
              ammo.body.velocity.y -= weapon.velocity;
            }
            ammo.body.velocity.x += options.spread
          }
        }

        ammo.destroyIt = () => {
          onDestroy(ammo)
          this.createExplosion(ammo.x, ammo.y, 1.25, options.layer)
          phaserSprites.destroy(ammo.name)
        }


        ammo.onUpdate = () => {
          onUpdate(ammo)
          ammo.angle += 5;
          // ammo speeds up
          ammo.accelerate();
          // destroy ammo
          if(ammo.y < -ammo.height){ ammo.destroyIt() }
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo)
       }

       return ammo;
  }
  /******************/

  /******************/
  public createTriplebomb(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.secondaryWeapons.TRIPLEBOMB;

    let ammo = phaserSprites.addFromAtlas({x: options.x, y: options.y,  name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          ammo.animations.add('animate', weapon.spriteAnimation, 1, true)
          ammo.animations.play('animate', 30, true)
        }
        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.anchor.setTo(0.5, 0.5)
        ammo.body.velocity.y = weapon.initialVelocity;
        ammo.angle = 90;
        ammo.hasDetonated = false;
        ammo.damageAmount = weapon.damage
        ammo.pierceStrength = weapon.pierceStrength;

        ammo.accelerate = () => {
          if(ammo.body !== null){
            if(ammo.body.velocity.y > -500){
              ammo.body.velocity.y -= weapon.velocity;
            }
            ammo.body.velocity.x += options.spread
          }
        }

        ammo.removeIt = () => {
          onDestroy(ammo)
          phaserSprites.destroy(ammo.name)
        }

        ammo.destroyIt = () => {
          onDestroy(ammo)
          this.createExplosion(ammo.x, ammo.y, 1.25, options.layer)
          phaserSprites.destroy(ammo.name)
        }

        ammo.onUpdate = () => {
          onUpdate(ammo)
          ammo.angle += 15;
          // ammo speeds up
          ammo.accelerate();
          // destroy ammo
          if(ammo.y < -ammo.height){ ammo.removeIt() }
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo)
       }

       return ammo;
  }
  /******************/

  /******************/
  public createTurret(options:any, onInit:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.secondaryWeapons.TURRET;

    let turret =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        if(weapon.spriteAnimation.length > 1){
          turret.animations.add('animate', weapon.spriteAnimation, 1, true)
          turret.animations.play('animate', 30, true)
        }
        turret.anchor.setTo(0.5, 0.5)
        game.physics.enable(turret, Phaser.Physics.ARCADE);
        phaserGroup.add(2, turret)
        turret.offset = options.offset;

        setTimeout(() => {
          if(turret !== undefined){
            turret.destroyIt();
          }
        }, weapon.lifespan)

        onInit(turret);

        turret.destroyIt = () => {
          if(turret !== undefined){
            onDestroy(turret)
            this.createExplosion(turret.x, turret.y, 0.5, options.layer)
            clearInterval(turret.fireInterval)
            phaserSprites.destroy(turret.name)
          }
        }

        turret.onUpdate = () => {
          onUpdate(turret);
        }

        if(options.layer !== undefined){
          phaserGroup.add(options.layer, turret)
        }

  }
  /******************/

  /******************/
  public createBlastradius(options:any){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let weapon = weaponData.secondaryWeapons.BLASTRADIUS;

    let blast = phaserSprites.addFromAtlas({x: options.x, y: options.y,  name: options.name, group: options.group, atlas: atlas, filename: weapon.spriteAnimation[0]})
        blast.anchor.setTo(0.5, 0.5)
        blast.scale.setTo(1, 1)
    if(weapon.spriteAnimation.length > 1){
      let anim = blast.animations.add('animate', weapon.spriteAnimation, 30, false)
          anim.onStart.add(() => {

          }, blast);
          anim.onComplete.add(() => {
            phaserSprites.destroy(blast.name)
          }, blast);
          anim.play('animate')

    }
    game.physics.enable(blast, Phaser.Physics.ARCADE);

    if(options.layer !== undefined){
      phaserGroup.add(options.layer, blast)
    }
  }
  /******************/

  /******************/
  public createBomblet(options:any, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let ammo =  phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `bomblet_${game.rnd.integer()}`, group: options.group, atlas: atlas, filename: 'clusterBomb.png'})
        ammo.anchor.setTo(0.5, 0.5)
        ammo.scale.setTo(0.5, 0.5)
        game.physics.enable(ammo, Phaser.Physics.ARCADE);
        ammo.body.velocity.y = options.iy
        ammo.body.velocity.x = options.ix
        ammo.detonate = game.time.now + game.rnd.integerInRange(1250, 1800)
        ammo.pierceStrength = 1
        ammo.damageAmount = 100

        ammo.destroyIt = () => {
          onDestroy(ammo)
          this.createExplosion(ammo.x, ammo.y, 1, options.layer)
          phaserSprites.destroy(ammo.name)
        }

        ammo.onUpdate = () => {
          onUpdate(ammo)
          ammo.angle += 5;
          if(game.time.now > ammo.detonate){
            ammo.destroyIt();
          }
       }

       if(options.layer !== undefined){
         phaserGroup.add(options.layer, ammo, options.layer)
       }

       return ammo;
  }
  /******************/


  /******************/
  public createExplosion(x:number, y:number, scale:number, layer:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    let explosion = phaserSprites.addFromAtlas({name: `explosion_${game.rnd.integer()}`, group: 'explosions',  x: x, y: y, atlas: atlas, filename: `explosion2_layer_1.png`})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        explosion.animations.add('explosion', Phaser.Animation.generateFrameNames('explosion2_layer_', 1, 12, '.png'), 1, true)
        explosion.animations.play('explosion', 30, true)

        // destroy expolosion sprite
        game.time.events.add(Phaser.Timer.SECOND/2, () => {
          phaserSprites.destroy(explosion.name)
        }).autoDestroy = true;

        explosion.onDestroy = () => {

        }

        explosion.onUpdate = () => {
          onUpdate(explosion)
        }

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/

  /******************/
  public createImpactExplosion(x:number, y:number, scale:number, layer:number, damage:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: `explosions_Layer_1.png`})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
        explosion.animations.add('explosion', Phaser.Animation.generateFrameNames('explosions_Layer_', 1, 16, '.png'), 1, true)
        explosion.animations.play('explosion', 30, true)
        explosion.damageAmount = damage;

        // destroy expolosion sprite
        game.time.events.add(Phaser.Timer.SECOND/2, () => {
          phaserSprites.destroy(explosion.name)
        }).autoDestroy = true;

        explosion.onDestroy = () => {

        }

        explosion.onUpdate = () => {
          onUpdate(explosion)
        }

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/



  /******************/
  public blueImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let frames = Phaser.Animation.generateFrameNames('blue_explosion_small_layer_', 1, 7, '.png');
    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: frames[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
    let anim = explosion.animations.add('animate', frames, 60, false)
        anim.onStart.add(() => {}, explosion);
        anim.onComplete.add(() => {
          phaserSprites.destroy(explosion.name)
        }, explosion);
        anim.play('animate')

    explosion.onUpdate = () => {
      explosion.y--
    }

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/

  /******************/
  public orangeImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let frames = Phaser.Animation.generateFrameNames('orange_ring_explosion_layer_', 1, 7, '.png');
    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: frames[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
    let anim = explosion.animations.add('animate', frames, 60, false)
        anim.onStart.add(() => {}, explosion);
        anim.onComplete.add(() => {
          phaserSprites.destroy(explosion.name)
        }, explosion);
        anim.play('animate')

    explosion.onUpdate = () => {
      explosion.y--
    }

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/

  /******************/
  public electricDischarge(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let frames = Phaser.Animation.generateFrameNames('disintegrate', 1, 10, '.png');
    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: frames[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        game.physics.enable(explosion, Phaser.Physics.ARCADE);
    let anim = explosion.animations.add('animate', frames, 60, false)
        anim.onStart.add(() => {}, explosion);
        anim.onComplete.add(() => {
          phaserSprites.destroy(explosion.name)
        }, explosion);
        anim.play('animate')

    explosion.onUpdate = () => {
      explosion.y--
    }

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/


}

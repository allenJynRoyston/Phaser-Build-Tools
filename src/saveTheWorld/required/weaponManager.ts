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


  /******************
  //
    COLLIDABLE BULLETS
  //
  /******************

  /******************/
  public enemyBullet(bulletPoolTotal:any = 2){

    let game = this.game
    let {phaserMaster} = this;

    let weapon = game.add.weapon(bulletPoolTotal, this.atlas, 'enemy_bullet')
        weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS ;
        weapon.bulletSpeed = 400
        weapon.bulletAngleOffset = 90
        weapon.multiFire = true;

        weapon.checkOrientation = (angle:number) => {
          weapon.bulletSpeed = -Math.abs(weapon.bulletSpeed);
          weapon.bulletAngleOffset = -Math.abs(weapon.bulletAngleOffset)
        }

        this.phaserGroup.add(7, weapon.bullets )


        // map destroy function into bullet
        weapon.bullets.children.map( bullet => {
          bullet.destroyIt = (layer:number) => {
            bullet.kill()
            this.orangeImpact(bullet.x + this.game.rnd.integerInRange(-5, 5), bullet.y + this.game.rnd.integerInRange(-5, 15), 1, layer)
          }
        })

    return weapon
  }
  /******************/

  /******************/
  public playerBullets(bulletPoolTotal:Number, type:string){
    let game = this.game
    let {phaserMaster} = this;
    let {weaponData} = phaserMaster.getAll(['weaponData']);
    let data = weaponData.primaryWeapons[type];

    let weapon = game.add.weapon(bulletPoolTotal, this.atlas, data.spriteAnimation[0])
        weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS ;
        weapon.bulletSpeed = data.bulletSpeed;
        weapon.bulletAngleOffset = 90
        weapon.multiFire = true;

        if(data.spriteAnimation.length > 0){
          weapon.bullets.callAll('animations.add', 'animations', 'fire', data.spriteAnimation, 20, true);
          weapon.bullets.callAll('play', null, 'fire');
        }

        // add custom attributes if required
        switch(type){
          case 'MISSLE':
            weapon.bulletSpeedVariance = 300;
            weapon.bulletAngleVariance = 15;
            break
          case 'SHOTGUN':
            weapon.bulletSpeedVariance = 1000;
            weapon.bulletAngleOffset = -10
            weapon.bulletAngleVariance = 20;
            break
          case 'GATLING':
            weapon.bulletSpeedVariance = 300;
            weapon.bulletAngleVariance = 3;
            break
        }

        weapon.onKill.add((bullet:any) => {
            //
        })

        weapon.checkOrientation = (angle:number) => {
          if(angle < 180){
            weapon.bulletSpeed = Math.abs(weapon.bulletSpeed);
            weapon.bulletAngleOffset = Math.abs(weapon.bulletAngleOffset)
          }
          else{
            weapon.bulletSpeed = -Math.abs(weapon.bulletSpeed);
            weapon.bulletAngleOffset = -Math.abs(weapon.bulletAngleOffset)
          }
        }


        this.phaserGroup.add(8, weapon.bullets)

        // map bullet characteristics
        weapon.bullets.children.map( bullet => {
          bullet.weaponData = data;
          bullet.pierce = data.pierce;
          bullet.destroyIt = (layer:number) => {
            bullet.kill()
          }
        })

    return weapon
  }
  /******************/

  /******************/
  public createClusterbomb(bulletPoolTotal:Number, onKill:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let data = weaponData.secondaryWeapons.CLUSTERBOMB;
    let bombletAmount = 25

    let bomblets = this.createBomblet(bombletAmount);

    // cluster bomb itself
    let weapon = game.add.weapon(1, this.atlas, data.spriteAnimation[0])
        weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN ;
        weapon.bulletSpeed = data.bulletSpeed;
        weapon.multiFire = true;
        weapon.bulletLifespan = 750
        weapon.bomblets = bomblets;

        if(data.spriteAnimation.length > 0){
          weapon.bullets.callAll('animations.add', 'animations', 'fire', data.spriteAnimation, 20, true);
          weapon.bullets.callAll('play', null, 'fire');
        }

        weapon.onKill.add((bullet:any) => {
          onKill()
          bomblets.map(bomblet => {
            bomblet.fire(bullet)
          })
          this.createExplosionVacuum(bullet.x, bullet.y, 1.25, 8, data.damage)
        })

        // map bullet characteristics
        weapon.bullets.children.map( bullet => {
          bullet.weaponData = data;
          bullet.pierce = data.pierce;
          bullet.destroyIt = (layer:number) => {
            bullet.kill()
          }
        })

        this.phaserGroup.add(7, weapon.bullets )



    return weapon

  }
  /******************/

  /******************/
  public createBomblet(amount:number){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let {weaponData} = phaserMaster.getAll();
    let data = {
          reference: 'BOMBLET',
          spriteAnimation: ["icon_sw_1"],
          damage: 25,
          pierce: false,
          ignoreDamageState: false,
          completeAnimation: false
        }

    let bomblets = [];

    for(let i = 0; i < amount; i++){
      let bomblet = game.add.weapon(1, this.atlas, data.spriteAnimation[0])
          bomblet.bulletKillType = Phaser.Weapon.KILL_LIFESPAN ;
          bomblet.bulletSpeed = 500 + game.rnd.integerInRange(50, 150)
          bomblet.bulletAngleVariance = 140;
          bomblet.bulletLifespan = game.rnd.integerInRange(50, 500)

          if(data.spriteAnimation.length > 0){
            bomblet.bullets.callAll('animations.add', 'animations', 'fire', data.spriteAnimation, 20, true);
            bomblet.bullets.callAll('play', null, 'fire');
          }

          bomblet.onKill.add((bullet:any) => {
            this.createExplosionBasic(bullet.x, bullet.y, 1.25, 8, data.damage)
          })

          // map bullet characteristics
          bomblet.bullets.children.map( bullet => {
            bullet.weaponData = data;
            bullet.pierce = data.pierce;
            bullet.destroyIt = (layer:number) => {
              bullet.kill()
            }
          })

          this.phaserGroup.add(7, bomblet.bullets )
      bomblets.push(bomblet)
    }

    return bomblets;
  }
  /******************/


  /******************
  //
    COLLIDABLE EXPLOSIONS
  //
  /******************
  /******************/
  public createExplosionVacuum(x:number, y:number, scale:number, layer:number, damage:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data = {
          reference: 'EXPLOSION_VACUUM',
          spriteAnimation: [...Phaser.Animation.generateFrameNames('explosion_vacuum_', 1, 9)],
          damage: 25,
          pierce: false,
          ignoreDamageState: false,
          completeAnimation: true
        }

    let explosion = phaserSprites.addFromAtlas({name: `impact_A`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        explosion.weaponData = data;
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);

        explosion.destroyIt = () => {
          phaserSprites.destroy(explosion.name)
        }

        game.camera.shake(0.004, 500);

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    game.physics.enable(explosion, Phaser.Physics.ARCADE);
    return explosion;
  }
  /******************/

  /******************/
  public createExplosionVacuumFire(x:number, y:number, scale:number, layer:number, damage:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data = {
          reference: 'VACUUMEXPLOSION',
          spriteAnimation: [...Phaser.Animation.generateFrameNames('explosion_vacuum_inner_', 1, 13)],
          damage: 25,
          pierce: false,
          ignoreDamageState: false,
          completeAnimation: true
        }

    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        explosion.weaponData = data;
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);

        explosion.destroyIt = () => {
          phaserSprites.destroy(explosion.name)
        }

        game.camera.shake(0.004, 500);

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    game.physics.enable(explosion, Phaser.Physics.ARCADE);
    return explosion;
  }
  /******************/

  /******************/
  public createExplosionBasic(x:number, y:number, scale:number, layer:number, damage:number, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data = {
          reference: 'EXPLOSION_BASIC',
          spriteAnimation:  Phaser.Animation.generateFrameNames('explosions_Layer_', 1, 16),
          damage: 25,
          pierce: false,
          ignoreDamageState: false,
          completeAnimation: true
        }

    let explosion = phaserSprites.addFromAtlas({name: `impact_${game.rnd.integer()}`, group: 'impactExplosions',  x: x, y: y, atlas: atlas, filename: data.spriteAnimation[0]})
        explosion.scale.setTo(scale, scale)
        explosion.anchor.setTo(0.5, 0.5)
        explosion.weaponData = data;
        explosion.animations.add('explosion', data.spriteAnimation, 1, true)
        explosion.animations.play('explosion', 30, false).onComplete.add(() => {
            explosion.destroyIt()
        }, explosion);


        explosion.destroyIt = () => {
          phaserSprites.destroy(explosion.name)
        }

        game.camera.shake(0.002, 500);

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    game.physics.enable(explosion, Phaser.Physics.ARCADE);
    return explosion;
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

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/

  /******************/
  public pelletImpact(x:number, y:number, scale:number, layer:number){
    let game = this.game
    let {phaserSprites, phaserGroup, atlas} = this;
    let data  = {
      spriteAnimation: Phaser.Animation.generateFrameNames('sparks_', 1, 3)
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

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

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

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

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

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

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

    if(layer !== undefined){
      phaserGroup.add(layer, explosion)
    }

    return explosion;
  }
  /******************/


}

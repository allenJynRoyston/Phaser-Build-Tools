declare var Phaser:any;

export class ENEMY_MANAGER {
  game:any;
  phaserSprites:any;
  phaserMaster:any;
  phaserTexts:any;
  phaserGroup:any
  weaponManager:any;
  atlas:any;
  atlas_weapons:any;
  effectsManager:any;
  showHitbox:any;
  enemyLayer:any;

  constructor(params){
    this.showHitbox = params.showHitbox;
  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, weaponManager:any, effectsManager:any, atlas:string, atlas_weapons:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.weaponManager = weaponManager;
    this.effectsManager = effectsManager;
    this.atlas = atlas
    this.atlas_weapons = atlas_weapons;
    this.enemyLayer
  }

  /******************/
  private facePlayer(obj:any){
    let game = this.game
    let {player} = this.phaserSprites.getOnly(['player'])
    return Math.ceil( (360 / (2 * Math.PI)) * game.math.angleBetween(obj.x, obj.y, player.x, player.y) - 90 )
  }
  /******************/

  /******************/
  private generateWaveData(duration:number, range:number){
    return this.game.math.sinCosGenerator(duration, range, 0, 1).cos.map(value => {
      return Math.abs(value)
    })
  }
  /******************/

  /******************/
  public bulletCollisionWithPlayer(enemy){
    let targets = [...this.phaserSprites.getGroup('player_hitboxes')]
    let collidables = [...enemy.collidables.primaryWeapon]
    this.game.physics.arcade.overlap(targets, collidables, (target, collidable) => {
      let player = target.parent;
      if(!player.isInvincible && !player.isDead && !player.isDamaged && !player.isForceMoved){
        player.takeDamage(collidable.damgeOnImpact);
        collidable.destroyIt()
      }
    });
  }
  /******************/

  /******************/
  private addSharedBehavior(enemy:any){
    let {game, phaserSprites, phaserMaster, phaserGroup} = this;

    enemy.onLayer = phaserMaster.get('layers').ENEMIES
    enemy.anchor.setTo(0.5, 0.5);
    enemy.health = enemy.maxHealth
    enemy.isInvincible = false;
    enemy.isDamaged = false
    enemy.isDestroyed = false;
    enemy.belowBlinkTimer = game.time.returnTrueTime();
    enemy.isBelow50 = false;
    enemy.isBelow75 = false;
    enemy.weaponSystems = [];
    enemy.collidables = {
      primaryWeapon: [],
      secondaryWeapon: []
    }

    enemy.removeIt = () => {
      if(!enemy.isDestroyed){
        enemy.weaponSystems.map(weaponSystem => {
          weaponSystem.destroyIt()
        })

        enemy.children.map(obj => {
          this.phaserSprites.destroy(obj.name);
        })
        phaserSprites.destroy(enemy.name);
      }
    }

    phaserGroup.add(enemy.onLayer, enemy)
  }
  /******************/

  /******************/
  private attachHitbox(enemy:any, hitboxes:String[]){
    let {game, phaserSprites, atlas} = this;
    hitboxes.map(obj => {
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })
  }
  /******************/

  /******************/
  private attachWeaponSystem(enemy, ammo, animationSprites){
    let {game, phaserSprites, phaserGroup, atlas} = this;

    let weaponSystem = this.phaserSprites.addFromAtlas({name: `enemy_weapons_${this.game.rnd.integer()}`, group: 'enemy_weapons', atlas: this.atlas_weapons,  filename: animationSprites[0], visible: true})
        weaponSystem.anchor.setTo(0.5, 0.5)
        weaponSystem.angle = 180;
        weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
        weaponSystem.sync = (enemy:any) => {
          let {x, y} = enemy;
          weaponSystem.x = x
          weaponSystem.y = y
        }
        weaponSystem.destroyIt = () => {
          let {x, y} = weaponSystem;
          this.effectsManager.blueImpact(x, y, 1, enemy.onLayer)
          this.phaserSprites.destroy(weaponSystem.name)
          game.time.events.add(Phaser.Timer.SECOND * 4, () => {
            weaponSystem.ammo.destroy()
          }, this).autoDestroy = true;
        }
        weaponSystem.onUpdate = () => {
          ammo.onUpdate();
        }
        weaponSystem.fire = () => {
          let player = phaserSprites.get('player')
          if(!player.isInvincible && !player.isDead){
            ammo.fire(weaponSystem, player.x, player.y);
          }
          else{

            ammo.checkOrientation(weaponSystem)
            ammo.fire(weaponSystem);
          }
          weaponSystem.animations.play('fireWeapon', 24, false)
        }
    phaserGroup.add(enemy.onLayer + 1, weaponSystem )
    weaponSystem.ammo = ammo
    enemy.weaponSystems.push(weaponSystem)

    enemy.collidables.primaryWeapon = [];
    enemy.collidables.primaryWeapon.push(ammo.bullets)

    return weaponSystem;
  }
  /******************/

  /******************/
  public createAsteroid1(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let folder = 'asteroid1'

    // create enemy sprite
    let enemySprites = [...Phaser.Animation.generateFrameNames(`${folder}/asteroid_`, 1, 28)]
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', org: 'gameobjects', atlas: atlas, filename: enemySprites[0], visible: true})
    enemy.maxHealth = 50;

    // add basic properties to enemy
    this.addSharedBehavior(enemy)

    // animations
    enemy.animations.add('idol', enemySprites)
    enemy.animations.play('idol', 16, true)

    // add hitbox/hitboxes to enemy
    this.attachHitbox(enemy, [`${folder}/hitbox`])


    // add ammo and weaaponsystem to enemy
    let ammo = this.weaponManager.enemyBullet(0);
        ammo.bullets.children.map(bullet => {})
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    this.attachWeaponSystem(enemy, ammo, animationSprites)


    //----------------------------
    enemy.onUpdate = () => {
      enemy.y += 2

      // universal behavior
      if(enemy.isBelow50){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 500
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }

      if(enemy.isBelow75){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 250
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }
      onUpdate(enemy);
      if(enemy.y > (this.game.world.height + enemy.height)){ enemy.removeIt()  }
      this.bulletCollisionWithPlayer(enemy)
    }
    //----------------------------

    //----------------------------
    enemy.destroyIt = () => {
     // universal behavior
     enemy.isDestroyed = true;
     enemy.isBelow50 = false;
     enemy.isBelow75 = false;
     enemy.tint = 1 * 0xff0000;
     enemy.weaponSystems.map(weaponSystem => {
       weaponSystem.destroyIt()
     })

     enemy.game.add.tween(enemy).to( {alpha: 0.75}, 150, Phaser.Easing.Linear.Out, true, 1, 0, false).
       onComplete.add(() => {
          onDestroy(enemy);
          this.weaponManager.createExplosionBasic(enemy.x, enemy.y, 1, enemy.onLayer + 1, 0)
          game.time.events.remove(enemy.explodeInterval)
          enemy.children.map(obj => {
            this.phaserSprites.destroy(obj.name);
          })
          phaserSprites.destroy(enemy.name);
       })
    }
    //----------------------------

    //----------------------------
    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      enemy.isDamaged = true
      game.time.events.add(10, () => {
        enemy.isDamaged = false
      }, this).autoDestroy = true;
      if(enemy.y > 0){ enemy.health -= val }
      enemy.tint = 1 * 0xff0000;
      enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
      if(enemy.health/enemy.maxHealth < 0.5){
        enemy.isBelow50 = true
      }
      if(enemy.health/enemy.maxHealth < 0.25){
        enemy.isBelow75 = true
      }
      if(enemy.health <= 0){
        enemy.destroyIt()
      }
    }
    //----------------------------


    return enemy;
  }
  /******************/

  /******************/
  public createAsteroid2(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let folder = 'asteroid2'

    // create enemy sprite
    let enemySprites = [...Phaser.Animation.generateFrameNames(`${folder}/asteroid_`, 1, 19)]
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', org: 'gameobjects', atlas: atlas, filename: enemySprites[0], visible: true})
    enemy.maxHealth = 150;

    // add basic properties to enemy
    this.addSharedBehavior(enemy)

    // animations
    enemy.animations.add('idol', enemySprites)
    enemy.animations.play('idol', 12, true)

    // add hitbox/hitboxes to enemy
    this.attachHitbox(enemy, [`${folder}/hitbox`])


    // add ammo and weaaponsystem to enemy
    let ammo = this.weaponManager.enemyBullet(0);
        ammo.bullets.children.map(bullet => {})
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    this.attachWeaponSystem(enemy, ammo, animationSprites)


    //----------------------------
    enemy.onUpdate = () => {
      enemy.y += 0.5

      // universal behavior
      if(enemy.isBelow50){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 500
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }

      if(enemy.isBelow75){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 250
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }
      onUpdate(enemy);
      if(enemy.y > (this.game.world.height + enemy.height)){ enemy.removeIt()  }
      this.bulletCollisionWithPlayer(enemy)
    }
    //----------------------------

    //----------------------------
    enemy.destroyIt = () => {
     // universal behavior
     enemy.isDestroyed = true;
     enemy.isBelow50 = false;
     enemy.isBelow75 = false;
     enemy.tint = 1 * 0xff0000;
     enemy.weaponSystems.map(weaponSystem => {
       weaponSystem.destroyIt()
     })


     enemy.game.add.tween(enemy).to( {alpha: 0.5}, 10, Phaser.Easing.Linear.Out, true, 1, 0, false).
       onComplete.add(() => {
          onDestroy(enemy);
          let debris = this.phaserMaster.get('sharedDebris');
          debris.customFire(enemy, 25)
          game.time.events.remove(enemy.explodeInterval)
          enemy.children.map(obj => {
            this.phaserSprites.destroy(obj.name);
          })
          phaserSprites.destroy(enemy.name);
       })
    }
    //----------------------------

    //----------------------------
    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      enemy.isDamaged = true
      game.time.events.add(10, () => {
        enemy.isDamaged = false
      }, this).autoDestroy = true;
      enemy.health -= val;
      enemy.tint = 1 * 0xff0000;
      enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
      if(enemy.health/enemy.maxHealth < 0.5){
        enemy.isBelow50 = true
      }
      if(enemy.health/enemy.maxHealth < 0.25){
        enemy.isBelow75 = true
      }
      if(enemy.health <= 0){
        enemy.destroyIt()
      }
    }
    //----------------------------


    return enemy;
  }
  /******************/

  /******************/
  public createSmallEnemy1(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    let folder = 'smallShip'

    // create enemy sprite
    let enemySprites = [...Phaser.Animation.generateFrameNames(`${folder}/small_`, 1, 1)]
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', org: 'gameobjects', atlas: atlas, filename: enemySprites[0], visible: true})
        enemy.maxHealth = 50;
        this.addSharedBehavior(enemy)

        // unique characteristics
        enemy.yWave = {data: this.generateWaveData(200, game.world.height * .60), count: 0}
        enemy.fireDelay = 0
        enemy.fireTimer = 1000

    phaserGroup.add(enemy.onLayer, enemy)

    //----------------------------  HITBOX
    // add hitbox/hitboxes to enemy
    this.attachHitbox(enemy, [`${folder}/hitbox`])
    //----------------------------

    //---------------------------- AMMO
    // add ammo and weaaponsystem to enemy
    let ammo = this.weaponManager.enemyBullet(3);  // amount that enemies can fire at one time
        ammo.bullets.children.map(bullet => {})
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let weaponSystem = this.attachWeaponSystem(enemy, ammo, animationSprites)
    //----------------------------


    //----------------------------
    enemy.onUpdate = () => {
      //if(!player.isInvincible && !player.isDead){
        enemy.angle = this.facePlayer(enemy)
        enemy.weaponSystems.map(weaponsSystem => {
          weaponsSystem.angle =  this.facePlayer(enemy) - 180
        })
      //}
      if(game.time.returnTrueTime() > enemy.fireDelay && !enemy.isDestroyed && (enemy.y > enemy.game.canvas.height * .4) ){
          enemy.fireDelay = game.time.returnTrueTime() + enemy.fireTimer
          enemy.weaponSystems.map(weaponsSystem => {
            weaponSystem.fire()
          })
      }

      if(!enemy.isDestroyed){
        enemy.y = enemy.yWave.data[enemy.yWave.count] - enemy.height
        enemy.yWave.count++
        if(enemy.yWave.count >= enemy.yWave.data.length){
          enemy.removeIt();
        }

        enemy.weaponSystems.map( obj => {
          obj.sync(enemy)
        })
      }

      // universal behavior
      if(enemy.isBelow50){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 500
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }

      if(enemy.isBelow75){
        if(game.time.returnTrueTime() > enemy.belowBlinkTimer){
          enemy.belowBlinkTimer += 250
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        }
      }
      onUpdate(enemy);
      if(enemy.y > (this.game.world.height + enemy.height)){ enemy.removeIt()  }
      this.bulletCollisionWithPlayer(enemy)
    }
    //----------------------------

    //----------------------------
    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      enemy.isDamaged = true
      game.time.events.add(10, () => {
        enemy.isDamaged = false
      }, this).autoDestroy = true;
      enemy.health -= val;
      enemy.tint = 1 * 0xff0000;
      enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
      if(enemy.health <= 0){
        enemy.destroyIt()
      }
    }
    //----------------------------

    //----------------------------
    enemy.removeIt = () => {
      enemy.weaponSystems.map(weaponSystem => {
        weaponSystem.destroyIt()
      })

      enemy.children.map(obj => {
        this.phaserSprites.destroy(obj.name);
      })
      phaserSprites.destroy(enemy.name);
    }
    //----------------------------

    //----------------------------
    enemy.destroyIt = () => {
     //enemy.body = null;
     enemy.isDestroyed = true;
     enemy.tint = 1 * 0xff0000;

     enemy.weaponSystems.map(weaponSystem => {
       weaponSystem.destroyIt()
     })


     enemy.explodeInterval = game.time.events.loop( 250, () => {
       this.effectsManager.createExplosion(enemy.x + game.rnd.integerInRange(-enemy.width/2, enemy.width/2), enemy.y + game.rnd.integerInRange(-enemy.height/2, enemy.height/2), 1, enemy.onLayer + 1)
     })
     enemy.game.add.tween(enemy).to( {y: enemy.y + 50, alpha: 0.5}, 500, Phaser.Easing.Linear.Out, true, 250, 0, false).
       onComplete.add(() => {
         let debris = this.phaserMaster.get('sharedDebris');
         debris.customFire(enemy, 25)
         onDestroy(enemy);
         game.time.events.remove(enemy.explodeInterval)
         enemy.children.map(obj => {
           this.phaserSprites.destroy(obj.name);
         })
         phaserSprites.destroy(enemy.name);
       })
    }
    //----------------------------




    return enemy;
  }
  /******************/

  /******************/
  public createSmallEnemy2(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({name: `enemy_${game.rnd.integer()}`, group:'enemies', org: 'gameobjects', atlas: atlas, filename: `big_1`, visible: true, x: options.x})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1,1);
        enemy.maxHealth = 700;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 1;
        enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        enemy.cosWave = {data: game.math.sinCosGenerator(400, game.world.height * .50 , 0, 1).cos, count: 0}
        enemy.fireDelay = 0
        enemy.fireTimer = 200
        enemy.isInvincible = false;
        enemy.isDamaged = false
        enemy.isDestroyed = false;
        enemy.onLayer = phaserMaster.get('layers').ENEMIES
        enemy.bulletCycle = {
          count: 0,
          total: 3,
          delay: 500,
          lock: false
        }
        enemy.weaponSystems = [];
        enemy.collidables = {
          primaryWeapon: [],
          secondaryWeapon: []
        }
    phaserGroup.add(enemy.onLayer, enemy)

    //----------------------------  HITBOX
    let hitboxes = [`big_1_hitbox_1`, `big_1_hitbox_2`]
    hitboxes.map(obj => {
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })
    //----------------------------


    //---------------------------- AMMO
    let ammo = this.weaponManager.enemyBullet(9);
    ammo.bullets.children.map(bullet => {
      bullet.damgeOnImpact = 10;
    })
    //----------------------------

    //---------------------------- WEAPON SYSTEM
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let weaponSystem = this.phaserSprites.addFromAtlas({name: `enemy_weapons_${this.game.rnd.integer()}`, group: 'enemy_weapons', atlas: this.atlas_weapons,  filename: animationSprites[0], visible: true})
        weaponSystem.anchor.setTo(0.5, 0.5)
        weaponSystem.angle = 180;
        weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
        weaponSystem.sync = (enemy:any) => {
          let {x, y} = enemy;
          weaponSystem.x = x
          weaponSystem.y = y
        }
        weaponSystem.destroyIt = () => {
          let {x, y} = weaponSystem;
          this.effectsManager.blueImpact(x, y, 1, enemy.onLayer)
          this.phaserSprites.destroy(weaponSystem.name)
          game.time.events.add(Phaser.Timer.SECOND * 4, () => {
            weaponSystem.ammo.destroy()
          }, this).autoDestroy = true;
        }

        weaponSystem.fire = () => {
          let player = phaserSprites.get('player')
          ammo.fire(weaponSystem, weaponSystem.x, weaponSystem.y + 100);
          ammo.fire(weaponSystem, weaponSystem.x + 50, weaponSystem.y + 100);
          ammo.fire(weaponSystem, weaponSystem.x - 50, weaponSystem.y + 100);
          weaponSystem.animations.play('fireWeapon', 24, false)
        }
    phaserGroup.add(enemy.onLayer + 1, weaponSystem )
    weaponSystem.ammo = ammo
    enemy.weaponSystems.push(weaponSystem)

    enemy.collidables.primaryWeapon = [];
    enemy.collidables.primaryWeapon.push(ammo.bullets)
    //----------------------------




    //----------------------------
    enemy.onUpdate = () => {
      let player = phaserSprites.get('player')
      onUpdate(enemy);

      if(game.time.returnTrueTime() > enemy.fireDelay && !enemy.isDestroyed && (enemy.y > enemy.game.canvas.height * .3) ){
          enemy.fireDelay = game.time.returnTrueTime() + enemy.fireTimer

          // bullet pattern
          if(enemy.bulletCycle.count < enemy.bulletCycle.total){
            enemy.weaponSystems.map(weaponsSystem => {
              weaponSystem.fire()
            })
            enemy.bulletCycle.count++
          }
          else{
            if(!enemy.bulletCycle.lock){
              enemy.bulletCycle.lock = true
              game.time.events.add(Phaser.Timer.SECOND * 1.5, () => {
                enemy.bulletCycle.count = 0;
                enemy.bulletCycle.lock = false
              }).autoDestroy = true;
            }
          }
      }

      if(!enemy.isDestroyed){
        if(enemy.cosWave.count < enemy.cosWave.data.length/2){
          enemy.y = -(enemy.cosWave.data[enemy.cosWave.count]) - enemy.height
          enemy.cosWave.count++
        }

        if(enemy.cosWave.count >= enemy.cosWave.data.length){
          enemy.removeIt();
        }

        enemy.weaponSystems.map( obj => {
          obj.sync(enemy)
        })
      }


      // collision detection
      this.bulletCollisionWithPlayer(enemy)

    }
    //----------------------------

    //----------------------------
    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      enemy.isDamaged = true
      game.time.events.add(10, () => {
        enemy.isDamaged = false
      }, this).autoDestroy = true;
      enemy.health -= val;
      enemy.tint = 1 * 0xff0000;
      enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
      if(enemy.health <= 0){
        enemy.destroyIt()
      }
    }
    //----------------------------

    //----------------------------
    enemy.removeIt = () => {
      enemy.weaponSystems.map(weaponSystem => {
        weaponSystem.destroyIt()
      })

      enemy.children.map(obj => {
        this.phaserSprites.destroy(obj.name);
      })
      phaserSprites.destroy(enemy.name);
    }
    //----------------------------

    //----------------------------
    enemy.destroyIt = () => {
     //enemy.body = null;
     enemy.isDestroyed = true;
     enemy.tint = 1 * 0xff0000;

     enemy.weaponSystems.map(weaponSystem => {
       weaponSystem.destroyIt()
     })

     enemy.explodeInterval = game.time.events.loop( 500, () => {
       this.effectsManager.createExplosion(enemy.x + game.rnd.integerInRange(-enemy.width/2, enemy.width/2), enemy.y + game.rnd.integerInRange(-enemy.height/2, enemy.height/2), 1, enemy.onLayer + 1)
     })

     enemy.game.add.tween(enemy.scale).to( {x: 0.85, y:0.85}, 500, Phaser.Easing.Linear.Out, true, 500, 0, false).
       onComplete.add(() => {
         this.weaponManager.createExplosionVacuum(enemy.x, enemy.y, 1.5, enemy.onLayer + 1, 10)
         let debris = this.phaserMaster.get('sharedDebris');
         debris.customFire(enemy, 50)
         game.time.events.remove(enemy.explodeInterval)
         onDestroy(enemy);
         enemy.children.map(obj => {
           this.phaserSprites.destroy(obj.name);
         })
         phaserSprites.destroy(enemy.name);
       })
    }
    //----------------------------




    return enemy;
  }
  /******************/

  /******************/
  public createBoss1(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({name: `enemy_${game.rnd.integer()}`, group:'enemies', org: 'gameobjects', atlas: atlas, filename: `big_1`, visible: true, x: options.x})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1,1);
        enemy.maxHealth = 15000;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 1;
        enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        enemy.cosWave = {data: game.math.sinCosGenerator(400, game.world.height * .50 , 0, 1).cos, count: 0}
        enemy.fireDelay = 0
        enemy.fireTimer = 200
        enemy.isInvincible = false;
        enemy.isDamaged = false
        enemy.isDestroyed = false;
        enemy.onLayer = phaserMaster.get('layers').ENEMIES
        enemy.bulletCycle = {
          count: 0,
          total: 3,
          delay: 500,
          lock: false
        }
        enemy.weaponSystems = [];
        enemy.collidables = {
          primaryWeapon: [],
          secondaryWeapon: []
        }
        enemy.trackinbox = null;
    phaserGroup.add(enemy.onLayer, enemy)

    //----------------------------  HITBOX
    let hitboxes = [`big_1_hitbox_1`, `big_1_hitbox_2`]
    hitboxes.map(obj => {
      //this.showHitbox = true
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })
    //----------------------------

    //----------------------------  create tracking box
    let targetingBox = phaserSprites.addFromAtlas({name: `targetingBox_${game.rnd.integer()}`, group:'enemy_hitboxes', width: enemy.width, height: enemy.height, atlas: atlas, filename: hitboxes[0], alpha: this.showHitbox ? 0.75 : 0})
        targetingBox.anchor.setTo(0.5, 0.5)
        targetingBox.sync = () => {
          let player = phaserSprites.get('player')
          targetingBox.x = enemy.x
          targetingBox.y = enemy.y
          targetingBox.angle = Math.ceil( (360 / (2 * Math.PI)) * game.math.angleBetween(targetingBox.x, targetingBox.y, player.x, player.y) - 90 )
        }
        enemy.targetingBox = targetingBox;
    //----------------------------

    //---------------------------- AMMO
    let ammo = this.weaponManager.enemyBullet(9);
    ammo.bullets.children.map(bullet => {
      bullet.damgeOnImpact = 10;
    })
    //----------------------------

    //---------------------------- WEAPON SYSTEM
    let animationSprites = [...Phaser.Animation.generateFrameNames('bullet_fire_', 1, 4)]
    let weaponSystem = this.phaserSprites.addFromAtlas({name: `enemy_weapons_${this.game.rnd.integer()}`, group: 'enemy_weapons', atlas: this.atlas_weapons,  filename: animationSprites[0], visible: true})
        weaponSystem.anchor.setTo(0.5, 0.5)
        weaponSystem.angle = 180;
        weaponSystem.animations.add('fireWeapon', animationSprites, 1, true)
        weaponSystem.sync = (enemy:any) => {
          let {x, y} = enemy;
          weaponSystem.x = x
          weaponSystem.y = y
        }
        weaponSystem.destroyIt = () => {
          let {x, y} = weaponSystem;
          this.effectsManager.blueImpact(x, y, 1, enemy.onLayer)
          this.phaserSprites.destroy(weaponSystem.name)
          game.time.events.add(Phaser.Timer.SECOND * 4, () => {
            weaponSystem.ammo.destroy()
          }, this).autoDestroy = true;
        }

        weaponSystem.fire = () => {
          let player = phaserSprites.get('player')
          ammo.fire(weaponSystem, weaponSystem.x, weaponSystem.y + 100);
          ammo.fire(weaponSystem, weaponSystem.x + 50, weaponSystem.y + 100);
          ammo.fire(weaponSystem, weaponSystem.x - 50, weaponSystem.y + 100);
          weaponSystem.animations.play('fireWeapon', 24, false)
        }
    phaserGroup.add(enemy.onLayer + 1, weaponSystem )
    weaponSystem.ammo = ammo
    enemy.weaponSystems.push(weaponSystem)

    enemy.collidables.primaryWeapon = [];
    enemy.collidables.primaryWeapon.push(ammo.bullets)
    //----------------------------




    //----------------------------
    enemy.onUpdate = () => {
      let player = phaserSprites.get('player')
      onUpdate(enemy);

      // tracking box follows player
      targetingBox.sync();

      if(game.time.returnTrueTime() > enemy.fireDelay && !enemy.isDestroyed && (enemy.y > enemy.game.canvas.height * .3) ){
          enemy.fireDelay = game.time.returnTrueTime() + enemy.fireTimer

          // bullet pattern
          if(enemy.bulletCycle.count < enemy.bulletCycle.total){
            enemy.weaponSystems.map(weaponsSystem => {
              weaponSystem.fire()
            })
            enemy.bulletCycle.count++
          }
          else{
            if(!enemy.bulletCycle.lock){
              enemy.bulletCycle.lock = true
              game.time.events.add(Phaser.Timer.SECOND * 1.5, () => {
                enemy.bulletCycle.count = 0;
                enemy.bulletCycle.lock = false
              }).autoDestroy = true;
            }
          }
      }

      if(!enemy.isDestroyed){
        if(enemy.cosWave.count < enemy.cosWave.data.length/2){
          enemy.y = -(enemy.cosWave.data[enemy.cosWave.count]) - enemy.height
          enemy.cosWave.count++
        }

        if(enemy.cosWave.count >= enemy.cosWave.data.length){
          enemy.removeIt();
        }

        enemy.weaponSystems.map( obj => {
          obj.sync(enemy)
        })
      }


      // collision detection
      this.bulletCollisionWithPlayer(enemy)

    }
    //----------------------------

    //----------------------------
    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      enemy.isDamaged = true
      game.time.events.add(10, () => {
        enemy.isDamaged = false
      }, this).autoDestroy = true;
      enemy.health -= val;
      enemy.tint = 1 * 0xff0000;
      enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
      if(enemy.health <= 0){
        enemy.destroyIt()
      }
    }
    //----------------------------

    //----------------------------
    enemy.removeIt = () => {
      enemy.weaponSystems.map(weaponSystem => {
        weaponSystem.destroyIt()
      })

      enemy.children.map(obj => {
        this.phaserSprites.destroy(obj.name);
      })
      phaserSprites.destroy(enemy.name);
    }
    //----------------------------

    //----------------------------
    enemy.destroyIt = () => {
     //enemy.body = null;
     enemy.isDestroyed = true;
     enemy.tint = 1 * 0xff0000;

     // destroy weaponSystems
     enemy.weaponSystems.map(weaponSystem => {
       weaponSystem.destroyIt()
     })

     // destroy targetingBox
     phaserSprites.destroy(targetingBox.name);

    this.weaponManager.createExplosionVacuum(enemy.x, enemy.y, 2, enemy.onLayer + 1, 10)
    enemy.game.add.tween(enemy).to( {y: enemy.y - 100}, 6000, Phaser.Easing.Linear.Out, true, 0, 0, false)

    game.time.events.add(Phaser.Timer.SECOND * 2, () => {

       // explosion interval
       enemy.explodeInterval = game.time.events.loop( 150, () => {
         enemy.tint = 1 * 0xff0000;
         enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 50, Phaser.Easing.Linear.Out, true, 0, 0, false)
         this.effectsManager.createExplosion(enemy.x + game.rnd.integerInRange(-enemy.width/2, enemy.width/2), enemy.y + game.rnd.integerInRange(-enemy.height/2, enemy.height/2), 1, enemy.onLayer + 1)
       })

       onDestroy(enemy);
       // tween

       enemy.game.add.tween(enemy.scale).to( {x: 0.75, y:0.75}, 4500, Phaser.Easing.Linear.Out, true, 0, 0, false).
         onComplete.add(() => {
           this.weaponManager.createExplosionVacuum(enemy.x, enemy.y, 1.5, enemy.onLayer + 1, 10)
           let debris = this.phaserMaster.get('sharedDebris');
           debris.customFire(enemy)
           game.time.events.remove(enemy.explodeInterval)
           enemy.children.map(obj => {
             this.phaserSprites.destroy(obj.name);
           })
           phaserSprites.destroy(enemy.name);
         })

       }).autoDestroy = true;
    }
    //----------------------------




    return enemy;
  }

  /******************/

}

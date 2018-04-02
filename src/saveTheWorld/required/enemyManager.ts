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
  showHitbox:any;

  constructor(params){
    this.showHitbox = params.showHitbox;
  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, weaponManager:any, atlas:string, atlas_weapons:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.weaponManager = weaponManager;
    this.atlas = atlas
    this.atlas_weapons = atlas_weapons;
  }

  /******************/
  public collisionCheck(obj:any, damage:number){
    this.phaserSprites.getManyGroups(['playership']).map(target => {
      target.game.physics.arcade.overlap(obj, target, (obj, target)=>{
        target.takeDamage(damage);
        obj.destroyIt()
      }, null, obj);
    })
  }
  /******************/

  /******************/
  private facePlayer(obj:any){
    let game = this.game
    let {player} = this.phaserSprites.getOnly(['player'])
    return Math.ceil( (360 / (2 * Math.PI)) * game.math.angleBetween(obj.x, obj.y, player.x, player.y) - 90 ) * 1
  }
  /******************/

  /******************/
  private fireBullet(enemy:any, tracking:Boolean = false){
    let spriteAnimation = [...Phaser.Animation.generateFrameNames('e_bullet', 1, 1)]
    // let ammo =  this.phaserSprites.addFromAtlas({x: x, y: y, name: `enemy_bullet_${this.game.rnd.integer()}`, group: 'enemy_bullets', atlas: this.atlas_weapons, filename: spriteAnimation[0]})
    //     ammo


    for(let i = 0; i < 3; i++){
      setTimeout(() => {
        let onDestroy = () => {}
        let onUpdate = (bullet:any) => {
          this.collisionCheck(bullet, 2)
        }
        let bullet = this.weaponManager.createBullet({name: `enemy_bullet_${this.game.rnd.integer()}`, group: 'enemy_bullets', x: enemy.x, y: enemy.y, spread: (i*8), layer: enemy.onLayer + 1}, onDestroy, onUpdate)
            bullet.body.velocity.y = 300;
     }, 25)
    }


  }
  /******************/

  /******************/
  private fireSpread(enemy:any, size:number){
    let onDestroy = () => {}
    let onUpdate = (bullet:any) => {
      this.collisionCheck(bullet, 2)
    }

    let bullet = this.weaponManager.redBullet({name: `enemy_bullet_${this.game.rnd.integer()}`, group: 'enemy_bullets', x: enemy.x, y: enemy.y, spread: 0, layer: enemy.onLayer + 1}, onDestroy, onUpdate)
        bullet.body.velocity.y = 300;
    for(let i = 1; i < size/2; i++){
      setTimeout(() => {
        let bullet = this.weaponManager.redBullet({name: `enemy_bullet_${this.game.rnd.integer()}`, group: 'enemy_bullets', x: enemy.x, y: enemy.y, spread: (i*8), layer: enemy.onLayer + 1}, onDestroy, onUpdate)
            bullet.body.velocity.y = 300;
     }, 25)
    }
    for(let i = 1; i < size/2; i++){
      setTimeout(() => {
        let bullet = this.weaponManager.redBullet({name: `enemy_bullet_${this.game.rnd.integer()}`, group: 'enemy_bullets', x: enemy.x, y: enemy.y, spread: -(i*8), layer: enemy.onLayer + 1}, onDestroy, onUpdate)
            bullet.body.velocity.y = 300;
     }, 25)
    }

  }
  /******************/

  /******************/
  public createSmallEnemy1(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onFail:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `small_1`, visible: true})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1,1);
        enemy.atTarget = false;
        enemy.maxHealth = 100;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 1;
        enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        enemy.cosWave = {data: game.math.sinCosGenerator(200, game.world.height * .50 , 0, 1).cos, count: 0}
        enemy.sinWave = {data: game.math.sinCosGenerator(game.rnd.integerInRange(200, 300), game.rnd.integerInRange(0, 1) === 1 ? -50 : 50, 1, 3).sin, count: 0}
        enemy.fireDelay = 0
        enemy.fireTimer = 1000
        enemy.isDestroyed = false;
        enemy.onLayer = options.layer;
        phaserGroup.add(options.layer, enemy)

    // add hitboxes
    let hitboxes = [`small_1_hitbox_1`]
    hitboxes.map(obj => {
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })



    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      if(!enemy.atTarget){
        enemy.health -= val;
        enemy.tint = 1 * 0xff0000;
        //this.weaponImpactAnimation(enemy, options, wpnType)
        enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        if(enemy.health <= 0){
          enemy.destroyIt()
        }
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name);
    }

    // destroy it
    enemy.destroyIt = () => {
      // destroy hitboxes
      enemy.children.map(obj => {
        this.phaserSprites.destroy(obj.name);
      })
      if(!enemy.isDestroyed){
       //enemy.body = null;
       enemy.isDestroyed = true;
       enemy.tint = 1 * 0xff0000;

       enemy.explodeInterval = setInterval(() => {
         this.weaponManager.createExplosion(enemy.x + game.rnd.integerInRange(-enemy.width/2, enemy.width/2), enemy.y + game.rnd.integerInRange(-enemy.height/2, enemy.height/2), 1, enemy.onLayer + 1)
       }, 250)

       enemy.game.add.tween(enemy).to( {y: enemy.y + 100, alpha: 0.5}, 750, Phaser.Easing.Linear.Out, true, 100, 0, false).
         onComplete.add(() => {
            clearInterval(enemy.explodeInterval)
            onDestroy(enemy);
            this.weaponManager.createExplosion(enemy.x, enemy.y, 1, options.layer + 1)
            phaserSprites.destroy(enemy.name);
         })
       }
    }



    enemy.onUpdate = () => {
      onUpdate(enemy);

      //enemy.angle = this.facePlayer(enemy)
      if(game.time.now > enemy.fireDelay && !enemy.isDestroyed && (enemy.y > enemy.game.canvas.height * .3) ){
          enemy.fireDelay = game.time.now + enemy.fireTimer
          this.fireSpread(enemy, 4)
      }

      if(!enemy.isDestroyed){
        enemy.y = -(enemy.cosWave.data[enemy.cosWave.count]) - enemy.height
        enemy.x = enemy.sinWave.data[enemy.sinWave.count] + options.x
        enemy.cosWave.count++
        enemy.sinWave.count++
        if(enemy.cosWave.count >= enemy.cosWave.data.length){
          enemy.removeIt();
        }
      }
      else{
        enemy.inPlace = true
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name)
    }


    return enemy;
  }
  /******************/

  /******************/
  public createBigEnemy1(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onFail:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({x: options.x, name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `big_1`, visible: true})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1,1);
        game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.atTarget = false;
        enemy.maxHealth = 1500;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 4;
        enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        enemy.sinWave = game.math.sinCosGenerator(400 + options.y, game.world.height/2 , 1, 1);
        enemy.count = 0;
        enemy.fireDelay = 0
        enemy.fireTimer = 500
        enemy.inPlace = false;
        enemy.isDestroyed = false;
        enemy.onLayer = options.layer;
        phaserGroup.add(options.layer, enemy)

    // add hitboxes
    let hitboxes = [`big_1_hitbox_1`, `big_1_hitbox_2`]
    hitboxes.map(obj => {
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })



    enemy.damageIt = (val:number) => {
      onDamage(enemy);
      if(!enemy.atTarget){
        enemy.health -= val;
        enemy.tint = 1 * 0xff0000;
        //this.weaponImpactAnimation(enemy, options, wpnType)
        enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        if(enemy.health <= 0){
          enemy.destroyIt()
        }
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name);
    }

    // destroy it
    enemy.destroyIt = () => {
      // destroy hitboxes
      enemy.children.map(obj => {
        this.phaserSprites.destroy(obj.name);
      })
      if(!enemy.isDestroyed){
       //enemy.body = null;
       enemy.isDestroyed = true;
       enemy.tint = 1 * 0xff0000;

       enemy.explodeInterval = setInterval(() => {
         this.weaponManager.createExplosion(enemy.x + game.rnd.integerInRange(-enemy.width/2, enemy.width/2), enemy.y + game.rnd.integerInRange(-enemy.height/2, enemy.height/2), 1, enemy.onLayer + 1)
       }, 100)

       enemy.game.add.tween(enemy).to( {y: enemy.y - 15, alpha: 0.5}, 750, Phaser.Easing.Linear.Out, true, 100, 0, false).
         onComplete.add(() => {
            clearInterval(enemy.explodeInterval)
            onDestroy(enemy);
            this.weaponManager.createExplosion(enemy.x, enemy.y, 1, options.layer + 1)
            phaserSprites.destroy(enemy.name);
         })
       }
    }

    enemy.onUpdate = () => {
      onUpdate(enemy);
      if(game.time.now > enemy.fireDelay && enemy.inPlace){
          enemy.fireDelay = game.time.now + enemy.fireTimer
          this.fireBullet(enemy, true)
      }


      if(!enemy.isDestroyed && enemy.count < enemy.sinWave.cos.length/2){
        enemy.y = -(enemy.sinWave.cos[enemy.count]) - enemy.height
        enemy.count++
      }
      else{
        enemy.inPlace = true
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name)
    }


    return enemy;
  }
  /******************/

  /******************/
  public createAsteroid(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onFail:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `asteroid_mid_layer_${game.rnd.integerInRange(1, 3)}`, visible: true})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1.5, 1.5);
        game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.velocity.y = options.iy
        enemy.body.velocity.x = options.ix
        enemy.angleMomentum = game.rnd.integerInRange(-5, 5)
        enemy.body.bounce.setTo(1, 1);
        enemy.atTarget = false;
        enemy.maxHealth = 150;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 4;
        enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        phaserGroup.add(options.layer, enemy)

    // add hitboxes
    let hitboxes = [`1_hitbox_1`, `1_hitbox_2`]
    hitboxes.map(obj => {
      let e_hitbox = phaserSprites.addFromAtlas({name: `enemy_hitbox_${game.rnd.integer()}`, group:'enemy_hitboxes', atlas: atlas, filename: obj, alpha: this.showHitbox ? 0.75 : 0})
          e_hitbox.anchor.setTo(0.5, 0.5)
          e_hitbox.destroyIt = (self:any) => {
            self.body = null;
            this.phaserSprites.destroy(self.name)
          }
          game.physics.enable(e_hitbox, Phaser.Physics.ARCADE);
          enemy.addChild(e_hitbox)
    })


    enemy.damageIt = (val:number, wpnType:string = null) => {
      onDamage(enemy);
      if(!enemy.atTarget){
        enemy.health -= val;
        enemy.tint = 1 * 0xff0000;
        enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        if(enemy.health <= 0){
          enemy.destroyIt()
        }
      }
    }

    // destroy it
    enemy.destroyIt = () => {
        // animate it
        let tween = {
          angle: game.rnd.integerInRange(-720, 720),
          x: enemy.x - game.rnd.integerInRange(-25, 25),
          y: enemy.y - game.rnd.integerInRange(5, 25),
          alpha: .5
        }
        enemy.game.add.tween(enemy).to( tween, game.rnd.integerInRange(150, 500), Phaser.Easing.Linear.Out, true, 0, 0, false);
        enemy.body = null;
       // animate death and then explode
       game.time.events.add(Phaser.Timer.SECOND/2, () => {
          onDestroy(enemy);
          this.weaponManager.createExplosion(enemy.x, enemy.y, 1, options.layer + 1)
        phaserSprites.destroy(enemy.name);
       }, enemy).autoDestroy = true;
    }

    enemy.fallToPlanet = () => {
      enemy.tint = 1 * 0x000000;
      enemy.atTarget = true;
      enemy.body = null;
      enemy.game.add.tween(enemy).to( {y: enemy.y + 60}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
      setTimeout(() => {
        this.game.add.tween(enemy.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*1, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
          onComplete.add(() => {
            onFail(enemy);
            enemy.removeIt();
            this.weaponManager.createExplosion(enemy.x, enemy.y, 0.25, 6)
          }).autoDestroy = true;
      }, 300)
    }

    enemy.checkLocation = () => {
      enemy.angle += enemy.angleMomentum
      if(enemy.angleMomentum > 0){
        enemy.angleMomentum -= 0.002
      }
      if(enemy.angleMomentum < 0){
        enemy.angleMomentum += 0.002
      }
      if(enemy.y > enemy.height){
        if(enemy.body !== null){
          enemy.body.collideWorldBounds = true;
        }
      }
      if(enemy.y > this.game.canvas.height - (75 + enemy.fallThreshold)){
        if(enemy.body !== null && !enemy.atTarget){
          enemy.body.collideWorldBounds = false;
          enemy.fallToPlanet();
        }
      }
    }

    enemy.onUpdate = () => {
      onUpdate(enemy);
      game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], enemy);
      enemy.rotate += 2
      if(!enemy.atTarget){
        if(enemy.body !== null){
          if(enemy.body.velocity.y + 2 < 100){
            enemy.body.velocity.y += 2
          }
          if(enemy.body.velocity.x > 0){
            enemy.body.velocity.x -= 0.2
          }
          if(enemy.body.velocity.x < 0){
            enemy.body.velocity.x += 0.2
          }
        }
        enemy.checkLocation();
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name)
    }


    return enemy;
  }
  /******************/


  /******************/
  public createDebris(options:any, onDamage:any = (enemy:any) => {}, onDestroy:any = (enemy:any) => {}, onFail:any = (enemy:any) => {}, onUpdate:any = (enemy:any) => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;

    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `asteroid_mid_layer_${game.rnd.integerInRange(1, 3)}`, visible: true})
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1, 1);
        game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.velocity.y = options.iy
        enemy.body.velocity.x = options.ix
        enemy.angleMomentum = game.rnd.integerInRange(-5, 5)
        enemy.body.bounce.setTo(1, 1);
        enemy.atTarget = false;
        enemy.maxHealth = 50;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 1;

        enemy.fallThrehold = game.rnd.integerInRange(0, 75)
        phaserGroup.add(options.layer, enemy)

        // damage it
        enemy.damageIt = (val:number, wpnType:string = null) => {
          enemy.health -= val;
          enemy.tint = 1 * 0xff0000;
          enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
          if(enemy.health <= 0){
            enemy.destroyIt(enemy)
          }
        }

        enemy.removeIt = () => {
          phaserSprites.destroy(enemy.name)
        }

        enemy.fallToPlanet = () => {
          enemy.tint = 1 * 0x000000;
          enemy.atTarget = true;
          enemy.body = null;
          enemy.game.add.tween(enemy).to( {y: enemy.y + 60}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
          setTimeout(() => {
            this.game.add.tween(enemy.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*1, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
              onComplete.add(() => {
                onFail(enemy);
                enemy.removeIt();
                this.weaponManager.createExplosion(enemy.x, enemy.y, 0.25, 6)
              }).autoDestroy = true;
          }, 300)
        }

        // destroy it
        enemy.destroyIt = () => {
            // add to score


            // animate it
            let tween = {
              angle: game.rnd.integerInRange(-720, 720),
              x: enemy.x - game.rnd.integerInRange(-25, 25),
              y: enemy.y - game.rnd.integerInRange(5, 25),
              alpha: .5
            }
            enemy.game.add.tween(enemy).to( tween, game.rnd.integerInRange(50, 200), Phaser.Easing.Linear.Out, true, 0, 0, false);
            enemy.body = null;

           // animate death and then explode
           game.time.events.add(Phaser.Timer.SECOND/3, () => {
              onDestroy(enemy)
              this.weaponManager.createExplosion(enemy.x, enemy.y, 0.5, 6)
              phaserSprites.destroy(enemy.name);
           }, enemy).autoDestroy = true;
        }

        enemy.checkLocation = () => {
          enemy.angle += enemy.angleMomentum
          if(enemy.angleMomentum > 0){
            enemy.angleMomentum -= 0.002
          }
          if(enemy.angleMomentum < 0){
            enemy.angleMomentum += 0.002
          }
          if(enemy.y > enemy.height){
            if(enemy.body !== null){
              enemy.body.collideWorldBounds = true;
            }
          }
          if(enemy.y > this.game.canvas.height - (50 + enemy.fallThrehold)){
            if(enemy.body !== null && !enemy.atTarget){
              enemy.body.collideWorldBounds = false;
              enemy.fallToPlanet();
            }
          }
          if(enemy.y > this.game.canvas.height + enemy.height){
            enemy.removeIt();
          }
        }

        enemy.onUpdate = () => {
          game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], enemy);
          enemy.rotate += 4
          if(enemy.body !== null){
            if(enemy.body.velocity.y + 1 < 50){
              enemy.body.velocity.y += 1
            }
            if(enemy.body.velocity.x > 0){
              enemy.body.velocity.x -= 0.2
            }
            if(enemy.body.velocity.x < 0){
              enemy.body.velocity.x += 0.2
            }
          }
          enemy.checkLocation();
        }
  }
  /******************/


  /******************/
  public createGiantAsteroid(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onFail:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'boss', atlas: atlas, filename: `asteroid_large_layer_${game.rnd.integerInRange(1, 3)}`, visible: true})
        enemy.anchor.setTo(0.5, 0.5);
        game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.velocity.y = options.iy
        enemy.body.velocity.x = options.ix
        enemy.angleMomentum = game.rnd.integerInRange(-5, 5)
        enemy.body.bounce.setTo(1, 1);
        enemy.atTarget = false;
        enemy.maxHealth = 5000;
        enemy.health = enemy.maxHealth
        enemy.pierceResistence = 50;
        //enemy.fallThreshold = game.rnd.integerInRange(0, 75)
        phaserGroup.add(options.layer, enemy)

    enemy.damageIt = (val:number, wpnType:string = null) => {
      onDamage(enemy);
      if(!enemy.atTarget){
        enemy.health -= val;
        enemy.tint = 1 * 0xff0000;
        enemy.game.add.tween(enemy).to( {tint: 1 * 0xffffff}, 100, Phaser.Easing.Linear.Out, true, 0, 0, false);
        if(enemy.health <= 0){
          enemy.destroyIt()
        }
      }
    }

    // destroy it
    enemy.destroyIt = (spawnMore = true) => {
        // animate it
        // animate it
        let tween = {
          angle: 720,
          x: enemy.x - game.rnd.integerInRange(-10, 10),
          y: enemy.y - game.rnd.integerInRange(10, 10),
          alpha: .15
        }
        enemy.game.add.tween(enemy).to( tween, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.Out, true, 0, 0, false);
        enemy.game.add.tween(enemy.scale).to( {x: 0.5, y: 0.5}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.Out, true, 0, 0, false);
        enemy.body = null;

        // animate death and then explode
        game.time.events.add(Phaser.Timer.SECOND/2, () => {
          onDestroy(enemy);
          this.weaponManager.createImpactExplosion(enemy.x, enemy.y, 2.5, options.layer + 1)
          phaserSprites.destroy(enemy.name);
        }, enemy).autoDestroy = true;
    }

    enemy.fallToPlanet = () => {
      enemy.tint = 1 * 0x000000;
      enemy.atTarget = true;
      enemy.body = null;
      enemy.game.add.tween(enemy).to( {y: enemy.y + 60}, Phaser.Timer.SECOND*2, Phaser.Easing.Linear.In, true, 0).autoDestroy = true;
      setTimeout(() => {
        this.game.add.tween(enemy.scale).to( {x: 0, y: 0}, Phaser.Timer.SECOND*1, Phaser.Easing.Linear.In, true, game.rnd.integerInRange(0, 500)).
          onComplete.add(() => {
            onFail(enemy);
            enemy.removeIt();
            this.weaponManager.createExplosion(enemy.x, enemy.y, 0.25, 6)
          }).autoDestroy = true;
      }, 300)
    }

    enemy.checkLocation = () => {
      enemy.angle += enemy.angleMomentum
      if(enemy.angleMomentum > 0){
        enemy.angleMomentum -= 0.002
      }
      if(enemy.angleMomentum < 0){
        enemy.angleMomentum += 0.002
      }
      if(enemy.y > enemy.height){
        if(enemy.body !== null){
          enemy.body.collideWorldBounds = true;
        }
      }
      if(enemy.y > enemy.game.canvas.height - enemy.height){
        if(enemy.body !== null && !enemy.atTarget){
          enemy.body.collideWorldBounds = false;
          enemy.fallToPlanet();
        }
      }
    }

    enemy.onUpdate = () => {
      onUpdate(enemy);
      game.physics.arcade.collide([phaserSprites.get('leftBoundry'), phaserSprites.get('rightBoundry')], enemy);
      enemy.rotate += 2
      if(!enemy.atTarget){
        if(enemy.body !== null){
          if(enemy.body.velocity.y + 1 < 25){
            enemy.body.velocity.y += 1
          }
          if(enemy.body.velocity.x > 0){
            enemy.body.velocity.x -= 0.2
          }
          if(enemy.body.velocity.x < 0){
            enemy.body.velocity.x += 0.2
          }
        }
        enemy.checkLocation();
      }
    }

    enemy.removeIt = () => {
      phaserSprites.destroy(enemy.name)
    }


    return enemy;
  }
  /******************/

}

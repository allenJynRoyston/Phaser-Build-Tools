declare var Phaser:any;

export class ENEMY_MANAGER {
  game:any;
  phaserSprites:any;
  phaserMaster:any;
  phaserTexts:any;
  phaserGroup:any
  weaponManager:any;
  atlas:any;

  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserTexts:any, phaserGroup:any, weaponManager:any, atlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserTexts = phaserTexts;
    this.phaserGroup = phaserGroup;
    this.weaponManager = weaponManager;
    this.atlas = atlas
  }

  /******************/
  public createAsteroid(options:any, onDamage:any = () => {}, onDestroy:any = () => {}, onFail:any = () => {}, onUpdate:any = () => {}){
    let game = this.game
    let {phaserMaster, phaserSprites, phaserGroup, atlas} = this;
    //let enemy = enemyData.BULLET;
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `asteroid_mid_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
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


    enemy.damageIt = (val:number) => {
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

    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'enemies', atlas: atlas, filename: `asteroid_mid_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
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
        enemy.damageIt = (val:number) => {
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
    let enemy = phaserSprites.addFromAtlas({x: options.x, y: options.y, name: `enemy_${game.rnd.integer()}`, group:'boss', atlas: atlas, filename: `asteroid_large_layer_${game.rnd.integerInRange(1, 3)}.png`, visible: true})
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

    enemy.damageIt = (val:number) => {
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

declare var Phaser:any;

export class ITEMSPAWN_MANAGER {
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
  public spawnHealthpack(x:number, y:number, layer:number, onPickup = () => {}){
    let animation = [...Phaser.Animation.generateFrameNames('healthpack_', 1, 4)]
    let item = this.phaserSprites.addFromAtlas({ name: `healthpack_${this.game.rnd.integer()}`, group: 'itemspawns', x: x, y: y, atlas: this.atlas, filename: animation[0] });
        item.animations.add('animate', animation, 8, true)
        item.animations.play('animate')
        item.anchor.setTo(0.5, 0.5);
        item.blinkLifespan = this.game.time.returnTrueTime() + (Phaser.Timer.SECOND*10)
        item.blinkLifespanInterval = this.game.time.returnTrueTime()
        item.blinkLifespanCount = 0
        this.game.physics.enable(item, Phaser.Physics.ARCADE);
        item.body.collideWorldBounds = true;
        item.body.bounce.setTo(1, 1);
        item.body.velocity.y = this.game.rnd.integerInRange(50, 50)
        item.body.velocity.x = this.game.rnd.integerInRange(-200, 200)
        item.destroyIt = () => {
          this.phaserSprites.destroy(item.name)
        }

        item.pickedUp = () => {
          // do an animation here
          this.phaserSprites.destroy(item.name)
        }

        item.onUpdate = () => {
          if(this.game.time.returnTrueTime() > item.blinkLifespan){
            item.destroyIt()
          }

          if(this.game.time.returnTrueTime() > (item.blinkLifespan - Phaser.Timer.SECOND*3)){
            if(this.game.time.returnTrueTime() > item.blinkLifespanInterval){
              item.blinkLifespanInterval = this.game.time.returnTrueTime() + 200 - (item.blinkLifespanCount * 5)
              item.alpha = item.blinkLifespanCount % 2 === 0 ? 0.25 : 1;
              item.blinkLifespanCount++
            }
          }

          this.phaserSprites.getManyGroups(['playership']).map(target => {
            target.game.physics.arcade.overlap(item, target, (obj, target)=>{
              onPickup()
              item.pickedUp()
            }, null, item);
          })
        }

      this.phaserGroup.add(layer, item)
  }
  /******************/

  /******************/
  public spawnPowerup(x:number, y:number, layer:number, onPickup = () => {}){
    let animation = [...Phaser.Animation.generateFrameNames('powerup_', 1, 4)]
    let item = this.phaserSprites.addFromAtlas({ name: `healthpack_${this.game.rnd.integer()}`, group: 'itemspawns', x: x, y: y, atlas: this.atlas, filename: animation[0] });
        item.animations.add('animate', animation, 8, true)
        item.animations.play('animate')
        item.anchor.setTo(0.5, 0.5);
        item.blinkLifespan = this.game.time.returnTrueTime() + (Phaser.Timer.SECOND*10)
        item.blinkLifespanInterval = this.game.time.returnTrueTime()
        item.blinkLifespanCount = 0
        this.game.physics.enable(item, Phaser.Physics.ARCADE);
        item.body.collideWorldBounds = true;
        item.body.bounce.setTo(1, 1);
        item.body.velocity.y = this.game.rnd.integerInRange(50, 50)
        item.body.velocity.x = this.game.rnd.integerInRange(-200, 200)
        item.destroyIt = () => {
          this.phaserSprites.destroy(item.name)
        }

        item.pickedUp = () => {
          // do an animation here
          this.phaserSprites.destroy(item.name)
        }

        item.onUpdate = () => {
          if(this.game.time.returnTrueTime() > item.blinkLifespan){
            item.destroyIt()
          }

          if(this.game.time.returnTrueTime() > (item.blinkLifespan - Phaser.Timer.SECOND*3)){
            if(this.game.time.returnTrueTime() > item.blinkLifespanInterval){
              item.blinkLifespanInterval = this.game.time.returnTrueTime() + 200 - (item.blinkLifespanCount * 5)
              item.alpha = item.blinkLifespanCount % 2 === 0 ? 0.25 : 1;
              item.blinkLifespanCount++
            }
          }

          this.phaserSprites.getManyGroups(['playership']).map(target => {
            target.game.physics.arcade.overlap(item, target, (obj, target)=>{
              onPickup()
              item.pickedUp()
            }, null, item);
          })
        }

      this.phaserGroup.add(layer, item)
  }
  /******************/

  /******************/
  public spawnSpecial(x:number, y:number, layer:number, onPickup = () => {}){
    let animation = [...Phaser.Animation.generateFrameNames('special_', 1, 5)]
    let item = this.phaserSprites.addFromAtlas({ name: `healthpack_${this.game.rnd.integer()}`, group: 'itemspawns', x: x, y: y, atlas: this.atlas, filename: animation[0] });
        item.animations.add('animate', animation, 8, true)
        item.animations.play('animate')
        item.anchor.setTo(0.5, 0.5);
        item.blinkLifespan = this.game.time.returnTrueTime() + (Phaser.Timer.SECOND*10)
        item.blinkLifespanInterval = this.game.time.returnTrueTime()
        item.blinkLifespanCount = 0
        this.game.physics.enable(item, Phaser.Physics.ARCADE);
        item.body.collideWorldBounds = true;
        item.body.bounce.setTo(1, 1);
        item.body.velocity.y = this.game.rnd.integerInRange(50, 50)
        item.body.velocity.x = this.game.rnd.integerInRange(-200, 200)
        item.destroyIt = () => {
          this.phaserSprites.destroy(item.name)
        }

        item.pickedUp = () => {
          // do an animation here
          this.phaserSprites.destroy(item.name)
        }

        item.onUpdate = () => {

          if(this.game.time.returnTrueTime() > item.blinkLifespan){
            item.destroyIt()
          }

          if(this.game.time.returnTrueTime() > (item.blinkLifespan - Phaser.Timer.SECOND*3)){
            if(this.game.time.returnTrueTime() > item.blinkLifespanInterval){
              item.blinkLifespanInterval = this.game.time.returnTrueTime() + 200 - (item.blinkLifespanCount * 5)
              item.alpha = item.blinkLifespanCount % 2 === 0 ? 0.25 : 1;
              item.blinkLifespanCount++
            }
          }

          this.phaserSprites.getManyGroups(['playership']).map(target => {
            target.game.physics.arcade.overlap(item, target, (obj, target)=>{
              onPickup()
              item.pickedUp()
            }, null, item);
          })
        }

      this.phaserGroup.add(layer, item)
  }
  /******************/


}

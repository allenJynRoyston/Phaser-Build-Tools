declare var Phaser:any;

export class UTILITY_MANAGER {
  game:any;
  phaserSprites:any;
  phaserBitmapdata:any;
  phaserGroup:any
  atlas:any;

  constructor(){

  }

  public assign(game:any,phaserSprites:any, phaserBitmapdata:any, phaserGroup:any, atlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserBitmapdata = phaserBitmapdata;
    this.phaserGroup = phaserGroup;
    this.atlas = atlas
  }

  public buildOverlayBackground(start:string, end:string, layer:number, visibleOnStart:Boolean = false){
    let game = this.game;
    let overlaybmd = this.phaserBitmapdata.addGradient({name: 'um_overlay__bmd', start: start, end: end, width: 5, height: 5, render: false})
    let overlay = this.phaserSprites.add({x: 0, y: 0, name: `um_overlay__bg`, width: game.world.width, height: game.world.height, reference: overlaybmd.cacheBitmapData, visible: visibleOnStart})
        overlay.fadeIn = (speed:number = 500, callback:any = () => {}) => {
          overlay.visible = true;
          overlay.alpha = 0
          game.add.tween(overlay).to( { alpha: 1 }, speed, Phaser.Easing.Linear.In, true, 0, 0, false).
            onComplete.add(() => {
              callback()
            })
        }
        overlay.fadeOut = (speed:number = 500, callback:any = () => {}) => {
          overlay.visible = true;
          overlay.alpha = 1
          game.add.tween(overlay).to( { alpha: 0 }, speed, Phaser.Easing.Linear.In, true, 0, 0, false).
            onComplete.add(() => {
              callback()
            })
        }

    this.phaserGroup.add(layer, overlay)
  }

  public buildOverlayGrid(squareSizeH:number = 80, squareSizeV:number = 80, layer:number, image:string){
    let game = this.game;
    // animate in
    let count = 0;


    for(let c = 0; c < Math.ceil(game.world.height/squareSizeV) + 1; c++ ){
      for(let r = 0; r < Math.ceil(game.world.width/squareSizeH) + 1; r++ ){
        let gridSquare = this.phaserSprites.addFromAtlas({x: r * squareSizeH, y: c * squareSizeV, name: `grid${count}`, group: 'um_grid__bg', width: squareSizeH, height: squareSizeV, atlas: this.atlas, filename: image, visible: true})
            gridSquare.anchor.setTo(0.5, 0.5)
            gridSquare.scale.setTo(1, 1)
            gridSquare.fadeOut = (speed:number) => {
              gridSquare.scale.setTo(1, 1)
              game.add.tween(gridSquare).to( { height: 0}, speed, Phaser.Easing.Linear.Out, true, 0, 0, false)
            }
            gridSquare.fadeIn = (speed:number) => {
              game.add.tween(gridSquare).to( { height: squareSizeV }, speed, Phaser.Easing.Linear.In, true, 0, 0, false)
            }
            gridSquare.scaleOut = (speed:number) => {
              game.add.tween(gridSquare.scale).to( { x: 0, y:0 }, speed, Phaser.Easing.Linear.In, true, 0, 0, false)
            }
            gridSquare.scaleIn = (speed:number) => {
              game.add.tween(gridSquare.scale).to( { x:1, y:1 }, speed, Phaser.Easing.Linear.Out, true, 0, 0, false)
            }

            count++;
        this.phaserGroup.add(layer, gridSquare)
      }
    }
  }

  public overlayBGControls(options, callback){
      let {transition, delay, speed} = options
      let {um_overlay__bg} = this.phaserSprites.getOnly(['um_overlay__bg'])
      setTimeout(() => {
        switch(transition) {

          //----------------
          case 'FADEIN':
            um_overlay__bg.fadeIn(speed, callback)
            break
          //----------------

          //----------------
          case 'FADEOUT':
            um_overlay__bg.fadeOut(speed, callback)
            break
          //----------------
        }

      }, delay)
  }

  public overlayControls(options, callback){
    let {transition, delay, speed, tileDelay} = options
    let grid = this.phaserSprites.getGroup('um_grid__bg');
    let odd = [];
    let even = [];
    let rowDelay = (tileDelay * grid.length) * 0.75
    let returnDelay = rowDelay + (tileDelay * grid.length)

    setTimeout(() => {
      switch(transition) {

        //----------------
        case 'WIPEIN':
          grid.map( (obj, index) => {
            if(index % 2 === 0){
              even.push(obj)
            }
            else{
              odd.push(obj)
            }
          })
          even.map( (obj, index) => {
            setTimeout(() => {
                obj.scaleIn(speed)
            }, tileDelay * index)
          })

          setTimeout(() => {
            odd.slice(0).reverse().map( (obj, index) => {
              setTimeout(() => {
                  obj.scaleIn(speed)
              }, tileDelay * index)
            })
          }, rowDelay)

          setTimeout(() => {
            callback();
          }, returnDelay)
          break
        //----------------

        //----------------
        case 'WIPEOUT':
          grid.map( (obj, index) => {
            if(index % 2 === 0){
              even.push(obj)
            }
            else{
              odd.push(obj)
            }
          })
          even.map( (obj, index) => {
            setTimeout(() => {
                obj.scaleOut(speed)
            }, tileDelay * index)
          })

          setTimeout(() => {
            odd.slice(0).reverse().map( (obj, index) => {
              setTimeout(() => {
                  obj.scaleOut(speed)
              }, tileDelay * index)
            })
          }, rowDelay)

          setTimeout(() => {
            callback();
          }, returnDelay)
          break
        //----------------

        //----------------
        case 'FADEOUT':
          grid.map( (obj, index) => {
            setTimeout(() => {
                obj.fadeOut(speed)
            }, tileDelay * index)
          })
          setTimeout(() => {
            callback()
          }, grid.length * tileDelay + speed)
          break
        //----------------

        //----------------
        case 'FADEIN':
          grid.map( (obj, index) => {
            setTimeout(() => {
                obj.fadeIn(speed)
            }, tileDelay * index)
          })
          setTimeout(() => {
            callback()
          }, grid.length * tileDelay + speed)
          break
        //----------------

      }
    }, delay)
  }

}

declare var Phaser:any;

export class DIALOG_MANAGER {
  game:any;
  phaserSprites:any;
  phaserMaster:any;
  phaserGroup:any;
  phaserTexts:any;
  phaserControls:any;
  atlas:any;
  dialogGenerator:any;
  dialogbox:any;

  canSkip:Boolean;
  onTimer:Boolean;
  autoplay: Boolean;


  constructor(){

  }

  public assign(game:any, phaserMaster:any, phaserSprites:any, phaserGroup:any, phaserTexts:any, phaserControls:any, atlas:string){
    this.game = game;
    this.phaserSprites = phaserSprites;
    this.phaserMaster = phaserMaster;
    this.phaserGroup = phaserGroup;
    this.phaserTexts = phaserTexts;
    this.phaserControls = phaserControls;
    this.atlas = atlas


    this.dialogGenerator;
    this.dialogbox;
  }


  /******************/
  public create(){
    let {game, phaserMaster, phaserSprites, phaserGroup, phaserTexts, atlas} = this;
    let {w, h} = phaserMaster.getResolution()

    // create blank container for dialogbox and text
    let dialogbox = phaserSprites.addEmptySprite({x: 0, y: h + 300, name: 'dialogbox', visible: false})

    dialogbox.reveal = (callback) => {
      let y = dialogbox.getDefaultPositions().y
      dialogbox.visible = true;
      dialogbox.setDefaultPositions();

      dialogbox.children.map(child => {
        if(child.onStart !== undefined){child.onStart()}
      })

      game.add.tween(dialogbox).to( { y: h - 110 }, Phaser.Timer.SECOND/2, Phaser.Easing.Circular.InOut, true, 1, 0, false).
        onComplete.add(() => {
          callback()
        })
    }

    dialogbox.hide = () => {
      dialogbox.text.replaceText('')
      game.add.tween(dialogbox).to( { y: dialogbox.getDefaultPositions().y }, Phaser.Timer.SECOND/2, Phaser.Easing.Circular.InOut, true, 1, 0, false).
        onComplete.add(() => {
          //dialogbox.visible = false;
          dialogbox.children.map(child => {
            if(child.onStop !== undefined){child.onStop()}
          })
        })
    }

    let dialogboxGraphic = phaserSprites.addFromAtlas({x: 0, y: 0, width: w, height: 110,  name: `dialogboxGraphic`, filename: 'dialogbox', atlas: 'atlas_main', alpha: 0.8})
    dialogbox.addChild(dialogboxGraphic)

    let dialogPortraitFrame = phaserSprites.addFromAtlas({x: 10, y: 8, name: `dialogPortraitFrame`, filename: 'ui_portraitContainer', atlas: 'atlas_main', visible: true})
    dialogbox.addChild(dialogPortraitFrame)
    let dialogPortraitMask = phaserSprites.createBasicMask(13, 11, dialogPortraitFrame.width - 3, dialogPortraitFrame.height -3)
    dialogbox.addChild(dialogPortraitMask)

    dialogPortraitFrame.replaceImage = (image:string) => {
      // remove image if already exists
      if(phaserSprites.get('dialogPortraitImage') !== undefined){
        phaserSprites.destroy('dialogPortraitImage')
      }
      // create new one and mask it
      let dialogPortraitImage = phaserSprites.addFromAtlas({name: `dialogPortraitImage`, filename: image, atlas: 'atlas_main'})
          dialogPortraitImage.mask = dialogPortraitMask;
      dialogPortraitFrame.addChild(dialogPortraitImage)
    }
    dialogPortraitFrame.onStart = () => {
      let staticAnimation = [...Phaser.Animation.generateFrameNames('portrait_static_', 1, 4), ...Phaser.Animation.generateFrameNames('portrait_static_', 3, 1)]
      let dialogboxStatic = phaserSprites.addFromAtlas({x: 10, y: 8, name: `dialogboxStatic`,  filename: staticAnimation[0], atlas: 'atlas_main', visible: true, alpha: 0.35})
      dialogboxStatic.animations.add('static', staticAnimation, 1, true)
      dialogboxStatic.mask = dialogPortraitMask
      dialogbox.addChild(dialogboxStatic)
      dialogboxStatic.animations.play('static', 30, true)
    }
    dialogPortraitFrame.onStop = () => {
      phaserSprites.destroy('dialogboxStatic')
      if(phaserSprites.get('dialogPortraitImage') !== undefined){
        phaserSprites.destroy('dialogPortraitImage')
      }
    }

    let animation = [...Phaser.Animation.generateFrameNames('a_button_', 1, 9)]
    let dialogboxButton = phaserSprites.addFromAtlas({x: dialogboxGraphic.width - 40, y: dialogboxGraphic.height - 40, name: `dialogboxButton`, filename: animation[0], atlas: 'atlas_main', visible: false})
        dialogboxButton.animations.add('animate', animation)
        dialogboxButton.onStop = () => {
          dialogboxButton.animations.stop(null, true)
        }
        dialogbox.addChild(dialogboxButton)



    let dialogText = phaserTexts.add({x: 100, y:10, name: `dialogtext`, font: 'gem', size: 16})
        dialogText.maxWidth = w - 100 - 15;
        dialogbox.addChild(dialogText)

    dialogText.replaceText = (newText:string, callback:any = () => {}) => {
      dialogText.alpha = 0;
      dialogboxButton.visible = false;
      dialogText.setText(newText)
      game.add.tween(dialogText).to( { alpha: 1 }, Phaser.Timer.SECOND/2, Phaser.Easing.Linear.In, true, 1, 0, false).
        onComplete.add(() => {
          dialogboxButton.visible = true;
          callback()
      })
    }
    dialogText.onStart = () => {}
    dialogText.onStop = () => {
      dialogText.replaceText('')
    }

    let skipallText = phaserTexts.add({y:-20, name: `skipallText`, font: 'gem', default: 'PRESS START TO SKIP', size: 15, visible: false})
        skipallText.x = w - skipallText.width - 10;
    dialogbox.addChild(skipallText)

    // add properties
    dialogbox.portrait = dialogPortraitFrame
    dialogbox.text = dialogText;
    dialogbox.skipallText = skipallText;
    dialogbox.dialogboxButton = dialogboxButton;
    this.dialogbox = dialogbox;
    phaserGroup.addMany(phaserMaster.get('layers').DIALOGBOX, [dialogbox])
  }
  /******************/

  /******************/
  public *dialog(data:any){
    for(let i = 0; i < data.length; i++){
      yield data[i]
    }
    yield null
  }
  /******************/

  /******************/
  public start(script, callback){
    let {game, phaserMaster, phaserSprites, phaserGroup, phaserTexts, phaserControls, atlas} = this;
    let {currentState} = phaserMaster.getState();
    let gen:any = this.dialog(script);

    // reset all for new dialogs
    this.canSkip = false;
    this.onTimer = false;
    this.autoplay = false;

    gen.complete = callback;
    gen.revertToState = currentState;
    gen.isReady = false;
    phaserControls.enableAllActionButtons()

    this.createDialogbox(gen)

    gen.nextItem = (data:any) => {
      let txtMsg = data.text;
      let portrait = data.portrait;
      gen.dialogbox.portrait.replaceImage(portrait)
      gen.dialogbox.text.replaceText(txtMsg, () => {})
    }

    gen.finished = () => {
      [...phaserSprites.getGroup('player_healthbar'), ...phaserSprites.getGroup('player_pow')].map(obj => {
        obj.fadeIn()
      })
      phaserMaster.changeState(gen.revertToState)
      gen.dialogbox.hide();
      callback();
    }

    phaserMaster.changeState('DIALOG');
    this.dialogGenerator = gen;
  }
  /******************/

  /******************/
  private createDialogbox(gen:any){
    let {game, phaserMaster, phaserSprites, phaserGroup, phaserTexts, phaserControls, atlas} = this;

    let {dialogbox} = this;
    // hide healthbar/powerbar
    [...phaserSprites.getGroup('player_healthbar'), ...phaserSprites.getGroup('player_pow')].map(obj => {
      obj.fadeOut()
    })

    // play first item automatically
    dialogbox.reveal(() => {
        gen.dialogbox = dialogbox;
        gen.dialogbox.text.replaceText('', () => {
          gen.isReady = true
          this.next()
        })
    });
  }
  /******************/

  /******************/
  public next(force:Boolean = false){
    let {dialogbox} = this;
    if( (this.dialogGenerator.isReady && !this.onTimer) || force){
      let line = this.dialogGenerator.next().value;
      if(line === null){
        this.dialogGenerator.finished()
      }
      else{
        // setup autoplay
        if(!!line.autoplay){
          this.autoplay = line.autoplay;
          if(this.autoplay){
            dialogbox.dialogboxButton.animations.play('animate', 6, true)
          }
          else{
            dialogbox.dialogboxButton.animations.stop('animate')
          }
        }
        if(this.autoplay){
          line.timer = (line.text.length * 50 > 2500) ? (line.text.length * 50) : 2500;
        }

        // show skipallText
        if(!!line.canSkip){
          this.canSkip = line.canSkip
        }
        dialogbox.skipallText.visible = this.canSkip

        // if line is on a timer
        if(!!line.timer){
          this.onTimer = true;
          this.execute(line);
          this.game.time.events.add(line.timer, () => {
            this.execute(line, () => {
              this.next(true)
            })
          }, this).autoDestroy = true;
        }
        else{
          this.onTimer = false;
          this.execute(line)
        }
      }
    }
  }
  /******************/

  /******************/
  private execute(line:any, callback:any = () => {}){
    if (line !== null){
      this.dialogGenerator.nextItem(line)
      callback()
    }
    if (line === null){
      this.dialogGenerator.finished()
    }

  }
  /******************/

  /******************/
  public skipAll(){
    if(this.dialogGenerator.isReady){
      if(this.canSkip){
        //let d = this.dialogGenerator.next().value;
        this.dialogGenerator.finished()
      }
    }
  }
  /******************/


}

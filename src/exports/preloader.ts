declare var Phaser:any;

export class PHASER_PRELOADER {
  game:any;

  constructor(construct:any){
    this.game = construct.game;
    this.init(construct.delayInSeconds, construct.done);
  }

  private init(delay:number, done:any){
    let loadingtext, loadingPercentage;
    /* ONLOAD START */
    this.game.load.onLoadStart.add(() => {
      // text
      loadingtext = this.game.add.text(this.game.world.centerX, this.game.world.centerY/2, "", { font: "18px Impact", fill: "#fff", align: "center" });
      loadingtext.anchor.set(0.5)
      loadingPercentage = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "", { font: "32px Impact", fill: "#fff", align: "center" });
      loadingPercentage.anchor.set(0.5);
    }, this);

    /* AS RESOURCES ARE LOADED */
    this.game.load.onFileComplete.add((progress, cacheKey, success, totalLoaded, totalFiles) => {
      // change text
      loadingtext.setText("Please wait...");
      loadingPercentage.setText(progress + "%")
    }, this);

    /* ALL RESOURCES ARE LOADED */
    this.game.load.onLoadComplete.add(() => {
      // finalized text
      loadingtext.setText("File loaded!");
      loadingPercentage.setText("")

      // start game after slight delay
      this.game.time.events.add(Phaser.Timer.SECOND * delay, () => {
        // destroy all text
        loadingtext.destroy();
        loadingPercentage.destroy();
        done();
      }, this).autoDestroy = true;


    }, this);
  }


}

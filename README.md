### Phaser BuildTool
This will drastically help you build Phaser games by allowing an easy way to import multiple files into your phaser build.  

### What am I?
There's no good solution for converting a Typescript (or ES6/ES7 files) that have multiple imports/export requirements into a single use .js file thats completly bundled correctly.  I mean, there are other solutions (Webpack/Browserify) but those won't work for this specific case.  Imagine for example, that you have your main game file, game.ts, that you want to import a controller and audio class from which are in external sources.  This can be helpful if you want to split up your game into several smaller parts but want to be able to reuse sections of code.  

Essentially:  you have main.ts importing from audio.ts and controller.ts and converting it into one final.js file with everything included so it works as a standalone file.  

Granted, this is kind of the point of Webpack but it wont work for this particular test case.  I really needed to build my own development toolchain to get to this to compile and load correctly.  


### Why Gulp?
It's important to understand what is going on under the hood.  Essentially, Typescript has it's own rules when it comes to importing/exporting modules but when converted from .ts -> .js, any import * from '/blahblah' leaves a require() that just doesn't work when you're trying to reference it as a standalone file.  Basically what I came up with is a Gulp solution that grabs all your required files, strips out the required code, concatanates the needed files, then bundles it correctly into a regular and minified standalone file, then spits it out as a regular 'ol ES5 .js file so it'll work with all modern browsers.  

Plus if you're in active development it, you really don't want to deal with compilers that hack your source code to all hell.


### Modifying the Gulp file
This is only designed to build one "game" file at a time.  Just model it as such.  The .ts file will have all it's import/export data already there but you'll have to reference it in the Gulp file too.  Just do it don't bitch about it.  

```sh
let buildGame = {
  mainFile: 'gameTemplate.ts',
  requiredFiles: ['src/exports/controller.ts', 'src/exports/audio.ts'],    
  exportTo: '../phaser/boilerplate'
}

```

### Also
```sh
You'll need to wrap your main "game" .ts file imports section with the following snippet.

//removeIf(gameBuild)  <---  ADD THIS

// Add imports as usual
import {IO_CONTROLS} from './exports/controller'
import {IO_AUDIO} from './exports/audio'


//endRemoveIf(gameBuild)   <---  ADD THIS
```



### Run
```
This will watch for any changes in the /src folder, so you can build and have it deploy automatically

$ gulp  

or if you want to just run in once 

$ gulp build


```

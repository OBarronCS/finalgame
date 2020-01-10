export default class Renderer {

    constructor(width, height) {
        this.pixiapp = new PIXI.Application({ width: width, height: height, backgroundColor : 0x4d5c63 })


        //Adds it to the DOM
        const displayDiv = document.querySelector('#display')
        displayDiv.appendChild(this.pixiapp.view);
        console.log("Renderer loaded")

        const game_sprites = ["static/images/player.png"];

        PIXI.Loader.shared
            .add(game_sprites)
    }

    getPixiApp() {
        return this.pixiapp;
    }
}


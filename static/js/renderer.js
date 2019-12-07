export default class Renderer {

    constructor(width, height) {
        this.pixiapp = new PIXI.Application({ width: width, height: height })

        //Adds it to the DOM
        const displayDiv = document.querySelector('#display')
        displayDiv.appendChild(this.pixiapp.view);

        const game_sprites = ["static/images/player.png"];

        PIXI.loader
            .add(game_sprites)
            .load(() => {
                console.log("Sprites loaded");
            });
    }

    getPixiApp() {
        return this.pixiapp;
    }
}


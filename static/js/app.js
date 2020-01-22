//This is where the app starts
import ServerConnection from "./serverconnection.js";
import Renderer from "./renderer.js";

const renderer = new Renderer(window.innerWidth - 25,window.innerHeight- 25);
window.renderer = renderer;
window.pixiapp = renderer.getPixiApp();

PIXI.Loader.shared.load(() => {
    console.log("Sprites loaded");

    console.log("Initiating Connection")

    for(let i = 0; i<50;i++){
        const s = new PIXI.Sprite(
            PIXI.Loader.shared.resources["static/images/basic_wall.png"].texture
        );

        s.x = Math.random() * 3000
        s.y = Math.random() * 2000
        window.renderer.addSprite(s,-1)

    }

    //Set this global so other things can access it.

    window.mouse = window.pixiapp.renderer.plugins.interaction.mouse.global

    const server = new ServerConnection();
    server.joinGame();
});

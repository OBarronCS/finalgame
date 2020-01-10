//This is where the app starts
import ServerConnection from "./serverconnection.js";
import Renderer from "./renderer.js";

const renderer = new Renderer(window.innerWidth - 50,window.innerHeight- 50);

PIXI.Loader.shared.load(() => {
    console.log("Sprites loaded");

    console.log("Initiating Connection")
    //Set this global so other things can access it.
    window.pixiapp = renderer.getPixiApp();
    window.mouse = window.pixiapp.renderer.plugins.interaction.mouse.global


    const server = new ServerConnection();
    server.joinGame();

});
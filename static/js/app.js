//This is where the app starts
import ServerConnection from "./serverconnection.js";
import Renderer from "./renderer.js";

const renderer = new Renderer(window.innerWidth - 25,window.innerHeight- 25);
window.pixiapp = renderer.getPixiApp();

PIXI.Loader.shared.load(() => {
    console.log("Sprites loaded");

    console.log("Initiating Connection")
    //Set this global so other things can access it.
    
    window.mouse = window.pixiapp.renderer.plugins.interaction.mouse.global

    const server = new ServerConnection();
    server.joinGame();

    
});

window.onresize = function (event){
    var w = window.innerWidth;
    var h = window.innerHeight;

    //this part resizes the canvas but keeps ratio the same
    window.pixiapp.view.width = w - 25;
    window.pixiapp.view.height = h - 25;

    //window.pixiapp.resize(w,h);
}

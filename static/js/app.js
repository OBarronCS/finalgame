//This is where the app starts
import ServerConnection from "./serverconnection.js";
import Renderer from "./renderer.js";

const renderer = new Renderer(700,400);

document.addEventListener("DOMContentLoaded", () => {
    console.log("Initiating Connection")
    //Set this global so other things can access it.
    window.pixiapp = renderer.getPixiApp();

    const server = new ServerConnection();
    server.joinGame();
});



//This is where the app starts
import ServerConnection from "./serverconnection.js";
import Renderer from "./renderer.js";

document.addEventListener("DOMContentLoaded", () => {
    const renderer = new Renderer(700,400);

    //Set this global so other things can access it.
    window.pixiapp = renderer.getPixiApp();

    const server = new ServerConnection();
    server.joinGame();
});
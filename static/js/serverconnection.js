import MatchConnection from "./matchcontroller.js";

export default class ServerConnection {
    // Adds the display renderer to the screen
    constructor(){
        this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
        this.game = null;

        ///////////////
        window.testtest = this;
        this.time = Date.now();
        //////////////

        window.socket = this.socket;
        this.setSocketListeners();
    }

    joinGame(){
        this.socket.emit("join room", "yes, I would like to join a room please!")
    }
    
    setSocketListeners(){
        this.socket.on('connect', () => {
            console.log("Successfully connnected to the server");
        });

        this.socket.on("join match", (data) => {
            console.log(data);
            this.game = new MatchConnection(this.socket, data);
        })


        ///// TESTING

        this.socket.on("pong", (data) => {
            console.log(Date.now() - this.time);
        });
    }

    ///TESTING PURPOSES
    ping(){
        this.time = Date.now();
        this.socket.emit("ping","hi")
    }

    getSocket(){
        return this.socket();
    }
}
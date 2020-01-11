import MatchConnection from "./matchcontroller.js";

export default class ServerConnection {
    constructor(){
        //this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
        this.socket = io({transports: [ 'websocket' ]});
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

        //Server calls this periodically to get the round trip time
        this.socket.on("p", (data) => {
            console.log("P")
            this.socket.emit("p", data)
        });
        ///// TESTING

        this.socket.on("testpong", (data) => {
            console.log(Date.now() - this.time);
        });
    }

    ///TESTING PURPOSES
    ping(){
        this.time = Date.now();
        this.socket.emit("testping","hi")
    }

    getSocket(){
        return this.socket();
    }
}
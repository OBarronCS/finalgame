import ClientObjectController from "./clientcontroller.js";
import Entity from "./entity.js"

//  An instance of this class are created as you join the game.
const step = 1/60;

export default class MatchConnection {

    //data is what was returned from the request to join this game    
    constructor(socket, data){
        this.entities = {};
        this.socket = socket;

        this.client = new ClientObjectController(data, this);
        this.pixiapp = window.pixiapp;
        
        this.setSocketListeners();
        
        this.delta = 0;
        
        this.loop_bind = this.gameLoop.bind(this);  
        
        this.steps = 0;
        this.lasttimestamp = 0;

        requestAnimationFrame(this.loop_bind)
    }

    gameLoop(this_timestamp){
        requestAnimationFrame(this.loop_bind)
        if(this.steps == 0){
            this.lasttimestamp = this_timestamp;
        }
        this.steps++;
        // time since last frame in ms, around .0167 ussually
        this.delta += (this_timestamp - this.lasttimestamp) / 1000;

        //console.log(this.delta)

        this.lasttimestamp = this_timestamp;

        let stepnum = 0;
        // glitch: sometimes this runs twice, and thus the same input is sent twice
        while(this.delta >= step){
            //console.log("step")
            // update goes here
            // update LOGIC
            // Inputs are being sent through client object, definately change this in a sec
            this.client.processInputs(step);

            this.delta -= step;
            stepnum++;
            // 10 equates to about a sixth of a second
            if(stepnum > 10){
                this.snapback();
            }
        }
    }

    snapback(){
        console.log("You have panicked!")
        // snap back to authoritative state from server
        this.delta = 0;
    }


    setSocketListeners(){
        this.socket.on("gamestate", data => {
            //console.log(data)
            this.processServerMessage(data)
        });
    }

    processServerMessage(serverMessage){

        let removeEntities = serverMessage["remove"]

        for(let i = 0; i < removeEntities.length; i++){
            console.log("deleted a player")
            this.entities[removeEntities[i]].deleteSprite();

            delete this.entities[removeEntities[i]]
        }


        let serverState = serverMessage["state"]
        console.log(serverState)

        for(let i = 0; i < serverState.length; i++){
            ///////////////////////////////////////////////////////
            if(serverState.length > 1){
                //console.log(serverState.length)
            }


            let entity_state = serverState[i]
            let id = entity_state["entity_id"];

            //if this client doesnt have this entity in its list of entites, create one for it,
            if( !this.entities[id] ){
                //later, when have time, make this into a seperate script

                let new_entity = new Entity(entity_state["x"],entity_state["y"],id);
                new_entity.setSprite("static/images/player.png")


                this.entities[id] = new_entity;
            }

            // get reference to local entity with the id of the one sent with info
            let current_entity = this.entities[id]

            // if this client is the entity that was sent to them
            if (this.client.entity_id == id){
                if(entity_state["x"] != this.client.entity.getX()){
                   // console.log(`Server x: ${entity_state["x"]}`)
                   // console.log(`Local x: ${this.client.entity.getX()}`)
                }

                this.client.entity.setPosition(entity_state["x"],entity_state["y"])
                // Here is where reconciliation should occur
            } else {
                //else the current entity is of some other entity then yourself
                current_entity.setPosition(entity_state["x"],entity_state["y"])

                //around here is where you would want to interpolie that stuff
            }

        }
    }
}
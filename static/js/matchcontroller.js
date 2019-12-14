import ClientObjectController from "./clientcontroller.js";
import Entity from "./entity.js"

//  An instance of this class are created as you join the game.
const step = 1/60;

export default class MatchConnection {

    //data is what was returned from the request to join this game    
    constructor(socket, data){
        this.entities = {};

        this.entitylist = [];

        this.socket = socket;

        // Im doing it the steam way, 
        //with everyone being displayed 
        //2 * server_dt in the past.  
        this.lerp_ms = (1/data["tickrate"] * 1000) * 2

        this.client = new ClientObjectController(data, this);
        this.pixiapp = window.pixiapp;
        
        this.setSocketListeners();
        
        this.delta = 0;
        
        this.loop_bind = this.gameLoop.bind(this);  
        
        this.steps = 0;
        this.lasttimestamp = 0;

        // holds dicts of states

        requestAnimationFrame(this.loop_bind)
    }

    gameLoop(this_timestamp){
        requestAnimationFrame(this.loop_bind)
        if(this.steps == 0){
            this.lasttimestamp = this_timestamp;
        }
        this.steps++;

        let now = Date.now();

        // target time to be drawing other entities at
        // time since last frame in ms, around .0167 ussually
        this.delta += (this_timestamp - this.lasttimestamp) / 1000;
        this.lasttimestamp = this_timestamp;

        let stepnum = 0;
        // glitch: sometimes this runs twice, and thus the same input is sent twice
        while(this.delta >= step){
            // Inputs are being sent through client object, definately change this in a sec
            let target_time = now - this.lerp_ms;
    
            this.updateEntities(target_time)
            
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
            //state data is an array holding dicts of entity info
            let stateData = data["state"]
            
            for(let i = 0; i < stateData.length; i++){
                let entity_state = stateData[i]
                let id = entity_state["entity_id"];

                // immediately create entity for new objects
                if( !this.entities[id] ){
                    let new_entity = new Entity(entity_state["x"],entity_state["y"],id);
                    new_entity.setSprite("static/images/player.png")
    
                    this.entities[id] = new_entity;
                    this.entitylist.push(new_entity)
                }

                let current_entity = this.entities[id]
 
                if (this.client.entity_id == id){
                    this.client.entity.setPosition(entity_state["x"],entity_state["y"])
                } else {
                    current_entity.state_buffer.push([data["timestamp"],entity_state])
                }
            }

            //immediately removes entities that have disconnected
            let removeEntities = data["remove"]

            for(let i = 0; i < removeEntities.length; i++){
                console.log("deleted a player")
                this.entities[removeEntities[i]].deleteSprite();

                delete this.entities[removeEntities[i]]

                for(let j = 0; j < this.entitylist.length;j++){
                    if(this.entitylist[j] == removeEntities[i]){
                        this.entitylist.splice(j,1)
                    }
                }
            }
        });
    }

    updateEntities(target_time){
        for(let i = 0; i < this.entitylist.length; i++){
            //entitylist does not include us.
            this.entitylist[i].interpolate(target_time);
        }
    }
}
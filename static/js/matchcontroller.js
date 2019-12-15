import ClientObjectController from "./clientcontroller.js";
import Entity from "./entity.js"

//  An instance of this class are created as you join the game.
const step = 1/60;

export default class MatchConnection {

    //data is what was returned from the request to join this game    
    constructor(socket, data){
        
        // time in ms
        this.time_ms = data["timestamp"]
        this.entities = {};
        this.last_server_time = data["timestamp"]

        this.entitylist = [];

        this.socket = socket;

        // Im doing it the steam way, 
        //with everyone being displayed 
        //2 * server_dt in the past.  
        this.lerp_ms = ((1/data["tickrate"]) * 1000) * 4        
        console.log(this.lerp_ms)

        // USE FOR CLOCK SYNCING
        this.ticksperupdate = 60 / data["tickrate"];

        this.client = new ClientObjectController(data, this);
        this.pixiapp = window.pixiapp;
        
        this.setSocketListeners();
        
        this.delta = 0;
        
        this.loop_bind = this.gameLoop.bind(this);  
        
        this.steps = 0;
        this.lasttimestamp = 0;
        this.test = 0;

        this.clock_delta = []
        // holds dicts of states

        requestAnimationFrame(this.loop_bind)
    }

    gameLoop(this_timestamp){
        requestAnimationFrame(this.loop_bind)
        if(this.steps == 0){
            this.lasttimestamp = this_timestamp;
        }
        this.steps++;

        // target time to be drawing other entities at
        // time since last frame in ms
        let dt_ms = (this_timestamp - this.lasttimestamp)

        this.delta += dt_ms / 1000;

        //Clock syncing
        //holds last 40 packet delta, discards older ones
        while(this.clock_delta.length > 20){
            this.clock_delta.shift();
        }

        let sum = 0;
        let amount = this.clock_delta.length

        for(let i = 0; i < amount; i++){
            sum += this.clock_delta[i];
        }

        let average_delta = sum / (amount + 1)


        // If we have converged over 200 ms...., snap back to last server time (mostly happens when browser loses focus)
       if(Math.abs(average_delta) > 200){
            //snaps back time to last server time
            average_delta = 0;

            //clears the data of clock data
            this.clock_delta = [];

            this.time_ms = this.last_server_time;
        }

        let delta_per_step = average_delta / this.ticksperupdate;

        //max amount of change is 10%
        let maxtween = dt_ms * .1;

        let compensation = -Math.sign(average_delta) * Math.min(maxtween, Math.abs(delta_per_step))
        console.log(delta_per_step)

        this.time_ms += dt_ms + compensation;



        let stepnum = 0;
        // ensures if refresh rate is about 60 that it only runs this often
        if(this.delta >= step){            
            let target_time = this.time_ms - this.lerp_ms;
            
            this.updateEntities(target_time)
            
            this.client.processInputs(step);

            this.delta -= step;
            stepnum++;
            // 10 equates to about a sixth of a second
            if(stepnum > 10){
                this.snapback();
            }
        }
        this.lasttimestamp = this_timestamp;
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
            this.last_server_time = data["timestamp"];
            let stateData = data["state"]
            this.clock_delta.push(this.time_ms -  data["timestamp"])
            //console.log(this.time_ms -  data["timestamp"])

            //this.time_ms = data["timestamp"]
            
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

                for(let j = 0; j < this.entitylist.length; j++){
                    if(this.entitylist[j].entity_id == removeEntities[i]){
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
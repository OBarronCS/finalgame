import ClientObjectController from "./clientcontroller.js";
import Entity from "./entity.js"

//  An instance of this class are created as you join the game.
const step = 1/60;

export default class MatchConnection {

    //data is what was returned from the request to join this game    
    constructor(socket, data){
        this.entities = {};
        this.entitylist = [];

        this.time_ms = data["timestamp"]
        this.last_server_time = data["timestamp"]

        // use in clock syncing
        this.ideal_time_ms = data["timestamp"]
        this.current_time_offset = 0;

        this.socket = socket;
        

        this.start_comp = false;

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

        this.clock_delta = []

        requestAnimationFrame(this.loop_bind)
    }

    gameLoop(this_timestamp){
        requestAnimationFrame(this.loop_bind)
        if(this.steps == 0){
            this.lasttimestamp = this_timestamp;
        }
        this.steps++;

        let dt_ms = (this_timestamp - this.lasttimestamp)
        this.delta += dt_ms / 1000;

        //make sure our client 'clock' time is not changing by too much different to real time
        let maxtween = dt_ms * .25;

        //the time we want to be at
        this.ideal_time_ms = this.time_ms - this.current_time_offset;
        //console.log( this.current_time_offset)

        let compensation = 0
        if(this.start_comp){
            compensation = -Math.sign(this.current_time_offset) * Math.min(maxtween, Math.abs(this.current_time_offset))
            this.current_time_offset += compensation

            if(this.current_time_offset == 0){
                this.start_comp = false;
                console.log("CLEAR")
                this.clock_delta = [];
            }
        }


        
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

    medianClockDelta(){
        // have to copy array in this method!

        while(this.clock_delta.length > 20){
            this.clock_delta.shift();
        }

        const array = [...this.clock_delta];

        if(array.length ===0) return 0;

        array.sort(function(a,b){
          return a-b;
        });
      
        var half = Math.floor(array.length / 2);
      
        if (array.length % 2)
          return array[half];
      
        return (array[half - 1] + array[half]) / 2.0;
      }

    setSocketListeners(){
        this.socket.on("gamestate", data => {
            this.last_server_time = data["timestamp"];
            let stateData = data["state"]

            this.clock_delta.push(this.time_ms - data["timestamp"])
        
            // Update the rate that our time increases here
            let median_delta = this.medianClockDelta()
            //console.log(`Current delta: ${this.time_ms - data["timestamp"]}`)
            console.log("MEDIAN")
            console.log(median_delta)

            if(Math.abs(median_delta) > 100){
                this.clock_delta = [];
                this.time_ms = data["timestamp"];
                this.current_time_offset = 0;
            } 

            // if my clock is off by 20 ms, update our compensation rate
            if(Math.abs(median_delta) > 20 && this.clock_delta.length >= 10){        
                // if we are diverged too far suddenly, just snapped back to last info we had
                //if this is positive, we are a bit ahead of the clock
                //if this is negative, we are a bit behind the clock
                this.current_time_offset = median_delta;
                this.start_comp = true;
                
            }


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
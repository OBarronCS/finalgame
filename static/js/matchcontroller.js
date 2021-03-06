import ClientObjectController from "./clientcontroller.js";
import Entity from "./entity.js"
import HitScan from "./hitscan.js";
import FixedEntity from "./fixedentity.js"
import TileMap from "./tilemap.js";

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

        this.lerp_ms = ((1/data["tickrate"]) * 1000) * (2)        
        console.log(this.lerp_ms)

        // USE FOR CLOCK SYNCING
        this.ticksperupdate = 60 / data["tickrate"];

        this.client = new ClientObjectController(data, this);
        this.tilemap = new TileMap(this, data)

        this.setSocketListeners();
        
        this.delta = 0;
        
        this.loop_bind = this.gameLoop.bind(this);  
        
        this.steps = 0;
        this.lasttimestamp = 0;

        this.clock_delta = []

        this.ping_text = new PIXI.Text("Ping: ", {fontFamily : 'Arial', fontSize: 16, fill : 0xff1010, align : 'center'})

        this.ping_text.x = 6
        this.ping_text.y = 10

        window.renderer.addGUI(this.ping_text);

        this.ping = 0;

        this.tick_objects = []

        requestAnimationFrame(this.loop_bind)
    }

    // deletes the object from the list
    deleteTickingObject(obj){
        let i;
        for(i = 0;i  < this.tick_objects.length; i++){
            if(obj == this.tick_objects[i]){
                this.tick_objects.splice(i,1)
                return;
            }
        }
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
        let maxtween = dt_ms * .1;

        //the time we want to be at, this is not used rn, but maybe later when simplifying code
        this.ideal_time_ms = this.time_ms - this.current_time_offset;
        //console.log( this.current_time_offset)

        let compensation = 0
        if(this.start_comp){
            compensation = -Math.sign(this.current_time_offset) * Math.min(maxtween, Math.abs(this.current_time_offset))
            this.current_time_offset += compensation

            if(this.current_time_offset == 0){
                // this means that our time has now hit the ideal_time_ms basically, and we are synced based on the data we know
                // in future add a smart_compensation var because at it is, user clock goes back to moving at own pace, which may cause it to diverge again
                this.start_comp = false;
                console.log("At ideal")
                this.clock_delta = [];
            }
        }


        
        this.time_ms += dt_ms + compensation;
        

        let stepnum = 0;
        // ensures if refresh rate is above 60 that it only runs this often
        if(this.delta >= step){ 
            let i;
            for(i = 0; i < this.tick_objects.length;i++){
                this.tick_objects[i].tick(this.time_ms);
            }
            



            let target_time = this.time_ms - this.lerp_ms;
            
            this.updateEntities(target_time)
            
            this.client.processInputs(step);

            this.delta -= step;
            stepnum++;
            // 10 equates to about a sixth of a second
            if(stepnum > 10){
                this.snapback();
            }
            const e = this.client.entity
            window.renderer.updateScreen(e, this.tilemap)
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
        this.socket.on("gamestate", message => {

            let verified_input = message["pvt"]["v_id"]
            this.ping = message["pvt"]["p"] / 2
            this.ping_text.text = `Ping: ${this.ping}ms`;

            let data = message["game"]

            this.last_server_time = data["timestamp"];
            let stateData = data["state"]

            this.clock_delta.push(this.time_ms - data["timestamp"])
        
            // Update the rate that our time increases here
            let median_delta = this.medianClockDelta()
            //console.log(`Current delta: ${this.time_ms - data["timestamp"]}`)
            //console.log(`Median delta: ${median_delta}, ${this.clock_delta.length}`)

            // if we are diverged too far suddenly, just snapped back to last info we had

            // should replace these magic numbers
            // if my clock is off by 25 ms, a 40th of a second, update our compensation rate
            if(Math.abs(median_delta) > 100){
                console.log("Snapped clock")
                this.clock_delta = [];
                this.time_ms = data["timestamp"];
                this.current_time_offset = 0;
                this.start_comp = false;
            } else if(Math.abs(median_delta) > 25 && this.clock_delta.length >= 20){        
                //if this is positive, we are a bit ahead of the clock
                //if this is negative, we are a bit behind the clock
                if(!this.start_comp){
                    this.current_time_offset = median_delta;
                    this.start_comp = true;
                }
            }

            //make a seperate event handler later
            let k;
            let events = message["game"]["e"]

            for(k = 0; k < events.length; k++){
                const id = events[k][0];


                if(id == 0){ // create hitscan
                    new HitScan(this, [ events[k][1], events[k][2] ], events[k][3] )
                } else if(id == 1){ //delete player
                    //immediately removes entities that have disconnected
                    console.log("deleted a player")
                    this.entities[events[k][1]].cleanUp();

                    delete this.entities[events[k][1]]

                    for(let j = 0; j < this.entitylist.length; j++){
                        if(this.entitylist[j].entity_id == events[k][1]){
                            this.entitylist.splice(j,1)
                        }
                    }  
                } else if(id == 2){ //player damaged
                    console.log("damaged")
                    // THIS SYSTEM WAS MOVED TO BE CONSTANT INFO STREAM
                    /*
                    let e = this.entities[events[k][1]]
                    if(e != null){
                        e.health = events[k][2];
                    }
                    */
                } else if(id == 3){ // create projectile
                    new FixedEntity(this, events[k][1], events[k][2], events[k][3], events[k][4], events[k][5], events[k][6], events[k][7])
                } // TODO: Player Death
                else {
                    console.log("Unsupported Event Received")
                }
            }

            for(let i = 0; i < stateData.length; i++){
                let entity_state = stateData[i]
                let id = entity_state["e_id"];

                // immediately create entity for new objects
                if( !this.entities[id] ){
                    let new_entity = new Entity(entity_state["x"],entity_state["y"],id);
                    new_entity.max_health = entity_state["h"]
                    new_entity.setSprite("static/images/player.png")
    

                    this.entities[id] = new_entity;
                    this.entitylist.push(new_entity)
                }

                let current_entity = this.entities[id]
 
                // console.log(entity_state["h"])

                if (this.client.entity_id == id){
                    //if it is us, reconcile our position with client side prediction
                    this.client.reconcile(entity_state,verified_input)
                    this.client.entity.updateHealth(entity_state["h"])
                } else {
                    current_entity.state_buffer.push([data["timestamp"],entity_state])
                    current_entity.updateHealth(entity_state["h"])
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
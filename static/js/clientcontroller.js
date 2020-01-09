import ClientInputListener from "./clientinput.js";
import Entity from "./entity.js";

// This deals with everything specifically to do with the object that the client controls.

export default class ClientObjectController {

    //{"player_id":new_client.player_id,"state": BELOW})
    //{"entity_id":self.entity_id, "x":self.x, "y": self.y}
    constructor(data, match){
        this.input = new ClientInputListener();
        this.match = match;
        

        this.entity_id = data["player_id"];

        let new_entity = new Entity(data["state"]["x"], data["state"]["y"],data["player_id"]);
		new_entity.setSprite("static/images/player.png");
        
        this.entity = new_entity;

		// Add this entity to the clients list of entities
        match.entities[data["player_id"]] = new_entity;
        
        

        // stores all the ones the server has yet to verify with us.
        // form: [0] = input number [1] is the input itself
        this.unauthorized_inputs = [];
        this.input_number = 0;

        this.speed = 75;

        this.adjust_x = 0;
        this.adjust_y = 0;
        this.adjusting = false;
        /* some more commands to know
		//app.stage.removeChild(anySprite)
		//anySprite.visible = false;

		// place where WEB-GL texture caches are stored:
		//let texture = PIXI.utils.TextureCache["images/anySpriteImage.png"];
		//let sprite = new PIXI.Sprite(texture);

        */
    }

    getInput(){
        return this.input.getMovementState();
    }

    processInputs(dt){
        //not only process inputs, but interpolate me a bit
          //this code slowly adjusts our position to where we should be
        if(this.adjusting){
            console.log("adjust loop")
            const maxtween_x = .1 * this.adjust_x;
            const maxtween_y = .1 * this.adjust_y;

            let cx = this.entity.getX();
            let cy = this.entity.getY();
    
            //how much we should move our charaacter in each axis to get to a ideal location points
            let comp_x = -Math.sign(this.adjust_x) * Math.min(Math.abs(maxtween_x), Math.abs(this.adjust_x))
            let comp_y = -Math.sign(this.adjust_y) * Math.min(Math.abs(maxtween_y), Math.abs(this.adjust_y))
           
            this.adjust_x += comp_x;
            this.adjust_y += comp_y;

            cx += comp_x;
            cy += comp_y;

            if(Math.abs(this.adjust_x) < .01 && Math.abs(this.adjust_y) < .01){
                this.adjusting = false;
            }
    
            this.entity.setPosition(cx,cy);
            console.log(this.entity.getPosition())
        }


        //console.log(`There are ${this.unauthorized_inputs.length} unauthorized inputs`)

        if(this.entity == null){
            return;
        }

        let sample_input = this.input.getMovementState();

        if(sample_input != false){
            //Client side prediction here
            this.applyInput(sample_input)

            this.unauthorized_inputs.push([this.input_number,sample_input, this.entity.getX(), this.entity.getY()])
          
            this.input_number += 1;

            window.socket.emit("cmd", sample_input.horz, sample_input.vert, this.input_number)
            
        }
    }

    //get server state and last authorized input, and from that get our current position
    reconcile(entity_state, verified_num){
        // discard all the inputs that have been implicitly verified on the server,
        // because they are less than or equal to this one (websockets guarentees order
        if(this.unauthorized_inputs.length == 0){
            return;
        }

        //if our first one is greater than the num, that means we have already discarded it.. 
        //which happens when we snap back
        if(this.unauthorized_inputs[0][0] > verified_num){
            console.log("AIUSUGIY ADFIUASGFKu")
            return;
        }
        
        while(this.unauthorized_inputs.length > 0 && this.unauthorized_inputs[0][0] < verified_num){
            this.unauthorized_inputs.shift()
        }
        // go through the unauthorized_inputs and apply them to get a more accurate position
        // only if we are a substantial distance from the server state

        // at this point, 0 index should = the verified_num

        if(this.unauthorized_inputs.length == 0){
            return;
        }

        const _x = Math.round(this.unauthorized_inputs[0][2])
        const _y = Math.round(this.unauthorized_inputs[0][3])

        const distance = Math.sqrt(Math.pow(_x - entity_state["x"],2) + (Math.pow(_y - entity_state["y"],2)))

        console.log("Discrepency: " + distance)

        //if get to far away , , , snap back
        if(distance > 40){
            // snap reconciliation
            console.log("SNAP RECONCILIATION");
            this.entity.setPosition(entity_state["x"],entity_state["y"]);

            this.unauthorized_inputs = [];
            // clears this stuff

            this.adjusting = false;
            this.adjust_x = 0;
            this.adjust_y = 0;

            return;
        }

        if(distance > 10 && !this.adjusting){
            console.log("ADJUSTING")

            // these nums tell us how much ahead we are on each axis 
            this.adjust_x = _x - entity_state["x"]; // how much we need to move to be at our desired location
            this.adjust_y = _y - entity_state["y"];
            this.adjusting = true;
            // OLD CODE BELOW
            /*
            this.entity.setPosition(entity_state["x"],entity_state["y"])
            
            this.unauthorized_inputs.shift();

            let i;
            for(i = 0; i < this.unauthorized_inputs.length; i++){
                this.applyInput(this.unauthorized_inputs[i][1]);
            }
            */
        }
    }

    applyInput(input){
        if(this.entity == null){
            return;
        }

        let cx = this.entity.getX();
        let cy = this.entity.getY();

        cx += this.speed * (input["horz"]/60)
        cy += this.speed * (input["vert"]/60)

        this.entity.setPosition(cx,cy)
    }

    update_state(){
        if(this.entity = null){
            return;
        }

        this.processInputs();
    }
}
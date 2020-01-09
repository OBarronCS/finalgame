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

        this.speed = 50;
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
        console.log(`There are ${this.unauthorized_inputs.length} unauthorized inputs`)

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
        // because they are less than or equal to this one (websockets guarentees order)
        if(this.unauthorized_inputs.length == 0){
            return;
        }
        
        while(this.unauthorized_inputs.length > 0 && this.unauthorized_inputs[0][0] < verified_num){
            this.unauthorized_inputs.shift()
        }
        // go through the unauthorized_inputs and apply them to get a more accurate position
        // only if we are a substantial distance from the server state

        // at this point, 0 index should = the last unnauthored input

        if(this.unauthorized_inputs.length == 0){
            return;
        }

        const distance = Math.sqrt((Math.pow(this.unauthorized_inputs[0][2] - entity_state["x"],2) + (Math.pow(this.unauthorized_inputs[0][3] - entity_state["y"],2))))

        if(distance > 10){
            this.entity.setPosition(entity_state["x"],entity_state["y"])
            
            this.unauthorized_inputs.shift();


            let i;
            for(i = 0; i < this.unauthorized_inputs.length; i++){
                this.applyInput(this.unauthorized_inputs[i][1]);
            }
        }
    }

    //this is client side prediction for movement
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
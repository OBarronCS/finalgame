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
        
        this.input_number = 0;
        this.pending_inputs = [];
        this.speed = 300;
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
        if(this.entity == null){
            return;
        }

        let sample_input = this.input.getMovementState();

        if(sample_input != false){
            // the toFixed just rounds the float so it is not huge
            //this.applyInput(sample_input,dt)
            
            let data = {"movement":sample_input, "input_num":this.input_number}
            //let data = {"movement":{"horz":1, "vert":0}, "input_num":this.input_number}
            this.input_number += 1;

            window.socket.emit("movement", data)
        }
    }

    applyInput(input,dt){
        if(this.entity == null){
            return;
        }

        let cx = this.entity.getX();
        let cy = this.entity.getY();

        cx += this.speed * input["horz"] * dt;
        cy += this.speed * input["vert"] * dt;

        this.entity.setPosition(cx,cy)
    }

    update_state(){
        if(this.entity = null){
            return;
        }

        this.processInputs();
    }
}
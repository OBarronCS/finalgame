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
        
        this.input_sequence_number = 0;
        this.pending_inputs = [];
    }

    getInput(){
        return this.input.getMovementState();
    }

    processInputs(dt){
        if(this.entity == null){
            return;
        }

        if(this.input.movement_positive()){
            //Right now, this does nothing mate
            let movement = this.input.getMovementState();

            let data = {"entity_id":this.entity_id,"movement":movement, "dt": dt, "input_sequence_num":this.input_sequence_number}
            this.input_sequence_number += 1;

            window.socket.emit("movement", data)
        }
    }

    update_state(){
        if(this.entity = null){
            return;
        }

        this.processInputs();
    }
}
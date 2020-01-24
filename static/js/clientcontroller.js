import ClientInputListener from "./clientinput.js";
import Entity from "./entity.js";
import HitScan from "./hitscan.js";
import FixedEntity from "./fixedentity.js"
import Renderer from "./renderer.js";

// This deals with everything specifically to do with the object that the client controls.

export default class ClientObjectController {

    //{"player_id":new_client.player_id,"state": BELOW})
    //{"entity_id":self.entity_id, "x":self.x, "y": self.y}
    constructor(data, match){
        this.input = new ClientInputListener();
        this.match = match;
        
        ///------- Adds the rectangle showing where you are actually aiming
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(2, 0xFF0000);
        window.renderer.addSprite(this.graphics, 1);

        //0, 0 in reference to this object
        /*
        this.graphics.drawRect(0, 0, 12, 12);
        // MAKE SURE THESE ARE HALF OF WIDTH SO MOUSE STAYS IN MIDDLE
        this.graphics.pivot.x = 6
        this.graphics.pivot.y = 6
        */
        //graphics.beginFill(color hex code);

        //LINES
        this.posline = new PIXI.Graphics();
        this.posline.lineStyle(1, 0xFFFFFF);
        this.posline.alpha = .2
        this.posline.lineTo(250, 0);
        window.renderer.addSprite(this.posline,0);
        

        this.negline = new PIXI.Graphics();
        this.negline.lineStyle(1, 0xFFFFFF);
        this.negline.alpha = .2
        this.negline.lineTo(250, 0);
        window.renderer.addSprite(this.negline,0);

        this.entity_id = data["player_id"];

        let new_entity = new Entity(data["state"]["x"], data["state"]["y"],data["player_id"]);
		new_entity.setSprite("static/images/player.png");
        
        this.entity = new_entity;

		// Add this entity to the clients list of entities
        match.entities[data["player_id"]] = new_entity;
        
        
        //max degrees per step can turn
        this.max_angle_turn = 2.5

        // amount of degrees each way that I can "see/aim"
        this.max_angle_view = 20

        // stores all the ones the server has yet to verify with us.
        // form: [0] = input number [1] is the input itself
        this.unauthorized_inputs = [];
        this.input_number = 0;
        this.last_verified_num = -1;

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
        this.entity.updateHealth();


        if(this.adjusting){
            //console.log("adjust loop")
            const maxtween_x = .1 * 2.5//this.adjust_x;
            const maxtween_y = .1 * 2.5//this.adjust_y;

            let cx = this.entity.getX();
            let cy = this.entity.getY();
    
            //how much we should move our charaacter in each axis to get to a ideal location points
            let comp_x = -Math.sign(this.adjust_x) * Math.min(Math.abs(maxtween_x), Math.abs(this.adjust_x))
            let comp_y = -Math.sign(this.adjust_y) * Math.min(Math.abs(maxtween_y), Math.abs(this.adjust_y))
           
            this.adjust_x += comp_x;
            this.adjust_y += comp_y;

            cx += comp_x;
            cy += comp_y;

            if(Math.abs(this.adjust_x) < .1 && Math.abs(this.adjust_y) < .1){
                this.adjusting = false;
            }
    
            this.entity.setPosition(cx,cy);
        }

        const mousepoint = this.input.getMousePoint();

        let mouseangle = Math.atan2(mousepoint.x - this.entity.getX(),- mousepoint.y + this.entity.getY());
        mouseangle *= (180/Math.PI)
        mouseangle -= 90

        //mouseangle now = angle to mouse in degrees

        //difference between current angle and angle to mouse
        const angledif = parseFloat(((this.entity.getAngle() - mouseangle + 540) % 360 - 180).toFixed(3));
        
        let angle_delta = Math.min(Math.abs(angledif), Math.abs(this.max_angle_turn)).toFixed(3);
        
        angle_delta *= -Math.sign(angledif);


        this.entity.turnByDegrees(angle_delta)

        const new_angledif = parseFloat(((this.entity.getAngle() - mouseangle + 540) % 360 - 180).toFixed(3));

        ///// ----------- DRAWING THE AIM RECTANGL

        //distance from player to mouse
        const mouse_dis = Math.sqrt(Math.pow(mousepoint.x - this.entity.x,2) + (Math.pow(mousepoint.y - this.entity.y,2)))
        
        //clear completely clears all settings and past draw things with this object
        this.graphics.x = this.entity.x;
        this.graphics.y = this.entity.y;
        
        this.graphics.clear()
        this.graphics.lineStyle(2, 0xFF0000);
        this.graphics.pivot.x = 6
        this.graphics.pivot.y = 6
        
        
        let rect_angle = parseFloat(Math.min(this.max_angle_view, Math.abs(new_angledif)).toFixed(3));

        this.graphics.angle = this.entity.getAngle() + -(Math.sign(new_angledif) * rect_angle)
        
        this.graphics.drawRect(mouse_dis, 0, 12, 12);


        /// ----- CALCING TARGET LOCATION---- ///
        let target_x = this.entity.getX() + (mouse_dis * Math.cos((Math.PI/180)*this.graphics.angle));
        let target_y = this.entity.getY() + (mouse_dis * Math.sin((Math.PI/180)*this.graphics.angle));
        //console.log(`${target_x},${target_y}`)


        this.posline.clear()
        this.negline.clear()

        if(this.graphics.angle == this.entity.getAngle() + this.max_angle_view || this.graphics.angle == this.entity.getAngle() - this.max_angle_view){
            
            this.posline.lineStyle(1, 0xFFFFFF);
            this.posline.alpha = .2
            this.posline.lineTo(250, 0);
            this.posline.x = this.entity.x;
            this.posline.y = this.entity.y
            this.posline.angle = this.entity.getAngle() + this.max_angle_view;
    
            this.negline.lineStyle(1, 0xFFFFFF);
            this.negline.alpha = .2
            this.negline.lineTo(250, 0);
            this.negline.x = this.entity.x;
            this.negline.y = this.entity.y
            this.negline.angle = this.entity.getAngle() - this.max_angle_view;
        }


        

        //console.log(`There are ${this.unauthorized_inputs.length} unauthorized inputs`)

        if(this.entity == null){
            return;
        }

        let sample_input = this.input.getMovementState();

        if(angle_delta == -0){
            angle_delta = 0;
        }

        // happens when renderer breaks. would break server rn becuase not validating inputs
        if(isNaN(angle_delta)){
            return;
        }



        const mousedown = this.input.getMouseDown();

        if(mousedown){
            //new HitScan(this.match, [this.entity.getX(), this.entity.getY()],this.graphics.angle)
            //new FixedEntity(this.match, this.entity.getX(),this.entity.getY(),this.entity.getAngle())
        }


        if(sample_input != false || angle_delta != 0 || mousedown){
            //Client side prediction here
            if(sample_input == false){
                sample_input = { "horz": 0, "vert": 0 }
            }

            this.applyInput(sample_input)

            this.unauthorized_inputs.push([this.input_number,sample_input, this.entity.getX(), this.entity.getY()])
          
           

            window.socket.emit("cmd", sample_input.horz, sample_input.vert, this.input_number, angle_delta, mousedown)
            this.input_number += 1;
        }
    }

    //get server state and last authorized input, and from that get our current position
    reconcile(entity_state, verified_num){
        if(this.last_verified_num == verified_num){
            return;
        }

        this.last_verified_num = verified_num;

        if(this.unauthorized_inputs.length == 0){
            //console.log("0 to start")
            return;
        }

        //if our first one is greater than the num, that means we have already discarded it.. 
        //which happens when we snap back
        if(this.unauthorized_inputs[0][0] > verified_num){
            //console.log("middle")
            return;
        }
        
        while(this.unauthorized_inputs.length > 0 && this.unauthorized_inputs[0][0] < verified_num){
            this.unauthorized_inputs.shift()
        }
        // at this point, 0 index should = the verified_num

        if(this.unauthorized_inputs.length == 0){
           // console.log("last")
            return;
        }

        const _x = Math.round(this.unauthorized_inputs[0][2])
        const _y = Math.round(this.unauthorized_inputs[0][3])

        const distance = Math.sqrt(Math.pow(_x - entity_state["x"],2) + (Math.pow(_y - entity_state["y"],2)))


        // console.log(distance)
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
        } else if(distance > 10 && !this.adjusting){
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
const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;

export default class Entity {

    constructor(x,y, entity_id){
        this.x = x;
        this.y = y;
        this.entity_id = entity_id;
        this.sprite = null
        this.angle = 0;

        // holds timestamped coordinate data for this client, held for the past 1 second.
        this.state_buffer = []
        // first index is timestamp, second is info
    }

    interpolate(target_time){
        //if have enough info to interpolate them
        //console.log(this.state_buffer.length)

        if(this.state_buffer.length >= 2){
            while(this.state_buffer.length > 2 && target_time >= this.state_buffer[1][0]){
                // removes first index
                this.state_buffer.shift();
            }


            // target time should now be between index 0 and 1

            let fraction = (target_time - this.state_buffer[0][0]) / (this.state_buffer[1][0] - this.state_buffer[0][0])
            
            // total changes over the two periods
            let delta_x = this.state_buffer[1][1]["x"] - this.state_buffer[0][1]["x"];
            let delta_y = this.state_buffer[1][1]["y"] - this.state_buffer[0][1]["y"];

            this.setPosition(this.state_buffer[0][1]["x"] + (delta_x * fraction),this.state_buffer[0][1]["y"] + (delta_y * fraction));
        } else {
            this.setPosition(this.state_buffer[0][1]["x"],this.state_buffer[0][1]["y"])
        }
    }

    setAngleRadians(angle){

        this.sprite.rotation = angle
    }

    deleteSprite(){
        window.pixiapp.stage.removeChild(this.sprite)
    }

    //none of this takes into considering anything smooth or good looking
    setPosition(new_x, new_y){
        this.x = new_x;
        this.y = new_y;

        if(this.sprite != null){
            this.sprite.x = new_x;
            this.sprite.y = new_y;
        }
    }

    setSprite(filepath_string){
        this.sprite = new Sprite(
            resources[filepath_string].texture
        );

        this.sprite.x = this.x
        this.sprite.y = this.y

        // set origin to middle
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        window.pixiapp.stage.addChild(this.sprite)

    }

    getPosition(){
        return `${this.x},${this.y}`
    }

    getX(){
        return this.x;
    }
    getY(){
        return this.y;
    }
}
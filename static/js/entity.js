const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;

export default class Entity {

    constructor(x,y, entity_id){
        this.x = x;
        this.y = y;
        this.entity_id = entity_id;
        this.angle = 0;

        this.radius = 11;

        this.health = 100;

        this.sprite = null
        
        // holds timestamped coordinate data for this client, held for the past 1 second.
        this.state_buffer = []

        // HEALTH INFO
        this.health_text = new PIXI.Text(`HP: ${this.health}`, {fontFamily : "\"Lucida Console\", Monaco, monospace", fontSize: 8, fill : 0x5298fa})

        this.health_back = new PIXI.Graphics();
        window.renderer.addSprite(this.health_back,0);

        this.health_front = new PIXI.Graphics();
        window.renderer.addSprite(this.health_front,0);
        
        
        this.health_length = 28

        this.health_text.x = this.x - 14
        this.health_text.y = this.y - 30

        window.renderer.addSprite(this.health_text,0);

        // first index is timestamp, second is info
    }

    updateHealth(){
        this.health_back.clear()
        this.health_front.clear()

        this.health_back.beginFill(0x000000)
        this.health_back.drawRect(this.x - (this.health_length / 2), this.y - 21, this.health_length, 6)
        this.health_back.endFill()

        this.health_front.beginFill(0x1cbd5a)
        this.health_front.drawRect(this.x - (this.health_length / 2), this.y - 21, (Math.max(0,this.health)/100) * this.health_length, 6)
        this.health_front.endFill()


        this.health_text.text = `HP: ${this.health}`

        this.health_text.x = this.x - 14
        this.health_text.y = this.y - 30
    }

    // this function is called every step
    interpolate(target_time){
        this.updateHealth();

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

            const angle0 = this.state_buffer[0][1]["a"]
            const angle1 = this.state_buffer[1][1]["a"]

            let angledif = (angle1 - (angle0) + 540) % 360 - 180;

            this.setPosition(this.state_buffer[0][1]["x"] + (delta_x * fraction),this.state_buffer[0][1]["y"] + (delta_y * fraction));
            
            let a = this.getAngle();
            
            this.setAngleDegrees(angle0 + (angledif * fraction))

            //console.log(this.getAngle() - a)
            
        } else {
            this.setPosition(this.state_buffer[0][1]["x"],this.state_buffer[0][1]["y"])
        }
    }

    turnByDegrees(degrees){
        this.setAngleDegrees(this.angle + degrees)
    }

    setAngleDegrees(angle){
        this.angle = angle;

        if(this.angle > 360){
            this.angle -= 360
        }
        if(this.angle < 0){
            this.angle += 360;
        }

        this.sprite.angle = angle
    }

    cleanUp(){
        this.deleteSprite()
        this.health_front.destroy()
        this.health_back.destroy()
        this.health_text.destroy()

    }

    deleteSprite(){
        window.renderer.removeSprite(this.sprite)
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

        window.renderer.addSprite(this.sprite,0)

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

    getHitBox(){
        return {"right":this.x + this.radius, "top":this.y - this.radius, "left":this.x - this.radius, "bottom":this.y + this.radius, }
    }


    getAngle(){
        return this.angle
    }
}
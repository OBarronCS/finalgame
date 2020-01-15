// Will represent an entity that we got the initial timestamp, position, and velocity of, so I can 
// predict its actual location until it disappears or server sends event to destroy it
const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;


"static/images/basic_proj.png"

export default class FixedEntity {

    constructor(match, x,y, spd, angle, time, max_dis){
        this.initial_x = x
        this.initial_y = y;
        this.x = x;
        this.y = y;
        this.speed = spd
        this.angle = angle
        this.initial_time = time;
        this.max_dis = max_dis
        this.sprite = null

        this.setSprite("static/images/basic_proj.png")

        this.sprite.angle = this.angle

        this.match = match
        
        this.inc_x = this.speed * Math.cos(angle * (Math.PI/180))
        this.inc_y = this.speed * Math.sin(angle * (Math.PI/180))

        match.tick_objects.push(this)

        this.ticks = 0;
    }

    tick(current_time){
        const delta = (current_time - this.initial_time) / 1000 // to convert to seconds
        console.log(delta)

        this.setPosition(this.initial_x + (delta * this.inc_x), this.initial_y + (delta * this.inc_y))

    }

    destroy(){
        this.match.deleteTickingObject(this)

        window.pixiapp.stage.removeChild(this.sprite)
    }

    setPosition(new_x, new_y){
        this.x = new_x;
        this.y = new_y;

        const a = new_x - this.initial_x;
        const b = new_y - this.initial_y;

        const c = Math.sqrt( a*a + b*b );
        if(c > this.max_dis){
            this.destroy()
            return;
        }

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
}
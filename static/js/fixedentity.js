// Will represent an entity that we got the initial timestamp, position, and velocity of, so I can 
// predict its actual location until it disappears or server sends event to destroy it
const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;


"static/images/basic_proj.png"

export default class FixedEntity {

    constructor(match, x,y, angle){
        this.x = x;
        this.y = y;
        this.angle = angle
        this.sprite = null
        this.setSprite("static/images/basic_proj.png")

        this.sprite.angle = this.angle

        this.match = match
        this.speed = 40
        
        this.inc_x = this.speed * Math.cos(angle * (Math.PI/180))
        this.inc_y = this.speed * Math.sin(angle * (Math.PI/180))

        match.tick_objects.push(this)

        this.ticks = 0;
    }

    tick(){
        this.setPosition(this.x + this.inc_x, this.y + this.inc_y)

        if(this.ticks++ == 21){
            this.destroy()
        }
    }

    destroy(){
        this.match.deleteTickingObject(this)

        window.pixiapp.stage.removeChild(this.sprite)
    }

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
}
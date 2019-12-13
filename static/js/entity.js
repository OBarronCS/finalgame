const Sprite = PIXI.Sprite;
const resources = PIXI.loader.resources;

export default class Entity {

    constructor(x,y, entity_id){
        this.x = x;
        this.y = y;
        this.entity_id = entity_id;
        this.sprite = null

        // holds timestamped coordinate data for this client, held for the past 1 second.
        this.position_buffer = []
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

    // Will apply the given movement
    applyInput(movement, delta){

    }
}
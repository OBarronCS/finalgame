export default class Renderer {

    constructor(width, height) {
        this.pixiapp = new PIXI.Application({ width: width, height: height, backgroundColor : 0x4d5c63 })
        this.pixiapp.sortableChildren = true;

        this.camera_width = width
        this.camera_height = height;

        this.camera = new PIXI.Container();
        this.camera.sortableChildren = true;
        this.camera.zIndex = 0;
        this.pixiapp.stage.addChild(this.camera)

        this.gui = new PIXI.Container();
        this.gui.zIndex = 1;
        this.pixiapp.stage.addChild(this.gui)

        const displayDiv = document.querySelector('#display')
        displayDiv.appendChild(this.pixiapp.view);
        console.log("Renderer loaded")

        const game_sprites = ["static/images/player.png", "static/images/basic_proj.png"];

        PIXI.Loader.shared
            .add(game_sprites)

        const _bind = this;

        window.onresize = function (event){
            const w = window.innerWidth;
            const h = window.innerHeight;

            //this part resizes the canvas but keeps ratio the same
            this.pixiapp.view.width = w - 25;
            this.pixiapp.view.height = h - 25;

            _bind.camera_width = w - 25;
            _bind.camera_height = h - 25;

        }
    }

    // adds the given sprite to the canvas at the given z layer. The higher the layer, the closer to the top
    addGUI(sprite){
        this.gui.addChild(sprite)
    }
    
    addSprite(sprite, z){
        sprite.zIndex = z;
        this.camera.addChild(sprite)
        this.camera.sortChildren();
    }

    removeSprite(sprite){
        this.camera.removeChild(sprite)
    }

    // takes in the entity it is following
    updateScreen(entity){
        // the top left corner of screen. camera x,y

        const _x = Math.max(0,entity.x - (this.camera_width / 2));
        const _y = Math.max(0,entity.y - (this.camera_height / 2));

        this.camera.pivot.x = _x;
        this.camera.pivot.y = _y
        //this.camera.x = _x;
        //this.camera.y = _y;
    }

    getPixiApp() {
        return this.pixiapp;
    }
}



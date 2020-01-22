const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;

export default class TileMap {
    constructor(match, serverinfo){

        this.cellwidth = serverinfo["winfo"]["c"]


        this.gridheight = serverinfo["winfo"]["h"]
        this.gridwidth = serverinfo["winfo"]["w"]
       
        this.tilemap = []

        for(let i = 0; i < this.gridheight;i++){
            const arr = []
            for(let j = 0; j < this.gridwidth;j++){
                arr.push(0)
            }
            this.tilemap.push(arr)
        }

        const walls = serverinfo["walls"]

        for(let i = 0; i < walls.length;i++){
            this.tilemap[walls[i][0],walls[i][1]] = 1

            const w  = new Sprite(
                resources["static/images/basic_wall.png"].texture
            );

            w.width = this.cellwidth;
            w.height = this.cellwidth;

            w.x = walls[i][0] * this.cellwidth;
            w.y = walls[i][1] * this.cellwidth;

            window.renderer.addSprite(w,-1)
        }

    }

        
}
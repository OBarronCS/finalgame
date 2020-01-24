const Sprite = PIXI.Sprite;
const resources = PIXI.Loader.shared.resources;

export default class TileMap {
    constructor(match, serverinfo){

        this.cellwidth = serverinfo["winfo"]["c"]


        this.gridheight = serverinfo["winfo"]["h"]
        this.gridwidth = serverinfo["winfo"]["w"]
       

        this.pixelwidth = this.cellwidth * this.gridwidth
        this.pixelheight = this.cellwidth * this.gridheight


        console.log(this.gridheight)
        console.log(this.gridwidth)

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
            this.tilemap[walls[i][0]][walls[i][1]] = 1


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

    wallCollision(hitbox){
        let left_tile = Math.floor(hitbox.left / this.cellwidth);
        let right_tile = Math.floor( hitbox.right / this.cellwidth);
        let top_tile = Math.floor( hitbox.top / this.cellwidth);
        let bottom_tile =  Math.floor(hitbox.bottom / this.cellwidth);

        // console.log(`${left_tile},${right_tile},${top_tile},${bottom_tile}`)


        if(left_tile < 0) return true; //left_tile = 0
        if(right_tile >= this.gridwidth)  return true; //right_tile = self.gridwidth - 1
        if(top_tile < 0)  return true; //top_tile = 0
        if(bottom_tile >= this.gridheight) return true; //bottom_tile = self.gridheight - 1


        let i = left_tile;
        while(i <= right_tile){
            let j = top_tile
            while(j <= bottom_tile){
                if(this.tilemap[i][j] == 1){
                    console.log("WALL COLLISION")
                    return true
                }
                j += 1
            }
            i += 1
        }
        return false
    }
        
}
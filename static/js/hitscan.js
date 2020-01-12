

export default class HitScan {
    constructor(match,start_array, angle){
        this.match = match
        this.objects = []

        this.rect = new PIXI.Graphics();
        this.rect.lineStyle(1, 0xdbbf70);
        this.rect.drawRect(0,0,860,2);
        this.rect.pivot.y = 1 
        this.rect.x = start_array[0]
        this.rect.y = start_array[1]
        this.rect.angle = angle;

        this.objects.push(this.rect)

        let i;
        for(i = 0; i < this.objects.length; i++){
            window.pixiapp.stage.addChild(this.objects[i])
        }
        match.tick_objects.push(this)
    }

    tick(){
        let todelete = [];

        let i;
        for(i = 0; i < this.objects.length; i++){
            this.objects[i].alpha -= .06

            if(this.objects[i].alpha <= 0){
                todelete.push(this.objects[i])
            }
        }

        let j;
        outer:
        for(j = 0; j < todelete.length; j++){
            let k;
            inner:
            for(k = 0; k < this.objects.length; k++){
                if(todelete[j] == this.objects[k]){
                    //console.log("DELETE")
                    this.objects[k].destroy();
                    this.objects.splice(k,1)
                    continue outer;
                }
            }
        }


        

        if(this.objects.length == 0){
            this.match.deleteTickingObject(this)
        }
        
    }
}
class Entity:
    def __init__(self,x,y):
        self.x = x;
        self.y = y;
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 100; # pixels per second

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"entity_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y))}

    def applyInput(self,data):
        #data = {"entity_id":this.entity_id,"movement":movement, "dt": dt, "input_sequence_num":this.input_sequence_number}
        if(data["movement"]["right"]):
            self.x += self.speed * data["dt"];
        if(data["movement"]["up"]):
            self.y -= self.speed * data["dt"];
        if(data["movement"]["left"]):
            self.x -= self.speed * data["dt"];
        if(data["movement"]["down"]):
            self.y += self.speed * data["dt"];

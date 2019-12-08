class Entity:
    def __init__(self,x,y):
        self.x = x;
        self.y = y;
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 300; # pixels per second

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"entity_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y))}

    def applyInput(self,data):
        #data = {"entity_id":this.entity_id,"movement":{horz:value, vert: value}}, "dt": dt, "input_sequence_num":this.input_sequence_number}
        self.x += self.speed * data["movement"]["horz"] * data["dt"];
        self.y += self.speed * data["movement"]["vert"] * data["dt"];

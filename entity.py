class Entity:
    def __init__(self,x,y):
        self.x = x;
        self.y = y;
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 75; # pixels per second
        self.angle = 0;

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"entity_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y)), "angle":round(self.angle)}

    def applyInput(self,move_data, angle_change):
        self.x += (move_data[0]/60) * self.speed;
        self.y += (move_data[1]/60) * self.speed;
        self.angle += angle_change;
        
        if self.angle > 360:
            self.angle -= 360
        if self.angle < 0:
            self.angle += 360

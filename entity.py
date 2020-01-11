class Entity:
    def __init__(self,x,y):
        self.x = x;
        self.y = y;
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 75; # pixels per second
        self.angle = 0;

        # collision box is a circle
        self.radius = 11

        self.health = 100

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"e_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y)), "a":round(self.angle), "h":self.health}

    def applyInput(self,move_data, angle_change):
        self.x += (move_data[0]/60) * self.speed;
        self.y += (move_data[1]/60) * self.speed;
        self.angle += angle_change;
        
        if self.angle > 360:
            self.angle -= 360
        if self.angle < 0:
            self.angle += 360

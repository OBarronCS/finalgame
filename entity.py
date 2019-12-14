class Entity:
    def __init__(self,x,y):
        self.x = x;
        self.y = y;
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 150; # pixels per second

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"entity_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y))}

    def applyInput(self,move_data):

        # here is where you make sure move_data for each direction is not over (60 * server tickrate) consistently,
        # or the user is sending too much data  
        self.x += (move_data[0]/60) * self.speed;
        self.y += (move_data[1]/60) * self.speed;

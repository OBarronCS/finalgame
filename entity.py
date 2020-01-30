import hitbox

class Entity:
    def __init__(self,match,x,y, is_bot):
        self.match = match
        self.x = x;
        self.y = y;
        self.is_bot = is_bot
        
        self.position_buffer = [];
        self.entity_id = None;
        self.speed = 75; # pixels per second
        self.angle = 0;

        # collision box is a circle
        self.radius = 11
        self.r_squared = self.radius**2

        self.health = 100
        self.hitbox = hitbox.HitBox(x + self.radius, y - self.radius, x - self.radius, y + self.radius)


        # following are used if this is a bot
        self.current_dx = 0
        self.current_dy = 0

    def getState(self):
        # rounds position -> int(round(x), to make the packet smaller
        return {"e_id":self.entity_id, "x":int(round(self.x)), "y": int(round(self.y)), "a":round(self.angle), "h":self.health}

    def getFullState(self):
        # [event_id, entity_id, x, y, angle, hp]
        return [self.entity_id, int(round(self.x)), int(round(self.y)), round(self.angle), self.health]

    def death(self):
        pass

    def applyInput(self,move_data, angle_change):
        self.angle += angle_change;

        last_x = self.x
        self.x += (move_data[0]/60) * self.speed;
        self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)
        if(self.match.tilemap.wallCollision(self.hitbox)):
            self.x = last_x
            self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)

        last_y = self.y
        self.y += (move_data[1]/60) * self.speed;
        self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)
        if(self.match.tilemap.wallCollision(self.hitbox)):
            self.y = last_y
            self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)

        if self.angle > 360:
            self.angle -= 360
        if self.angle < 0:
            self.angle += 360

    def applyInputSetAngle(self,move_data, angle):
        self.angle = angle;

        last_x = self.x
        self.x += (move_data[0]/60) * self.speed;
        self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)
        if(self.match.tilemap.wallCollision(self.hitbox)):
            self.x = last_x
            self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)

        last_y = self.y
        self.y += (move_data[1]/60) * self.speed;
        self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)
        if(self.match.tilemap.wallCollision(self.hitbox)):
            self.y = last_y
            self.hitbox.setHitBox(self.x  + self.radius, self.y - self.radius, self.x  - self.radius, self.y + self.radius)

        if self.angle > 360:
            self.angle -= 360
        if self.angle < 0:
            self.angle += 360

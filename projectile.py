from math import cos, sin, pi, sqrt
import time

class Projectile:
    def __init__(self, match, entity_id, x, y, r, spd, angle, distance):
        self.match = match
        self.entity_id = entity_id
        self.initial_x = x
        self.initial_y = y
        self.x = x
        self.y = y
        self.r = r
        self.spd = spd # pixels per second
        self.angle = angle
        self.distance = distance # max distance it can travel

        self.inc_x = spd * cos(angle * (pi/180))
        self.inc_y = spd * sin(angle * (pi/180))
        self.steps = 0;


        self.match.events.append([3, x, y, r, spd, angle, int(time.time() * 1000), distance])

       

    def step(self, delta):
        self.x += self.inc_x * delta
        self.y += self.inc_y * delta

        # print(f"{self.x},{self.y}")
        self.steps += 1

        a = self.x - self.initial_x
        b = self.y - self.initial_y

        c = sqrt( a*a + b*b );
        if(c > self.distance):
            self.match.collision.to_destroy.append(self)
            
        
            

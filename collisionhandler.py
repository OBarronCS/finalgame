from math import cos, sin, pi, sqrt

class CollisionHandler:
    def __init__(self,match):
        self.match = match

        # self.match.entities is list of entities.



    def hitscan_collision(self, start_x, start_y, angle, length, origin_id):
        inc = 10
        
        inc_x = inc * cos(angle * (pi/180))
        inc_y = inc * sin(angle * (pi/180))

        x = start_x;
        y = start_y;

        i = 0;
        
        # extremely(!!!!) inneffiecient, but it works for now 

        while(i < length / inc):
            for entity in self.match.entities:
                if entity.entity_id != origin_id:
                    dis = sqrt((x - entity.x)**2 + (y - entity.y)**2)
                    if dis < entity.radius + 2:
                        print("COLLISION")
                        entity.health -= 6
                        self.match.events.append([2,entity.entity_id,entity.health])
                        return;
            x += inc_x
            y += inc_y
            i += 1;



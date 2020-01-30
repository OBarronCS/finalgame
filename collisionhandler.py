from math import cos, sin, pi, sqrt

class CollisionHandler:
    def __init__(self,match):
        self.match = match

        # they have format [projectile id, origin entity_id]
        self.projectiles = []
        self.to_destroy = []
        # self.match.entities is list of entities.

    def step(self, delta):
        for proj in self.projectiles:
            proj.step(delta)

            for entity in self.match.entities:
                if entity.entity_id != proj.entity_id:
                    dis = sqrt((proj.x - entity.x)**2 + (proj.y - entity.y)**2)
                    if dis < entity.radius + 2:
                        # print("COLLISION")
                        entity.health -= 11
                        self.checkBotDeath(entity)
                        self.match.events.append([2,entity.entity_id,entity.health])
                        self.to_destroy.append(proj)
                        break;
        
        for proj in self.to_destroy:
            self.destroy_proj(proj)

        # print(len(self.projectiles))
        self.to_destroy = []

    def destroy_proj(self, proj):
        try:
            self.projectiles.remove(proj)
        except ValueError:
            pass  # this sometimes has an error, and idk why
        
   

        # checking for their collisions

    def checkBotDeath(self, entity):
        if entity.health > 0:
            return

        for bot in self.match.spawncontrol.entities:
            if bot == entity:
                self.match.deleteEntity(entity)

    def start_projectile(self, proj):
        self.projectiles.append(proj)

    def hitscan_collision(self, start_x, start_y, angle, length, origin_id):
        inc = 10
        
        inc_x = inc * cos(angle * (pi/180))
        inc_y = inc * sin(angle * (pi/180))

        x = start_x;
        y = start_y;

        i = 0;
        
        # extremely(!!!!) inneffiecient, but it works for now 

        while(i < (length / inc) + 1):
            for entity in self.match.entities:
                if entity.entity_id != origin_id:
                    dis = sqrt((x - entity.x)**2 + (y - entity.y)**2)
                    if dis < entity.radius + 2:
                        
                        sofar = sqrt((x - start_x)**2 + (y - start_y)**2)
                        
                        percent = sofar/length

                        entity.health -= 3.5 * percent
                        self.checkBotDeath(entity)
                        self.match.events.append([2,entity.entity_id,entity.health])
                        
            x += inc_x
            y += inc_y
            i += 1;



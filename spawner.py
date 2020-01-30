import random

class Spawner:
    def __init__(self, spawncontrol, pixel_x, pixel_y):
        self.spawncontrol = spawncontrol
        self.x = pixel_x
        self.y = pixel_y
        self.maxsteps = 120
        self.steps = self.maxsteps

    def createBot(self):
        self.steps -= 1
         
        if self.steps <= 0:
            self.steps = self.maxsteps
            
            biggest_distance = 1000**2

            for player_e in self.spawncontrol.match.playerentities:
                distance = (player_e.x - self.x)**2 + (player_e.y - self.y)**2

                if distance < biggest_distance:
                    biggest_distance = distance


            if biggest_distance < 1000**2:
                self.spawncontrol.addEntity(self.x + ((random.random() * 2 - 1) * 5), self.y + ((random.random() * 2- 1) * 5))




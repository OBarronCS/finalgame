import entity, random

class SpawnControl:

    def __init__(self, match):
        self.match = match
        # this includes only references to the AI things. Main game has on list that includes them as well
        self.spawners = []
        self.entities = []

        # calculate direction of entities every 5th step. Might delegate this to indivual spanwers later
        self.max_calc_step = 5
        self.calc_step = self.max_calc_step

    def step(self):
        for spawner in self.spawners:
            spawner.createBot()

        self.calc_step -= 1
        if self.calc_step <= 0:
            self.calc_step = self.max_calc_step

            for entity in self.entities:
                # first find closest player entity

                target_player = None
                biggest_distance = 500**2

                for player_e in self.match.playerentities:
                    distance = (player_e.x - entity.x)**2 + (player_e.y - entity.y)**2

                    if distance < biggest_distance:
                        biggest_distance = distance
                        target_player = player_e

                if target_player is not None:   
                    move_command = [0,0]

                    if target_player.x > entity.x:
                        move_command[0] = 2 + random.random()
                    else:
                        move_command[0] = -2 + random.random()

                    if target_player.y > entity.y:
                        move_command[1] = 2 + random.random()
                    else:
                        move_command[1] = -2 + random.random()


                    entity.current_dx = move_command[0]
                    entity.current_dy = move_command[1]
        
        # actually moves them
        for entity in self.entities:
            entity.applyInputSetAngle([entity.current_dx, entity.current_dy], 76)

                    

    def addEntity(self, x, y):
        # cap number of enemies to 100
        if len(self.entities) > 150:
            return

        e = entity.Entity(self.match, x, y, True)
        e.entity_id = self.match.entity_id_num 
        e.health = 45

        self.match.entity_id_num += 1

        self.entities.append(e)
        self.match.entities.append(e)

from math import copysign, ceil
import projectile, time

class Client:
    def __init__(self, match, maxInputs, player_id, sid):
        # unique ID to identify player ((length of things))
        self.match = match
        self.maxInputs = maxInputs;
        self.player_id = player_id;

       
        # unique socket session ID of this user
        self.sid = sid;
        # the entity you are controlling
        self.entity = None;

        self.last_received_input = None;
        self.last_verified_input = None;

        self.move = [0,0]
        self.next_move = [0,0]

        # list dict of last pings sent, code : timestamp in MS
        self.sent_pings = {}
        self.next_ping_id = 0
        # list of pings times to this client
        self.ping_list = []

        self.ping = 0

        
        # TODO_ --> Auto sync with client on connection
        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        self.max_angle_turn = 2.5 * (60/20)
        self.angle_change = 0

        self.next_angle_change = 0;

        # numbers of times mouse was down TEMPORARY
        self.mousedown = 0 


    def calc_ping(self, pingid, return_time):
        sent_time = self.sent_pings.get(pingid, None)

        if sent_time is None:
            print("PING ID unrecognized")
            return;

        del self.sent_pings[pingid]
        
        self.ping_list.append(return_time - sent_time)

        if len(self.ping_list) > 10:
            self.ping_list.pop(0)

        # print(sum(self.ping_list))

        # rough average. later can make it favor recent ones more
        self.ping = ceil(sum(self.ping_list) / len(self.ping_list))

    def processInput(self, tick):
        if(self.entity.health <= 0):
            self.entity.health = 100


        self.move[0] += self.next_move[0];
        self.move[1] += self.next_move[1];
        
        self.next_move = [0,0];

        
        # checks for the overflow amount of inputs
        # max amount of inputs is defined as  !!!!!  60 /  game.tickrate    !!!!

        # this might be bad

        self.angle_change += self.next_angle_change;
        self.next_angle_change = 0
        
        angle_sign = copysign(1,self.angle_change)
        angle_overFlow = abs(self.angle_change) - self.max_angle_turn
        
        if angle_overFlow > 0:
            # print("ANGLE OVERFLOW")
            self.angle_change -= (angle_sign * angle_overFlow); 
            self.next_angle_change += (angle_sign * angle_overFlow);


        i = 0;
        while(i < 2):
            # can be negative
            inputNum = self.move[i];
            sign = copysign(1,inputNum);

            overFlow = abs(inputNum) - self.maxInputs;
         
            # if we have more inputs than the maximum possible
            if(overFlow > 0):
                # print("OVERFLOW")
                self.move[i] -= (sign * overFlow); # truncates it to max amount
                # design choice, +=. just = would punish people with very inconsistent output of inputs
                self.next_move[i] += (sign * overFlow);

            i += 1;


        # print(f"{self.move[0],self.move[1]} | Overflow --> {self.next_move[0]},{self.next_move[1]}")
        self.entity.applyInput(self.move, self.angle_change)
        self.last_verified_input = self.last_received_input;

        # if user had mousedown in past 3 ticks (need to adjust it to an array so multiple shots can go thru)
        b = 0;
        while(b < self.mousedown):
            self.match.events.append([0,self.entity.x, self.entity.y, self.entity.angle])
            self.match.collision.hitscan_collision(self.entity.x, self.entity.y,self.entity.angle,860, self.entity.entity_id)
            
            # projectile thing!
            self.match.collision.start_projectile(projectile.Projectile(self.match, self.player_id, self.entity.x, self.entity.y, 15, 200, self.entity.angle, 400))
            
            b += 1;

        self.mousedown = 0
        self.angle_change = 0;
        self.move = [0,0]

    def addInput(self, horz, vert, input_num, angle_delta, mousedown):
        # currently hackable if user sets horz or vert to something else than -1,0,1
        self.last_received_input = input_num
        self.move[0] += horz
        self.move[1] += vert
        self.angle_change += angle_delta;

        self.mousedown += mousedown


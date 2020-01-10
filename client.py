from math import copysign

class Client:
    def __init__(self, maxInputs, player_id, sid):
        # unique ID to identify player ((length of things))
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
        self.angle_change = 0
        
    def processInput(self, tick):
        self.move[0] += self.next_move[0];
        self.move[1] += self.next_move[1];
        
        self.next_move = [0,0];

        
        # checks for the overflow amount of inputs
        # max amount of inputs is defined as  !!!!!  60 /  game.tickrate    !!!!

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

        self.angle_change = 0;
        self.move = [0,0]

    def addInput(self, horz, vert, input_num, angle_delta):
        # currently hackable if user sets horz or vert to something else than -1,0,1
        self.last_received_input = input_num
        self.move[0] += horz
        self.move[1] += vert
        self.angle_change += angle_delta;



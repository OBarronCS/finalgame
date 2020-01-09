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
        
    def processInput(self, tick):

        self.move[0] += self.next_move[0];
        self.move[1] += self.next_move[1];
        
        self.next_move = [0,0];

        # checks for the overflow amount of inputs
        # max amount of inputs is defined as  !!!!!  60 /  game.tickrate    !!!!

        i = 0;
        while(i < 2):
            inputNum = self.move[i];
            overFlow = inputNum - self.maxInputs;

            # if we have more inputs than the maximum possible
            if(overFlow > 0):
                self.move[i] -= overFlow; # truncates it to max amount
                # design choice, +=. just = would punish people with very inconsistent output of inputs
                self.next_move[i] += overFlow;

            i += 1;


        self.entity.applyInput(self.move)
        self.last_verified_input = self.last_received_input;

        self.move = [0,0]

    def addInput(self, horz, vert, input_num):
        # currently hackable if user sets horz or vert to something else than -1,0,1
        self.last_received_input = input_num
        self.move[0] += horz
        self.move[1] += vert


class Client:
    def __init__(self, player_id, sid):
        # unique ID to identify player ((length of things))
        self.player_id = player_id;
        # unique socket session ID of this user
        self.sid = sid;
        # the entity you are controlling
        self.entity = None;

        self.last_received_input = None;
        self.last_verified_input = None;

        self.move = [0,0]
        
    def processInput(self, tick):
        self.entity.applyInput(self.move)
        self.last_verified_input = self.last_received_input;

        self.move = [0,0]

    def addInput(self,data):
        # currently hackable if user sets horz or vert to something else than -1,0,1
        self.last_received_input = data["input_num"]
        self.move[0] += data["movement"]["horz"];
        self.move[1] += data["movement"]["vert"];


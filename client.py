class Client:
    def __init__(self, player_id, sid):
        # unique ID to identify player ((length of things))
        self.player_id = player_id;
        # unique socket session ID of this user
        self.sid = sid;
        # the entity you are controlling
        self.entity = None;

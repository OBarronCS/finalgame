#This class represents an game, holding info on clients and such
import eventlet;
eventlet.monkey_patch();

import entity, client, threading, time;

class Game(threading.Thread):
    # Game loop in here?
    def __init__(self, socketio):
        threading.Thread.__init__(self);
        self.clients = [];
        self.entities = [];
        self.waiting_inputs = [];


        self.entities_to_remove = [];

        # This one is not in used RN
        self.last_processed_input = [];

        self.socketio = socketio;

        self.client_authentication = {}

    def processInputs(self):
        # here is where you would want to validate the input first, mate!
        # like make sure dt is not too long, or that it came from the correct user

        input_amount = len(self.waiting_inputs);
        i = 0;
        while(i < input_amount):

            message = self.waiting_inputs[i]
            player_id = message["entity_id"]

            # this works for now because they increment
            client = self.clients[player_id];
            client.entity.applyInput(message);

            i += 1;
        self.waiting_inputs = [];

    def disconnectPlayer(self, sid):
        # this is called from the server, basically just kills the entity
        remove_entity = None;
        
        for client in self.clients:
            if client.sid == sid:
                if(client.entity is None):
                    return;
                remove_entity = client.entity;
                self.clients.remove(client)
                break;

        # have to notify people that he has died
        self.entities_to_remove.append(remove_entity.entity_id)



    def sendWorldState(self):
        #all clients are in room 1

        game_messages = {};
        world_state = []

        for client in self.clients:
            entity = client.entity;
            world_state.append(entity.getState())

        game_messages.update({"state":world_state})
        game_messages.update({"remove":self.entities_to_remove})

        # clears the list of entites to get rid of since last step
        self.entities_to_remove = [];

        # Broadcast world state to everyone
        self.socketio.emit("gamestate", game_messages)

    # when the thread is started, this is run
    def run(self):
        print("thread started")
        #total time that the game logic has processed
        t = 0;
        #frame rate
        dt = 1/20;

        currentTime = time.time()
        accumulator = 0;

        while (True):
            #frametime = time that that last frame took
            newTime = time.time();
            frameTime = newTime - currentTime;
            currentTime = newTime;

            accumulator += frameTime;

            #if the frame time as elapsed do the frame logic bro
            while (accumulator >= dt):
                print(dt);

                self.processInputs();
                self.sendWorldState();

                accumulator -= dt;
                t += dt;
            eventlet.sleep(0);

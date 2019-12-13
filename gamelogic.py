#This class represents an game, holding info on clients and such
import eventlet;
eventlet.monkey_patch();

import entity, client, threading, time, random;

class Game(threading.Thread):
    # Game loop in here?
    def __init__(self, socketio,app):
        threading.Thread.__init__(self);
        self.socketio = socketio;
        self.app = app;
        self.entity_id_num = 0;
        self.clients = [];
        self.entities = [];
        self.dt = 1/5

        self.entities_to_remove = [];

        # This one is not in used RN
        self.last_processed_input = [];

        self.sid_to_client = {}

    def queueInput(self, data):
        sid = data.get("sid")

        client = self.sid_to_client.get(sid, None)
        if(client is None):
            print("movement linked to no client")
        
        client.addInput(data["data"])


    def processInputs(self):
        # here is where you would want to validate the input first, mate!
        # like make sure dt is not too long, or that it came from the correct user

        #print(input_amount)
        for client in self.clients:    
            client.processInput(self.dt)

            eventlet.sleep(0);


    def disconnectPlayer(self, sid):
        # this is called from the server, basically just kills the entity
        remove_client = self.sid_to_client.get(sid, None)
        # this happens most likely when someone connects to server, but never gets to connect to the game;
        if(remove_client is None):
            return;
        remove_entity = remove_client.entity;

        # removes all reference to this player and his entity
        del self.sid_to_client[sid]
        self.clients.remove(remove_client);
        self.entities.remove(remove_entity);

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
        for client in self.clients:
            self.socketio.emit("gamestate", game_messages, room = client.sid)

    # when the thread is started, this is run
    def run(self):
        print("thread started")
        #total time that the game logic has processed
        t = 0;
        #frame rate
        dt = self.dt;

        currentTime = time.time()
        accumulator = 0;

        while (True):
            #frametime = time that that last frame took
            newTime = time.time();
            frameTime = newTime - currentTime;
            currentTime = newTime;

            accumulator += frameTime;

            #if the frame time as elapsed do the frame logic as many times as needed, then eventually send the world staet once everything has been done;
            if(accumulator >= dt):
                while (accumulator >= dt):
                    #print(accumulator);

                    self.processInputs();
                    

                    accumulator -= dt;
                    t += dt;
                #print("sent world state")
                self.sendWorldState();
            eventlet.sleep(0);

    # connects a new client to this game
    def addNewClient(self,sid):
        #random spawn locations
        spawn_x = random.randint(50,500);
        spawn_y = random.randint(50,350);

        # gives new client an unique player_id
        # issues arise at this len(self.clients) !!!!!!!!!!
        new_client = client.Client(self.entity_id_num, sid);
        self.entity_id_num += 1;

        new_entity = entity.Entity(spawn_x, spawn_y)
        new_entity.entity_id = new_client.player_id;

        # give client object a reference to the entity they are controlling
        new_client.entity = new_entity;

        self.entities.append(new_entity)
        self.clients.append(new_client)
        self.sid_to_client.update({sid:new_client});

        self.socketio.emit("join match", {"player_id":new_client.player_id,"state":new_entity.getState()}, room = sid)
    

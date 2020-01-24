#This class represents an game, holding info on clients and such
import eventlet;
eventlet.monkey_patch();

import entity, client, threading, time, random, collisionhandler, tilemap;

class Game(threading.Thread):
    # Game loop in here?
    def __init__(self, socketio,app):
        threading.Thread.__init__(self);
        self.socketio = socketio;
        self.app = app;
        self.entity_id_num = 0;
        self.clients = [];
        self.entities = [];
        self.tickrate = 20

        self.collision = collisionhandler.CollisionHandler(self)
        self.tilemap = tilemap.TileMap(2048, 2048, 32)

        # This one is not in used RN
        self.last_processed_input = [];

        self.sid_to_client = {}

        self.events = []

    def queueInput(self, sid, horz, vert, input_num, angle_delta, mousedown):

        client = self.sid_to_client.get(sid, None)
        if client is None:
            # this is called alot right after someone joins as they have yet to be created in the world
            print("movement linked to no client")
            return;
        
        client.addInput(horz, vert, input_num, angle_delta, mousedown)


    def processInputs(self):

        for client in self.clients:    
            client.processInput(self.tickrate)

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

        self.events.append([1, remove_entity.entity_id])



    def sendWorldState(self, timestamp):
        #all clients are in room 1

        time_ms = int(timestamp * 1000) # int floors the value

        game_messages = {};
        world_state = []

        for client in self.clients:
            entity = client.entity;
            world_state.append(entity.getState())


        game_messages.update({"state":world_state})
        game_messages.update({"timestamp":time_ms})
        game_messages.update({"e":self.events})

        self.events = []

        # Broadcast world state to everyone
        #print(time_ms)
        for client in self.clients:
            self.socketio.emit("gamestate",{"pvt":{"v_id" : client.last_verified_input, "p":client.ping}, "game":game_messages}, room = client.sid)
            eventlet.sleep(0)

    # when the thread is started, this is run
    def run(self):
        print("thread started")
        #total time that the game logic has processed
        t = 0;
        #frame rate
        dt = 1/self.tickrate;

        currentTime = time.time()
        accumulator = 0;
        ping_accumulator = 0;

        while (True):
            #frametime = time that that last frame took
            newTime = time.time();
            frameTime = newTime - currentTime;
            currentTime = newTime;

            accumulator += frameTime;
            ping_accumulator += frameTime;


            # for now, sending all pings at once... later disperse them over different time periods
            # every .3 seconds check ping
            if(ping_accumulator > .3):
                ping_accumulator = 0;
                for client in self.clients:
                    self.send_ping(client)
                    eventlet.sleep(0)

                


            #if the frame time as elapsed do the frame logic as many times as needed, then eventually send the world staet once everything has been done;
            if(accumulator >= dt):
                while (accumulator >= dt):
                    #print(accumulator);

                    self.processInputs();
                    self.collision.step(dt)

                    accumulator -= dt;
                    t += dt;
                #print("sent world state")
                self.sendWorldState(newTime);
            eventlet.sleep(0);

    def send_ping(self,client):
        ping_id = client.next_ping_id
        self.socketio.emit("p", ping_id, room = client.sid)
        client.sent_pings.update({ping_id:time.time()*1000})

        client.next_ping_id += 1
        eventlet.sleep(0)

    def ping_return(self, sid, pingid):
        client = self.sid_to_client.get(sid, None)
        if client is None:
            print("ping linked to no client")
            return;

        return_time = time.time() * 1000

        client.calc_ping(pingid, return_time)

    # connects a new client to this game
    def addNewClient(self,sid):
        #random spawn locations
        spawn = self.tilemap.getOpenCoords()

        spawn_x = spawn[0]
        spawn_y = spawn[1]

        # gives new client an unique player_id
        new_client = client.Client(self, 60 / self.tickrate , self.entity_id_num, sid);
        self.entity_id_num += 1;

        new_entity = entity.Entity(spawn_x, spawn_y)
        new_entity.entity_id = new_client.player_id;

        # give client object a reference to the entity they are controlling
        new_client.entity = new_entity;

        self.entities.append(new_entity)
        self.clients.append(new_client)
        self.sid_to_client.update({sid:new_client});

        self.socketio.emit("join match", {"player_id":new_client.player_id,"state":new_entity.getState(), "tickrate":self.tickrate, "winfo":self.tilemap.getTileMapInfo() , "walls":self.tilemap.getWalls(), "timestamp":int(time.time() * 1000)}, room = sid)
    

import eventlet;
eventlet.monkey_patch();

import gamelogic;
import client;
import entity;


import json, random, atexit, time, logging
from flask import Flask, render_template, request, jsonify

from flask_socketio import SocketIO, emit, join_room, leave_room


app = Flask(__name__);
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
socketio = SocketIO(app, async_mode='eventlet')
game = gamelogic.Game(socketio);
#Starts the game thread




@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("connect")
def connect():
    print("A user has connected");

@socketio.on("disconnect")
def disconnect():
    print(f"{request.sid} has disconnected")
    leave_room(1)
    leave_room(request.sid)
    game.disconnectPlayer(request.sid);

@socketio.on("join room")
def joinmatch(data):
    sid = request.sid;

    join_room(1) #connect the player to the main room
    # added to personal room in case need to send specific data only to them
    join_room(sid)

    spawn_x = random.randint(50,500);
    spawn_y = random.randint(50,350);

    # gives new client an unique player_id
    new_client = client.Client(len(game.clients), sid);

    new_entity = entity.Entity(spawn_x, spawn_y)
    new_entity.entity_id = new_client.player_id;

    # give client object a reference to the entity they are controlling
    new_client.entity = new_entity;

    game.entities.append(new_entity)
    game.clients.append(new_client)

    # makes the session id linked to user id so I can check that no one changed them
    game.client_authentication.update({sid:new_client.player_id});

    emit("join match", {"player_id":new_client.player_id,"state":new_entity.getState()})

@socketio.on("movement")
def movement(data):
    game.waiting_inputs.append(data)


    #print(data)

    #emit("gamestate",{"playerdata" : this_player.info()})


# TESTING
@socketio.on("ping")
def function(data):
    emit("pong","hi")


if __name__ == '__main__':
    # use_reloader=False. Debug mode makes the thread start twice
    #log = logging.getLogger('werkzeug')
    #log.setLevel(logging.ERROR)
    game.daemon = True;
    game.start();

    socketio.run(app)
    


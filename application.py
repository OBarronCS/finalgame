import eventlet;
eventlet.monkey_patch();

import gamelogic;
import client;
import entity;

import json, atexit, time, logging, os
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__);
#app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
socketio = SocketIO(app, async_mode='eventlet')
game = gamelogic.Game(socketio, app);

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
    print("A player has requested to join the game")
    sid = request.sid;
    join_room(1) # this doesnt really mean anything yet
    join_room(sid)

    game.addNewClient(sid)

@socketio.on("movement")
def movement(data):
    game.queueInput({"sid":request.sid, "data":data});
    #print("Added to input list")


    eventlet.sleep(0);
    #print(data)

# TESTING
@socketio.on("ping")
def function(data):
    emit("pong","hi")


if __name__ == '__main__':
    #log = logging.getLogger('werkzeug')
    #log.setLevel(logging.ERROR)
    game.daemon = True;
    game.start();
    #socketio.run(app)
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host="0.0.0.0", port=port)
    


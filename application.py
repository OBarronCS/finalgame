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
game.daemon = True;
game.start();


@app.route("/")
def index():
    print("user went to site")
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

@socketio.on("cmd")
def movement(horz,vert,input_num):
    game.queueInput(request.sid, horz, vert, input_num);

# TESTING
@socketio.on("testping")
def function(data):
    emit("testpong","hi")


if __name__ == '__main__':
    print("__main__")
    # this only runs when locally testing, mate!
    #socketio.run(app)
    port = int(os.environ.get('PORT', 5000))
    #socketio.run(app, host="0.0.0.0", port=port)
    print("asdvuiasfduyasfduy")
    socketio.run(app, host="0.0.0.0", port="80")
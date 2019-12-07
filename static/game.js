import Entity from './entity.js/index.js.js' 
import Client from './clientcontrol.js/index.js'

const FRAME_RATE = 1000/60;

var Application = PIXI.Application,
	 	loader = PIXI.loader,
		resources = PIXI.loader.resources,
		Sprite = PIXI.Sprite;

var app = new Application({width:600, height:400})
const displayDiv = document.querySelector('#display')
displayDiv.appendChild(app.view);

document.addEventListener("DOMContentLoaded", () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	var client = null;

	socket.on('connect', () => {
		alert("Succesfuly connnected")
	});
	

	//Load game textures right when connect . . . might change this later
	const game_sprites = ["static/images/player.png"]

	loader
		.add(game_sprites)
		.load(setup);

	//Now that sprites are on the local machine, join a room
	function setup(){
		socket.emit("join room", "I would like to join a room pl0x")
	}

	var lastTime, now, dt;

	//runs this every 60 seconds, with built in delta time correction
	function gameLoop(delta){
	  now = Date.now()
		dt = now - lastTime;
		lastTime = now;

		// Only send packet if changed state of keyboard
		client.processInputs(dt/1000);
	}

	//this server sends back the state of your location after you every time you send a request
	socket.on('gamestate', data => {
		//console.log(data);
		if(client != null){
			client.processServerState(data);
		}
	})

	socket.on("join", (data) => {
		//We have joined the game world
		console.log(data);

		client = new Client(data["player_id"])
		let new_entity = new Entity(data["state"]["x"], data["state"]["y"],data["player_id"])
		client.entity = new_entity;

		// Add this entity to the clients list of entities
		client.entities[data["player_id"]] = new_entity;

		new_entity.setSprite("static/images/player.png")

		lastTime = Date.now()
		now = Date.now()
		timeSinceLastFrame = 0;

		app.ticker.add(delta => gameLoop(delta));
		//app.stage.removeChild(anySprite)
		//anySprite.visible = false;

		// place where WEB-GL texture caches are stored:
		//let texture = PIXI.utils.TextureCache["images/anySpriteImage.png"];
		//let sprite = new PIXI.Sprite(texture);
	});
});

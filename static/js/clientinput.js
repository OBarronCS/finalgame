export default class ClientInputListener {

    constructor(){
        this.last_movement;
        
        this.movement = {
          up: false,
          down: false,
          left: false,
          right: false,
        }

        this.setKeyboardListeners();

    }
	setKeyboardListeners() {

        let movement = this.movement;

        document.addEventListener('keydown', function(event) {
            switch (event.keyCode) {
              case 65: // A
                movement.left = true;
                break;
              case 87: // W
                movement.up = true;
                break;
              case 68: // D
                movement.right = true;
                break;
              case 83: // S
               movement.down = true;
                break;
            }
        });

        document.addEventListener('keyup', function(event) {
            switch (event.keyCode) {
              case 65: // A
                movement.left = false;
                break;
              case 87: // W
                movement.up = false;
                break;
              case 68: // D
                movement.right = false;
                break;
              case 83: // S
                movement.down = false;
                break;
            }
        });

    }

    getMovementState(){
      return this.movement;
    }

    //it is assumed that this is called every step
	has_movement_changed(){
		for(var key in this.last_movement) {
        if(this.last_movement[key] != this.movement[key]){
				return true;
			}
    }
        
    for(var key in this.last_movement) {
      this.last_movement[key] = this.movement[key]
    }   


		return false;
	}
	movement_positive(){
		//checks if any movement values are positive
		for(var key in this.movement) {
			if(this.movement[key] == true){
				return true;
			}
		}
		return false;
	}
}
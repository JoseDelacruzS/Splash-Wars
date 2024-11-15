// PlayerController.js

const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com/');  // URL de tu servidor
class PlayerController {
    constructor(socket, playerId) {
        this.socket = socket;
        this.playerId = playerId;
        this.position = { x: 0, y: 0, z: 0 };
    }

    // Mover al jugador
    movePlayer(deltaX, deltaY, deltaZ) {
        this.position.x += deltaX;
        this.position.y += deltaY;
        this.position.z += deltaZ;

        // Enviar la nueva posición al servidor
        this.socket.emit('updatePlayerPosition', this.position);
    }

    // Recibir actualización de la posición de otro jugador
    updatePlayerPosition(position) {
        this.position = position;
        // Actualizar la posición del jugador en Three.js (puedes hacerlo con el objeto 3D correspondiente)
    }
}

module.exports = PlayerController;

// GameController.js

const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com/');  // URL de tu servidor
class GameController {
    constructor(socket) {
        this.socket = socket;
        this.players = {}; // Para guardar la información de los jugadores
        this.maxPlayers = 6; // Número máximo de jugadores
    }

    // Maneja la conexión de un nuevo jugador
    handleNewPlayer(playerId) {
        if (Object.keys(this.players).length < this.maxPlayers) {
            this.players[playerId] = { x: Math.random() * 100, y: 0, z: Math.random() * 100 };
            this.socket.emit('newPlayer', { id: playerId, position: this.players[playerId] });
            this.socket.broadcast.emit('newPlayer', { id: playerId, position: this.players[playerId] });
        } else {
            this.socket.emit('gameFull');
        }
    }

    // Actualiza la posición de un jugador
    updatePlayerPosition(playerId, position) {
        if (this.players[playerId]) {
            this.players[playerId] = position;
            this.socket.emit('playerMoved', { id: playerId, position: this.players[playerId] });
            this.socket.broadcast.emit('playerMoved', { id: playerId, position: this.players[playerId] });
        }
    }

    // Elimina un jugador cuando se desconecta
    removePlayer(playerId) {
        delete this.players[playerId];
        this.socket.emit('playerDisconnected', playerId);
        this.socket.broadcast.emit('playerDisconnected', playerId);
    }
}

module.exports = GameController;

// controllers/playerController.js
const players = {}; // Objeto para almacenar jugadores conectados

const playerController = {};

// Inicializar un nuevo jugador
playerController.initPlayer = (socket) => {
    players[socket.id] = {
        id: socket.id,
        health: 100,
        position: { x: 0, y: 0, z: 0 },
        score: 0
    };

    socket.emit('playerInitialized', players[socket.id]);
    console.log(`Jugador inicializado: ${socket.id}`);

    // Actualizar posición del jugador
    socket.on('updatePosition', (position) => {
        if (players[socket.id]) {
            players[socket.id].position = position;
            socket.broadcast.emit('playerPositionUpdated', { id: socket.id, position });
        }
    });

    // Manejar daño recibido por el jugador
    socket.on('receiveDamage', (damage) => {
        if (players[socket.id]) {
            players[socket.id].health -= damage;
            if (players[socket.id].health <= 0) {
                playerController.playerKilled(socket, players[socket.id]);
            } else {
                socket.emit('healthUpdated', players[socket.id].health);
            }
        }
    });
};

// Eliminar jugador al desconectarse
playerController.removePlayer = (id) => {
    delete players[id];
    console.log(`Jugador eliminado: ${id}`);
};

// Manejo de bajas
playerController.playerKilled = (socket, player) => {
    player.health = 0;
    player.score = 0; // Resetea el puntaje si quieres
    socket.emit('playerKilled');
    console.log(`Jugador ${player.id} ha sido eliminado`);
};

module.exports = playerController;

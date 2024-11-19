// const players = {}; // Objeto para almacenar jugadores conectados

// const playerController = {};

// // Función para formatear los datos del jugador
// const formatPlayerData = (id) => ({
//     id,
//     name: players[id]?.name || "Unknown",
//     position: players[id]?.position || { x: 0, y: 0, z: 0 },
//     health: players[id]?.health || 100,
// });

// // Inicializar un nuevo jugador
// playerController.initPlayer = (socket) => {
//     players[socket.id] = {
//         id: socket.id,
//         position: { x: 0, y: 1, z: 0 }, // Posición inicial
//         health: 100, // Salud inicial
//     };

//     // Enviar al jugador los datos iniciales
//     socket.emit('playerInitialized', formatPlayerData(socket.id));
//     console.log(`Jugador inicializado: ${socket.id}`);

//     // Emitir evento a todos los demás jugadores para que agreguen al nuevo jugador
//     socket.broadcast.emit('newPlayer', formatPlayerData(socket.id));

//     // Actualizar posición del jugador
//     socket.on('updatePosition', (position) => {
//         if (players[socket.id]) {
//             players[socket.id].position = position;
//             const roomId = Object.keys(rooms).find(roomId =>
//                 rooms[roomId].some(player => player.id === socket.id)
//             );
//             if (roomId) {
//                 socket.broadcast.to(roomId).emit('playerPositionUpdated', formatPlayerData(socket.id));
//             }
//         }
//     });

//     // Manejar daño recibido por el jugador
//     socket.on('receiveDamage', (damage) => {
//         if (players[socket.id]) {
//             players[socket.id].health -= damage;
//             if (players[socket.id].health <= 0) {
//                 playerController.playerKilled(socket, players[socket.id]);
//             } else {
//                 socket.emit('healthUpdated', players[socket.id].health);
//             }
//         }
//     });
    
// };

// // Eliminar jugador al desconectarse
// playerController.removePlayer = (id) => {
//     delete players[id];
//     console.log(`Jugador eliminado: ${id}`);
// };

// // Manejo de bajas
// playerController.playerKilled = (socket, player) => {
//     player.health = 0;
//     player.score = 0; // Resetea el puntaje si quieres
//     socket.emit('playerKilled');
//     console.log(`Jugador ${player.id} ha sido eliminado`);
// };

// module.exports = playerController;

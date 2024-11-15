// controllers/gameController.js
const gameController = {};

// Inicializar lógica del juego
gameController.initGame = (socket, io) => {
    // Aquí es donde podemos configurar el estado inicial del juego y los eventos de juego
    socket.on('startGame', () => {
        console.log('Juego iniciado');
        // Aquí iría la lógica de inicio del juego, como el temporizador y el modo de juego.
        io.emit('gameStarted');
    });

    // Opcional: Cambiar modos de juego
    socket.on('changeGameMode', (mode) => {
        console.log(`Modo de juego cambiado a: ${mode}`);
        io.emit('gameModeChanged', mode);
    });
};

module.exports = gameController;

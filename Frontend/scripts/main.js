// Importar módulos y clases necesarias
import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';

// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;
let localPlayerId;

// Conectar al servidor de Socket.IO
const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com');

// Función para generar nombres aleatorios
function generateRandomName() {
    const names = ['Player', 'Warrior', 'Hunter', 'Ninja', 'Ghost', 'Falcon', 'Viper', 'Phoenix', 'Shadow'];
    const randomNumber = Math.floor(Math.random() * names.length);
    return names[randomNumber] + Math.floor(Math.random() * 1000); // Para hacerlo más único
}

// Función para unirse a una sala con nombre aleatorio
function joinRandomRoom() {
    const roomId = 'room1';  // O puedes hacer que sea dinámico, por ejemplo, generar un ID de sala
    const playerName = generateRandomName();  // Genera un nombre aleatorio para el jugador
    socket.emit('joinRoom', roomId, playerName); // Emitir el evento de unirse a la sala con el nombre aleatorio
}

// Inicialización
function init() {
    // Crear escena y HUD
    gameScene = new GameScene();
    hud = new HUD();

    // Unirse a la sala con nombre aleatorio
    joinRandomRoom();

    // Escuchar eventos del servidor
    setupSocketListeners();

    // Eventos y render loop
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

// Función para configurar los listeners de Socket.IO
function setupSocketListeners() {
    // Confirmar conexión
    socket.on('connect', () => {
        console.log('Conectado al servidor con ID:', socket.id);
        localPlayerId = socket.id; 
    });
    
    // Evento de inicio del juego
    socket.on('gameStarted', () => {
        console.log('El juego ha comenzado');
        // Opcional: Iniciar lógica específica del juego
    });

    // Actualización de la vida del jugador
    socket.on('healthUpdated', (newHealth) => {
        playerLife = newHealth;
        hud.updateLife(playerLife);
    });

    // Evento de munición recargada
    socket.on('ammoReloaded', () => {
        ammo = 15; // Restablece la munición
        hud.updateAmmo(ammo);
    });

    // Evento de tiempo restante
    socket.on('timeUpdated', (newTimeLeft) => {
        timeLeft = newTimeLeft;
        hud.updateTimer(timeLeft);
    });

    // Evento de eliminación del jugador
    socket.on('playerKilled', () => {
        console.log('Has sido eliminado');
        // Lógica para terminar el juego o mostrar pantalla de "game over"
    });

    // Evento de mensaje general desde el servidor
    socket.on('message', (message) => {
        console.log(message);
    });

    socket.on('addPlayer', (playerData) => {
        // Evitar agregar al jugador local de nuevo
        if (playerData.id === socket.id) {
            console.warn('El jugador local ya está inicializado:', playerData.id);
            return;
        }
    
        // Verificar que no exista ya en la escena
        if (!gameScene.getPlayerById(playerData.id)) {
            gameScene.addPlayer(playerData);
        } else {
            console.warn("Jugador ya existente:", playerData.id);
        }
    });

    // Actualización de la lista de jugadores
    socket.on('playersList', (players) => {
        console.log('Jugadores en la sala:', players);
        players.forEach((player) => {
            if (!gameScene.getPlayerById(player.id)) {
                gameScene.addPlayer(player); // Agrega al jugador si no existe
            }
        });
    });

    // main.js
    socket.on('playerPositionUpdated', ({ id, position }) => {
        if (id === socket.id) {
            // Ignorar actualizaciones de posición del propio jugador
            return;
        }
        const player = gameScene.getPlayerById(id); // Debes implementar getPlayerById en GameScene
        if (player) {
            player.updatePosition(position); // Actualiza la posición del jugador
        }
    });

    socket.on('updateAllPositions', (playersData) => {
        Object.keys(playersData).forEach((id) => {
            const playerData = playersData[id];
            if (id !== socket.id) { // No actualizar la posición propia
                let player = gameScene.getPlayerById(id);
                if (player) {
                    player.updatePosition(playerData.position);
                } else {
                    gameScene.addPlayer(playerData); // Solo agregar si no existe
                }
            }
        });
    });
    
    
    socket.on('updatePosition', (data) => {
        const { id, position } = data;
        if (players[id]) {
            players[id].position = position;
            io.to(roomId).emit('updateAllPositions', players);
        }
    });

    socket.on('playerDisconnected', (playerId) => {
        const player = gameScene.getPlayerById(playerId);
        if (player) {
            gameScene.removePlayer(playerId); // Implementa esta función en `scene.js`
        }
    });    
    
}

// Actualizar HUD
function updateHUD() {
    hud.updateLife(playerLife);
    hud.updateTimer(timeLeft);
    hud.updateAmmo(ammo);
}

// Ciclo de animación
function animate() {
    requestAnimationFrame(animate);
    update();
    gameScene.render();
    updateHUD();
}

// Función de actualización del juego (Lógica adicional aquí)
function update() {
    if (gameScene.player) {
        const position = gameScene.player.model.position;
        const animation = gameScene.player.animations.currentAnimation;
        socket.emit('updatePosition', { x: position.x, y: position.y, z: position.z });
    }
}

// Ajustar tamaño de la ventana
function onWindowResize() {
    gameScene.onWindowResize();
}

// Ejecutar init cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);

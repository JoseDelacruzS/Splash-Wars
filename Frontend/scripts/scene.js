import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';
import { Player } from './player.js';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.player = new Player(this.scene, this.camera, this);
        this.hud = new HUD();
        this.map = null;
        this.players = [];

        this.init();
        this.animate();
    }

    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEventListeners();
        this.loadGameElements();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.scene.position);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    loadGameElements() {
        this.map = new Map(this.scene, this.camera);
        this.loadPlayer();
    }

    loadPlayer() {
        this.player = new Player(this.scene, this.camera);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        if (this.player) {
            this.player.update(deltaTime);
        }
        if (this.map) {
            this.map.update();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initHUD() {
        if (this.hud) {
            this.hud.updateLife(100);
            this.hud.updateTimer(120);
            this.hud.updateAmmo(15);
        } else {
            console.error('HUD no está inicializado');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

// Agrega un jugador a la escena
addPlayer(playerData) {
    if (!playerData || !playerData.position) {
        console.error('Datos de jugador inválidos:', playerData);
        return;
    }

    // Verificar si el jugador ya existe para evitar duplicados
    if (this.getPlayerById(playerData.id)) {
        console.warn(`Jugador con ID ${playerData.id} ya existe en la escena.`);
        return;
    }

    // Instanciar un nuevo jugador
    const newPlayer = new Player(this.scene, this.camera, this); // Pasa la referencia de `gameScene` si es necesario
    newPlayer.id = playerData.id;

    // Escuchar cuando el modelo esté cargado
    newPlayer.loadModel(); // Asume que `loadModel` maneja el cargador asíncrono
    newPlayer.modelLoadedCallback = () => {
        // Establecer posición inicial
        newPlayer.model.position.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );

        // Reproducir la animación inicial, si está definida
        if (playerData.animation && newPlayer.animations) {
            newPlayer.animations.play(playerData.animation);
        }
    };

    // Añadir al array de jugadores
    this.players.push(newPlayer);
}

// Obtén un jugador por ID
getPlayerById(id) {
    return this.players.find(player => player.id === id);
}

    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(player => player.id === playerId);
        if (playerIndex !== -1) {
            const [removedPlayer] = this.players.splice(playerIndex, 1);
            this.scene.remove(removedPlayer.model); // Elimina el modelo de la escena
        }
    }

}
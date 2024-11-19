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

    addPlayer(playerData) {
        if (!playerData || !playerData.position) {
            console.error('Datos de jugador inválidos:', playerData);
            return;
        }
    
        // Ignora al jugador local
        if (playerData.id === localPlayerId) {
            console.log('Ignorando jugador local en addPlayer');
            return;
        }
    
        const existingPlayer = this.getPlayerById(playerData.id);
        if (existingPlayer) {
            console.warn('El jugador ya existe en la escena:', playerData.id);
            return;
        }
    
        const newPlayer = new Player(this.scene, this.camera);
        newPlayer.id = playerData.id;
    
        if (newPlayer.model) {
            newPlayer.model.position.set(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            );
        } else {
            console.error("El modelo de Player no está cargado.");
        }
    
        this.players.push(newPlayer);
    }
    
    // scene.js
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
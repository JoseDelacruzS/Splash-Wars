import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';
import { Player } from './player.js';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.5,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.player = null;
        this.hud = null;
        this.map = null;
        this.playerMap = new Map(); // Cambiado para evitar conflicto con la clase Map

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
        // Carga el mapa
        this.map = new Map(this.scene, this.camera);

        // Carga el jugador principal
        this.loadPlayer();

        // Inicializa el HUD
        this.initHUD();
    }

    loadPlayer() {
        this.player = new Player(this.scene, this.camera);
    }

    initHUD() {
        this.hud = new HUD(); // Asegúrate de que la clase HUD esté configurada correctamente
        if (this.hud) {
            this.hud.updateLife(100);
            this.hud.updateTimer(120);
            this.hud.updateAmmo(15);
        } else {
            console.error('HUD no está inicializado');
        }
    }

    update() {
        const deltaTime = this.clock.getDelta();

        if (this.player) {
            this.player.update(deltaTime);
        }

        if (this.map) {
            this.map.update();
        }

        // Actualización adicional de jugadores
        this.playerMap.forEach((player) => {
            player.update(deltaTime);
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    // Métodos relacionados con jugadores adicionales
    addPlayer(playerData) {
        if (!this.playerMap.has(playerData.id)) {
            const newPlayer = new Player(this.scene, this.camera);
            newPlayer.updatePosition(playerData.position);
            this.playerMap.set(playerData.id, newPlayer);
            console.log(`Jugador ${playerData.name} agregado a la escena`);
        }
    }

    getPlayerById(id) {
        return this.playerMap.get(id);
    }
}

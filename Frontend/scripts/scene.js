import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';
import { Player } from './player.js';

export default class GameScene {
    constructor() {
        this.players = [];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.player = null;
        this.hud = new HUD();
        this.map = null;

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

    // scene.js
    addPlayer(playerData) {
        const player = new Player(this.scene, this.camera); // Crear un nuevo objeto Player
        player.model.position.set(playerData.position.x, playerData.position.y, playerData.position.z); // Establecer la posición inicial
        player.id = playerData.id; // Asignar el ID al jugador
        this.players.push(player); // Almacenar el jugador en el array
    }

    // scene.js
    getPlayerById(id) {
        return this.players.find(player => player.id === id);
    }

    // scene.js
    removePlayer(id) {
        const index = this.players.findIndex(player => player.id === id);
        if (index !== -1) {
            this.scene.remove(this.players[index].model); // Elimina el modelo de la escena
            this.players.splice(index, 1); // Elimina el jugador del array
        }
    }
}
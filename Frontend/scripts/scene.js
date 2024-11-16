import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';
import { Player } from './player.js';

export default class GameScene {
    constructor() {
        this.otherPlayers = {}; // Manejador de jugadores remotos
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.player = null;
        this.hud = new HUD();
        this.map = null;

        this.init(); // Configuración inicial
        this.animate(); // Inicia la animación
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
        this.initHUD();
    }

    loadPlayer() {
        this.player = new Player(this.scene, this.camera);
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

    update() {
        const deltaTime = this.clock.getDelta();
        if (this.player) {
            this.player.update(deltaTime); // Actualiza al jugador local
        }
        Object.values(this.otherPlayers || {}).forEach(player => {
            player.update(deltaTime); // Actualiza jugadores remotos
        });
        if (this.map) {
            this.map.update(); // Actualiza el mapa
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

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    addPlayer(id, position) {
        if (!id || !position || !('x' in position && 'y' in position && 'z' in position)) {
            console.error('Parámetros inválidos para addPlayer:', { id, position });
            return;
        }
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const playerMesh = new THREE.Mesh(geometry, material);

        playerMesh.position.set(position.x, position.y, position.z);
        this.scene.add(playerMesh);

        this.otherPlayers[id] = playerMesh;
    }

    updatePlayerPosition(id, position) {
        if (this.otherPlayers && this.otherPlayers[id]) {
            this.otherPlayers[id].position.set(position.x, position.y, position.z);
        }
    }

    removePlayer(id) {
        if (this.otherPlayers && this.otherPlayers[id]) {
            this.scene.remove(this.otherPlayers[id]);
            delete this.otherPlayers[id];
        }
    }
}

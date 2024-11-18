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
        this.hud = new HUD();
        this.map = null;
        this.players = [];
        this.player = null;

        this.init();
        this.animate();
    }

    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEventListeners();
        this.loadGameElements();
        this.initHUD();
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
        directionalLight.position.set(5, 10, 5);
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
        this.player = new Player(this.scene, this.camera, this);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        if (this.player) this.player.update(deltaTime);
        if (this.map) this.map.update();
        this.players.forEach(player => player.update(deltaTime));
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
        this.hud.updateLife(100);
        this.hud.updateTimer(120);
        this.hud.updateAmmo(15);
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

        const newPlayer = new Player(this.scene, this.camera, this);
        newPlayer.id = playerData.id;

        newPlayer.model.position.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );

        this.players.push(newPlayer);
    }

    getPlayerById(id) {
        return this.players.find(player => player.id === id);
    }

    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(player => player.id === playerId);
        if (playerIndex !== -1) {
            const [removedPlayer] = this.players.splice(playerIndex, 1);
            this.scene.remove(removedPlayer.model);
        }
    }
}

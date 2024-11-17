import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Map {
    constructor(scene, camera) {
        this.camera = camera;
        this.scene = scene;
        this.skydomeMesh = null;
        this.planeCollisionBox = null;
        this.audioListener = new THREE.AudioListener();
        this.backgroundMusic = new THREE.Audio(this.audioListener);

        this.init();
    }

    init() {
        this.loadStage();
        this.addSkydome();
        this.addPlane();
        this.setupAudio();
    }

    addSkydome() {
        const skydomeGeometry = new THREE.SphereGeometry(500, 60, 40);
        const skyTexture = new THREE.TextureLoader().load('../assets/images/cielo.png');
        const skydomeMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide
        });
        this.skydomeMesh = new THREE.Mesh(skydomeGeometry, skydomeMaterial);
        this.scene.add(this.skydomeMesh);

        //Rotacion
        this.skydomeRotationSpeed = 0.00008;
        const animateSkydome = () => {
            requestAnimationFrame(animateSkydome);
            this.skydomeMesh.rotation.y += this.skydomeRotationSpeed;
            if (this.skydomeMesh.rotation.y > Math.PI * 2 || this.skydomeMesh.rotation.y < 0) {
                this.skydomeRotationSpeed = -this.skydomeRotationSpeed;
            }
        };
        animateSkydome();

    }

    addPlane() {
        const planeGeometry = new THREE.PlaneGeometry(600, 600);
        const edges = new THREE.EdgesGeometry(planeGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // Color blanco para las líneas
        const planeLines = new THREE.LineSegments(edges, lineMaterial);
        planeLines.rotation.x = -Math.PI / 2;
        planeLines.position.y = 0.3; // Ajusta esto según sea necesario
        this.scene.add(planeLines);
        this.planeCollisionBox = new THREE.Box3().setFromObject(planeLines);
    }

    setupAudio() {
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../assets/sounds/music/Musica1.mp3', (buffer) => {
            this.backgroundMusic.setBuffer(buffer);
            this.backgroundMusic.setLoop(true);
            this.backgroundMusic.setVolume(0.5); // Cambiado a un valor entre 0 y 1
            this.backgroundMusic.play();
        }, undefined, (error) => {
            console.error('Error al cargar el audio:', error);
        });
    }

    loadStage() {
        const loader = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        loader.load(
            '../assets/models/scenarios/low_poly_city/city.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene;
                stage.scale.set(12, 12, 12);
                stage.position.set(0, 0, 0);
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
            }
        );
    }

    update() {
        this.audioListener.position.copy(this.camera.position);
    }
}
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
    }

    addSkydome() {
        const skydomeGeometry = new THREE.SphereGeometry(500, 60, 40);
        const skyTexture = new THREE.TextureLoader().load('./assets/images/cielo2map2.png');
        const skydomeMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide
        });
        this.skydomeMesh = new THREE.Mesh(skydomeGeometry, skydomeMaterial); // Almacena el skydome en una propiedad
        this.scene.add(this.skydomeMesh);
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
        audioLoader.load('./assets/audio/backgroundMusic.mp3', (buffer) => {
            this.backgroundMusic.setBuffer(buffer);
            this.backgroundMusic.setLoop(true);
            this.backgroundMusic.setVolume(0.5);
            this.backgroundMusic.play();
        });
    }

    loadStage() {
        const loader = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        loader.load(
            './assets/models/scenarios/map2/mapa1.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.scale.set(2, 2, 2);
                stage.position.set(0, 0, 0); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const loader2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        loader2.load(
            './assets/models/scenarios/map2/mapa1.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 3.1416;
                stage.scale.set(2, 2, 2);
                stage.position.set(0, 0, -200); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );
    }

    update() {
        // Actualiza la posición del audioListener según la posición de la cámara
        this.audioListener.position.copy(this.camera.position);
    }
}
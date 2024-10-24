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
        const skyTexture = new THREE.TextureLoader().load('../assets/images/cielo2map2.png');
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
        audioLoader.load('../assets/audio/backgroundMusic.mp3', (buffer) => {
            this.backgroundMusic.setBuffer(buffer);
            this.backgroundMusic.setLoop(true);
            this.backgroundMusic.setVolume(0.5);
            this.backgroundMusic.play();
        });
    }

    loadStage() {
        const loader = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        loader.load(
            '../assets/models/scenarios/map2/IslaInicial/IslaInicial.glb', // Cambia esto a la ruta de tu modelo
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
            '../assets/models/scenarios/map2/IslaInicial/IslaInicial.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 3.1416;
                stage.scale.set(2, 2, 2);
                stage.position.set(0, 0, -150); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const islaPequ1 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaPequ1.load(
            '../assets/models/scenarios/map2/IslaPequeña1/IslaPequeña1.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 4.7;
                stage.scale.set(2, 2, 2);
                stage.position.set(60, 0, -80); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const islaPequ1_2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaPequ1_2.load(
            '../assets/models/scenarios/map2/IslaPequeña1/IslaPequeña1.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 1.57;
                stage.scale.set(2, 2, 2);
                stage.position.set(-60, 0, -80); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const islaPequ2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaPequ2.load(
            '../assets/models/scenarios/map2/IslaPequña2/IslaPequeña2.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 3.1416;
                stage.scale.set(2, 2, 2);
                stage.position.set(60, 0, -30); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const islaPequ2_2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaPequ2_2.load(
            '../assets/models/scenarios/map2/IslaPequña2/IslaPequeña2.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 3.1416;
                stage.scale.set(2, 2, 2);
                stage.position.set(-60, 0, -120); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );



        const islaGrande = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaGrande.load(
            '../assets/models/scenarios/map2/IslaGrande/IslaGrande.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
               
                stage.scale.set(2, 2, 2);
                stage.position.set(100, 0, -140); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const islaGrande_2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaGrande_2.load(
            '../assets/models/scenarios/map2/IslaGrande/IslaGrande.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 3.1416
                stage.scale.set(2, 2, 2);
                stage.position.set(-100, 0, -10); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const islaBandera = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        islaBandera.load(
            '../assets/models/scenarios/map2/IslaBandera/IslaBandera.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
               
                stage.scale.set(3, 3, 3);
                stage.position.set(0, 0, -75); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        /// Esta es la parte de los puentes que conectan con las isltas

        const puente1 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente1.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 1;
                stage.scale.set(3, 3, 6);
                stage.position.set(-60, 0, 30); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const puente1_R = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente1_R.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = 1;
                stage.scale.set(3, 3, 6);
                stage.position.set(70, 0, -170); 
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );



        const puente2 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente2.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = -1.0;
                stage.scale.set(3, 3, 5);
                stage.position.set(-50, 0, -35); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const puente2_R = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente2_R.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = -1.0;
                stage.scale.set(3, 3, 6);
                stage.position.set(50, 0, -115); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );



        const puente3 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente3.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = - 0.6;
                stage.scale.set(3, 3, 5);
                stage.position.set(-80, 0, -50); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const puente3_R = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente3_R.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y = - 0.7;
                stage.scale.set(3, 3, 5);
                stage.position.set(80, 0, -100); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const puente5 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente5.load(
            './assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y =  0.1;
                stage.scale.set(3, 3, 3);
                stage.position.set(-60, 0, -100); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );


        const puente5_R = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente5_R.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y =  0.1;
                stage.scale.set(3, 3, 4);
                stage.position.set(60, 0, -50); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const puente6 = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente6.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y =  -1.0;
                stage.scale.set(3, 3, 5);
                stage.position.set(-40, 0, -134); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        const puente6_R = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        puente6_R.load(
            '../assets/models/scenarios/map2/Puente/puente.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.rotation.y =  -1.0;
                stage.scale.set(3, 3, 5);
                stage.position.set(40, 0, -16); 
                this.scene.add(stage); // Agrga el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );

        //items
        const bombalodo = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        bombalodo.load(
            '../assets/models/itemsAbraham/bombabarro.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                console.log('Modelo cargado con exito', gltf)
                const stage = gltf.scene; 
                stage.scale.set(1, 1, 1);
                stage.position.set(0, 2, 0); 
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
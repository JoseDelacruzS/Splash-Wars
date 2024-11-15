import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class PlayerAnimations {
    constructor(model) {
        this.model = model;
        this.mixer = new THREE.AnimationMixer(this.model);  // Crea un AnimationMixer para gestionar las animaciones
        this.animations = {};  // Almacenamos las animaciones cargadas aquí
    }

    loadAnimation(name, path) {
        const loader = new FBXLoader();
        loader.load(path, (object) => {
            // Mezclamos y guardamos las animaciones en el diccionario
            const animation = object.animations[0];  // Asegúrate de que el FBX tiene animaciones
            const action = this.mixer.clipAction(animation);  
            this.animations[name] = action; 
        });
    }

    play(name) {
        if (this.currentAnimation === name) return;  // Evita cambiar a la misma animación
        if (this.currentAction) {
            this.currentAction.fadeOut(0.2);  
        }
        const newAction = this.animations[name];  
        if (newAction) {
            newAction.reset().fadeIn(0.2).play();  
            this.currentAction = newAction; 
            this.currentAnimation = name;  // Almacena el nombre de la animación actual
        }
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);  
        }
    }
}

// scripts/hud.js
export class HUD {
    constructor() {
        this.lifeValueElement = document.getElementById('life-value');
        this.timeValueElement = document.getElementById('time-value');
        this.ammoCountElement = document.getElementById('ammo-count');
        this.abilities = document.querySelectorAll('.ability');
    }

    updateLife(life) {
        this.lifeValueElement.innerText = life;
    }

    updateTimer(timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.timeValueElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    updateAmmo(ammo) {
        this.ammoCountElement.innerText = ammo;
    }

    updateAbilities(abilities) {
        this.abilities.forEach((ability, index) => {
            if (abilities[index]) {
                ability.querySelector('.ability-icon').src = abilities[index].icon; // Cambia la imagen de la habilidad
                ability.querySelector('.ability-key').innerText = abilities[index].key; // Cambia la tecla de la habilidad
            }
        });
    }
}
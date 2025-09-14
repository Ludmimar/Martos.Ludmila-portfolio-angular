import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-petal-animation',
  imports: [],
  templateUrl: './petal-animation.html',
  styleUrl: './petal-animation.scss'
})
export class PetalAnimationComponent implements OnInit {
  
  ngOnInit() {
    this.createFlowers();
  }

  private createFlowers() {
    const container = document.querySelector('.petal-container');
    if (!container) return;

    const flowerCount = 40;
    const svgFlower = `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#ff6f91" stroke-width="1.5">
          <path d="M32 32 C36 20, 50 20, 44 32 C50 44, 36 44, 32 32 Z" fill="#ffb3c1"/>
          <circle cx="32" cy="32" r="2" fill="#ff4f70"/>
          <path d="M32 32 L36 28 M32 32 L28 28 M32 32 L36 36 M32 32 L28 36" stroke="#ff4f70" stroke-width="1"/>
        </g>
      </svg>
    `;

    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement('div');
      flower.classList.add('flower');
      flower.innerHTML = svgFlower;

      // Posición horizontal aleatoria
      flower.style.left = Math.random() * window.innerWidth + 'px';

      // Tamaño aleatorio
      const size = 20 + Math.random() * 25;
      flower.style.width = size + 'px';
      flower.style.height = size + 'px';

      // Duración de caída aleatoria
      const duration = 6 + Math.random() * 6; // entre 6s y 12s
      flower.style.animationDuration = duration + 's';

      // Delay aleatorio
      flower.style.animationDelay = Math.random() * 10 + 's';

      // Rotación inicial aleatoria
      flower.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(flower);
    }
  }
}
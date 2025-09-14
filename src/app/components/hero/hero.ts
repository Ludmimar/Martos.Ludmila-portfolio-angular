import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {

  downloadCV() {
    const originalText = 'Descargando...';
    const link = document.createElement('a');
    link.href = 'assets/files/cv-Martos.Ludmila.pdf';
    link.download = 'cv-Martos.Ludmila.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
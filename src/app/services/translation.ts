import { Injectable } from '@angular/core';

export interface Translation {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = 'es';
  private translations: { [lang: string]: Translation } = {
    es: {
      // Header
      'nav.home': 'Inicio',
      'nav.about': 'Sobre mí',
      'nav.skills': 'Habilidades',
      'nav.projects': 'Proyectos',
      'nav.contact': 'Contacto',
      
      // Hero
      'hero.title': 'De conectar con personas a conectar con tecnología',
      'hero.description': 'Vengo del mundo de ventas y atención al cliente, donde aprendí a escuchar y adaptarme rápido. Hoy vuelvo a mi primer amor: la programación. Me inspiran el anime, las flores de cerezo y el tejido a crochet, y quiero que mi código también refleje esa pasión y dedicación.',
      'hero.download_cv': 'Descargar CV',
      'hero.github': 'GitHub',
      'hero.linkedin': 'LinkedIn',
      
      // Skills
      'skills.title': 'Mis Superpoderes',
      'skills.subtitle': 'Mis soft skills de ventas + mis tech skills en IT',
      'skills.soft_skills': 'Soft Skills (Ventas)',
      'skills.tech_skills': 'Tech Skills (IT)',
      
      // Projects
      'projects.title': 'Proyectos',
      'projects.subtitle': 'Cada proyecto cuenta una parte del viaje: práctica, colaboración y entrega de valor.',
      'projects.view_github': 'Ver en GitHub',
      'projects.view_demo': 'Ver Demo',
      
      // Contact
      'contact.title': 'Contacto',
      'contact.subtitle': '¿Charlamos? Estoy abierta a colaborar en proyectos, prácticas y nuevas oportunidades',
      'contact.name': 'Nombre',
      'contact.email': 'Email',
      'contact.message': 'Mensaje',
      'contact.send': 'Enviar',
      'contact.sending': 'Enviando...',
      'contact.success': '¡Gracias! Tu mensaje fue enviado correctamente.',
      
      // Footer
      'footer.rights': 'Todos los derechos reservados',
      'footer.made_with': 'Hecho con',
      'footer.by': 'por Ludmila Martos'
    },
    en: {
      // Header
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.skills': 'Skills',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      
      // Hero
      'hero.title': 'From connecting with people to connecting with technology',
      'hero.description': 'I come from the world of sales and customer service, where I learned to listen and adapt quickly. Today I return to my first love: programming. I\'m inspired by anime, cherry blossoms and crochet, and I want my code to reflect that passion and dedication too.',
      'hero.download_cv': 'Download CV',
      'hero.github': 'GitHub',
      'hero.linkedin': 'LinkedIn',
      
      // Skills
      'skills.title': 'My Superpowers',
      'skills.subtitle': 'My sales soft skills + my IT tech skills',
      'skills.soft_skills': 'Soft Skills (Sales)',
      'skills.tech_skills': 'Tech Skills (IT)',
      
      // Projects
      'projects.title': 'Projects',
      'projects.subtitle': 'Each project tells part of the journey: practice, collaboration and value delivery.',
      'projects.view_github': 'View on GitHub',
      'projects.view_demo': 'View Demo',
      
      // Contact
      'contact.title': 'Contact',
      'contact.subtitle': 'Let\'s chat? I\'m open to collaborating on projects, internships and new opportunities',
      'contact.name': 'Name',
      'contact.email': 'Email',
      'contact.message': 'Message',
      'contact.send': 'Send',
      'contact.sending': 'Sending...',
      'contact.success': 'Thank you! Your message was sent successfully.',
      
      // Footer
      'footer.rights': 'All rights reserved',
      'footer.made_with': 'Made with',
      'footer.by': 'by Ludmila Martos'
    }
  };

  constructor() {
    // Cargar idioma desde localStorage o detectar idioma del navegador
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      if (this.translations[browserLanguage]) {
        this.currentLanguage = browserLanguage;
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): void {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('portfolio-language', language);
      
      // Actualizar el atributo lang del HTML
      document.documentElement.lang = language;
      
      // Disparar evento para que los componentes se actualicen
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language } 
      }));
    }
  }

  translate(key: string): string {
    return this.translations[this.currentLanguage][key] || key;
  }

  getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }

  isRTL(): boolean {
    // Para futuras implementaciones de idiomas RTL como árabe
    return false;
  }
}

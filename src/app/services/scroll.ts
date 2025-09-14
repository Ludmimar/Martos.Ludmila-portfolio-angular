import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor() { }

  initScrollAnimations() {
    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('show');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  initScrollToTop() {
    setTimeout(() => {
      const scrollBtn = document.getElementById('scrollTopBtn');
      if (!scrollBtn) {
        console.error('❌ Scroll to top button not found in DOM');
        return;
      }

      console.log('✅ Scroll to top button initialized');

      // Establecer estado inicial correcto - usar clases CSS en lugar de opacity directo
      scrollBtn.classList.remove('show');

      // Mostrar u ocultar el botón según scroll
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const shouldShow = scrollY > 300;
        
        console.log(`📏 Scroll position: ${scrollY}px, should show: ${shouldShow}`);
        
        if (shouldShow) {
          scrollBtn.classList.add('show');
          console.log('👁️ Button shown');
        } else {
          scrollBtn.classList.remove('show');
          console.log('🙈 Button hidden');
        }
      };

      // Agregar listener de scroll
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Agregar listener de clic para scroll to top
      scrollBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🔄 Scrolling to top...');
        
        // Limpiar la URL removiendo cualquier ancla
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('#')[0];
        
        // Cambiar la URL sin recargar la página
        window.history.replaceState(null, '', baseUrl);
        
        console.log('🧹 URL cleaned:', baseUrl);
        
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        console.log('✅ Scroll command executed');
      });
      
      console.log('👆 Click listener added to button');

      // Verificar estado inicial después de un pequeño delay para evitar parpadeo
      setTimeout(() => {
        handleScroll();
      }, 50);
    }, 100);
  }
}
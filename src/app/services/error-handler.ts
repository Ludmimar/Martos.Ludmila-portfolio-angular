import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {
  
  handleError(error: any): void {
    // Filtrar errores no críticos
    if (this.isNonCriticalError(error)) {
      return;
    }
    
    console.error('Error capturado:', error);
    
    // Aquí podrías enviar errores a un servicio de logging como Sentry
    // this.logErrorToService(error);
    
    // Mostrar mensaje de error amigable al usuario
    this.showUserFriendlyError(error);
  }

  private showUserFriendlyError(error: any): void {
    // Crear un toast o notificación de error
    const errorMessage = this.getErrorMessage(error);
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <span>${errorMessage}</span>
        <button onclick="this.parentElement.parentElement.remove()" aria-label="Cerrar error">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #f5c6cb;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  private isNonCriticalError(error: any): boolean {
    const errorMessage = error?.message || error?.toString() || '';
    
    // Suprimir errores de cookies cross-site
    if (errorMessage.includes('cookie') && errorMessage.includes('cross-site')) {
      return true;
    }
    
    // Suprimir errores de SameSite
    if (errorMessage.includes('SameSite')) {
      return true;
    }
    
    // Suprimir errores de GitHub cookies
    if (errorMessage.includes('_gh_sess') || errorMessage.includes('_octo') || errorMessage.includes('logged_in')) {
      return true;
    }
    
    // Suprimir errores de performance observer
    if (errorMessage.includes('entryTypes no compatibles') || errorMessage.includes('entryTypes no válidas')) {
      return true;
    }
    
    return false;
  }

  private getErrorMessage(error: any): string {
    if (error.message) {
      // Errores de red
      if (error.message.includes('Network')) {
        return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      // Errores de validación
      if (error.message.includes('validation')) {
        return 'Error de validación. Revisa los datos ingresados.';
      }
      
      // Errores de servidor
      if (error.message.includes('500')) {
        return 'Error del servidor. Intenta nuevamente en unos minutos.';
      }
      
      // Errores de permisos
      if (error.message.includes('403')) {
        return 'No tienes permisos para realizar esta acción.';
      }
      
      // Errores de recurso no encontrado
      if (error.message.includes('404')) {
        return 'El recurso solicitado no fue encontrado.';
      }
    }
    
    // Error genérico
    return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
  }
}

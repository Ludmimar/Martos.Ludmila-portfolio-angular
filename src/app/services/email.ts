import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() {
    emailjs.init("VKK1bOMx-UIll-q1F");
  }

  async sendEmail(name: string, email: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validar datos antes de enviar
      if (!this.validateEmailData(name, email, message)) {
        return { success: false, error: 'Datos de contacto inválidos' };
      }

      await emailjs.send("service_71n6aof", "template_fbyizub", {
        from_name: name,
        from_email: email,
        message: message,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al enviar el mensaje';
      
      if (error.status === 400) {
        errorMessage = 'Datos de contacto inválidos';
      } else if (error.status === 429) {
        errorMessage = 'Demasiados intentos. Espera unos minutos';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde';
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  private validateEmailData(name: string, email: string, message: string): boolean {
    // Validación básica
    if (!name || name.trim().length < 2) return false;
    if (!email || !this.isValidEmail(email)) return false;
    if (!message || message.trim().length < 10) return false;
    
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
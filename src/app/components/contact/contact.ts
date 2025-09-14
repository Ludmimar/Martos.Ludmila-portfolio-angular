import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmailService } from '../../services/email';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  // Métodos para obtener errores específicos
  getNameError(): string {
    const nameControl = this.contactForm.get('name');
    if (nameControl?.errors && nameControl.touched) {
      if (nameControl.errors['required']) return 'El nombre es requerido';
      if (nameControl.errors['minlength']) return 'El nombre debe tener al menos 2 caracteres';
      if (nameControl.errors['maxlength']) return 'El nombre no puede exceder 50 caracteres';
    }
    return '';
  }

  getEmailError(): string {
    const emailControl = this.contactForm.get('email');
    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) return 'El email es requerido';
      if (emailControl.errors['email']) return 'Ingresa un email válido';
    }
    return '';
  }

  getMessageError(): string {
    const messageControl = this.contactForm.get('message');
    if (messageControl?.errors && messageControl.touched) {
      if (messageControl.errors['required']) return 'El mensaje es requerido';
      if (messageControl.errors['minlength']) return 'El mensaje debe tener al menos 10 caracteres';
      if (messageControl.errors['maxlength']) return 'El mensaje no puede exceder 500 caracteres';
    }
    return '';
  }

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, message } = this.contactForm.value;

    try {
      const result = await this.emailService.sendEmail(name, email, message);
      
      if (result.success) {
        this.successMessage = '¡Gracias! Tu mensaje fue enviado correctamente.';
        this.contactForm.reset();
      } else {
        this.errorMessage = result.error || 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.';
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.errorMessage = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
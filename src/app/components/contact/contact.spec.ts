import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Contact } from './contact';
import { EmailService } from '../../services/email';

// Mock EmailService
const mockEmailService = {
  sendEmail: jest.fn()
};

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: EmailService, useValue: mockEmailService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    emailService = TestBed.inject(EmailService) as jest.Mocked<EmailService>;
    
    // Reset mocks
    jest.clearAllMocks();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.contactForm.get('name')?.value).toBe('');
      expect(component.contactForm.get('email')?.value).toBe('');
      expect(component.contactForm.get('message')?.value).toBe('');
    });

    it('should initialize form as invalid', () => {
      expect(component.contactForm.valid).toBe(false);
    });

    it('should initialize with correct validators', () => {
      const nameControl = component.contactForm.get('name');
      const emailControl = component.contactForm.get('email');
      const messageControl = component.contactForm.get('message');

      expect(nameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
      expect(messageControl?.hasError('required')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate name field correctly', () => {
      const nameControl = component.contactForm.get('name');

      // Test required
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      expect(component.getNameError()).toBe('El nombre es requerido');

      // Test minlength
      nameControl?.setValue('A');
      nameControl?.markAsTouched();
      expect(component.getNameError()).toBe('El nombre debe tener al menos 2 caracteres');

      // Test maxlength
      nameControl?.setValue('A'.repeat(51));
      nameControl?.markAsTouched();
      expect(component.getNameError()).toBe('El nombre no puede exceder 50 caracteres');

      // Test valid
      nameControl?.setValue('John Doe');
      nameControl?.markAsTouched();
      expect(component.getNameError()).toBe('');
    });

    it('should validate email field correctly', () => {
      const emailControl = component.contactForm.get('email');

      // Test required
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      expect(component.getEmailError()).toBe('El email es requerido');

      // Test invalid email
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      expect(component.getEmailError()).toBe('Ingresa un email válido');

      // Test valid email
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();
      expect(component.getEmailError()).toBe('');
    });

    it('should validate message field correctly', () => {
      const messageControl = component.contactForm.get('message');

      // Test required
      messageControl?.setValue('');
      messageControl?.markAsTouched();
      expect(component.getMessageError()).toBe('El mensaje es requerido');

      // Test minlength
      messageControl?.setValue('Short');
      messageControl?.markAsTouched();
      expect(component.getMessageError()).toBe('El mensaje debe tener al menos 10 caracteres');

      // Test maxlength
      messageControl?.setValue('A'.repeat(501));
      messageControl?.markAsTouched();
      expect(component.getMessageError()).toBe('El mensaje no puede exceder 500 caracteres');

      // Test valid
      messageControl?.setValue('This is a valid message with enough characters.');
      messageControl?.markAsTouched();
      expect(component.getMessageError()).toBe('');
    });

    it('should not show errors when field is not touched', () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.setValue('');
      // Don't mark as touched
      expect(component.getNameError()).toBe('');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Set up valid form data
      component.contactForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with enough characters.'
      });
    });

    it('should submit form successfully', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue({ success: true });

      await component.onSubmit();
      tick();

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'This is a test message with enough characters.'
      );
      expect(component.successMessage).toBe('¡Gracias! Tu mensaje fue enviado correctamente.');
      expect(component.errorMessage).toBe('');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle email service error', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue({ 
        success: false, 
        error: 'Network error' 
      });

      await component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Network error');
      expect(component.successMessage).toBe('');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle email service exception', fakeAsync(async () => {
      emailService.sendEmail.mockRejectedValue(new Error('Unexpected error'));

      await component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      expect(component.successMessage).toBe('');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should not submit invalid form', async () => {
      component.contactForm.patchValue({
        name: '',
        email: 'invalid-email',
        message: 'Short'
      });

      await component.onSubmit();

      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Por favor, completa todos los campos correctamente.');
    });

    it('should reset form after successful submission', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue({ success: true });

      await component.onSubmit();
      tick();

      expect(component.contactForm.get('name')?.value).toBe('');
      expect(component.contactForm.get('email')?.value).toBe('');
      expect(component.contactForm.get('message')?.value).toBe('');
    }));

    it('should set submitting state correctly', fakeAsync(async () => {
      emailService.sendEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const submitPromise = component.onSubmit();
      expect(component.isSubmitting).toBe(true);

      await submitPromise;
      tick(100);

      expect(component.isSubmitting).toBe(false);
    }));
  });

  describe('Edge Cases', () => {
    it('should handle form with whitespace-only values', () => {
      component.contactForm.patchValue({
        name: '   ',
        email: '   ',
        message: '   '
      });

      expect(component.contactForm.valid).toBe(false);
    });

    it('should handle form with special characters', () => {
      component.contactForm.patchValue({
        name: 'José María O\'Connor-Smith',
        email: 'test+tag@example-domain.co.uk',
        message: 'Mensaje con caracteres especiales: áéíóú ñ ç @#$%^&*()'
      });

      expect(component.contactForm.valid).toBe(true);
    });

    it('should handle very long valid input', () => {
      component.contactForm.patchValue({
        name: 'A'.repeat(50), // Maximum allowed
        email: 'test@example.com',
        message: 'A'.repeat(500) // Maximum allowed
      });

      expect(component.contactForm.valid).toBe(true);
    });

    it('should handle form submission with concurrent requests', fakeAsync(async () => {
      emailService.sendEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 50))
      );

      const promises = [
        component.onSubmit(),
        component.onSubmit(),
        component.onSubmit()
      ];

      await Promise.all(promises);
      tick(50);

      expect(emailService.sendEmail).toHaveBeenCalledTimes(3);
    }));

    it('should handle rapid form changes', () => {
      const nameControl = component.contactForm.get('name');
      
      // Rapid changes
      for (let i = 0; i < 100; i++) {
        nameControl?.setValue(`Name ${i}`);
        nameControl?.markAsTouched();
      }

      expect(component.getNameError()).toBe('');
    });

    it('should handle form with null/undefined values', () => {
      component.contactForm.patchValue({
        name: null,
        email: undefined,
        message: null
      });

      expect(component.contactForm.valid).toBe(false);
    });

    it('should handle email service returning null', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue(null as any);

      await component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    }));

    it('should handle email service returning undefined', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue(undefined as any);

      await component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    }));
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const compiled = fixture.nativeElement;
      
      const form = compiled.querySelector('form');
      expect(form.getAttribute('role')).toBe('form');
      expect(form.getAttribute('aria-label')).toBe('Formulario de contacto');

      const nameInput = compiled.querySelector('#name-input');
      expect(nameInput.getAttribute('aria-invalid')).toBe('false');
      expect(nameInput.getAttribute('aria-describedby')).toBeNull();

      const emailInput = compiled.querySelector('#email-input');
      expect(emailInput.getAttribute('aria-invalid')).toBe('false');
      expect(emailInput.getAttribute('aria-describedby')).toBeNull();

      const messageTextarea = compiled.querySelector('#message-input');
      expect(messageTextarea.getAttribute('aria-invalid')).toBe('false');
      expect(messageTextarea.getAttribute('aria-describedby')).toBe('message-count');
    });

    it('should update ARIA attributes on validation errors', () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const nameInput = compiled.querySelector('#name-input');
      expect(nameInput.getAttribute('aria-invalid')).toBe('true');
      expect(nameInput.getAttribute('aria-describedby')).toBe('name-error');
    });

    it('should have proper labels for screen readers', () => {
      const compiled = fixture.nativeElement;
      
      const labels = compiled.querySelectorAll('label');
      expect(labels.length).toBe(3);
      
      labels.forEach(label => {
        expect(label.classList.contains('sr-only')).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should handle form validation efficiently', () => {
      const startTime = performance.now();
      
      const nameControl = component.contactForm.get('name');
      for (let i = 0; i < 1000; i++) {
        nameControl?.setValue(`Name ${i}`);
        nameControl?.markAsTouched();
        component.getNameError();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should handle rapid form submissions efficiently', fakeAsync(async () => {
      emailService.sendEmail.mockResolvedValue({ success: true });
      
      const startTime = performance.now();
      
      const promises = Array.from({ length: 10 }, () => component.onSubmit());
      await Promise.all(promises);
      tick();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200);
    }));
  });

  describe('Integration', () => {
    it('should work with different email service responses', fakeAsync(async () => {
      const testCases = [
        { response: { success: true }, expectedError: '', expectedSuccess: '¡Gracias! Tu mensaje fue enviado correctamente.' },
        { response: { success: false, error: 'Server error' }, expectedError: 'Server error', expectedSuccess: '' },
        { response: { success: false }, expectedError: 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.', expectedSuccess: '' }
      ];

      for (const testCase of testCases) {
        emailService.sendEmail.mockResolvedValue(testCase.response);
        
        await component.onSubmit();
        tick();
        
        expect(component.errorMessage).toBe(testCase.expectedError);
        expect(component.successMessage).toBe(testCase.expectedSuccess);
        
        // Reset for next test
        component.errorMessage = '';
        component.successMessage = '';
      }
    }));

    it('should maintain form state across component lifecycle', () => {
      component.contactForm.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
      });

      // Simulate component destruction and recreation
      fixture.destroy();
      fixture = TestBed.createComponent(Contact);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Form should be reset
      expect(component.contactForm.get('name')?.value).toBe('');
      expect(component.contactForm.get('email')?.value).toBe('');
      expect(component.contactForm.get('message')?.value).toBe('');
    });
  });
});

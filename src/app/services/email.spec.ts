import { TestBed } from '@angular/core/testing';
import { EmailService } from './email';
import emailjs from 'emailjs-com';

// Mock EmailJS
jest.mock('emailjs-com', () => ({
  init: jest.fn(),
  send: jest.fn(),
}));

const mockEmailjs = emailjs as jest.Mocked<typeof emailjs>;

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailService]
    });
    service = TestBed.inject(EmailService);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize EmailJS on construction', () => {
    expect(mockEmailjs.init).toHaveBeenCalledWith('VKK1bOMx-UIll-q1F');
  });

  describe('sendEmail', () => {
    const validEmailData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message with enough characters to pass validation.'
    };

    it('should send email successfully with valid data', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockEmailjs.send).toHaveBeenCalledWith(
        'service_71n6aof',
        'template_fbyizub',
        {
          from_name: validEmailData.name,
          from_email: validEmailData.email,
          message: validEmailData.message,
        }
      );
    });

    it('should handle EmailJS success response', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(true);
    });

    it('should handle EmailJS error response', async () => {
      const errorResponse = { status: 400, text: 'Bad Request' };
      mockEmailjs.send.mockRejectedValue(errorResponse);

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
    });

    it('should handle network error', async () => {
      const networkError = { status: 0, text: 'Network Error' };
      mockEmailjs.send.mockRejectedValue(networkError);

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al enviar el mensaje');
    });

    it('should handle rate limiting error', async () => {
      const rateLimitError = { status: 429, text: 'Too Many Requests' };
      mockEmailjs.send.mockRejectedValue(rateLimitError);

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Demasiados intentos. Espera unos minutos');
    });

    it('should handle server error', async () => {
      const serverError = { status: 500, text: 'Internal Server Error' };
      mockEmailjs.send.mockRejectedValue(serverError);

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error del servidor. Intenta más tarde');
    });

    it('should handle offline error', async () => {
      // Mock navigator.onLine to false
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sin conexión a internet');

      // Restore navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('should handle unexpected error', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockEmailjs.send.mockRejectedValue(unexpectedError);

      const result = await service.sendEmail(
        validEmailData.name,
        validEmailData.email,
        validEmailData.message
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al enviar el mensaje');
    });
  });

  describe('Validation', () => {
    it('should reject email with invalid name (too short)', async () => {
      const result = await service.sendEmail(
        'A', // Too short
        'test@example.com',
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should reject email with invalid name (empty)', async () => {
      const result = await service.sendEmail(
        '', // Empty
        'test@example.com',
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should reject email with invalid email format', async () => {
      const result = await service.sendEmail(
        'John Doe',
        'invalid-email', // Invalid format
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should reject email with invalid email (empty)', async () => {
      const result = await service.sendEmail(
        'John Doe',
        '', // Empty
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should reject email with message too short', async () => {
      const result = await service.sendEmail(
        'John Doe',
        'test@example.com',
        'Short' // Too short
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should reject email with empty message', async () => {
      const result = await service.sendEmail(
        'John Doe',
        'test@example.com',
        '' // Empty
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de contacto inválidos');
      expect(mockEmailjs.send).not.toHaveBeenCalled();
    });

    it('should accept valid email with minimum requirements', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        'Jo', // Minimum length
        'a@b.co', // Minimum valid email
        '1234567890' // Minimum length
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalled();
    });

    it('should handle whitespace in inputs', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        '  John Doe  ', // With whitespace
        '  test@example.com  ', // With whitespace
        '  This is a valid message with enough characters.  ' // With whitespace
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalledWith(
        'service_71n6aof',
        'template_fbyizub',
        {
          from_name: 'John Doe', // Should be trimmed
          from_email: 'test@example.com', // Should be trimmed
          message: 'This is a valid message with enough characters.', // Should be trimmed
        }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in name', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        'José María O\'Connor-Smith',
        'test@example.com',
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalled();
    });

    it('should handle special characters in email', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const result = await service.sendEmail(
        'John Doe',
        'test+tag@example-domain.co.uk',
        'This is a valid message with enough characters.'
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalled();
    });

    it('should handle very long message', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const longMessage = 'A'.repeat(500); // Exactly 500 characters
      const result = await service.sendEmail(
        'John Doe',
        'test@example.com',
        longMessage
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalled();
    });

    it('should handle message with newlines and special characters', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const specialMessage = `Hello!

This is a message with:
- Bullet points
- Special characters: áéíóú ñ ç
- Numbers: 1234567890
- Symbols: @#$%^&*()

Best regards,
John`;

      const result = await service.sendEmail(
        'John Doe',
        'test@example.com',
        specialMessage
      );

      expect(result.success).toBe(true);
      expect(mockEmailjs.send).toHaveBeenCalled();
    });

    it('should handle concurrent email requests', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const promises = Array.from({ length: 3 }, (_, i) =>
        service.sendEmail(
          `User ${i}`,
          `user${i}@example.com`,
          `Message ${i} with enough characters to pass validation.`
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockEmailjs.send).toHaveBeenCalledTimes(3);
    });
  });

  describe('Email Validation Regex', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'test123@test-domain.com',
      'a@b.co',
      'user@sub.domain.com'
    ];

    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user..name@example.com',
      'user@.com',
      'user@domain.',
      'user name@example.com',
      'user@domain space.com'
    ];

    it('should accept valid email formats', async () => {
      mockEmailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      for (const email of validEmails) {
        const result = await service.sendEmail(
          'John Doe',
          email,
          'This is a valid message with enough characters.'
        );
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid email formats', async () => {
      for (const email of invalidEmails) {
        const result = await service.sendEmail(
          'John Doe',
          email,
          'This is a valid message with enough characters.'
        );
        expect(result.success).toBe(false);
        expect(result.error).toBe('Datos de contacto inválidos');
      }
    });
  });
});

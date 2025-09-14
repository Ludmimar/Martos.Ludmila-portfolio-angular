# 🧪 Testing Guide - Portfolio Angular

## 📋 Overview

Este proyecto implementa un sistema de testing robusto con **Jest** y **Angular Testing Utilities** para asegurar la calidad y confiabilidad del código.

## 🚀 Quick Start

### Ejecutar Tests

```bash
# Tests con Jest (recomendado)
npm run test:jest

# Tests con cobertura
npm run test:jest:coverage

# Tests en modo watch (desarrollo)
npm run test:jest:watch

# Tests en CI/CD
npm run test:jest:ci

# Todos los tests (Jest + Angular)
npm run test:all
```

### Ver Coverage

```bash
# Generar reporte de cobertura
npm run test:jest:coverage

# Abrir reporte en navegador (macOS)
npm run coverage:open

# Verificar umbrales de cobertura
npm run coverage:check
```

## 📊 Coverage Targets

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🏗️ Test Structure

### Services Tests
- ✅ **ProjectService**: Tests completos con HTTP mocking
- ✅ **EmailService**: Tests de validación y envío de emails
- ✅ **ThemeService**: Tests de gestión de temas
- ✅ **TranslationService**: Tests de internacionalización

### Components Tests
- ✅ **Contact**: Tests de formularios y validación
- ✅ **Projects**: Tests de filtrado y modales
- 🔄 **Header**: Tests de navegación (pendiente)
- 🔄 **Skills**: Tests de renderizado (pendiente)

### Test Categories

#### 1. **Unit Tests**
```typescript
describe('ServiceName', () => {
  it('should handle valid input', () => {
    // Test implementation
  });
});
```

#### 2. **Integration Tests**
```typescript
describe('Component Integration', () => {
  it('should work with service dependencies', () => {
    // Integration test
  });
});
```

#### 3. **Edge Cases**
```typescript
describe('Edge Cases', () => {
  it('should handle null/undefined values', () => {
    // Edge case test
  });
});
```

#### 4. **Performance Tests**
```typescript
describe('Performance', () => {
  it('should handle large datasets efficiently', () => {
    // Performance test
  });
});
```

## 🛠️ Test Utilities

### Mocking

#### HTTP Requests
```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

const httpMock = TestBed.inject(HttpTestingController);
const req = httpMock.expectOne('/api/endpoint');
req.flush(mockData);
```

#### Services
```typescript
const mockService = {
  method: jest.fn()
};
TestBed.configureTestingModule({
  providers: [{ provide: Service, useValue: mockService }]
});
```

#### Browser APIs
```typescript
// localStorage
Object.defineProperty(window, 'localStorage', {
  value: { getItem: jest.fn(), setItem: jest.fn() }
});

// matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});
```

### Async Testing
```typescript
import { fakeAsync, tick } from '@angular/core/testing';

it('should handle async operations', fakeAsync(() => {
  component.asyncMethod();
  tick();
  expect(component.result).toBe(expectedValue);
}));
```

## 📝 Writing Tests

### Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Test Structure (AAA Pattern)
```typescript
it('should return expected result', () => {
  // Arrange
  const input = 'test input';
  const expected = 'expected output';
  
  // Act
  const result = component.method(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### Best Practices

1. **One concept per test**
2. **Descriptive test names**
3. **Test edge cases**
4. **Mock external dependencies**
5. **Test error scenarios**
6. **Verify cleanup**

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Setup File (`src/setup-jest.ts`)
- Mocks para browser APIs
- Configuración global de Jest
- Polyfills necesarios

## 🚨 Common Issues

### 1. **Async Operations**
```typescript
// ❌ Wrong
it('should handle async', () => {
  component.asyncMethod();
  expect(component.result).toBe(expected); // May fail
});

// ✅ Correct
it('should handle async', fakeAsync(() => {
  component.asyncMethod();
  tick();
  expect(component.result).toBe(expected);
}));
```

### 2. **Component Lifecycle**
```typescript
// ❌ Wrong
it('should initialize', () => {
  expect(component.data).toBeDefined(); // May be undefined
});

// ✅ Correct
it('should initialize', () => {
  fixture.detectChanges(); // Triggers ngOnInit
  expect(component.data).toBeDefined();
});
```

### 3. **HTTP Mocking**
```typescript
// ❌ Wrong
it('should load data', () => {
  component.loadData();
  expect(component.data).toBeDefined(); // May fail
});

// ✅ Correct
it('should load data', () => {
  component.loadData();
  const req = httpMock.expectOne('/api/data');
  req.flush(mockData);
  expect(component.data).toBeDefined();
});
```

## 📈 Coverage Reports

### HTML Report
- Ubicación: `coverage/lcov-report/index.html`
- Muestra cobertura por archivo
- Identifica líneas no cubiertas

### LCOV Report
- Ubicación: `coverage/lcov.info`
- Formato estándar para CI/CD
- Compatible con herramientas externas

### Text Report
- Muestra resumen en consola
- Incluye métricas globales
- Identifica archivos con baja cobertura

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:jest:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Pre-commit Hooks
```bash
# Instalar husky
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run precommit"
```

## 🎯 Next Steps

### Pending Tests
- [ ] Header component tests
- [ ] Skills component tests
- [ ] Footer component tests
- [ ] Navigation component tests
- [ ] E2E tests with Cypress

### Improvements
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Accessibility tests
- [ ] Cross-browser testing

## 📚 Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Angular Testing Utilities](https://angular.io/api/core/testing)

## 🤝 Contributing

1. Write tests for new features
2. Maintain coverage above 80%
3. Follow naming conventions
4. Test edge cases
5. Update this guide when needed

---

**Happy Testing! 🧪✨**

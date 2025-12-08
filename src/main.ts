import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Vercel Speed Insights (client-side only)
injectSpeedInsights();

// Filtrar errores y warnings de consola no críticos
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suprimir errores de cookies cross-site
  if (message.includes('cookie') && message.includes('cross-site')) {
    return;
  }
  
  // Suprimir errores de SameSite
  if (message.includes('SameSite')) {
    return;
  }
  
  // Suprimir errores de GitHub cookies
  if (message.includes('_gh_sess') || message.includes('_octo') || message.includes('logged_in')) {
    return;
  }
  
  // Suprimir errores de performance observer
  if (message.includes('entryTypes no compatibles') || message.includes('entryTypes no válidas')) {
    return;
  }
  
  // Mostrar otros errores normalmente
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suprimir warnings de performance observer
  if (message.includes('Ignorando entryTypes no compatibles') || 
      message.includes('entryTypes no válidas; se aborta registro') ||
      message.includes('Layout Shift observer not supported')) {
    return;
  }
  
  // Mostrar otros warnings normalmente
  originalConsoleWarn.apply(console, args);
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

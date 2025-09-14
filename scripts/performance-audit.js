#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceAuditor {
  constructor() {
    this.results = {
      bundleSize: {},
      lighthouse: {},
      bundleAnalysis: {},
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🚀 Iniciando auditoría de performance...\n');

    try {
      await this.auditBundleSize();
      await this.auditLighthouse();
      await this.auditBundleAnalysis();
      this.generateRecommendations();
      this.generateReport();
    } catch (error) {
      console.error('❌ Error durante la auditoría:', error.message);
      process.exit(1);
    }
  }

  async auditBundleSize() {
    console.log('📦 Analizando tamaño del bundle...');
    
    try {
      // Build the project
      execSync('npm run build:prod', { stdio: 'pipe' });
      
      // Analyze bundle size
      const distPath = path.join(process.cwd(), 'dist/portfolio-angular/browser');
      const files = this.getFilesRecursively(distPath);
      
      this.results.bundleSize = {
        totalSize: this.getTotalSize(files),
        files: files.map(file => ({
          name: path.relative(distPath, file.path),
          size: file.size,
          sizeKB: (file.size / 1024).toFixed(2)
        })),
        largestFiles: files
          .sort((a, b) => b.size - a.size)
          .slice(0, 10)
          .map(file => ({
            name: path.relative(distPath, file.path),
            sizeKB: (file.size / 1024).toFixed(2)
          }))
      };

      console.log(`✅ Bundle total: ${(this.results.bundleSize.totalSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.log('⚠️ No se pudo analizar el bundle size:', error.message);
    }
  }

  async auditLighthouse() {
    console.log('🔍 Ejecutando Lighthouse audit...');
    
    try {
      // Check if lighthouse is installed
      try {
        execSync('lighthouse --version', { stdio: 'pipe' });
      } catch {
        console.log('📥 Instalando Lighthouse...');
        execSync('npm install -g lighthouse', { stdio: 'pipe' });
      }

      // Start local server
      const server = execSync('npm run serve &', { stdio: 'pipe' });
      
      // Wait for server to start
      await this.sleep(5000);

      // Run lighthouse audit
      const lighthouseOutput = execSync(
        'lighthouse http://localhost:4200 --output=json --chrome-flags="--headless" --quiet',
        { stdio: 'pipe' }
      );

      const lighthouseData = JSON.parse(lighthouseOutput.toString());
      
      this.results.lighthouse = {
        performance: Math.round(lighthouseData.lhr.categories.performance.score * 100),
        accessibility: Math.round(lighthouseData.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouseData.lhr.categories['best-practices'].score * 100),
        seo: Math.round(lighthouseData.lhr.categories.seo.score * 100),
        metrics: {
          fcp: lighthouseData.lhr.audits['first-contentful-paint'].numericValue,
          lcp: lighthouseData.lhr.audits['largest-contentful-paint'].numericValue,
          fid: lighthouseData.lhr.audits['max-potential-fid'].numericValue,
          cls: lighthouseData.lhr.audits['cumulative-layout-shift'].numericValue,
          ttfb: lighthouseData.lhr.audits['server-response-time'].numericValue
        },
        opportunities: lighthouseData.lhr.audits['unused-css-rules']?.details?.items?.length || 0
      };

      console.log(`✅ Performance Score: ${this.results.lighthouse.performance}/100`);
      console.log(`✅ Accessibility Score: ${this.results.lighthouse.accessibility}/100`);
      
      // Kill server
      execSync('pkill -f "ng serve"', { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️ No se pudo ejecutar Lighthouse:', error.message);
    }
  }

  async auditBundleAnalysis() {
    console.log('🔬 Analizando bundle con webpack-bundle-analyzer...');
    
    try {
      // Generate stats.json
      execSync('npm run build:prod -- --stats-json', { stdio: 'pipe' });
      
      const statsPath = path.join(process.cwd(), 'dist/portfolio-angular/browser/stats.json');
      
      if (fs.existsSync(statsPath)) {
        const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        
        this.results.bundleAnalysis = {
          totalSize: stats.assets.reduce((sum, asset) => sum + asset.size, 0),
          chunks: stats.chunks.map(chunk => ({
            id: chunk.id,
            size: chunk.size,
            modules: chunk.modules?.length || 0
          })),
          modules: stats.modules
            .sort((a, b) => b.size - a.size)
            .slice(0, 20)
            .map(module => ({
              name: module.name,
              size: module.size,
              sizeKB: (module.size / 1024).toFixed(2)
            }))
        };

        console.log(`✅ Bundle analysis completado`);
      }
    } catch (error) {
      console.log('⚠️ No se pudo analizar el bundle:', error.message);
    }
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    if (this.results.bundleSize.totalSize > 500 * 1024) { // 500KB
      recommendations.push({
        category: 'Bundle Size',
        priority: 'High',
        issue: 'Bundle size exceeds 500KB',
        solution: 'Implement code splitting and lazy loading'
      });
    }

    // Lighthouse performance recommendations
    if (this.results.lighthouse.performance < 90) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        issue: `Performance score is ${this.results.lighthouse.performance}/100`,
        solution: 'Optimize images, implement lazy loading, and reduce JavaScript bundle size'
      });
    }

    // Core Web Vitals recommendations
    if (this.results.lighthouse.metrics?.lcp > 2500) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'High',
        issue: `LCP is ${this.results.lighthouse.metrics.lcp}ms (should be < 2500ms)`,
        solution: 'Optimize largest contentful paint by improving image loading and reducing render-blocking resources'
      });
    }

    if (this.results.lighthouse.metrics?.cls > 0.1) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'Medium',
        issue: `CLS is ${this.results.lighthouse.metrics.cls} (should be < 0.1)`,
        solution: 'Fix layout shifts by setting dimensions for images and avoiding dynamic content insertion'
      });
    }

    // Accessibility recommendations
    if (this.results.lighthouse.accessibility < 95) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'Medium',
        issue: `Accessibility score is ${this.results.lighthouse.accessibility}/100`,
        solution: 'Improve accessibility by adding proper ARIA labels and ensuring keyboard navigation'
      });
    }

    this.results.recommendations = recommendations;
  }

  generateReport() {
    const report = this.formatReport();
    
    // Save to file
    const reportPath = path.join(process.cwd(), 'performance-audit-report.md');
    fs.writeFileSync(reportPath, report);
    
    // Display in console
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(report);
    console.log('\n📄 Report saved to: performance-audit-report.md');
  }

  formatReport() {
    let report = '# 🚀 Performance Audit Report\n\n';
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // Bundle Size Section
    if (this.results.bundleSize.totalSize) {
      report += '## 📦 Bundle Size Analysis\n\n';
      report += `**Total Size:** ${(this.results.bundleSize.totalSize / 1024 / 1024).toFixed(2)} MB\n\n`;
      
      if (this.results.bundleSize.largestFiles.length > 0) {
        report += '### Largest Files:\n\n';
        report += '| File | Size |\n';
        report += '|------|------|\n';
        this.results.bundleSize.largestFiles.forEach(file => {
          report += `| ${file.name} | ${file.sizeKB} KB |\n`;
        });
        report += '\n';
      }
    }

    // Lighthouse Section
    if (this.results.lighthouse.performance) {
      report += '## 🔍 Lighthouse Audit\n\n';
      report += `**Performance:** ${this.results.lighthouse.performance}/100\n`;
      report += `**Accessibility:** ${this.results.lighthouse.accessibility}/100\n`;
      report += `**Best Practices:** ${this.results.lighthouse.bestPractices}/100\n`;
      report += `**SEO:** ${this.results.lighthouse.seo}/100\n\n`;

      if (this.results.lighthouse.metrics) {
        report += '### Core Web Vitals:\n\n';
        report += `- **FCP:** ${this.results.lighthouse.metrics.fcp.toFixed(2)}ms\n`;
        report += `- **LCP:** ${this.results.lighthouse.metrics.lcp.toFixed(2)}ms\n`;
        report += `- **FID:** ${this.results.lighthouse.metrics.fid.toFixed(2)}ms\n`;
        report += `- **CLS:** ${this.results.lighthouse.metrics.cls.toFixed(3)}\n`;
        report += `- **TTFB:** ${this.results.lighthouse.metrics.ttfb.toFixed(2)}ms\n\n`;
      }
    }

    // Recommendations Section
    if (this.results.recommendations.length > 0) {
      report += '## 🎯 Recommendations\n\n';
      
      const highPriority = this.results.recommendations.filter(r => r.priority === 'High');
      const mediumPriority = this.results.recommendations.filter(r => r.priority === 'Medium');
      
      if (highPriority.length > 0) {
        report += '### 🔴 High Priority\n\n';
        highPriority.forEach((rec, index) => {
          report += `${index + 1}. **${rec.category}:** ${rec.issue}\n`;
          report += `   - *Solution:* ${rec.solution}\n\n`;
        });
      }
      
      if (mediumPriority.length > 0) {
        report += '### 🟡 Medium Priority\n\n';
        mediumPriority.forEach((rec, index) => {
          report += `${index + 1}. **${rec.category}:** ${rec.issue}\n`;
          report += `   - *Solution:* ${rec.solution}\n\n`;
        });
      }
    }

    // Summary
    report += '## 📋 Summary\n\n';
    const totalIssues = this.results.recommendations.length;
    const highIssues = this.results.recommendations.filter(r => r.priority === 'High').length;
    
    if (totalIssues === 0) {
      report += '🎉 **Excellent!** No performance issues detected.\n';
    } else {
      report += `⚠️ **${totalIssues} issues found** (${highIssues} high priority)\n\n`;
      report += 'Focus on high priority issues first for maximum impact.\n';
    }

    return report;
  }

  getFilesRecursively(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else {
          files.push({
            path: fullPath,
            size: stat.size
          });
        }
      });
    }
    
    traverse(dir);
    return files;
  }

  getTotalSize(files) {
    return files.reduce((sum, file) => sum + file.size, 0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the audit
const auditor = new PerformanceAuditor();
auditor.runAudit().catch(console.error);

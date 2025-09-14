import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() {}

  // Track page views
  trackPageView(pagePath: string, pageTitle: string) {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  }

  // Track custom events
  trackEvent(eventName: string, parameters?: any) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
  }

  // Track CV download
  trackCVDownload() {
    this.trackEvent('cv_download', {
      event_category: 'engagement',
      event_label: 'CV Download',
      value: 1
    });
  }

  // Track project clicks
  trackProjectClick(projectTitle: string, projectType: 'github' | 'demo') {
    this.trackEvent('project_click', {
      event_category: 'engagement',
      event_label: `${projectTitle} - ${projectType}`,
      value: 1
    });
  }

  // Track contact form submission
  trackContactFormSubmission(success: boolean) {
    this.trackEvent('contact_form_submission', {
      event_category: 'engagement',
      event_label: success ? 'success' : 'error',
      value: success ? 1 : 0
    });
  }

  // Track section views
  trackSectionView(sectionName: string) {
    this.trackEvent('section_view', {
      event_category: 'engagement',
      event_label: sectionName,
      value: 1
    });
  }

  // Track external links
  trackExternalLink(linkType: string, url: string) {
    this.trackEvent('external_link_click', {
      event_category: 'outbound',
      event_label: linkType,
      value: 1,
      custom_parameter_url: url
    });
  }
}

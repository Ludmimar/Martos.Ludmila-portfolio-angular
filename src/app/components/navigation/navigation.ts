import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation implements OnInit, OnDestroy {
  private scrollListener?: () => void;

  ngOnInit() {
    this.initStickyNavigation();
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initStickyNavigation() {
    this.scrollListener = () => {
      const stickyBar = document.querySelector('.sticky-bar') as HTMLElement;
      if (!stickyBar) return;

      const header = document.querySelector('header') as HTMLElement;
      if (!header) return;

      const headerHeight = header.offsetHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop >= headerHeight) {
        stickyBar.style.position = 'fixed';
        stickyBar.style.top = '0';
        stickyBar.style.left = '0';
        stickyBar.style.right = '0';
        stickyBar.style.zIndex = '1000';
      } else {
        stickyBar.style.position = 'sticky';
        stickyBar.style.top = '0';
        stickyBar.style.left = '';
        stickyBar.style.right = '';
        stickyBar.style.zIndex = '100';
      }
    };

    window.addEventListener('scroll', this.scrollListener);
  }
}
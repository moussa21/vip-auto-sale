import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  imports: [NgIf],
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.scss'
})
export class PwaInstall implements OnInit, OnDestroy {
  showBanner = false;
  private deferredPrompt: any;
  private listener!: (e: Event) => void;

  ngOnInit() {
    this.listener = (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showBanner = true;
    };
    window.addEventListener('beforeinstallprompt', this.listener);
  }

  ngOnDestroy() {
    window.removeEventListener('beforeinstallprompt', this.listener);
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.showBanner = false;
    if (outcome === 'accepted') console.log('PWA installed');
  }

  dismiss() { this.showBanner = false; }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { PwaInstall } from './components/pwa-install/pwa-install';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, PwaInstall],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-pwa-install></app-pwa-install>
  `,
  styles: [`
    main { min-height: calc(100vh - 64px - 180px); }
  `]
})
export class App {}

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "jakocrudapp", appId: "1:306042422243:web:0e3b6c98147322575916d6", storageBucket: "jakocrudapp.firebasestorage.app", apiKey: "AIzaSyAn5LHoaaOd7bQLNLaJ9mww_FxA3DNvY8A", authDomain: "jakocrudapp.firebaseapp.com", messagingSenderId: "306042422243", measurementId: "G-DHYX8YE8DD" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};

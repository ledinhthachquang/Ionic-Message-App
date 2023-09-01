import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        const userEmail = result.user.email;
        const userName = result.user.displayName;
        // Navigate to user profile page with user email and name
        this.router.navigate(['/profile'], { queryParams: { email: userEmail, name: userName } });
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }

  async signUpWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        const userEmail = result.user.email;
        const userName = result.user.displayName;
        // Navigate to user profile page with user email and name
        this.router.navigate(['/profile'], { queryParams: { email: userEmail, name: userName } });
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  }

  async signOut() {
    try {
      this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

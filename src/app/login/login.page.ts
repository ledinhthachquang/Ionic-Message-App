import { Component } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service'; // Update the path accordingly

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage {
  email!: string;
  password!: string;

  constructor(private authService: FirebaseAuthService) {}

  login() {
    this.authService.signInWithEmailAndPassword(this.email, this.password);
  }
}

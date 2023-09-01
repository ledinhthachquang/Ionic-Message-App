import { Component } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service'; // Update the path accordingly

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss']
})
export class SignupPage {
  email!: string;
  password!: string;

  constructor(private authService: FirebaseAuthService) {}

  signUp() {
    this.authService.signUpWithEmailAndPassword(this.email, this.password);
  }

}

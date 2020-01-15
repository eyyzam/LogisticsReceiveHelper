import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLogin = true;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    ) { }

  ngOnInit() {
  }

  Authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging In...'
    }).then(loadingEl => {
      loadingEl.present();
      let authObs: Observable<AuthResponseData>;
      if (this.isLogin) {
        authObs = this.authService.onLogin(email, password);
      } else {
        authObs = this.authService.signUp(email, password);
      }
      authObs.subscribe(
        resData => {
          this.isLoading = false;
          loadingEl.dismiss();
          this.router.navigate(["../"]);
        },
        errRes => {
          loadingEl.dismiss();
          const code = errRes.error.error.message;
          let message = 'Nie można cię autoryzować, ponów próbę za chwile';
          if (code === 'EMAIL_EXISTS') {
            message = 'Ten adres E-Mail jest już zajęty';
          } else if (code === 'INVALID_PASSWORD') {
            message = 'Nieprawidłowe Hasło';
          } else if (code === 'EMAIL_NOT_FOUND') {
            message = 'Nie ma takiego adresu E-Mail w bazie danych';
          }
          this.showAlert(message);
      });
    });
  }

  onLogout() {
    this.authService.onLogout();
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.Authenticate(email, password);
    form.resetForm();
  }

  switchAuthModes() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Operacja nie powiodła się',
      message,
      buttons: [
        'OK'
      ]
    }).then(alertEl => alertEl.present());
  }
}

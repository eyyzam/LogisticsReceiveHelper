import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {

  private userData: Subscription;
  loggedInUserEmail: string | false;

  constructor(private menu: MenuController, private authService: AuthService) { }

  ngOnInit() {
    this.WhoIsLoggedIn();
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  routeClickCloseMenu() {
    this.menu.close();
  }

  WhoIsLoggedIn() {
    this.userData = this.authService.WhoIsLoggedIn.subscribe(userData => {
      this.loggedInUserEmail = userData === false ? null : userData;
    });
  }

  onLogOut() {
    this.authService.onLogout();
  }
}

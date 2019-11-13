import { Component } from '@angular/core';
import { Platform, NavController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { InitService } from './services/init.service';
import { EnvService } from './services/env.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private initService: InitService,
    private navCtrl: NavController,
    private env: EnvService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.authService.getToken();
      this.initService.checkNetwork();
    });
  }

}

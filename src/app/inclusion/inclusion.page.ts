import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-inclusion',
  templateUrl: './inclusion.page.html',
  styleUrls: ['./inclusion.page.scss'],
})
export class InclusionPage implements OnInit {

	@Input() form:any;

  constructor(
  	public modalController: ModalController,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }

}

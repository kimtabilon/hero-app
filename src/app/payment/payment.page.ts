import { Component, OnInit } from '@angular/core';
import { ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  
  
  constructor(
    public modalController: ModalController,
  ) {
  	
  }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }

}

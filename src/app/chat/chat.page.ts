import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

	@ViewChild('content') private content: any;
	@Input() job:any;
	@Input() customer:any;

	messages:any = [];
	chat:any;
	provider:any = {};
	client:any = {};

  constructor(
  	public modalController: ModalController,
    public alertController: AlertController,
    private env: EnvService,
    private http: HttpClient,
    public loading: LoadingService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  	
  }

  ionViewWillEnter() {
  	this.provider.photo = this.env.DEFAULT_IMG;
  	this.provider.name = this.job.hero.profile.first_name+' '+this.job.hero.profile.last_name;

  	if(this.job.hero.profile.photo != null) {
      this.provider.photo = this.env.IMAGE_URL + 'uploads/' + this.job.hero.profile.photo;
    } 

    this.client.photo = this.customer.photo;
  	this.client.name = this.customer.first_name+' '+this.customer.last_name;

  	this.http.post(this.env.HERO_API + 'chats/byJob',{ job_id: this.job.id })
      .subscribe(data => {
        let response:any = data; 
         this.messages = response.data;

        setTimeout(() => {
            if (this.content.scrollToBottom) {
                this.content.scrollToBottom(400);
            }
        }, 500);

        setInterval(() => {
            this.http.post(this.env.HERO_API + 'chats/byJob',{ job_id: this.job.id })
              .subscribe(data => {
                let response:any = data; 
                 this.messages = response.data;
                 setTimeout(() => {
                    if (this.content.scrollToBottom) {
                        this.content.scrollToBottom(400);
                    }
                 }, 500);
              },error => { 
                  console.log(error);  
              }
            );

            // this.content.scrollToBottom(400);  
        }, 20000);
      },error => { 
          console.log(error);  
      }
    );
  }

  send() {
  	this.messages.push({
  		'from':'client',
  		'chat':this.chat
  	});
  	
  	setTimeout(() => {
        if (this.content.scrollToBottom) {
            this.content.scrollToBottom(400);
        }
    }, 500);

    this.http.post(this.env.HERO_API + 'chats/save',{ 
    		xjob_id: this.job.id,
    		xchat: this.chat,
    		xfrom: 'client'
    	})
      .subscribe(data => {
        let response:any = data; 
      },error => { 
          console.log(error);  
      }
    );

    this.chat = '';
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }

}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MenuController, NavController, ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Profile } from 'src/app/models/profile';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { GetService } from 'src/app/services/get.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { finalize } from 'rxjs/operators';
import { OrderPipe } from 'ngx-order-pipe';

const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html', 
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user:any = {
    email: '',
    password: '',
    status: ''
  };  
  profile:any = {
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    gender: '',
    photo: ''
  };  

  address:any = {
    id: '',
    profile_id: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    country: '',
    zip: ''
  };

  contact:any = {
    id: '',
    profile_id: '',
    dial_code: '',
    number: ''
  };

  photo:any = '';
  page:any = 'profile';
  customer:any = '';	
  images = [];
  categories:any;
  reviews:any = [];
  logs:any = [];

  provinces:any = [];
  cities:any = [];
  barangays:any = [];

  constructor(
  	private menu: MenuController, 
  	private authService: AuthService,
  	private navCtrl: NavController,
    private storage: Storage,
    private alertService: AlertService,
    public loading: LoadingService,
    public getService: GetService,
    public router : Router,
    private http: HttpClient,
    private env: EnvService,

    private camera: Camera, 
    private file: File, 
    private webview: WebView,
    private actionSheetController: ActionSheetController, 
    private toastController: ToastController,
    private platform: Platform, 
    private loadingController: LoadingController,
    private ref: ChangeDetectorRef, 
    private filePath: FilePath,
    private orderPipe: OrderPipe,
  ) { 
  	this.menu.enable(true);	
  }

  ngOnInit() {
  }

  doRefresh(event) {
    this.http
    .post(this.env.HERO_API + 'customer/login',{email: this.user.email, password:  this.user.password})
    .subscribe(data => {
        let response:any = data;
        this.storage.set('customer', response);
        this.user = response.data;
        this.ionViewWillEnter();
    },error => { 
      this.logout();
      console.log(error); 
    });

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  ionViewWillEnter() {
    this.loading.present(); 
    
    this.storage.get('customer').then((val) => {
      // console.log(val.data);
      this.customer = val;
      this.user = val.data;
      this.profile = val.data.profile;

      if(this.profile.addresses.length) {
        this.address = this.profile.addresses[0];
      } else {
        this.address = {
          id: '',
          profile_id: this.profile.id,
          street: '',
          barangay: '',
          city: '',
          province: '',
          country: '',
          zip: ''
        };
      }

      if(this.profile.contacts.length) {
        this.contact = this.profile.contacts[0];
      } else {
        this.contact = {
          id: '',
          profile_id: this.profile.id,
          dial_code: '',
          number: ''
        };
      }

      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }
    });

    fetch('./assets/json/refprovince.json').then(res => res.json())
    .then(json => {
      // console.log(json.RECORDS);
      let records:any = json.RECORDS
      let province:any = records.filter(item => item.provDesc === this.address.province)[0];
      this.provinces = this.orderPipe.transform(records, 'provDesc'); 
      
      fetch('./assets/json/refcitymun.json').then(res => res.json())
      .then(json => {
        // console.log(json.RECORDS);
        let records:any = json.RECORDS
        let city:any = records.filter(item => item.citymunDesc === this.address.city)[0];
        this.cities = records.filter(item => item.provCode === province.provCode);
        this.cities = this.orderPipe.transform(this.cities, 'citymunDesc');

        fetch('./assets/json/refbrgy.json').then(res => res.json())
        .then(json => {
          let records:any = json.RECORDS
          this.barangays = records.filter(item => item.citymunCode === city.citymunCode);
          this.barangays = this.orderPipe.transform(this.barangays, 'brgyDesc');
        });
      });
    });
    this.loading.dismiss();
  }

  tapProvince(event){ 
    let prov:any = event.detail.value;
    fetch('./assets/json/refprovince.json').then(res => res.json())
    .then(json => {
      let records:any = json.RECORDS
      let province:any = records.filter(item => item.provDesc === prov)[0];
      fetch('./assets/json/refcitymun.json').then(res => res.json())
      .then(json => {
        let records:any = json.RECORDS
        this.cities = records.filter(item => item.provCode === province.provCode);
        this.cities = this.orderPipe.transform(this.cities, 'citymunDesc');
      });
    });
  };

  tapCity(event){ 
    let ci:any = event.detail.value;
    fetch('./assets/json/refcitymun.json').then(res => res.json())
    .then(json => {
      let records:any = json.RECORDS
      let city:any = records.filter(item => item.citymunDesc === ci)[0];

      fetch('./assets/json/refbrgy.json').then(res => res.json())
      .then(json => {
        let records:any = json.RECORDS
        this.barangays = records.filter(item => item.citymunCode === city.citymunCode);
        this.barangays = this.orderPipe.transform(this.barangays, 'brgyDesc');
      });
    });
  };

  tapBarangay(event){ 
    
  };

  tapMyProfile(){
    this.loading.present();
    this.page='profile';
    this.loading.dismiss();
  }

  tapLogs(){
    this.loading.present();
    this.http.post(this.env.HERO_API + 'logs/byUser',{ user_id: this.user.id, app_key: this.env.APP_ID })
      .subscribe(data => {
        let response:any = data; 
        this.logs = response.data;
        console.log(response);
      },error => { 
        this.alertService.presentToast("Somethings went wrong");
        console.log(error);
    },() => { });  
    this.page='logs';
    this.loading.dismiss();
  }

  tapReviews(){
    this.loading.present();
    this.http.post(this.env.HERO_API + 'reviews/byClient',{ customer_id: this.user.id })
      .subscribe(data => {
        let response:any = data; 
        this.reviews = response.data;
      },error => { this.alertService.presentToast("Somethings went wrong.");
    },() => { });  

    this.page='reviews';
    this.loading.dismiss();
  }

  parse(customer_info) {
    return JSON.parse(customer_info);
  }

  tapMyAddress(){
    this.loading.present();
    this.page='address';
    this.loading.dismiss();
  }

  tapMyContact(){
    this.loading.present();
    this.page='contact';
    this.loading.dismiss();
  }

  tapUpdate() {
    this.loading.present();
    this.http.post(this.env.API_URL + 'customer/modify',{ customer: this.user, profile: this.profile, address: this.address, contact: this.contact })
      .subscribe(data => { 
        this.storage.set('customer', data);
      },
      error => { 
        this.alertService.presentToast("Server not responding!");
        console.log(error);
        this.loading.dismiss();
      },
      () => { 
        this.alertService.presentToast("Saved Changes."); 
        this.loading.dismiss();
    });  
  }

  tapUpdateAddr() {
    this.loading.present();

    /*Confirm Jobs*/
    this.http.post(this.env.API_URL + 'address/modify',{ address: this.address })
      .subscribe(data => { 
        this.customer.data.profile.addresses[0] = this.address;
        this.storage.set('customer', this.customer);
      },error => { 
        this.alertService.presentToast("Server not responding!");
        console.log(error.error);
    },() => { this.alertService.presentToast("Address updated!"); });  

    this.loading.dismiss();
  }

  tapUpdateContact() {
    this.loading.present();

    /*Confirm Jobs*/
    this.http.post(this.env.API_URL + 'contact/modify',{ contact: this.contact })
      .subscribe(data => { 
        this.customer.data.profile.contacts[0] = this.contact;
        this.storage.set('customer', this.customer);
      },error => { this.alertService.presentToast("Server not responding!");
    },() => { this.alertService.presentToast("Contact updated!"); });  

    this.loading.dismiss();
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }
 
  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  createFileName() {
    var d = new Date(),
        n = d.getTime(),
        newFileName = n + ".jpg";
    return newFileName;
  }

  async selectImage() {
      const actionSheet = await this.actionSheetController.create({
          header: "Select Image source",
          buttons: [{
                  text: 'Load from Library',
                  handler: () => {
                      this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                  }
              },
              {
                  text: 'Use Camera',
                  handler: () => {
                      this.takePicture(this.camera.PictureSourceType.CAMERA);
                  }
              },
              {
                  text: 'Cancel',
                  role: 'cancel'
              }
          ]
      });
      await actionSheet.present();
  }
   
  takePicture(sourceType: PictureSourceType) {
      var options: CameraOptions = {
          quality: 100,
          sourceType: sourceType,
          saveToPhotoAlbum: false,
          correctOrientation: true
      };
   
      this.camera.getPicture(options).then(imagePath => {
          if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
              this.filePath.resolveNativePath(imagePath)
                  .then(filePath => {
                      let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                      let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                      this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                  });
          } else {
              var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
              var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          }
      });
   
  }
   
  copyFileToLocalDir(namePath, currentName, newFileName) {
      this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
          this.updateStoredImages(newFileName);
      }, error => {
          this.alertService.presentToast('Error while storing file.');
      });
  }
   
  updateStoredImages(name) {
      this.storage.get(STORAGE_KEY).then(images => {
          let arr = JSON.parse(images);
          if (!arr) {
              let newImages = [name];
              this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
          } else {
              arr.push(name);
              this.storage.set(STORAGE_KEY, JSON.stringify(arr));
          }
   
          let filePath = this.file.dataDirectory + name;
          let resPath = this.pathForImage(filePath);
   
          let newEntry = {
              name: name,
              path: resPath,
              filePath: filePath
          };
   
          this.images = [newEntry, ...this.images];
          this.ref.detectChanges(); // trigger change detection cycle
      });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);
 
    this.storage.get(STORAGE_KEY).then(images => {
        let arr = JSON.parse(images);
        let filtered = arr.filter(name => name != imgEntry.name);
        this.storage.set(STORAGE_KEY, JSON.stringify(filtered));
 
        var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);
 
        this.file.removeFile(correctPath, imgEntry.name).then(res => {
            this.alertService.presentToast('File removed.');
        });
    });
  }  

  startUpload(imgEntry) {
      this.photo = imgEntry.path;
      this.profile.photo = imgEntry.name;
      this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
          .then(entry => {
              ( < FileEntry > entry).file(file => this.readFile(file));
          })
          .catch(err => {
              this.alertService.presentToast('Error while reading file.');
          });
  }
   
  readFile(file: any) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const formData = new FormData();
          const imgBlob = new Blob([reader.result], {
              type: file.type
          });
          formData.append('file', imgBlob, file.name);
          this.uploadImageData(formData);
      };
      reader.readAsArrayBuffer(file);
  }
   
  async uploadImageData(formData: FormData) {
      // const loading = await this.loadingController.create({
      //     content: 'Uploading image...',
      // });
      // await loading.present();

      this.loading.present();
   
      this.http.post(this.env.IMAGE_URL + 'upload.php', formData)
          .pipe(
              finalize(() => {
                  // loading.dismiss();
                  this.loading.dismiss();
              })
          )
          .subscribe(res => {
              if (res['success']) {
                  this.alertService.presentToast('Done. Update your profile now.')
                  this.page = 'profile';
              } else {
                  this.alertService.presentToast('Photo not uploading.')
              }
          });
  }

  logout() {
    this.loading.present();
    this.authService.logout();
    this.alertService.presentToast('Successfully logout');  
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { Router } from '@angular/router';
import { FirestoreDataService, Message } from 'src/app/services/firestore-data.service';
import { IonModal } from '@ionic/angular';
import { fromUnixTime, differenceInSeconds } from 'date-fns';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  loggedInUserEmail: string = '';
  userText: string = '';
  messages: any[] = [];
  newItem = new Message();
  currentPageIndex = 0;
  showMessageNotification: boolean = false; 
  showNotification: boolean = false;
  notificationMessage: string = "";

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseAuthService,
    private router: Router,
    private firestoreService: FirestoreDataService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController

  ) {
    this.route.queryParams.subscribe(params => {
      this.loggedInUserEmail = params['email'];
      this.userText = params['name'];
    });
    this.ShowAllMessages();
  }

  ngOnInit() {
    this.ShowAllMessages();
  }

  signOut() {
    this.firebaseService.signOut();
    this.router.navigate(['/login']);
  }

  ShowAllMessages() {
    this.firestoreService.getAllDocuments().subscribe(documents => {
      this.messages = documents;
      this.messages.sort((a, b) => {
        const aTime = a.payload.doc.data().createdTime.toDate();
        const bTime = b.payload.doc.data().createdTime.toDate(); 
        return bTime.getTime() - aTime.getTime(); 
      });
    });
  }

  deleteMessages(itemId: string) {
    this.firestoreService.delete(itemId);
  }

  cancel() {
    this.modal.dismiss();
  }

  async createMessage() {
    this.newItem.author = this.loggedInUserEmail;
    this.newItem.createdTime = new Date();
  
    if (this.newItem.text.trim().length === 0) {
      this.showNotification = true;
      this.notificationMessage = 'メッセージを入力してください';
      const toast = await this.toastCtrl.create({
        message: this.notificationMessage,
        duration: 1000, 
        position: 'top'
      });
      await toast.present();
    } else {
      this.showNotification = false; 
      this.firestoreService.create(this.newItem).then(() => {
        this.newItem = {
          text: '',
          author: '',
        };
        this.cancel();
      });
    }
  }

  nextPage() {
    if (this.currentPageIndex + 3 < this.messages.length) {
      this.currentPageIndex += 3;
    }
  }

  previousPage() {
    if (this.currentPageIndex - 3 >= 0) {
      this.currentPageIndex -= 3;
    }
  }

  differenceInHour(articleDate: any) {

    const currentTime = new Date();
    const initialUnixTime = articleDate.seconds;
    const initialDate = fromUnixTime(initialUnixTime);

    const temp = differenceInSeconds(currentTime, initialDate);
    return this.formatDuration(temp)
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} 秒前`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} 分前`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} 時間前`;
    } else {
      const days = Math.floor(seconds / 86400);
      const remainingSeconds = seconds % 86400;
      const hours = Math.floor(remainingSeconds / 3600);
      return `${days} 日 ${hours} 時間前`;
    }
  }
  
  async showBasicAlertDelete(id: string, author: string) {
    if (this.loggedInUserEmail === author) {
      const alertBox = await this.alertCtrl.create({
        header: '確認',
        subHeader: '削除しても良いですか？',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'OK',
            handler: async () => {
              await this.deleteMessages(id);
  
              const toast = await this.toastCtrl.create({
                message: '削除しました',
                duration: 2000,
                position: 'top'
              });
              await toast.present();
            }
          }
        ]
      });
      await alertBox.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: '削除する権限がありません',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
    }
  }
  

  async editMessage(item: any) {
    
    if (this.loggedInUserEmail === item.payload.doc.data().author) {
      const alert = await this.alertCtrl.create({
        header: '編集',
        inputs: [
          {
            name: 'editedText',
            type: 'text',
            value: item.payload.doc.data().text
          }
        ],
        buttons: [
          {
            text: 'キャンセル',
            role: 'cancel'
          },
          {
            text: '更新',
            handler: async (data) => {
              const editedText = data.editedText;
  
              try {
           
                await this.firestoreService.updateText(item.payload.doc.id, editedText);
  
                const toast = await this.toastCtrl.create({
                  message: 'メッセージが更新されました',
                  duration: 2000,
                  position: 'top'

                });
                await toast.present();
              } catch (error) {
                console.error('Error updating message:', error);
                const toast = await this.toastCtrl.create({
                  message: 'メッセージの更新に失敗しました',
                  duration: 2000, 
                  position: 'top'
                });
                await toast.present();
              }
            }
          }
        ]
      });
  
      await alert.present();
    } else {

      const toast = await this.toastCtrl.create({
        message: '編集する権限がありません',
        duration: 2000, 
        position: 'top'
      });
      await toast.present();
    }
  }
}

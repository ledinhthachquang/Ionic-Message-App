import { Injectable } from '@angular/core';
import { AngularFirestore,AngularFirestoreCollection } from '@angular/fire/compat/firestore'; // Import AngularFirestore

@Injectable({
  providedIn: 'root'
})
export class FirestoreDataService {
  messagesRef!: AngularFirestoreCollection<Message>;

  constructor(db: AngularFirestore) {
    this.messagesRef = db.collection('/message', ref=>ref.orderBy('createdTime','asc'));
  }

  getAllDocuments() {
    return this.messagesRef.snapshotChanges();
  }

  create(message: Message) {
    message.createdTime = new Date();
    return this.messagesRef.add({ ...message });
  }
  delete(id: string): Promise<void>{
    return this.messagesRef.doc(id).delete();
  }
  updateText(id: string, newText: string): Promise<void> {
    return this.messagesRef.doc(id).update({ text: newText });
  }
}
  
// Define the Message interface
export class Message {
  text: string = ''; // Initialize text property
  author: string = '';
  createdTime?: Date ;
}

import React, { useRef, useState } from 'react';
import './App.css';
import enterLogo from './images/arrow.png'; 

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAOxCVkKoyilJ3gXEiSuOc5R2vqj73ODKQ",
  authDomain: "messenger-app-a4d9a.firebaseapp.com",
  projectId: "messenger-app-a4d9a",
  storageBucket: "messenger-app-a4d9a.appspot.com",
  messagingSenderId: "433405022111",
  appId: "1:433405022111:web:7c2d93847f7bd71f6ef7aa"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="title">Christian's Messenger</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  }

  return (
    <>
      <div className="button" id="btn">
        <div id="circle"></div>
        <a onClick={signInWithGoogle}>Sign in with Google</a>
      </div>
      <p className="signInMessege">Sign in to enter the chat!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      name: displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message" />

      <button type="submit" disabled={!formValue}><img className="enterLogo" src={enterLogo} ></img></button>

    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL, name } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <div className="nameMessage">
        <a className="mesageName">{name}</a>
        <p>{text}</p>
      </div>
    </div>
  </>)
}




export default App;

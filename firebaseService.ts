import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Функція для додавання нового квесту
export const addNewQuest = async (location: { lat: number, long: number }) => {
  try {
    const questsCollectionRef = collection(db, 'Quests');

    const newQuest = {
      Location: location,
      Timestamp: serverTimestamp(),
      Next: null 
    };
    const docRef = await addDoc(questsCollectionRef, newQuest);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

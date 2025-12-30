import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

useEffect(() => {
    onSnapshot(collection(db, "chats", "match1", "messages"), snap => {
        setMessages(snap.docs.map(d => d.data()));
    });
}, []);

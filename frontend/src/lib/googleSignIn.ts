import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export const googleSignIn = async (navigate: (path: string) => void) => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);

        navigate('/dashboard');
    } catch (err) {
        console.log(err);
    }
};
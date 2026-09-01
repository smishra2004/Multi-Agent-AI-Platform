// Initialize Firebase Admin using our service-account credentials so our backend can securely access Firebase services.

import {cert,initializeApp} from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with {type:"json"};

export const app = initializeApp({
  credential: cert(serviceAccount)
});

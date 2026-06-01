import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { Order, ExternalRevenue, ProfitSplits } from './types';

// The verified secure Firebase configurations provided directly by the user
const firebaseConfig = {
  apiKey: "AIzaSyC5jncWEI4JcMODEqGrDZ-ljKRg5tyxbx4",
  authDomain: "saudicore.firebaseapp.com",
  databaseURL: "https://saudicore-default-rtdb.firebaseio.com",
  projectId: "saudicore",
  storageBucket: "saudicore.firebasestorage.app",
  messagingSenderId: "480635618160",
  appId: "1:480635618160:web:4369d494fa006d42be45b5",
  measurementId: "G-K1B35KEK5J"
};

// Initialize Firebase SDK
let appInstance;
let dbInstance: ReturnType<typeof getFirestore>;
let authInstance: ReturnType<typeof getAuth>;
let isFirebaseAvailable = false;

try {
  appInstance = initializeApp(firebaseConfig);
  dbInstance = getFirestore(appInstance);
  authInstance = getAuth(appInstance);
  isFirebaseAvailable = true;
  console.log("Madar: Firebase initialized successfully with cloud endpoints.");
} catch (error) {
  console.warn("Madar: Firebase failed to initialize. Falling back to robust offline state.", error);
}

export const db = dbInstance!;
export const auth = authInstance!;
export const isReady = isFirebaseAvailable;

// ABAC & Zero-Trust Firestore Error Handling Logger
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const current_user = authInstance ? authInstance.currentUser : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: current_user?.uid || null,
      email: current_user?.email || null,
      emailVerified: current_user?.emailVerified || null,
    },
    operationType,
    path
  };
  console.error('[Madar] Firestore Security and Access Error:', JSON.stringify(errInfo));
}

// Validate connection on startup (Phase testing)
export async function testConnection() {
  if (!isFirebaseAvailable) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('the client is offline') || errMsg.includes('Failed to get document because the client is offline')) {
      console.warn("Madar Firestore status: System is operating offline.");
      return false;
    }
    // Any other response (like "Missing or insufficient permissions") means the network is online and we contacted Google Firebase!
    return true;
  }
}

// Global Cloud Sync service functions
export async function fetchCloudOrders(): Promise<Order[] | null> {
  if (!isFirebaseAvailable) return null;
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const fetched: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as Order);
    });
    return fetched.length > 0 ? fetched : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return null;
  }
}

export async function saveCloudOrder(order: Order): Promise<boolean> {
  if (!isFirebaseAvailable) return false;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
    return false;
  }
}

export async function deleteCloudOrder(orderId: string): Promise<boolean> {
  if (!isFirebaseAvailable) return false;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    return false;
  }
}

export async function fetchCloudRevenues(): Promise<ExternalRevenue[] | null> {
  if (!isFirebaseAvailable) return null;
  try {
    const querySnapshot = await getDocs(collection(db, 'revenues'));
    const fetched: ExternalRevenue[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as ExternalRevenue);
    });
    return fetched.length > 0 ? fetched : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'revenues');
    return null;
  }
}

export async function saveCloudRevenue(revenue: ExternalRevenue): Promise<boolean> {
  if (!isFirebaseAvailable) return false;
  try {
    await setDoc(doc(db, 'revenues', revenue.id), revenue);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `revenues/${revenue.id}`);
    return false;
  }
}

export async function deleteCloudRevenue(revenueId: string): Promise<boolean> {
  if (!isFirebaseAvailable) return false;
  try {
    await deleteDoc(doc(db, 'revenues', revenueId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `revenues/${revenueId}`);
    return false;
  }
}

export async function fetchCloudSplits(): Promise<ProfitSplits | null> {
  if (!isFirebaseAvailable) return null;
  try {
    const docSnap = await getDoc(doc(db, 'splits', 'config'));
    if (docSnap.exists()) {
      return docSnap.data() as ProfitSplits;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'splits/config');
    return null;
  }
}

export async function saveCloudSplits(splits: ProfitSplits): Promise<boolean> {
  if (!isFirebaseAvailable) return false;
  try {
    await setDoc(doc(db, 'splits', 'config'), splits);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'splits/config');
    return false;
  }
}

// Real-time synchronization subscriptions
export function subscribeCloudOrders(onUpdate: (orders: Order[]) => void): () => void {
  if (!isFirebaseAvailable) return () => {};
  try {
    return onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as Order);
      });
      // Sort: Newest orders first by parsing the date string
      ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(ordersList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return () => {};
  }
}

export function subscribeCloudRevenues(onUpdate: (revenues: ExternalRevenue[]) => void): () => void {
  if (!isFirebaseAvailable) return () => {};
  try {
    return onSnapshot(collection(db, 'revenues'), (snapshot) => {
      const revsList: ExternalRevenue[] = [];
      snapshot.forEach((docSnap) => {
        revsList.push(docSnap.data() as ExternalRevenue);
      });
      // Sort by date descending
      revsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(revsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'revenues');
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'revenues');
    return () => {};
  }
}

export function subscribeCloudSplits(onUpdate: (splits: ProfitSplits) => void): () => void {
  if (!isFirebaseAvailable) return () => {};
  try {
    return onSnapshot(doc(db, 'splits', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as ProfitSplits);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'splits/config');
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'splits/config');
    return () => {};
  }
}

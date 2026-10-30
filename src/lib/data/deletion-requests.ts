import { getDb } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import type { DeletionRequest } from '@/lib/types';

export async function requestDeletion(
  type: 'article' | 'staff' | 'banner',
  itemId: string,
  itemTitle: string,
  requestedBy: string,
  requestedByName: string,
  reason?: string
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');
  
  await addDoc(collection(db, 'deletionRequests'), {
    type,
    itemId,
    itemTitle,
    requestedBy,
    requestedByName,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    reason,
  });
  
  // Admin-ə notification göndər
  await addDoc(collection(db, 'notifications'), {
    type: 'deletion_request',
    title: `${requestedByName} silmə sorğusu göndərdi`,
    message: `${type}: ${itemTitle}`,
    priority: 'high',
    forRole: ['admin'],
    read: false,
    createdAt: new Date().toISOString(),
    link: '/admin/deletion-requests',
  });
}

export async function getPendingDeletionRequests(): Promise<DeletionRequest[]> {
  const db = getDb();
  if (!db) return [];
  
  const q = query(collection(db, 'deletionRequests'), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DeletionRequest));
}

export async function approveDeletion(requestId: string, approvedBy: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');
  
  await updateDoc(doc(db, 'deletionRequests', requestId), {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
  });
}

export async function rejectDeletion(requestId: string, rejectedBy: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');
  
  await updateDoc(doc(db, 'deletionRequests', requestId), {
    status: 'rejected',
    approvedBy: rejectedBy,
    approvedAt: new Date().toISOString(),
  });
}

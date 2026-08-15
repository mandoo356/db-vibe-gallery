import {
  collection, addDoc, getDocs, doc, getDoc,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp, where,
} from 'firebase/firestore'
import { db } from './firebase'

export type AppItem = {
  id: string
  name: string
  url: string
  description: string
  imageUrl?: string
  imageUrls?: string[]
  tags?: string[]
  createdAt: any
  averageRating: number
  reviewCount: number
}

export type Review = {
  id: string
  appId: string
  rating: number
  text: string
  createdAt: any
}

export async function fetchApps(): Promise<AppItem[]> {
  const q = query(collection(db, 'apps'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppItem))
}

export async function fetchApp(id: string): Promise<AppItem | null> {
  const snap = await getDoc(doc(db, 'apps', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AppItem
}

export async function createApp(data: Pick<AppItem, 'name' | 'url' | 'description' | 'imageUrl' | 'imageUrls' | 'tags'>) {
  return addDoc(collection(db, 'apps'), {
    ...data,
    averageRating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  })
}

export async function editApp(id: string, data: Partial<Pick<AppItem, 'name' | 'url' | 'description'>>) {
  await updateDoc(doc(db, 'apps', id), data)
}

export async function removeApp(id: string) {
  await deleteDoc(doc(db, 'apps', id))
}

export async function fetchReviews(appId: string): Promise<Review[]> {
  // orderBy + where on different fields requires a composite index — sort client-side instead
  const q = query(collection(db, 'reviews'), where('appId', '==', appId))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Review))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

export async function createReview(appId: string, rating: number, text: string) {
  await addDoc(collection(db, 'reviews'), {
    appId, rating, text, createdAt: serverTimestamp(),
  })
  // Recompute average
  const reviews = await fetchReviews(appId)
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  await updateDoc(doc(db, 'apps', appId), {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  })
}

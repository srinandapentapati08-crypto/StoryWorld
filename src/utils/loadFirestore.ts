// src/utils/loadFirestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface StoryDoc {
  id: string;
  title: string;
  tagline: string;
  image: string;
  genre: string;
  comingSoon: boolean;
}

export interface ChapterDoc {
  id: string;
  story_id: string;
  number: number;
  title: string;
  image: string;
  content: string;
  doc_url?: string;
}

/** Fetch all stories from Firestore */
export async function getStories(): Promise<StoryDoc[]> {
  const snapshot = await getDocs(collection(db, 'stories'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<StoryDoc, 'id'>),
  }));
}

/** Fetch a single story by slug */
export async function getStory(slug: string): Promise<StoryDoc | null> {
  const snap = await getDoc(doc(db, 'stories', slug));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<StoryDoc, 'id'>) };
}

/** Fetch all chapters for a story, sorted client-side by number */
export async function getChapters(storyId: string): Promise<ChapterDoc[]> {
  const q = query(
    collection(db, 'chapters'),
    where('story_id', '==', storyId),
  );
  const snapshot = await getDocs(q);
  const chapters = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ChapterDoc, 'id'>),
  }));
  return chapters.sort((a, b) => a.number - b.number);
}

/** Fetch a single chapter by story and number */
export async function getChapter(storyId: string, number: number): Promise<ChapterDoc | null> {
  const q = query(
    collection(db, 'chapters'),
    where('story_id', '==', storyId),
    where('number', '==', number),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...(d.data() as Omit<ChapterDoc, 'id'>) };
}

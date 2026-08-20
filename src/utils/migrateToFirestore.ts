// src/utils/migrateToFirestore.ts
// One-time migration from Google Sheets → Firestore.
// Call runMigration() from the admin panel.
import { doc, setDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { loadSheet } from './loadSheet';

export async function runMigration(): Promise<{ stories: number; chapters: number }> {
  const [stories, chapters] = await Promise.all([
    loadSheet('stories'),
    loadSheet('chapters'),
  ]);

  if (!stories.length) {
    throw new Error('No stories found in Google Sheets. Check the sheet is public and has data.');
  }

  let storyCount = 0;
  for (const row of stories) {
    if (!row.id) continue;
    await setDoc(doc(db, 'stories', row.id), {
      id: row.id,
      title: row.title ?? '',
      tagline: row.tagline ?? '',
      image: row.image ?? '',
      genre: row.genre ?? '',
      comingSoon: row.comingSoon === 'TRUE' || row.comingSoon === true,
    });
    storyCount++;
  }

  let chapterCount = 0;
  for (const row of chapters) {
    if (!row.story_id || !row.number) continue;

    // Check for existing chapter to prevent duplicates
    const existing = await getDocs(
      query(
        collection(db, 'chapters'),
        where('story_id', '==', row.story_id),
        where('number', '==', Number(row.number)),
      )
    );
    if (!existing.empty) continue; // skip duplicate

    await addDoc(collection(db, 'chapters'), {
      story_id: row.story_id,
      number: Number(row.number),
      title: row.title ?? '',
      image: row.image ?? '',
      content: row.content ?? '',
      doc_url: row.doc_url ?? '',
    });
    chapterCount++;
  }

  return { stories: storyCount, chapters: chapterCount };
}

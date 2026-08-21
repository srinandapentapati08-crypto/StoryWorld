// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { runMigration } from '../../utils/migrateToFirestore';
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaSignOutAlt, FaHome } from 'react-icons/fa';

/* ================= TYPES ================= */

interface Story {
  id: string;
  title: string;
  tagline: string;
  image: string;
  genre: string;
  comingSoon: boolean;
}

interface Chapter {
  id: string;
  story_id: string;
  number: number;
  title: string;
  image: string;
  content: string;
  doc_url?: string;
}

type View = 'stories' | 'addStory' | 'storyEditor';

/* ================= ANIMATIONS ================= */

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); }`;

/* ================= LAYOUT ================= */

const DashboardLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0d0d0d;
  color: #eee;
  font-family: 'Inter', sans-serif;
`;

const Sidebar = styled.nav`
  width: 220px;
  flex-shrink: 0;
  background: #111;
  border-right: 1px solid rgba(255, 215, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;

  @media (max-width: 767px) {
    width: 64px;
  }
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  margin-bottom: 1rem;

  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
  }

  span {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffd700;

    @media (max-width: 767px) { display: none; }
  }
`;

const SidebarLink = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1.25rem;
  background: ${(p) => (p.$active ? 'rgba(255, 215, 0, 0.1)' : 'transparent')};
  border: none;
  border-left: 3px solid ${(p) => (p.$active ? '#ffd700' : 'transparent')};
  color: ${(p) => (p.$active ? '#ffd700' : '#aaa')};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.07);
    color: #ffd700;
  }

  span { @media (max-width: 767px) { display: none; } }
`;

const SidebarBottom = styled.div`
  margin-top: auto;
  padding: 0 0 0.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  padding-top: 1rem;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 767px) { padding: 1rem; }
`;

/* ================= SHARED COMPONENTS ================= */

const PageTitle = styled.h1`
  font-size: 1.6rem;
  color: #fff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const GoldBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.12);
    border-color: #ffd700;
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const DangerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 70, 70, 0.12);
  color: #ff6b6b;
  border: 1px solid rgba(255, 70, 70, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover { background: rgba(255, 70, 70, 0.22); }
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const RedSpinner = styled(Spinner)`
  border: 2px solid rgba(255,107,107,0.3);
  border-top-color: #ff6b6b;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 0.4rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 0.9rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: #ffd700; }
  &::placeholder { color: #555; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.7rem 0.9rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 260px;
  line-height: 1.6;
  font-family: 'Georgia', serif;
  transition: border-color 0.2s;

  &:focus { border-color: #ffd700; }
  &::placeholder { color: #555; }
  &:disabled { 
    opacity: 0.6; 
    cursor: wait; 
    background: #151515;
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 1rem;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: #ffd700;
    cursor: pointer;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 280px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #333;
  display: block;
  margin-top: 0.75rem;
`;

const UploadBtn = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background: transparent;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.12);
    border-color: #ffd700;
  }

  input[type='file'] { display: none; }
`;

const StatusMsg = styled.p<{ $ok?: boolean }>`
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: ${(p) => (p.$ok ? '#4caf50' : '#ff6b6b')};
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ConfirmBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255,215,0,0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 380px;
  width: 100%;
  text-align: center;

  h3 { color: #fff; margin-bottom: 0.75rem; }
  p { color: #aaa; font-size: 0.9rem; margin-bottom: 1.5rem; }

  div { display: flex; gap: 1rem; justify-content: center; }
`;

/* ================= STORIES LIST ================= */

const StoriesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
`;

const StoryCard = styled.div`
  width: 180px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: #ffd700;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
  }

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .info {
    padding: 0.75rem;
  }

  .title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 0.75rem;
    color: #888;
  }
`;

/* ================= CHAPTER GRID ================= */

const ChapterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ChapterCardItem = styled.div`
  background: #1a1a1a;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }

  .info {
    padding: 0.6rem;
  }

  .num { font-size: 0.75rem; color: #ffd700; font-weight: 600; }
  .title { font-size: 0.82rem; color: #ccc; margin-top: 0.2rem; }
`;

/* ================= SLIDE PANEL ================= */

const PanelOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 540px;
  background: #111;
  border-left: 1px solid rgba(255,215,0,0.15);
  z-index: 1001;
  overflow-y: auto;
  padding: 2rem;
  animation: ${slideIn} 0.3s ease;

  @media (max-width: 600px) {
    max-width: 100%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 { font-size: 1.2rem; color: #fff; }
`;

const PanelActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

/* ================= SECTION DIVIDER ================= */

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0 1rem;

  h2 { font-size: 1.15rem; color: #ccc; }
`;

/* ================= STORY EDITOR ================= */

const StoryEditorWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 900px) {
    grid-template-columns: 360px 1fr;
  }
`;

const EditorCard = styled.div`
  background: #111;
  border: 1px solid rgba(255,215,0,0.1);
  border-radius: 14px;
  padding: 1.5rem;
`;

/* ================= MIGRATION ================= */

const MigrationBox = styled.div`
  background: rgba(255, 215, 0, 0.05);
  border: 1px dashed rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-top: 2rem;

  h3 { font-size: 0.95rem; color: #ffd700; margin-bottom: 0.5rem; }
  p { font-size: 0.82rem; color: #888; margin-bottom: 1rem; }
`;

const PermissionHelp = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 100, 100, 0.07);
  border: 1px solid rgba(255, 100, 100, 0.2);
  border-radius: 8px;
  font-size: 0.82rem;
  color: #ccc;
  line-height: 1.6;

  a { color: #ffd700; text-decoration: underline; }

  pre {
    margin-top: 0.75rem;
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: #aef;
    overflow-x: auto;
    white-space: pre-wrap;
  }
`;

/* ================= COMPONENT ================= */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [view, setView] = useState<View>('stories');
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Story form
  const [storyForm, setStoryForm] = useState<Omit<Story, 'id'>>({
    title: '',
    tagline: '',
    image: '',
    genre: '',
    comingSoon: false,
  });
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storySaving, setStorySaving] = useState(false);
  const [storyMsg, setStoryMsg] = useState('');

  // Chapter panel
  const [chapterPanel, setChapterPanel] = useState<Chapter | null | 'new'>(null);
  const [chapterForm, setChapterForm] = useState<Omit<Chapter, 'id' | 'story_id'>>({
    number: 1,
    title: '',
    image: '',
    content: '',
    doc_url: '',
  });
  const [chapterImageFile, setChapterImageFile] = useState<File | null>(null);
  const [chapterSaving, setChapterSaving] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterMsg, setChapterMsg] = useState('');

  // Add story form
  const [newStoryForm, setNewStoryForm] = useState({ id: '', title: '', tagline: '', genre: '', comingSoon: false });
  const [newStoryImageFile, setNewStoryImageFile] = useState<File | null>(null);
  const [newStorySaving, setNewStorySaving] = useState(false);
  const [newStoryMsg, setNewStoryMsg] = useState('');

  // Confirm dialog
  const [confirmTarget, setConfirmTarget] = useState<null | { type: 'chapter' | 'story'; id: string }>(null);

  // Migration
  const [migrating, setMigrating] = useState(false);
  const [migrationMsg, setMigrationMsg] = useState('');
  const [migrationDone, setMigrationDone] = useState(false);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState('');

  const storyFileRef = useRef<HTMLInputElement>(null);
  const chapterFileRef = useRef<HTMLInputElement>(null);
  const newStoryFileRef = useRef<HTMLInputElement>(null);

  /* ---------- LOAD STORIES ---------- */
  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    const snap = await getDocs(collection(db, 'stories'));
    const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Story, 'id'>) }));
    setStories(data);
  }

  /* ---------- LOAD CHAPTERS for selected story ---------- */
  async function loadChapters(storyId: string) {
    const q = query(
      collection(db, 'chapters'),
      where('story_id', '==', storyId),
    );
    const snap = await getDocs(q);
    const chapters = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chapter, 'id'>) }));
    setChapters(chapters.sort((a, b) => a.number - b.number));
  }

  /* ---------- SELECT STORY ---------- */
  function selectStory(story: Story) {
    setSelectedStory(story);
    setStoryForm({
      title: story.title,
      tagline: story.tagline,
      image: story.image,
      genre: story.genre,
      comingSoon: story.comingSoon,
    });
    loadChapters(story.id);
    setView('storyEditor');
    setStoryMsg('');
  }

  /* ---------- UPLOAD FILE to Firebase Storage ---------- */
  async function uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  /* ---------- SAVE STORY EDITS ---------- */
  async function saveStory() {
    if (!selectedStory) return;
    setStorySaving(true);
    setStoryMsg('');
    try {
      let imageUrl = storyForm.image;
      if (storyImageFile) {
        imageUrl = await uploadFile(storyImageFile, `stories/${selectedStory.id}/cover.jpg`);
      }
      const updated = { ...storyForm, image: imageUrl };
      await setDoc(doc(db, 'stories', selectedStory.id), { id: selectedStory.id, ...updated });
      setStoryForm(updated);
      setSelectedStory({ id: selectedStory.id, ...updated });
      setStoryImageFile(null);
      setStoryMsg('✓ Saved');
      loadStories();
    } catch {
      setStoryMsg('Error saving story.');
    } finally {
      setStorySaving(false);
    }
  }

  /* ---------- OPEN CHAPTER PANEL ---------- */
  async function openChapterPanel(chapter: Chapter) {
    setChapterPanel(chapter);
    setChapterImageFile(null);
    setChapterMsg('');
    setChapterLoading(true);

    // If chapter has doc_url but no content, fetch it from Google Docs
    let content = chapter.content || '';
    if (!content && chapter.doc_url) {
      try {
        const html = await fetch(chapter.doc_url).then((r) => r.text());
        const docDom = new DOMParser().parseFromString(html, 'text/html');
        const paragraphs: string[] = [];
        docDom.querySelectorAll('p').forEach((p) => {
          const txt = p.innerText.replace(/\s+/g, ' ').trim();
          if (
            txt &&
            !/Published using Google Docs/i.test(txt) &&
            !/Report abuse/i.test(txt) &&
            !/Learn more/i.test(txt)
          ) {
            paragraphs.push(txt);
          }
        });
        content = paragraphs.join('\n\n');
      } catch (err) {
        console.error('Failed to fetch content from doc_url:', err);
      }
    }

    setChapterForm({
      number: chapter.number,
      title: chapter.title,
      image: chapter.image,
      content,
      doc_url: chapter.doc_url ?? '',
    });
    setChapterLoading(false);
  }

  function openNewChapter() {
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.number)) + 1 : 1;
    setChapterPanel('new');
    setChapterForm({ number: nextNum, title: '', image: '', content: '', doc_url: '' });
    setChapterImageFile(null);
    setChapterMsg('');
  }

  /* ---------- SAVE CHAPTER ---------- */
  async function saveChapter() {
    if (!selectedStory) return;
    setChapterSaving(true);
    setChapterMsg('');
    try {
      let imageUrl = chapterForm.image;
      if (chapterImageFile) {
        imageUrl = await uploadFile(
          chapterImageFile,
          `chapters/${selectedStory.id}/${chapterForm.number}.jpg`
        );
      }
      const payload = {
        story_id: selectedStory.id,
        number: Number(chapterForm.number),
        title: chapterForm.title,
        image: imageUrl,
        content: chapterForm.content,
        doc_url: chapterForm.doc_url ?? '',
      };

      if (chapterPanel === 'new') {
        await addDoc(collection(db, 'chapters'), payload);
      } else if (chapterPanel) {
        await updateDoc(doc(db, 'chapters', chapterPanel.id), payload);
      }

      setChapterMsg('✓ Saved');
      loadChapters(selectedStory.id);
      setChapterImageFile(null);
    } catch {
      setChapterMsg('Error saving chapter.');
    } finally {
      setChapterSaving(false);
    }
  }

  /* ---------- DELETE CHAPTER ---------- */
  async function confirmDelete() {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.type === 'chapter') {
        await deleteDoc(doc(db, 'chapters', confirmTarget.id));
        setChapterPanel(null);
        if (selectedStory) loadChapters(selectedStory.id);
      }
    } finally {
      setConfirmTarget(null);
    }
  }

  /* ---------- ADD NEW STORY ---------- */
  async function submitNewStory(e: React.FormEvent) {
    e.preventDefault();
    if (!newStoryForm.id.trim()) return;
    setNewStorySaving(true);
    setNewStoryMsg('');
    try {
      let imageUrl = '';
      if (newStoryImageFile) {
        imageUrl = await uploadFile(newStoryImageFile, `stories/${newStoryForm.id}/cover.jpg`);
      }
      await setDoc(doc(db, 'stories', newStoryForm.id), {
        id: newStoryForm.id,
        title: newStoryForm.title,
        tagline: newStoryForm.tagline,
        genre: newStoryForm.genre,
        comingSoon: newStoryForm.comingSoon,
        image: imageUrl,
      });
      setNewStoryMsg('✓ Story created!');
      loadStories();
      setNewStoryForm({ id: '', title: '', tagline: '', genre: '', comingSoon: false });
      setNewStoryImageFile(null);
    } catch {
      setNewStoryMsg('Error creating story.');
    } finally {
      setNewStorySaving(false);
    }
  }

  /* ---------- MIGRATION ---------- */
  async function handleMigration() {
    setMigrating(true);
    setMigrationMsg('');
    try {
      const result = await runMigration();
      setMigrationMsg(`✓ Migrated ${result.stories} stories and ${result.chapters} chapters.`);
      setMigrationDone(true);
      loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Check for common Firebase permission error
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        setMigrationMsg('❌ Permission denied — Firestore rules are blocking writes. See instructions below.');
      } else {
        setMigrationMsg(`❌ Error: ${msg}`);
      }
      console.error('[Migration error]', err);
    } finally {
      setMigrating(false);
    }
  }

  /* ---------- DELETE DUPLICATES ---------- */
  async function handleDeleteDuplicates() {
    if (!confirm('This will delete duplicate chapters. Keep only the first occurrence of each story_id + number combination. Continue?')) {
      return;
    }

    setCleaningDuplicates(true);
    setCleanupMsg('');
    try {
      const snapshot = await getDocs(collection(db, 'chapters'));
      const allChapters = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Chapter, 'id'>),
      }));

      // Group by story_id + number
      const seen = new Map<string, string>(); // key: story_id:number, value: first doc ID
      const duplicates: string[] = [];

      allChapters.forEach((ch) => {
        const key = `${ch.story_id}:${ch.number}`;
        if (seen.has(key)) {
          duplicates.push(ch.id); // Mark as duplicate
        } else {
          seen.set(key, ch.id); // Keep first occurrence
        }
      });

      // Delete duplicates
      for (const id of duplicates) {
        await deleteDoc(doc(db, 'chapters', id));
      }

      setCleanupMsg(`✓ Deleted ${duplicates.length} duplicate chapter(s).`);
      if (selectedStory) loadChapters(selectedStory.id);
    } catch (err) {
      setCleanupMsg('❌ Error deleting duplicates. Check console.');
      console.error('[Cleanup error]', err);
    } finally {
      setCleaningDuplicates(false);
    }
  }

  const getImageSrc = (img: string) =>
    img.startsWith('http') ? img : img ? `/${img}` : '';

  /* ============================================================ */
  /*  RENDER                                                        */
  /* ============================================================ */

  return (
    <DashboardLayout>
      {/* SIDEBAR */}
      <Sidebar>
        <SidebarLogo>
          <img src="/images/cartoon.png" alt="StoryWorld" />
          <span>Admin</span>
        </SidebarLogo>

        <SidebarLink $active={view === 'stories'} onClick={() => setView('stories')}>
          <FaEdit /> <span>Stories</span>
        </SidebarLink>
        <SidebarLink $active={view === 'addStory'} onClick={() => setView('addStory')}>
          <FaPlus /> <span>Add Story</span>
        </SidebarLink>

        <SidebarBottom>
          <SidebarLink onClick={() => navigate('/')}>
            <FaHome /> <span>View Site</span>
          </SidebarLink>
          <SidebarLink
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <FaSignOutAlt /> <span>Sign Out</span>
          </SidebarLink>
        </SidebarBottom>
      </Sidebar>

      {/* MAIN */}
      <MainContent>

        {/* ---- STORIES LIST ---- */}
        {view === 'stories' && (
          <>
            <PageTitle>Stories</PageTitle>
            <StoriesRow>
              {stories.map((story) => (
                <StoryCard key={story.id} onClick={() => selectStory(story)}>
                  <img
                    src={getImageSrc(story.image) || '/images/cartoon.png'}
                    alt={story.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/cartoon.png'; }}
                  />
                  <div className="info">
                    <div className="title">{story.title}</div>
                    <div className="meta">{story.comingSoon ? 'Coming Soon' : story.genre}</div>
                  </div>
                </StoryCard>
              ))}
            </StoriesRow>

            {!migrationDone && (
              <MigrationBox>
                <h3>One-time Migration from Google Sheets</h3>
                <p>Run this once to import stories and chapters from Google Sheets into Firestore. Hide this button afterwards.</p>
                <GoldBtn onClick={handleMigration} disabled={migrating}>
                  {migrating && <Spinner />}
                  {migrating ? 'Migrating…' : 'Run Migration'}
                </GoldBtn>
                {migrationMsg && (
                  <>
                    <StatusMsg $ok={migrationMsg.startsWith('✓')}>{migrationMsg}</StatusMsg>
                    {migrationMsg.includes('Permission denied') && (
                      <PermissionHelp>
                        <strong>Fix:</strong> Go to{' '}
                        <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
                          Firebase Console
                        </a>{' '}
                        → Firestore Database → <strong>Rules</strong> tab → paste this and click Publish:
                        <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
                        Then come back and click Run Migration again.
                      </PermissionHelp>
                    )}
                  </>
                )}
              </MigrationBox>
            )}

            <MigrationBox style={{ marginTop: '1rem', background: 'rgba(255, 100, 100, 0.05)', borderColor: 'rgba(255, 100, 100, 0.2)' }}>
              <h3 style={{ color: '#ff6b6b' }}>Delete Duplicate Chapters</h3>
              <p>If you see duplicate chapters, click this to clean them up. Keeps only the first occurrence of each chapter.</p>
              <DangerBtn onClick={handleDeleteDuplicates} disabled={cleaningDuplicates}>
                {cleaningDuplicates && <RedSpinner />}
                {cleaningDuplicates ? 'Deleting…' : 'Delete Duplicates'}
              </DangerBtn>
              {cleanupMsg && <StatusMsg $ok={cleanupMsg.startsWith('✓')}>{cleanupMsg}</StatusMsg>}
            </MigrationBox>
          </>
        )}

        {/* ---- ADD STORY ---- */}
        {view === 'addStory' && (
          <>
            <PageTitle>Add New Story</PageTitle>
            <EditorCard style={{ maxWidth: 520 }}>
              <form onSubmit={submitNewStory}>
                <Label>Slug / ID (unique, URL-safe)</Label>
                <Input
                  placeholder="e.g. the-lost-world"
                  value={newStoryForm.id}
                  onChange={(e) => setNewStoryForm((f) => ({ ...f, id: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                  required
                />
                <Label>Title</Label>
                <Input
                  placeholder="Story title"
                  value={newStoryForm.title}
                  onChange={(e) => setNewStoryForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
                <Label>Tagline</Label>
                <Input
                  placeholder="Short description"
                  value={newStoryForm.tagline}
                  onChange={(e) => setNewStoryForm((f) => ({ ...f, tagline: e.target.value }))}
                />
                <Label>Genre</Label>
                <Input
                  placeholder="Fantasy, Sci-Fi…"
                  value={newStoryForm.genre}
                  onChange={(e) => setNewStoryForm((f) => ({ ...f, genre: e.target.value }))}
                />
                <Toggle>
                  <input
                    type="checkbox"
                    checked={newStoryForm.comingSoon}
                    onChange={(e) => setNewStoryForm((f) => ({ ...f, comingSoon: e.target.checked }))}
                  />
                  Coming Soon
                </Toggle>
                <Label>Cover Image</Label>
                <UploadBtn>
                  Upload Cover
                  <input
                    ref={newStoryFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewStoryImageFile(file);
                    }}
                  />
                </UploadBtn>
                {newStoryImageFile && (
                  <ImagePreview src={URL.createObjectURL(newStoryImageFile)} alt="preview" />
                )}
                {newStoryMsg && <StatusMsg $ok={newStoryMsg.startsWith('✓')}>{newStoryMsg}</StatusMsg>}
                <div style={{ marginTop: '1.5rem' }}>
                  <GoldBtn type="submit" disabled={newStorySaving}>
                    {newStorySaving && <Spinner />}
                    Create Story
                  </GoldBtn>
                </div>
              </form>
            </EditorCard>
          </>
        )}

        {/* ---- STORY EDITOR ---- */}
        {view === 'storyEditor' && selectedStory && (
          <>
            <PageTitle>
              <button
                onClick={() => setView('stories')}
                style={{ background: 'none', border: 'none', color: '#ffd700', cursor: 'pointer', fontSize: '1rem' }}
              >
                <FaArrowLeft />
              </button>
              {selectedStory.title}
            </PageTitle>

            <StoryEditorWrapper>
              {/* Story Fields */}
              <EditorCard>
                <h2 style={{ color: '#ffd700', fontSize: '1rem', marginBottom: '0.5rem' }}>Story Details</h2>

                <Label>Title</Label>
                <Input
                  value={storyForm.title}
                  onChange={(e) => setStoryForm((f) => ({ ...f, title: e.target.value }))}
                />
                <Label>Tagline</Label>
                <Input
                  value={storyForm.tagline}
                  onChange={(e) => setStoryForm((f) => ({ ...f, tagline: e.target.value }))}
                />
                <Label>Genre</Label>
                <Input
                  value={storyForm.genre}
                  onChange={(e) => setStoryForm((f) => ({ ...f, genre: e.target.value }))}
                />
                <Toggle>
                  <input
                    type="checkbox"
                    checked={storyForm.comingSoon}
                    onChange={(e) => setStoryForm((f) => ({ ...f, comingSoon: e.target.checked }))}
                  />
                  Coming Soon
                </Toggle>

                <Label>Cover Image</Label>
                {(storyImageFile ? URL.createObjectURL(storyImageFile) : getImageSrc(storyForm.image)) && (
                  <ImagePreview
                    src={storyImageFile ? URL.createObjectURL(storyImageFile) : getImageSrc(storyForm.image)}
                    alt="cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <UploadBtn>
                  Upload New Image
                  <input
                    ref={storyFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setStoryImageFile(file);
                    }}
                  />
                </UploadBtn>

                {storyMsg && <StatusMsg $ok={storyMsg.startsWith('✓')}>{storyMsg}</StatusMsg>}

                <div style={{ marginTop: '1.5rem' }}>
                  <GoldBtn onClick={saveStory} disabled={storySaving}>
                    {storySaving && <Spinner />}
                    Save Changes
                  </GoldBtn>
                </div>
              </EditorCard>

              {/* Chapters */}
              <div>
                <SectionRow>
                  <h2>Chapters ({chapters.length})</h2>
                  <GoldBtn onClick={openNewChapter}>
                    <FaPlus /> Add Chapter
                  </GoldBtn>
                </SectionRow>

                {chapters.length === 0 && (
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>No chapters yet. Add the first one!</p>
                )}

                <ChapterGrid>
                  {chapters.map((ch) => (
                    <ChapterCardItem key={ch.id} onClick={() => openChapterPanel(ch)}>
                      <img
                        src={getImageSrc(ch.image) || '/images/cartoon.png'}
                        alt={`Chapter ${ch.number}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/cartoon.png'; }}
                      />
                      <div className="info">
                        <div className="num">Chapter {ch.number}</div>
                        <div className="title">{ch.title}</div>
                      </div>
                    </ChapterCardItem>
                  ))}
                </ChapterGrid>
              </div>
            </StoryEditorWrapper>
          </>
        )}
      </MainContent>

      {/* ---- CHAPTER SLIDE PANEL ---- */}
      {chapterPanel !== null && (
        <>
          <PanelOverlay onClick={() => setChapterPanel(null)} />
          <Panel>
            <PanelHeader>
              <h2>{chapterPanel === 'new' ? 'New Chapter' : `Edit Chapter ${(chapterPanel as Chapter).number}`}</h2>
              <GhostBtn onClick={() => setChapterPanel(null)}>✕</GhostBtn>
            </PanelHeader>

            <Label>Chapter Number</Label>
            <Input
              type="number"
              value={chapterForm.number}
              onChange={(e) => setChapterForm((f) => ({ ...f, number: Number(e.target.value) }))}
              min={1}
            />
            <Label>Title</Label>
            <Input
              value={chapterForm.title}
              onChange={(e) => setChapterForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Chapter title"
            />
            <Label>Google Doc URL (optional — content fetched from here at read time)</Label>
            <Input
              value={chapterForm.doc_url}
              onChange={(e) => setChapterForm((f) => ({ ...f, doc_url: e.target.value }))}
              placeholder="https://docs.google.com/document/d/..."
            />
            <Label>Content (or paste text directly)</Label>
            {chapterLoading && (
              <p style={{ fontSize: '0.82rem', color: '#ffd700', marginBottom: '0.5rem' }}>
                <Spinner /> Fetching content from Google Doc...
              </p>
            )}
            <Textarea
              value={chapterForm.content}
              onChange={(e) => setChapterForm((f) => ({ ...f, content: e.target.value }))}
              placeholder={chapterLoading ? "Loading..." : "Write the chapter content here…"}
              disabled={chapterLoading}
            />
            <Label>Chapter Image</Label>
            {(chapterImageFile ? URL.createObjectURL(chapterImageFile) : getImageSrc(chapterForm.image)) && (
              <ImagePreview
                src={chapterImageFile ? URL.createObjectURL(chapterImageFile) : getImageSrc(chapterForm.image)}
                alt="chapter cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <UploadBtn>
              Upload Image
              <input
                ref={chapterFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setChapterImageFile(file);
                }}
              />
            </UploadBtn>

            {chapterMsg && <StatusMsg $ok={chapterMsg.startsWith('✓')}>{chapterMsg}</StatusMsg>}

            <PanelActions>
              <GoldBtn onClick={saveChapter} disabled={chapterSaving}>
                {chapterSaving && <Spinner />}
                Save
              </GoldBtn>
              {chapterPanel !== 'new' && (
                <DangerBtn
                  onClick={() =>
                    setConfirmTarget({ type: 'chapter', id: (chapterPanel as Chapter).id })
                  }
                >
                  <FaTrash /> Delete
                </DangerBtn>
              )}
              <GhostBtn onClick={() => setChapterPanel(null)}>Cancel</GhostBtn>
            </PanelActions>
          </Panel>
        </>
      )}

      {/* ---- CONFIRM DIALOG ---- */}
      {confirmTarget && (
        <ConfirmOverlay>
          <ConfirmBox>
            <h3>Delete Chapter?</h3>
            <p>This action cannot be undone.</p>
            <div>
              <DangerBtn onClick={confirmDelete}>Yes, Delete</DangerBtn>
              <GhostBtn onClick={() => setConfirmTarget(null)}>Cancel</GhostBtn>
            </div>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </DashboardLayout>
  );
}

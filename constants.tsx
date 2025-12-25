import { Track } from './types';

export const COLORS = {
  primary: '#ff2e63',
  secondary: '#08d9d6',
  darkBg: '#050505',
  surface: '#121212',
  surfaceHighlight: '#1e1e1e',
  textSecondary: '#a0a0a0'
};

export const SAMPLE_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
    duration: '3:45',
    color: 'from-[#ff2e63] to-purple-900',
    youtubeId: 'dX3k_UAnyS8'
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop',
    duration: '3:22',
    color: 'from-red-600 to-black',
    youtubeId: '4NRXx6U8ABQ'
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop',
    duration: '3:24',
    color: 'from-[#08d9d6] to-blue-900',
    youtubeId: 'TUVcZfQe-Kw'
  },
  {
    id: '4',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'Stay Single',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&h=600&fit=crop',
    duration: '2:21',
    color: 'from-blue-600 to-black',
    youtubeId: 'kTJczUoc26U'
  },
  {
    id: '5',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '=',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop',
    duration: '3:50',
    color: 'from-yellow-600 to-red-900',
    youtubeId: 'orJSJGHjBLI'
  }
];
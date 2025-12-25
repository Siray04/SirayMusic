
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  genre?: string;
  lyrics?: string;
  color: string;
  youtubeId: string;
  isLocal?: boolean;
  localUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  coverUrl: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'playlist' | 'artist' | 'album';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  queue: Track[];
  history: Track[];
}

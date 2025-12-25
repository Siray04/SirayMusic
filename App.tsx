import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MusicCard from './components/MusicCard';
import NowPlayingScreen from './components/NowPlayingScreen';
import QueueDrawer from './components/QueueDrawer';
import BottomNav from './components/BottomNav';
import AlbumView from './components/AlbumView';
import ArtistPage from './components/ArtistPage';
import { Track, ViewType } from './types';
import { SAMPLE_TRACKS } from './constants';
import { Sparkles, Search as SearchIcon, User, ChevronLeft, Library, CloudUpload, Play } from 'lucide-react';
import { getTrackVibe } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');
  
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(SAMPLE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiVibe, setAiVibe] = useState<string>('');
  const [vibeLoading, setVibeLoading] = useState(false);
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  
  const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [sharedProgress, setSharedProgress] = useState(0);
  const [sharedDuration, setSharedDuration] = useState(0);

  const [queue, setQueue] = useState<Track[]>([...SAMPLE_TRACKS]);

  useEffect(() => {
    setQueue(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newLocals = localTracks.filter(t => !existingIds.has(t.id));
      return [...newLocals, ...prev];
    });
  }, [localTracks]);

  useEffect(() => {
    if (currentTrack) {
      setVibeLoading(true);
      if (!currentTrack.isLocal) {
        getTrackVibe(currentTrack.title, currentTrack.artist).then(v => {
          setAiVibe(v);
          setVibeLoading(false);
        });
      } else {
        setAiVibe("Mendengarkan koleksi pribadi Anda di SirayMusic. Koneksi autentik dengan musik favorit Anda.");
        setVibeLoading(false);
      }
    }
  }, [currentTrack]);

  const filteredTracks = useMemo(() => {
    const list = currentView === 'library' ? [...localTracks, ...SAMPLE_TRACKS] : SAMPLE_TRACKS;
    if (!searchQuery) return list;
    
    return list.filter(t => {
      const matchesText = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (searchFilter === 'songs') return matchesText;
      if (searchFilter === 'artists') return t.artist.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchFilter === 'albums') return t.album.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesText;
    });
  }, [searchQuery, currentView, localTracks, searchFilter]);

  const handleTrackSelect = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setQueue(prev => {
        if (prev.find(t => t.id === track.id)) return prev;
        return [track, ...prev];
      });
    }
  };

  const handleNext = useCallback(() => {
    if (repeatMode === 'one') {
      setSharedProgress(0);
      return;
    }
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (nextIndex === currentIndex && queue.length > 1) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    if (queue[nextIndex]) {
      setCurrentTrack(queue[nextIndex]);
      setIsPlaying(true);
    }
  }, [queue, currentTrack, isShuffle, repeatMode]);

  const handlePrev = useCallback(() => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    if (queue[prevIndex]) {
      setCurrentTrack(queue[prevIndex]);
      setIsPlaying(true);
    }
  }, [queue, currentTrack]);

  const navigateToAlbum = (albumName: string) => {
    setSelectedId(albumName);
    setCurrentView('album');
  };

  const navigateToArtist = (artistName: string) => {
    setSelectedId(artistName);
    setCurrentView('artist');
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLocalUpload={(tracks) => {
            setLocalTracks(prev => [...tracks, ...prev]);
            setCurrentTrack(tracks[0]);
            setIsPlaying(true);
            setCurrentView('library');
          }}
        />
        
        <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
          <header className="h-16 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 z-40 bg-zinc-950/80 backdrop-blur-2xl sticky top-0 border-b border-white/5 gap-2 py-2 md:py-0">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <div className="hidden md:flex gap-2">
                <button onClick={() => setCurrentView('home')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              <div className="relative group flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#08d9d6] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari lagu, artis, atau album di SirayMusic..." 
                  className="bg-zinc-800/40 hover:bg-zinc-700/40 focus:bg-zinc-800/80 text-sm rounded-full py-2.5 pl-10 pr-4 w-full outline-none transition-all border border-transparent focus:border-zinc-700"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== 'search') setCurrentView('search');
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                 <span className="text-[10px] font-bold text-[#ff2e63] bg-[#ff2e63]/10 px-2 py-1 rounded border border-[#ff2e63]/20 uppercase tracking-tighter">Siray Premium</span>
                 <button className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                    <User className="w-5 h-5 text-zinc-400" />
                 </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-36 md:pb-12">
            {currentView === 'home' && (
              <div className="space-y-12">
                {/* SirayMusic Hero Section - Sinematik & Rapi */}
                <section className="relative group min-h-[460px] rounded-[2.5rem] overflow-hidden shadow-[0_35px_70px_-15px_rgba(0,0,0,0.9)] transition-all duration-700 ease-in-out">
                  <div key={currentTrack?.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${currentTrack?.color || 'from-[#ff2e63] to-zinc-950'} track-enter`}>
                    <img 
                      src={currentTrack?.coverUrl} 
                      className="absolute inset-0 w-full h-full object-cover opacity-25 blur-3xl scale-110 animate-pulse-slow" 
                      alt="" 
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10 p-10 md:p-16 h-full flex flex-col justify-end min-h-[460px]">
                    <div className="flex items-center gap-2 mb-6 animate-in slide-in-from-left-4 duration-700">
                      <div className="bg-[#ff2e63] p-1.5 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-white fill-current" />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-[#08d9d6]">Siray Choice</span>
                    </div>

                    <div className={`space-y-2 mb-10 track-enter`} key={`info-${currentTrack?.id}`}>
                      <h2 className="text-4xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter drop-shadow-2xl">
                        {currentTrack?.title}
                      </h2>
                      <p className="text-xl md:text-4xl font-bold text-white/90 tracking-tight opacity-90">
                        {currentTrack?.artist}
                      </p>
                      <div className={`pt-8 transition-opacity duration-700 ${vibeLoading ? 'opacity-30' : 'opacity-100'}`}>
                         <p className="text-sm md:text-xl font-medium text-white/60 italic max-w-2xl leading-relaxed">
                          "{aiVibe}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => currentTrack && handleTrackSelect(currentTrack)}
                        className="bg-white text-black px-10 py-4 rounded-full text-sm md:text-base font-bold hover:scale-105 transition-all active:scale-95 shadow-2xl flex items-center gap-3"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Putar Sekarang
                      </button>
                      <button className="bg-white/5 backdrop-blur-xl text-white border border-white/20 px-10 py-4 rounded-full text-sm md:text-base font-bold hover:bg-white/15 transition-all flex items-center gap-3">
                        <CloudUpload className="w-5 h-5" />
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Decorative Side Cover */}
                  <div className="absolute right-[-3%] bottom-[-5%] w-[420px] md:w-[620px] h-[420px] md:h-[620px] pointer-events-none hidden lg:block overflow-hidden">
                    <img 
                      key={`img-${currentTrack?.id}`}
                      src={currentTrack?.coverUrl} 
                      className="w-full h-full object-cover opacity-30 rotate-12 rounded-[4rem] shadow-2xl transition-all duration-1000 group-hover:scale-110 group-hover:rotate-6 track-enter" 
                      alt="" 
                    />
                  </div>
                </section>

                <section className="track-enter">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">Baru Saja Diputar</h2>
                    <button className="text-xs font-bold text-zinc-500 hover:text-[#ff2e63] transition uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800">Lihat Semua</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {SAMPLE_TRACKS.map(track => (
                      <MusicCard 
                        key={track.id} 
                        track={track} 
                        isActive={currentTrack?.id === track.id}
                        isPlaying={isPlaying}
                        onPlay={handleTrackSelect}
                      />
                    ))}
                  </div>
                </section>

                <section className="bg-gradient-to-r from-zinc-900/40 to-transparent p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-tr from-[#ff2e63] to-[#08d9d6] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                        <Library className="text-white w-8 h-8" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white font-display">SirayMusic Offline Mode</h3>
                        <p className="text-zinc-400 mt-1 max-w-xl">Akses semua lagu dari memori internal Android Anda dengan visual premium. Musik Anda, aturan Anda.</p>
                      </div>
                      <button className="md:ml-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-full transition-all border border-zinc-700">
                        Cek Koleksi
                      </button>
                   </div>
                </section>
              </div>
            )}

            {currentView === 'search' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {['all', 'songs', 'artists', 'albums'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setSearchFilter(f as any)}
                      className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${searchFilter === f ? 'bg-[#ff2e63] border-[#ff2e63] text-white shadow-lg' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {filteredTracks.map(track => (
                    <MusicCard 
                      key={track.id} 
                      track={track} 
                      isActive={currentTrack?.id === track.id}
                      isPlaying={isPlaying}
                      onPlay={handleTrackSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {(currentView === 'album' || currentView === 'artist' || currentView === 'library') && (
               <div className="animate-in fade-in duration-500">
                 {currentView === 'library' && <h2 className="text-3xl font-black mb-8 tracking-tight">Koleksi Musik Siray</h2>}
                 
                 {currentView === 'album' && selectedId && (
                    <AlbumView 
                      albumName={selectedId} 
                      tracks={SAMPLE_TRACKS.filter(t => t.album === selectedId)} 
                      currentTrackId={currentTrack?.id}
                      onPlay={handleTrackSelect}
                      onBack={() => setCurrentView('home')}
                    />
                 )}

                 {currentView === 'artist' && selectedId && (
                    <ArtistPage 
                      artistName={selectedId} 
                      tracks={SAMPLE_TRACKS.filter(t => t.artist === selectedId)} 
                      currentTrackId={currentTrack?.id}
                      onPlay={handleTrackSelect}
                      onBack={() => setCurrentView('home')}
                    />
                 )}

                 {currentView === 'library' && (
                   filteredTracks.length > 0 ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                       {filteredTracks.map(track => (
                         <MusicCard 
                           key={track.id} 
                           track={track} 
                           isActive={currentTrack?.id === track.id}
                           isPlaying={isPlaying}
                           onPlay={handleTrackSelect}
                         />
                       ))}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-[50vh] opacity-30">
                        <Library className="w-16 h-16 mb-4" />
                        <p className="font-medium">Belum ada koleksi musik di SirayMusic.</p>
                     </div>
                   )
                 )}
               </div>
            )}
          </div>
        </main>
      </div>

      <Player 
        currentTrack={currentTrack} 
        onNext={handleNext} 
        onPrev={handlePrev}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onOpenNowPlaying={() => setIsNowPlayingVisible(true)}
        onToggleQueue={() => setIsQueueVisible(!isQueueVisible)}
        syncProgress={setSharedProgress}
        syncDuration={setSharedDuration}
        externalSeek={sharedProgress}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        repeatMode={repeatMode}
        onToggleRepeat={() => {
          const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
          const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
          setRepeatMode(next);
        }}
      />

      <BottomNav currentView={currentView} onViewChange={setCurrentView} />

      {isQueueVisible && (
        <QueueDrawer 
          queue={queue}
          currentTrackId={currentTrack?.id || ''}
          onSelectTrack={handleTrackSelect}
          onRemoveTrack={(id) => setQueue(q => q.filter(t => t.id !== id))}
          onMoveTrack={() => {}} 
          onClose={() => setIsQueueVisible(false)}
        />
      )}

      {isNowPlayingVisible && (
        <NowPlayingScreen 
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={() => setIsNowPlayingVisible(false)}
          onToggleQueue={() => { setIsNowPlayingVisible(false); setIsQueueVisible(true); }}
          onNavigateToArtist={navigateToArtist}
          onNavigateToAlbum={navigateToAlbum}
          progress={sharedProgress}
          duration={sharedDuration}
          onSeek={(e) => setSharedProgress(parseFloat(e.target.value))}
          vibe={aiVibe}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          repeatMode={repeatMode}
          onToggleRepeat={() => {
            const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
            const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
            setRepeatMode(next);
          }}
        />
      )}
    </div>
  );
};

export default App;
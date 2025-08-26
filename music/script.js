// Fisher-Yates Shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Playlist (replace with your own MP3 files in the project folder)
const songs = [
    { title: "Instrumental Track 1", src: "./songs/song1.mp3" },
    { title: "Instrumental Track 2", src: "./songs/song2.mp3" },
    { title: "Instrumental Track 3", src: "./songs/song3.mp3" },
    { title: "Instrumental Track 4", src: "./songs/song4.mp3" },
    { title: "Instrumental Track 5", src: "./songs/song5.mp3" }
];

// App State
let shuffledSongs = [...songs];
let currentAudio = null;
let currentSongIndex = -1;

// DOM Elements
const shuffleBtn = document.getElementById('shuffleBtn');
const songListEl = document.getElementById('songList');
const currentSongEl = document.getElementById('currentSong');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Update prev/next button disabled state
function updateNavButtons() {
    prevBtn.disabled = currentSongIndex <= 0;
    nextBtn.disabled = currentSongIndex === -1 || currentSongIndex >= shuffledSongs.length - 1;
}

// Display Playlist in Sidebar
function displayPlaylist() {
    songListEl.innerHTML = '';
    shuffledSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = `song-item${currentSongIndex === index ? ' active' : ''}`;
        songItem.setAttribute('tabindex', '0');
        songItem.setAttribute('aria-label', song.title + (currentSongIndex === index ? ' (playing)' : ''));
        songItem.innerHTML = `
            <span class="song-title">${song.title}</span>
            <button class="play-btn${currentSongIndex === index ? ' playing' : ''}" data-index="${index}" aria-label="${currentSongIndex === index ? 'Pause' : 'Play'} ${song.title}">
                ${currentSongIndex === index ? 'Pause' : 'Play'}
            </button>
            <audio id="audio-${index}" src="${song.src}"></audio>
        `;
        songListEl.appendChild(songItem);
    });

    // Add play/pause event listeners
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            playSong(index);
        });
    });

    updateNavButtons();
}

// Play or Pause Song
function playSong(index) {
    if (index < 0 || index >= shuffledSongs.length) return;
    const audio = document.getElementById(`audio-${index}`);
    const button = document.querySelector(`.play-btn[data-index="${index}"]`);
    const isPlaying = button.classList.contains('playing');
    const prevIndex = currentSongIndex; // Save previous index

    // Pause any currently playing audio
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        const prevButton = document.querySelector(`.play-btn[data-index="${prevIndex}"]`);
        if (prevButton) {
            prevButton.classList.remove('playing');
            prevButton.textContent = 'Play';
            prevButton.setAttribute('aria-label', 'Play ' + shuffledSongs[prevIndex]?.title);
        }
        const prevActiveItem = document.querySelectorAll('.song-item')[prevIndex];
        if (prevActiveItem) {
            prevActiveItem.classList.remove('active');
        }
    }

    // Toggle play/pause
    if (isPlaying) {
        audio.pause();
        button.classList.remove('playing');
        button.textContent = 'Play';
        button.setAttribute('aria-label', 'Play ' + shuffledSongs[index].title);
        currentSongEl.textContent = 'No song playing';
        currentSongIndex = -1;
        currentAudio = null;
        document.querySelectorAll('.song-item')[index].classList.remove('active');
    } else {
        audio.play().catch(error => {
            console.error('Playback failed:', error);
            currentSongEl.textContent = 'Error playing song (check console)';
        });
        button.classList.add('playing');
        button.textContent = 'Pause';
        button.setAttribute('aria-label', 'Pause ' + shuffledSongs[index].title);
        currentSongEl.textContent = shuffledSongs[index].title;
        currentSongIndex = index; // Update after cleanup
        currentAudio = audio;
        document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.song-item')[index].classList.add('active');

        // When song ends, auto-play next
        audio.onended = () => {
            playNextSong();
        };
    }

    updateNavButtons();
}

// Shuffle Playlist
shuffleBtn.addEventListener('click', () => {
    shuffledSongs = [...songs];
    shuffle(shuffledSongs);
    stopCurrentSong();
    displayPlaylist();
});

// Stop current song helper
function stopCurrentSong() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        const prevButton = document.querySelector('.play-btn.playing');
        if (prevButton) {
            prevButton.classList.remove('playing');
            prevButton.textContent = 'Play';
            prevButton.setAttribute('aria-label', 'Play ' + shuffledSongs[currentSongIndex]?.title);
        }
        currentSongEl.textContent = 'No song playing';
        currentSongIndex = -1;
        currentAudio = null;
        document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
    }
}

// Previous/Next controls
function playPrevSong() {
    // Only allow if a song is selected and not the first
    if (currentSongIndex > 0) {
        playSong(currentSongIndex - 1);
    } else if (currentSongIndex === -1 && shuffledSongs.length > 0) {
        // If nothing is playing, start from first
        playSong(0);
    }
}

function playNextSong() {
    // Only allow if a song is selected and not the last
    if (currentSongIndex >= 0 && currentSongIndex < shuffledSongs.length - 1) {
        playSong(currentSongIndex + 1);
    } else if (currentSongIndex === -1 && shuffledSongs.length > 0) {
        // If nothing is playing, start from first
        playSong(0);
    } else {
        stopCurrentSong();
        updateNavButtons();
    }
}

// Keyboard navigation for accessibility
function handleSongListKeydown(e) {
    if (document.activeElement.classList.contains('song-item')) {
        let idx = Array.from(songListEl.children).indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (idx < songListEl.children.length - 1) {
                songListEl.children[idx + 1].focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx > 0) {
                songListEl.children[idx - 1].focus();
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playSong(idx);
        }
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);
    document.addEventListener('keydown', handleSongListKeydown);
    displayPlaylist();
});
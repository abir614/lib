// Notification Sound System with Fallback
const NotificationSoundSystem = {
    audioElement: null,
    audioContext: null,
    soundEnabled: true,
    audioLoaded: false,

    init() {
        console.log('Initializing Notification Sound System...');

        // Get audio element
        this.audioElement = document.getElementById('notificationSound');

        // Load sound preference
        const savedPreference = localStorage.getItem('notificationSoundEnabled');
        if (savedPreference !== null) {
            this.soundEnabled = savedPreference === 'true';
        }

        // Initialize Web Audio API for fallback
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Web Audio API initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }

        // Check if audio file is loaded
        if (this.audioElement) {
            this.audioElement.volume = 0.5;

            this.audioElement.addEventListener('canplaythrough', () => {
                this.audioLoaded = true;
                console.log('Notification audio file loaded successfully');
            });

            this.audioElement.addEventListener('error', (e) => {
                console.warn('Audio file failed to load, will use fallback beep:', e);
                this.audioLoaded = false;
            });

            // Try to load
            this.audioElement.load();
        }
    },

    play() {
        if (!this.soundEnabled) {
            console.log('Sound disabled by user');
            return;
        }

        // Try to play audio file first
        if (this.audioElement && this.audioLoaded) {
            console.log('Playing notification sound from file');
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(err => {
                console.log('Failed to play audio file, using fallback:', err);
                this.playBeep();
            });
        } else {
            // Use fallback beep
            console.log('Using fallback beep sound');
            this.playBeep();
        }
    },

    playBeep() {
        if (!this.audioContext) {
            console.warn('No audio context available');
            return;
        }

        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Create a pleasant notification sound (two-tone)
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
            oscillator.type = 'sine';

            // Envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);

            console.log('Beep sound played');
        } catch (error) {
            console.error('Error playing beep:', error);
        }
    },

    toggle(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('notificationSoundEnabled', enabled.toString());
        console.log('Notification sound', enabled ? 'enabled' : 'disabled');
    },

    isEnabled() {
        return this.soundEnabled;
    },

    // Test function
    test() {
        console.log('Testing notification sound...');
        console.log('Sound enabled:', this.soundEnabled);
        console.log('Audio loaded:', this.audioLoaded);
        console.log('Audio context:', this.audioContext ? 'Available' : 'Not available');
        this.play();
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.NotificationSoundSystem = NotificationSoundSystem;
}

// Source: client/utils/sound.js
// Source: client/utils/sound.js
import { Audio } from 'expo-av';
import { SOUNDS } from '../constants/sounds';

// Objet pour stocker les sons préchargés
let loadedSounds = {};
let soundsLoaded = false;

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    
    // Préchargez tous les sons
    if (!soundsLoaded) {
      await preloadSounds();
      soundsLoaded = true;
    }
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

// Nouvelle fonction pour précharger tous les sons
const preloadSounds = async () => {
  try {
    const soundPromises = Object.entries(SOUNDS).map(async ([key, source]) => {
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      return [key, sound];
    });
    
    // Attendez que tous les sons soient chargés
    const loadedSoundEntries = await Promise.all(soundPromises);
    loadedSounds = Object.fromEntries(loadedSoundEntries);
    
    console.log('All sounds preloaded successfully');
  } catch (error) {
    console.error('Error preloading sounds:', error);
  }
};

export const playSound = async (soundFile) => {
  try {
    // Trouvez la clé correspondant au fichier son
    const soundKey = Object.entries(SOUNDS).find(
      ([_, source]) => source === soundFile
    )?.[0];
    
    if (soundKey && loadedSounds[soundKey]) {
      // Utilisez le son préchargé
      await loadedSounds[soundKey].setPositionAsync(0);
      await loadedSounds[soundKey].playAsync();
    } else {
      // Fallback: charger et jouer le son si non préchargé
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const unloadSound = async () => {
  try {
    // Ne déchargez pas les sons préchargés, arrêtez-les simplement
    const stopPromises = Object.values(loadedSounds).map(sound => 
      sound.stopAsync().catch(console.error)
    );
    await Promise.all(stopPromises);
  } catch (error) {
    console.error('Error stopping sounds:', error);
  }
};

// Nouvelle fonction pour nettoyer tous les sons lors de la fermeture de l'app
export const cleanupSounds = async () => {
  try {
    if (soundsLoaded) {
      const unloadPromises = Object.values(loadedSounds).map(sound => 
        sound.unloadAsync().catch(console.error)
      );
      await Promise.all(unloadPromises);
      loadedSounds = {};
      soundsLoaded = false;
    }
  } catch (error) {
    console.error('Error cleaning up sounds:', error);
  }
};
import { Audio } from 'expo-av';

let sound = null;

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const playSound = async (soundFile) => {
  try {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
    sound = newSound;
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const unloadSound = async () => {
  try {
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error unloading sound:', error);
  }
};
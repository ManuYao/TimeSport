// Source: client/components/ForTime.js
// Source: client/components/ForTime.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { playSound, unloadSound } from '../utils/sound';
import { SOUNDS } from '../constants/sounds';
import NumberPicker from './common/NumberPicker';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75;
const LONG_PRESS_DURATION = 800;

const ForTime = () => {
  const [series, setSeries] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [currentSeries, setCurrentSeries] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // États pour le NumberPicker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [pickerConfig, setPickerConfig] = useState({
    minValue: 1,
    maxValue: 99,
    initialValue: 5
  });
  
  const intervalRef = useRef(null);
  const soundTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Fonction améliorée pour gérer les sons avec un délai de sécurité
  const handleSoundWithProtection = (soundType) => {
    if (isRunning && !isPaused && !isPlayingRef.current) {
      isPlayingRef.current = true;
      
      playSound(soundType).catch(error => {
        console.error('Erreur lors de la lecture du son:', error);
      });
      
      // Désactiver la protection après un délai pour permettre d'autres sons
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
      
      soundTimeoutRef.current = setTimeout(() => {
        isPlayingRef.current = false;
      }, 1000); // Délai de protection d'une seconde
    }
  };

  const handleSeriesChange = (value) => {
    setSeries(parseInt(value) || 0);
  };

  const handleRestTimeChange = (value) => {
    setRestTime(parseInt(value) || 0);
  };
  
  // Fonction pour ouvrir le NumberPicker
  const openNumberPicker = (target) => {
    let config = {
      minValue: 1,
      initialValue: 5,
      maxValue: 30
    };
    
    if (target === 'series') {
      config = {
        minValue: 1,
        maxValue: 30,
        initialValue: parseInt(series) || 5
      };
    } else if (target === 'rest') {
      config = {
        minValue: 5,
        maxValue: 300,
        initialValue: parseInt(restTime) || 60
      };
    }
    
    setPickerConfig(config);
    setPickerTarget(target);
    setPickerVisible(true);
  };

  // Gérer la confirmation du NumberPicker
  const handlePickerConfirm = (value) => {
    if (pickerTarget === 'series') {
      setSeries(value);
    } else if (pickerTarget === 'rest') {
      setRestTime(value);
    }
    setPickerVisible(false);
  };

  const startTimer = () => {
    if (!series || !restTime) {
      Alert.alert('Attention', 'Veuillez remplir tous les champs');
      return;
    }
    setIsRunning(true);
    setCurrentSeries(1);
    setCurrentTime(0);
    setCountdown(10);
  };

  const resetTimer = () => {
    // Nettoyage des timers de son et intervalles
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Réinitialisation des états
    isPlayingRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSeries(1);
    setCurrentTime(0);
    setCountdown(10);
    setIsResting(false);
    
    // Libérer la ressource son
    unloadSound().catch(error => {
      console.error('Erreur lors de l\'arrêt du son:', error);
    });
  };

  const handleCirclePress = () => {
    if (isRunning && countdown === 0) {
      setIsPaused(!isPaused);
    }
  };

  const handleNextPhase = () => {
    if (isRunning && countdown === 0) {
      setIsResting(!isResting);
      
      if (!isResting) {
        setCurrentTime(restTime);
      } else {
        setCurrentTime(0);
        setCurrentSeries(prev => prev + 1);
      }
    }
  };

  // Gestion de la navigation (focus/blur)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if (soundTimeoutRef.current) {
          clearTimeout(soundTimeoutRef.current);
          soundTimeoutRef.current = null;
        }
        
        unloadSound().catch(console.error);
        resetTimer();
      };
    }, [])
  );

  const getPhaseColor = () => {
    if (countdown > 0) return COLORS.warning;
    return isResting ? COLORS.warning : COLORS.success;
  };

  const getBackgroundColor = () => {
    if (countdown > 0) return COLORS.darkBlue;
    return isResting ? COLORS.darkGreen : COLORS.darkRed;
  };

  const getCircleBackground = () => {
    if (countdown > 0) return 'rgba(255,255,255,0.1)';
    return isResting ? 'rgba(255,200,0,0.1)' : 'rgba(0,255,0,0.1)';
  };

  useEffect(() => {
    let isComponentMounted = true;

    if (isRunning && !isPaused) {
      // Son pendant le compte à rebours initial
      if (countdown <= 3 && countdown > 0) {
        handleSoundWithProtection(SOUNDS.fiveSecondsStart);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (countdown > 0) {
        intervalRef.current = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        intervalRef.current = setInterval(() => {
          if (isResting) {
            setCurrentTime(prev => {
              // Son pour les 5 dernières secondes du repos - utilisation de if pour éviter les conflits
              if (prev === 5) {
                handleSoundWithProtection(SOUNDS.fiveSecondsEnd);
              }
              // Son à mi-repos - utilisation de if également
              const midPoint = Math.floor(restTime / 2);
              if (prev === midPoint && midPoint > 5) {
                handleSoundWithProtection(SOUNDS.midExercise);
              }

              if (prev <= 0) {
                if (currentSeries >= series) {
                  if (soundTimeoutRef.current) {
                    clearTimeout(soundTimeoutRef.current);
                  }
                  
                  // Attendre que le son termine avant de réinitialiser
                  setTimeout(() => {
                    if (isComponentMounted) {
                      resetTimer();
                      Alert.alert('Terminé', 'Entraînement terminé !');
                    }
                  }, 1500);
                  return 0;
                }
                setIsResting(false);
                setCurrentTime(0);
                setCurrentSeries(prevSeries => prevSeries + 1);
                return 0;
              }
              return prev - 1;
            });
          } else {
            setCurrentTime(prev => {
              const newTime = prev + 1;
              // Son toutes les minutes pendant le travail
              if (newTime > 0 && newTime % 60 === 0) {
                handleSoundWithProtection(SOUNDS.midExercise);
              }
              return newTime;
            });
          }
        }, 1000);
      }
    }

    return () => {
      isComponentMounted = false;
      
      // Nettoyage des timers et intervalles
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      
      // Permettre au son en cours de finir avant de le décharger
      setTimeout(() => {
        unloadSound().catch(console.error);
      }, 500);
    };
  }, [isRunning, countdown, isPaused, currentSeries, series, currentTime, isResting, restTime]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.safeArea}>
        {!isRunning ? (
          <View style={styles.setup}>
            <View style={styles.circleContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openNumberPicker('series')}
              >
                <View style={[styles.circle, styles.setupCircle]}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.phaseText}>SÉRIES</Text>
                    <View style={[styles.circleInputContainer, { width: '100%' }]}>
                      <Text style={styles.circleInput}>
                        {series || "5"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.inputContainer}
              activeOpacity={0.8}
              onPress={() => openNumberPicker('rest')}
            >
              <Text style={styles.label}>REPOS</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.input}>
                  {restTime || "60"}
                </Text>
              </View>
              <Text style={styles.unit}>SEC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startButton}
              onPress={startTimer}
            >
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timerDisplay}>
            <Pressable onPress={handleCirclePress}>
              <View style={[
                styles.circle,
                { 
                  borderColor: getPhaseColor(),
                  backgroundColor: getCircleBackground()
                },
                isPaused && styles.circlePaused
              ]}>
                <Text style={styles.phaseText}>
                  {countdown > 0 ? 'PRÊT' : (isResting ? 'REPOS' : 'GO')}
                </Text>
                {countdown === 0 && (
                  <Text style={styles.seriesText}>{currentSeries}/{series}</Text>
                )}
                <Text style={styles.timeDisplay}>
                  {countdown > 0 ? countdown : formatTime(currentTime)}
                </Text>
                {isPaused && <Text style={styles.pausedText}>PAUSE</Text>}
              </View>
            </Pressable>

            {countdown === 0 && (
              <TouchableOpacity
                style={[styles.phaseButton, isResting && styles.phaseButtonActive]}
                onPress={handleNextPhase}
              >
                <Text style={styles.phaseButtonText}>
                  {isResting ? 'REPRENDRE' : 'RÉCUPÉRATION'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetTimer}
              >
                <Text style={styles.controlButtonText}>↺</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* NumberPicker Modal */}
      <NumberPicker
        visible={pickerVisible}
        initialValue={pickerConfig.initialValue}
        minValue={pickerConfig.minValue}
        maxValue={pickerConfig.maxValue}
        onConfirm={handlePickerConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  setup: {
    width: '100%',
    alignItems: 'center',
    gap: 40,
  },
  circleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  setupCircle: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  circleInputContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInput: {
    fontSize: 64,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    height: 80,
    padding: 0,
    minWidth: 120,
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  seriesText: {
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '300',
    opacity: 0.9,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: SIZES.radius,
    maxWidth: width * 0.4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: SIZES.fontSize.body,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },
  input: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    textAlign: 'center',
    height: 50,
    padding: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    minWidth: 100,
  },
  unit: {
    fontSize: SIZES.fontSize.small,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    letterSpacing: 1,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.background,
    fontWeight: '500',
    letterSpacing: 3,
  },
  phaseText: {
    fontSize: SIZES.fontSize.title,
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  circlePaused: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },
  pausedText: {
    position: 'absolute',
    fontSize: SIZES.fontSize.title,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '600',
  },
  phaseButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    marginTop: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  phaseButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: COLORS.success,
  },
  phaseButtonText: {
    fontSize: SIZES.fontSize.body,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 2,
    opacity: 0.9,
  },
  inputWrapper: {
    alignItems: 'center',
    width: '100%',
  },
});

export default ForTime;
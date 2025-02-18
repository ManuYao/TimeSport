// Source: client/components/AMRAP.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { playSound, unloadSound } from '../utils/sound';
import { SOUNDS } from '../constants/sounds';
import NumberPicker from './common/NumberPicker';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75;

const AmrapTimer = () => {
  const [totalDuration, setTotalDuration] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [restTime, setRestTime] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  
  // États pour le NumberPicker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [pickerConfig, setPickerConfig] = useState({
    minValue: 1,
    maxValue: 99,
    initialValue: 20
  });
  
  const intervalRef = useRef(null);
  const soundTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Fonction pour gérer les sons avec protection
  const handleSoundWithProtection = useCallback((soundType) => {
    if (isRunning && !isPaused && !isPlayingRef.current) {
      isPlayingRef.current = true;
      
      playSound(soundType).catch(error => {
        console.error('Erreur lors de la lecture du son:', error);
      });
      
      // Désactiver la protection après un délai
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
      
      soundTimeoutRef.current = setTimeout(() => {
        isPlayingRef.current = false;
      }, 1000);
    }
  }, [isRunning, isPaused]);

  const validateAndFormatInput = useCallback((value, max = 999) => {
    const numberValue = value.replace(/[^0-9]/g, '');
    const parsedValue = parseInt(numberValue);
    if (isNaN(parsedValue) || parsedValue <= 0) return '';
    return Math.min(parsedValue, max).toString();
  }, []);

  const handleTotalDurationChange = useCallback((value) => {
    setTotalDuration(validateAndFormatInput(value, 999));
  }, [validateAndFormatInput]);

  const handleWorkTimeChange = useCallback((value) => {
    setWorkTime(validateAndFormatInput(value, 999));
  }, [validateAndFormatInput]);

  const handleRestTimeChange = useCallback((value) => {
    setRestTime(validateAndFormatInput(value, 999));
  }, [validateAndFormatInput]);
  
  // Fonction pour ouvrir le NumberPicker
  const openNumberPicker = useCallback((target) => {
    let config = {
      minValue: 1,
      initialValue: 20,
      maxValue: 99
    };
    
    if (target === 'duration') {
      config = {
        minValue: 1,
        maxValue: 180,
        initialValue: parseInt(totalDuration) || 20
      };
    } else if (target === 'work') {
      config = {
        minValue: 1,
        maxValue: 180,
        initialValue: parseInt(workTime) || 30
      };
    } else if (target === 'rest') {
      config = {
        minValue: 1,
        maxValue: 120,
        initialValue: parseInt(restTime) || 10
      };
    }
    
    setPickerConfig(config);
    setPickerTarget(target);
    setPickerVisible(true);
  }, [totalDuration, workTime, restTime]);

  // Gérer la confirmation du NumberPicker
  const handlePickerConfirm = useCallback((value) => {
    if (pickerTarget === 'duration') {
      setTotalDuration(value.toString());
    } else if (pickerTarget === 'work') {
      setWorkTime(value.toString());
    } else if (pickerTarget === 'rest') {
      setRestTime(value.toString());
    }
    setPickerVisible(false);
  }, [pickerTarget]);

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const pauseTimer = useCallback(() => {
    if (countdown === 0) {
      setIsPaused(!isPaused);
    }
  }, [countdown, isPaused]);

  const resetTimer = useCallback(() => {
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
    setCurrentTime(0);
    setElapsedTime(0);
    setCountdown(10);
    setIsResting(false);
    
    // Libérer la ressource son
    unloadSound().catch(error => {
      console.error('Erreur lors de l\'arrêt du son:', error);
    });
  }, []);

  const startTimer = useCallback(() => {
    if (isInfiniteMode) {
      const durationValue = parseInt(totalDuration);
      if (!durationValue || durationValue <= 0) {
        Alert.alert('Attention', 'Veuillez entrer une durée valide');
        return;
      }
    } else {
      const workValue = parseInt(workTime);
      const restValue = parseInt(restTime);
      
      if (!workValue || !restValue || workValue <= 0 || restValue <= 0) {
        Alert.alert('Attention', 'Veuillez entrer des temps valides pour le travail et le repos');
        return;
      }
    }
    
    setIsRunning(true);
    setCurrentTime(isInfiniteMode ? parseInt(totalDuration) * 60 : parseInt(workTime));
    setElapsedTime(0);
    setIsPaused(false);
    setCountdown(10);
    setIsResting(false);
  }, [isInfiniteMode, totalDuration, workTime, restTime]);

  const handleNextPhase = useCallback(() => {
    if (isRunning && countdown === 0 && !isInfiniteMode) {
      setIsResting(!isResting);
      
      if (!isResting) {
        // Démarrer le repos avec le temps complet
        setCurrentTime(parseInt(restTime));
      } else {
        // Retour au travail
        setCurrentTime(parseInt(workTime));
      }
    }
  }, [isRunning, countdown, isInfiniteMode, isResting, restTime, workTime]);

  const getPhaseColor = useCallback(() => {
    if (countdown > 0) return COLORS.warning;
    return isResting ? COLORS.warning : COLORS.success;
  }, [countdown, isResting]);

  const getBackgroundColor = useCallback(() => {
    if (countdown > 0) return COLORS.darkBlue;
    return isResting ? COLORS.darkGreen : COLORS.darkRed;
  }, [countdown, isResting]);

  const getCircleBackground = useCallback(() => {
    if (countdown > 0) return 'rgba(255,255,255,0.1)';
    return isResting ? 'rgba(255,200,0,0.1)' : 'rgba(0,255,0,0.1)';
  }, [countdown, isResting]);

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
      };
    }, [])
  );

  useEffect(() => {
    let isComponentMounted = true;

    if (isRunning && !isPaused) {
      // Son pendant le compte à rebours initial - CONSERVÉ
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
          setCurrentTime(prev => {
            // Son à mi-chemin seulement (pour le travail ou le repos)
            const currentPhaseTime = isInfiniteMode ? 
              parseInt(totalDuration) * 60 : 
              (isResting ? parseInt(restTime) : parseInt(workTime));
            const midPoint = Math.floor(currentPhaseTime / 2);
            
            if (prev === midPoint && midPoint > 5) {
              handleSoundWithProtection(SOUNDS.midExercise);
            }

            if (prev <= 1) {
              if (isInfiniteMode) {
                // Attendre avant de réinitialiser
                setTimeout(() => {
                  if (isComponentMounted) {
                    resetTimer();
                    Alert.alert('Terminé', 'Entraînement terminé !');
                  }
                }, 100);
                return 0;
              }
              
              if (isResting) {
                setIsResting(false);
                return parseInt(workTime);
              } else {
                setIsResting(true);
                return parseInt(restTime);
              }
            }
            return prev - 1;
          });

          if (!isInfiniteMode) {
            setElapsedTime(prev => {
              const totalDurationSecs = parseInt(totalDuration) * 60;
              const newTime = prev + 1;
              if (newTime >= totalDurationSecs) {
                setTimeout(() => {
                  if (isComponentMounted) {
                    resetTimer();
                    Alert.alert('Terminé', 'Entraînement terminé !');
                  }
                }, 100);
                return totalDurationSecs;
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
      
      unloadSound().catch(console.error);
    };
  }, [isRunning, countdown, isPaused, isResting, workTime, restTime, isInfiniteMode, totalDuration, handleSoundWithProtection, resetTimer]);

  // Utiliser useMemo pour éviter de recréer des objets de style à chaque rendu
  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: getBackgroundColor() },
    circle: { 
      borderColor: getPhaseColor(),
      backgroundColor: getCircleBackground()
    }
  }), [getBackgroundColor, getPhaseColor, getCircleBackground]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.safeArea}>
        {!isRunning ? (
          <View style={styles.setup}>
            <TouchableOpacity
              style={[styles.modeButton, isInfiniteMode && styles.modeButtonActive]}
              onPress={() => setIsInfiniteMode(!isInfiniteMode)}
            >
              <Text style={[styles.modeButtonText, isInfiniteMode && styles.modeButtonTextActive]}>
                {isInfiniteMode ? '∞ Mode Infini' : '⏱ Mode Minuté'}
              </Text>
            </TouchableOpacity>

            <View style={styles.circleContainer}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => openNumberPicker('duration')}
              >
                <View style={[styles.circle, styles.setupCircle]}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.phaseText}>DURÉE</Text>
                    <View style={[styles.circleInputContainer, { width: '100%' }]}>
                      <Text style={styles.circleInput}>
                        {totalDuration || "20"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {!isInfiniteMode && (
              <View style={styles.rowContainer}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  activeOpacity={0.8}
                  onPress={() => openNumberPicker('work')}
                >
                  <Text style={styles.label}>TRAVAIL</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.input}>
                      {workTime || "30"}
                    </Text>
                  </View>
                  <Text style={styles.unit}>SEC</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.inputContainer}
                  activeOpacity={0.8}
                  onPress={() => openNumberPicker('rest')}
                >
                  <Text style={styles.label}>REPOS</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.input}>
                      {restTime || "10"}
                    </Text>
                  </View>
                  <Text style={styles.unit}>SEC</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.startButton}
              onPress={startTimer}
            >
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timerDisplay}>
            <Pressable onPress={pauseTimer}>
              <View style={[
                styles.circle,
                dynamicStyles.circle,
                isPaused && styles.circlePaused
              ]}>
                <Text style={styles.phaseText}>
                  {countdown > 0 ? 'PRÊT' : (isResting ? 'REPOS' : 'GO')}
                </Text>
                {!isInfiniteMode && (
                  <Text style={styles.timeDisplay}>
                    {formatTime(elapsedTime)} / {formatTime(totalDuration * 60)}
                  </Text>
                )}
                <Text style={styles.currentTimeDisplay}>
                  {countdown > 0 ? countdown : formatTime(currentTime)}
                </Text>
                {isPaused && <Text style={styles.pausedText}>PAUSE</Text>}
              </View>
            </Pressable>

            {!isInfiniteMode && countdown === 0 && (
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
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  currentTimeDisplay: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: SIZES.radius,
    flex: 1,
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
    color: '#FFFFFF',
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
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: SIZES.fontSize.body,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 2,
  },
  modeButtonTextActive: {
    color: COLORS.background,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
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

export default AmrapTimer;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

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
  const intervalRef = useRef(null);

  const validateAndFormatInput = (value, max = 999) => {
    const numberValue = value.replace(/[^0-9]/g, '');
    const parsedValue = parseInt(numberValue);
    if (isNaN(parsedValue) || parsedValue <= 0) return '';
    return Math.min(parsedValue, max).toString();
  };

  const handleTotalDurationChange = (value) => {
    setTotalDuration(validateAndFormatInput(value, 999));
  };

  const handleWorkTimeChange = (value) => {
    setWorkTime(validateAndFormatInput(value, 999));
  };

  const handleRestTimeChange = (value) => {
    setRestTime(validateAndFormatInput(value, 999));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const pauseTimer = () => {
    if (countdown === 0) {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setElapsedTime(0);
    setCountdown(10);
    setIsResting(false);
  };

  const startTimer = () => {
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
  };

  const handleNextPhase = () => {
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
  };

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
    if (isRunning && !isPaused) {
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
            if (prev <= 1) {
              if (isInfiniteMode) {
                resetTimer();
                Alert.alert('Terminé', 'Entraînement terminé !');
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
                resetTimer();
                Alert.alert('Terminé', 'Entraînement terminé !');
                return totalDurationSecs;
              }
              return newTime;
            });
          }
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, countdown, isPaused, isResting, workTime, restTime, isInfiniteMode, totalDuration]);

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
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
              <View style={[styles.circle, styles.setupCircle]}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.phaseText}>DURÉE</Text>
                  <View style={[styles.circleInputContainer, { width: '100%' }]}>
                    <TextInput
                      style={[styles.circleInput, { textAlign: 'center' }]}
                      keyboardType="numeric"
                      onChangeText={handleTotalDurationChange}
                      value={totalDuration}
                      placeholder="20"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>
            </View>

            {!isInfiniteMode && (
              <View style={styles.rowContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>TRAVAIL</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={handleWorkTimeChange}
                      value={workTime}
                      placeholder="30"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      maxLength={3}
                    />
                  </View>
                  <Text style={styles.unit}>SEC</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>REPOS</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={handleRestTimeChange}
                      value={restTime}
                      placeholder="10"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      maxLength={3}
                    />
                  </View>
                  <Text style={styles.unit}>SEC</Text>
                </View>
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
                { 
                  borderColor: getPhaseColor(),
                  backgroundColor: getCircleBackground()
                },
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
});

export default AmrapTimer;
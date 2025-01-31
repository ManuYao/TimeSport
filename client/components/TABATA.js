import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75;

const TABATA = () => {
  const [rounds, setRounds] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [restTime, setRestTime] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  // Validation et formatage des entrées
  const validateAndFormatInput = (value, max = 999) => {
    const numberValue = value.replace(/[^0-9]/g, '');
    const parsedValue = parseInt(numberValue);
    if (isNaN(parsedValue)) return '';
    return Math.min(parsedValue, max).toString();
  };

  const handleRoundsChange = (value) => {
    setRounds(validateAndFormatInput(value, 99));
  };

  const handleWorkTimeChange = (value) => {
    setWorkTime(validateAndFormatInput(value, 999));
  };

  const handleRestTimeChange = (value) => {
    setRestTime(validateAndFormatInput(value, 999));
  };

  const startTimer = () => {
    if (!rounds || !workTime || !restTime) {
      Alert.alert('Attention', 'Veuillez remplir tous les champs');
      return;
    }
    setIsRunning(true);
    setCurrentRound(1);
    setCurrentTime(parseInt(workTime));
    setIsResting(false);
    setCountdown(10);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentRound(1);
    setCurrentTime(parseInt(workTime) || 0);
    setCountdown(10);
    setIsResting(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimerPress = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
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
    let intervalId;

    if (isRunning && !isPaused) {
      if (countdown > 0) {
        intervalId = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        intervalId = setInterval(() => {
          setCurrentTime(prev => {
            if (prev <= 0) {
              if (isResting) {
                if (currentRound >= parseInt(rounds)) {
                  setIsRunning(false);
                  Alert.alert('Terminé', 'Entraînement terminé!');
                  return 0;
                } else {
                  setCurrentRound(r => r + 1);
                  setIsResting(false);
                  return parseInt(workTime);
                }
              } else {
                setIsResting(true);
                return parseInt(restTime);
              }
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => clearInterval(intervalId);
  }, [isRunning, countdown, isPaused, currentRound, rounds, workTime, restTime, isResting]);

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.safeArea}>
        {!isRunning ? (
          <View style={styles.setup}>
            <View style={styles.circleContainer}>
              <View style={[styles.circle, styles.setupCircle]}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.phaseText}>ROUNDS</Text>
                  <View style={[styles.circleInputContainer, { width: '100%' }]}>
                    <TextInput
                      style={[styles.circleInput, { textAlign: 'center' }]}
                      keyboardType="numeric"
                      onChangeText={handleRoundsChange}
                      value={rounds}
                      placeholder="8"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>TRAVAIL</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={handleWorkTimeChange}
                    value={workTime}
                    placeholder="20"
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
                <Text style={styles.seriesText}>{currentRound}/{rounds}</Text>
                <Text style={styles.timeDisplay}>
                  {countdown > 0 ? countdown : formatTime(currentTime)}
                </Text>
                {isPaused && <Text style={styles.pausedText}>PAUSE</Text>}
              </View>
            </Pressable>

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
    marginBottom: 40,
    alignItems: 'center',
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
  inputWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  circleInputContainer: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: SIZES.fontSize.title,
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    gap: 20,
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
  timerDisplay: {
    alignItems: 'center',
  },
  seriesText: {
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '300',
    opacity: 0.9,
    textAlign: 'center',
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: 8,
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
    backgroundColor: 'rgba(255, 193, 7, 0.1)', // Fond jaune transparent
    borderColor: COLORS.warning, // Bordure jaune
    borderWidth: 6,
    opacity: 0.9,
    borderStyle: 'dashed',
  },
  pausedText: {
    position: 'absolute',
    fontSize: SIZES.fontSize.title,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '600',
  },
});

export default TABATA;
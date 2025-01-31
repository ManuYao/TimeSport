import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

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

  const handleSeriesChange = (value) => {
    setSeries(parseInt(value) || 0);
  };

  const handleRestTimeChange = (value) => {
    setRestTime(parseInt(value) || 0);
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
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSeries(1);
    setCurrentTime(0);
    setCountdown(10);
    setIsResting(false);
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
        // Démarrer le repos avec le temps complet
        setCurrentTime(restTime);
      } else {
        // Retour au travail
        setCurrentTime(0);
        setCurrentSeries(prev => prev + 1);
      }
    }
  };

  const getPhaseColor = () => {
    if (countdown > 0) return COLORS.warning;
    return isResting ? COLORS.warning : COLORS.success; // Modifié ici
  };

  const getBackgroundColor = () => {
    if (countdown > 0) return COLORS.darkBlue;
    return isResting ? COLORS.darkGreen : COLORS.darkRed;
  };

  const getCircleBackground = () => {
    if (countdown > 0) return 'rgba(255,255,255,0.1)';
    return isResting ? 'rgba(255,200,0,0.1)' : 'rgba(0,255,0,0.1)'; // Ajout des fonds colorés
  };

  useEffect(() => {
    let intervalId;

    if (isRunning && !isPaused) {
      if (countdown > 0) {
        intervalId = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        if (currentSeries <= series) {
          intervalId = setInterval(() => {
            if (isResting) {
              if (currentTime <= 0) {
                setIsResting(false);
                setCurrentTime(0);
                setCurrentSeries(prev => prev + 1);
              } else {
                setCurrentTime(prev => prev - 1); // Décrémenter pendant le repos
              }
            } else {
              setCurrentTime(prev => prev + 1);
            }
          }, 1000);
        } else {
          setIsRunning(false);
          Alert.alert('Bravo !', 'Entraînement terminé !');
        }
      }
    }

    return () => clearInterval(intervalId);
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
              <View style={[styles.circle, styles.setupCircle]}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.phaseText}>SÉRIES</Text>
                  <View style={[styles.circleInputContainer, { width: '100%' }]}>
                    <TextInput
                      style={[styles.circleInput, { textAlign: 'center' }]}
                      keyboardType="numeric"
                      onChangeText={handleSeriesChange}
                      placeholder="5"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>REPOS</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleRestTimeChange}
                  placeholder="60"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  maxLength={3}
                />
              </View>
              <Text style={styles.unit}>SEC</Text>
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
            <Pressable onPress={handleCirclePress}>
              <View style={[
                styles.circle,
                { 
                  borderColor: getPhaseColor(),
                  backgroundColor: getCircleBackground() // Ajout du fond dynamique
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
    color: '#FFFFFF', // Assurons-nous que c'est bien blanc
    textAlign: 'center',
    height: 80,
    padding: 0,
    minWidth: 120,
  },

  timeDisplay: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF', // Changé de COLORS.text à blanc
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
    color: '#FFFFFF', // Changé de COLORS.accent à blanc
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
  },
  restTimeRemaining: {
    fontSize: SIZES.fontSize.title,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '300',
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
  controlButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    color: COLORS.text,
    opacity: 0.7,
    fontWeight: '600',
  },

  phaseButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 193, 7, 0.2)', // Version plus douce du jaune
    marginTop: 30,
    elevation: 2, // Réduction de l'élévation
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
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Version plus douce du vert
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

export default ForTime;
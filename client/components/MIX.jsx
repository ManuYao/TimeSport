import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AMRAP from './AMRAP';
import EMOM from './EMOM';
import TABATA from './TABATA';
import ForTime from './ForTime';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const MIX = () => {
  const [selectedTimers, setSelectedTimers] = useState([]);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [isConfiguring, setIsConfiguring] = useState(true);

  const timerComponents = {
    AMRAP: AMRAP,
    EMOM: EMOM,
    TABATA: TABATA,
    'FOR TIME': ForTime,
  };

  const addTimer = (timerType) => {
    setSelectedTimers([...selectedTimers, timerType]);
  };

  const removeTimer = (index) => {
    const newTimers = selectedTimers.filter((_, idx) => idx !== index);
    setSelectedTimers(newTimers);
  };

  const startSequence = () => {
    if (selectedTimers.length > 0) {
      setIsConfiguring(false);
    }
  };

  const resetSequence = () => {
    setSelectedTimers([]);
    setCurrentTimerIndex(0);
    setIsConfiguring(true);
  };

  if (isConfiguring) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Crée ton mélange</Text>
        
        <View style={styles.buttonContainer}>
          {Object.keys(timerComponents).map((timer) => (
            <TouchableOpacity
              key={timer}
              style={styles.addButton}
              onPress={() => addTimer(timer)}
            >
              <Text style={styles.buttonText}>➕ {timer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.sequenceContainer}>
          {selectedTimers.map((timer, index) => (
            <View key={index} style={styles.timerItem}>
              <Text style={styles.timerText}>{index + 1}. {timer}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeTimer(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {selectedTimers.length > 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startSequence}
          >
            <Text style={styles.buttonText}>Start Sequence</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const CurrentTimer = timerComponents[selectedTimers[currentTimerIndex]];
  
  return (
    <View style={styles.container}>
      <CurrentTimer
        onComplete={() => {
          if (currentTimerIndex < selectedTimers.length - 1) {
            setCurrentTimerIndex(currentTimerIndex + 1);
          } else {
            resetSequence();
          }
        }}
      />
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetSequence}
      >
        <Text style={styles.buttonText}>Reset Sequence</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    textAlign: 'center',
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SIZES.padding,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    margin: 5,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  startButton: {
    backgroundColor: COLORS.success,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
    ...SHADOWS.light,
  },
  resetButton: {
    backgroundColor: COLORS.error,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
    ...SHADOWS.light,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sequenceContainer: {
    maxHeight: 300,
  },
  timerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  timerText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.text,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    padding: 5,
    borderRadius: SIZES.radius,
  },
  removeButtonText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.small,
  },
});

export default MIX;
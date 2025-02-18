// Source: client/page/Home.jsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const TimerTypes = [
    { id: 1, name: 'AMRAP', icon: 'infinite', description: 'Mode : Maximum' },
    { id: 2, name: 'Basic Timer', icon: 'timer', description: 'Mode : Normal' },
    { id: 3, name: 'EMOM', icon: 'repeat', description: 'Mode : Chaque X - Pendant' },
    { id: 4, name: 'TABATA', icon: 'flash', description: 'Mode : Tour - Travaill - Récup' },
    { id: 5, name: 'MIX', icon: 'shuffle', description: 'Combinaisons personnalisées (Prochainement)', disabled: true },
  ];

const Home = ({ navigation }) => {
  const [activeTimer, setActiveTimer] = useState('Basic Timer');

  useEffect(() => {
    // Set Basic Timer as default active timer
    setActiveTimer('Basic Timer');
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.headerText}>⌛</Text>
      <ScrollView contentContainerStyle={styles.container}>
        {TimerTypes.map((timer) => (
          <TouchableOpacity
            key={timer.id}
            style={[
              styles.card,
              activeTimer === timer.name && styles.activeCard,
              timer.disabled && styles.disabledCard
            ]}
            onPress={() => {
              if (!timer.disabled) {
                setActiveTimer(timer.name);
                navigation.navigate(timer.name);
              }
            }}
            disabled={timer.disabled}
          >
            <Ionicons 
              name={timer.icon} 
              size={32} 
              color={timer.disabled ? COLORS.textSecondary : "#333"} 
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{timer.name}</Text>
              <Text style={styles.description}>{timer.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerText: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: SIZES.padding,
    color: COLORS.text,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: SIZES.padding,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    width: '90%',
    maxWidth: 400,
    ...SHADOWS.light,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activeCard: {
    backgroundColor: COLORS.primary,
  },
  disabledCard: {
    opacity: 0.5,
    backgroundColor: COLORS.surface,
  },
});

export default Home;
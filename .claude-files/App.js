// Source: client/App.js
// Source: client/App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { COLORS } from './constants/theme';
import Home from './page/Home';
import AmrapTimer from './components/AMRAP';
import ForTime from './components/ForTime';
import EMOM from './components/EMOM';
import TABATA from './components/TABATA';
import MIX from './components/MIX';
import { initializeAudio, cleanupSounds } from './utils/sound';

const Stack = createNativeStackNavigator();

export default function App() {
  // Préchargez les sons au démarrage de l'application
  useEffect(() => {
    initializeAudio();
    
    // Nettoyez les sons lors de la fermeture de l'app
    return () => {
      cleanupSounds();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'Timer Selection' }}
        />
        <Stack.Screen 
          name="AMRAP" 
          component={AmrapTimer} 
          options={{ title: 'AMRAP Timer' }}
        />
        <Stack.Screen 
          name="Basic Timer" 
          component={ForTime} 
          options={{ title: 'Timer' }}
        />
        <Stack.Screen 
          name="EMOM" 
          component={EMOM} 
          options={{ title: 'EMOM Timer' }}
        />
        <Stack.Screen 
          name="TABATA" 
          component={TABATA} 
          options={{ title: 'Tabata Timer' }}
        />
        <Stack.Screen 
          name="MIX" 
          component={MIX} 
          options={{ title: 'Mix Timer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
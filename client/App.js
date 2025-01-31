import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './constants/theme';
import Home from './page/Home';
import AmrapTimer from './components/AMRAP';
import ForTime from './components/ForTime';
import EMOM from './components/EMOM';
import TABATA from './components/TABATA';
import MIX from './components/MIX';

const Stack = createNativeStackNavigator();

export default function App() {
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
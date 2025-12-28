import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Platform, SafeAreaView, StatusBar as RNStatusBar, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Ignore the intrusive Expo Go notification warning on Android
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import * as Notifications from 'expo-notifications';
import { Home, Calculator, Settings } from 'lucide-react-native';

// Screens
// Screens
import HomeScreen from './src/screens/HomeScreen';
import ConverterScreen from './src/screens/ConverterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SourcesScreen from './src/screens/SourcesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LegalScreen from './src/screens/LegalScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

// Theme
import { COLORS } from './src/theme/colors';

// Context
import { RateProvider } from './src/context/RateContext';
import { ToastProvider } from './src/context/ToastContext';
import { requestNotificationPermissions, scheduleDailyRateAlerts } from './src/services/notificationService';
import { defineRateCheckTask, registerBackgroundFetch } from './src/services/backgroundTaskService';

// Define the background task globally
defineRateCheckTask();

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#1c1c1e' }
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Sources" component={SourcesScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Dynamic colors per tab
        let activeColor = COLORS.bcvGreen;
        let glowColor = COLORS.glowGreen;
        let IconComponent = Home;

        if (route.name === 'Calculadora') {
          activeColor = COLORS.euroBlue;
          glowColor = COLORS.glowBlue;
          IconComponent = Calculator;
        }
        if (route.name === 'Ajustes') {
          activeColor = COLORS.parallelOrange;
          glowColor = COLORS.glowOrange;
          IconComponent = Settings;
        }

        return {
          // Alineación exacta de colores y etiquetas
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'none',
            margin: 0,
            padding: 0,
          },

          // Cápsula de fondo (Indicador) - Ahora se ajusta al ancho real de la pestaña
          tabBarIndicatorStyle: {
            backgroundColor: glowColor,
            height: 46,
            borderRadius: 16,
            bottom: 7,
            // Quitamos el width fijo y los márgenes manuales que causaban el desfase
          },

          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
          },

          tabBarItemStyle: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 60,
          },

          tabBarPressColor: `${activeColor}20`,
          tabBarShowIcon: true,
          tabBarIcon: ({ color }) => (
            <IconComponent
              size={20}
              color={color}
              strokeWidth={2.5}
            />
          ),
          tabBarIconStyle: {
            marginBottom: 2,
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
          },
        };
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Calculadora" component={ConverterScreen} />
      <Tab.Screen name="Ajustes" component={SettingsStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);

  React.useEffect(() => {
    // Handle notification clicks
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // You can navigate if needed
      console.log("Notification tapped:", response);
    });

    // Check if we should auto-schedule on first run or if enabled
    const checkInitialSetup = async () => {
      const isIntroShown = await AsyncStorage.getItem('@app_intro_shown');
      setIsFirstLaunch(isIntroShown === null);

      const isFirstRun = await AsyncStorage.getItem('@app_first_run_done');
      const savedStatus = await AsyncStorage.getItem('@app_notifications');

      // On first run, try to enable it by default if user permits
      if (isFirstRun === null) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleDailyRateAlerts();
          await registerBackgroundFetch();
          await AsyncStorage.setItem('@app_notifications', 'true');
        }
        await AsyncStorage.setItem('@app_first_run_done', 'true');
      } else if (savedStatus === 'true') {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleDailyRateAlerts();
          await registerBackgroundFetch();
        }
      }
    };

    checkInitialSetup();

    return () => subscription.remove();
  }, []);

  if (isFirstLaunch === null) {
    return null; // Or a loading spinner
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1c1e', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <StatusBar style="light" backgroundColor="#1c1c1e" />
      <ToastProvider>
        <RateProvider>
          <NavigationContainer
            theme={{
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: '#1c1c1e',
                card: '#2c2c2e',
              }
            }}
          >
            <Stack.Navigator
              initialRouteName={isFirstLaunch ? "Welcome" : "MainTabs"}
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1c1c1e' } }}
            >
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="HistoryChart" component={HistoryScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Legal" component={LegalScreen} options={{ animation: 'slide_from_bottom' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </RateProvider>
      </ToastProvider>
    </SafeAreaView>
  );
}

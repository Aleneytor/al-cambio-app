import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Platform, SafeAreaView, StatusBar as RNStatusBar, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Ignore the intrusive Expo Go notification warning on Android
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import * as Notifications from 'expo-notifications';
import { Home, Calculator, Settings } from 'lucide-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ConverterScreen from './src/screens/ConverterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SourcesScreen from './src/screens/SourcesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LegalScreen from './src/screens/LegalScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

// Context
import { RateProvider } from './src/context/RateContext';
import { ToastProvider } from './src/context/ToastContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { requestNotificationPermissions, scheduleDailyRateAlerts } from './src/services/notificationService';
import { defineRateCheckTask, registerBackgroundFetch } from './src/services/backgroundTaskService';

// Define the background task globally
defineRateCheckTask();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SettingsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Sources" component={SourcesScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Dynamic colors per tab
        let activeColor = colors.bcvGreen;
        let glowColor = colors.glowGreen;
        let IconComponent = Home;

        if (route.name === 'Calculadora') {
          activeColor = colors.euroBlue;
          glowColor = colors.glowBlue;
          IconComponent = Calculator;
        }
        if (route.name === 'Ajustes') {
          activeColor = colors.parallelOrange;
          glowColor = colors.glowOrange;
          IconComponent = Settings;
        }

        return {
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
          tabBarStyle: {
            backgroundColor: colors.card + 'F0',
            borderTopWidth: 0,
            elevation: 0,
            height: 95,
            paddingBottom: 35,
            paddingTop: 8,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarIcon: ({ color, focused }) => (
            <IconComponent
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Calculadora" component={ConverterScreen} />
      <Tab.Screen name="Ajustes" component={SettingsStack} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { colors, isDark, isLoading: themeLoading } = useTheme();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);

  React.useEffect(() => {
    // Handle notification clicks
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
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

  if (isFirstLaunch === null || themeLoading) {
    return null; // Loading state
  }

  const navigationTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.card,
    }
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.card,
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? "Welcome" : "MainTabs"}
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="HistoryChart" component={HistoryScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Legal" component={LegalScreen} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RateProvider>
          <AppContent />
        </RateProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

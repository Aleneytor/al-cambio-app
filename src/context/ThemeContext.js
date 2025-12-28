import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../theme/colors';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@app_theme_preference';

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState('system'); // 'light', 'dark', or 'system'
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
            if (saved) {
                setThemePreference(saved);
            }
            setIsLoading(false);
        });
    }, []);

    // Determine the actual theme based on preference
    const isDark = useMemo(() => {
        if (themePreference === 'system') {
            return systemColorScheme === 'dark';
        }
        return themePreference === 'dark';
    }, [themePreference, systemColorScheme]);

    // Get the appropriate color palette
    const colors = useMemo(() => {
        return isDark ? DARK_COLORS : LIGHT_COLORS;
    }, [isDark]);

    // Function to change theme
    const setTheme = async (newTheme) => {
        setThemePreference(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const value = useMemo(() => ({
        themePreference,
        setTheme,
        isDark,
        colors,
        isLoading,
    }), [themePreference, isDark, colors, isLoading]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;

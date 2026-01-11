import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Share, Platform, Switch, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
    Info,
    Share2,
    Database,
    ChevronRight,
    Mail,
    Bell,
    Star,
    Heart,
    FileText,
    Sun,
    Moon,
    Smartphone,
    Palette,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../context/RateContext';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermissions, scheduleDailyRateAlerts, cancelAllNotifications } from '../services/notificationService';
import { registerBackgroundFetch, unregisterBackgroundFetch } from '../services/backgroundTaskService';
import { useToast } from '../context/ToastContext';
import AdBanner from '../components/AdBanner';
import NativeAdComponent from '../components/NativeAd';

const SettingsScreen = ({ navigation }) => {
    const { rates } = useRates();
    const { showToast } = useToast();
    const { colors, themePreference, setTheme, isDark } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

    React.useEffect(() => {
        AsyncStorage.getItem('@app_notifications').then(val => {
            if (val !== null) setNotificationsEnabled(JSON.parse(val));
        });
    }, []);

    const toggleNotifications = async (val) => {
        Haptics.selectionAsync();

        if (val) {
            const granted = await requestNotificationPermissions();
            if (granted) {
                setNotificationsEnabled(true);
                await AsyncStorage.setItem('@app_notifications', JSON.stringify(true));
                await scheduleDailyRateAlerts();
                await registerBackgroundFetch();
                showToast('Alertas activadas (1 PM y 5 PM)', 'success');
            } else {
                showToast('Permisos de notificación denegados', 'error');
                setNotificationsEnabled(false);
            }
        } else {
            setNotificationsEnabled(false);
            await AsyncStorage.setItem('@app_notifications', JSON.stringify(false));
            await cancelAllNotifications();
            await unregisterBackgroundFetch();
            showToast('Alertas desactivadas', 'info');
        }
    };

    const handleThemeChange = async (newTheme) => {
        Haptics.selectionAsync();
        await setTheme(newTheme);
        const labels = { light: 'Modo Claro', dark: 'Modo Oscuro', system: 'Automático' };
        showToast(`${labels[newTheme]} activado`, 'success');
    };

    const themeOptions = [
        { id: 'light', icon: Sun, label: 'Claro', color: '#FF9500' },
        { id: 'dark', icon: Moon, label: 'Oscuro', color: '#5856D6' },
        { id: 'system', icon: Smartphone, label: 'Auto', color: colors.bcvGreen },
    ];

    const ThemeSelector = () => (
        <View style={[styles.themeSelectorContainer, { backgroundColor: colors.card }]}>
            <View style={styles.themeSelectorHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                    <Palette size={20} color={colors.euroBlue} />
                </View>
                <View style={styles.themeSelectorTitleContainer}>
                    <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Apariencia</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>Personaliza el tema de la app</Text>
                </View>
            </View>
            <View style={styles.themeOptionsRow}>
                {themeOptions.map((option) => {
                    const isSelected = themePreference === option.id;
                    const IconComp = option.icon;
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.themeOption,
                                {
                                    backgroundColor: isSelected
                                        ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                                    borderColor: isSelected
                                        ? option.color
                                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                }
                            ]}
                            onPress={() => handleThemeChange(option.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.themeIconWrapper,
                                { backgroundColor: isSelected ? `${option.color}20` : 'transparent' }
                            ]}>
                                <IconComp
                                    size={20}
                                    color={isSelected ? option.color : colors.textSecondary}
                                />
                            </View>
                            <Text style={[
                                styles.themeOptionLabel,
                                {
                                    color: isSelected ? option.color : colors.textSecondary,
                                    fontWeight: isSelected ? '600' : '500'
                                }
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const settingsSections = [
        {
            title: 'Apariencia',
            customContent: <ThemeSelector />,
        },
        {
            title: 'General',
            items: [
                {
                    id: 'notify_daily',
                    icon: <Bell size={20} color={colors.parallelOrange} />,
                    label: 'Notificaciones',
                    subtitle: 'Recibe alertas de tasas',
                    type: 'switch',
                    value: notificationsEnabled,
                    onValueChange: toggleNotifications
                },
                {
                    id: 'sources',
                    icon: <Database size={20} color={colors.bcvGreen} />,
                    label: 'Fuentes de datos',
                    subtitle: 'BCV, Binance, Bybit',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('Sources');
                    }
                },
            ]
        },
        {
            title: 'Comparte',
            items: [
                {
                    id: 'share',
                    icon: <Share2 size={20} color={colors.euroBlue} />,
                    label: 'Compartir App',
                    subtitle: 'Invita a tus amigos',
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        try {
                            await Share.share({
                                message: `💱 *Kuanto*\n\nConsulta las tasas del BCV y Paralelo al instante.\n\n📲 Descárgala gratis!`,
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    }
                },
                {
                    id: 'rate',
                    icon: <Star size={20} color="#FFD700" />,
                    label: 'Califica la App',
                    subtitle: '¡Tu opinión importa!',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // TODO: Link to store
                    }
                },
            ]
        },
        {
            title: 'Soporte',
            items: [
                {
                    id: 'contact',
                    icon: <Mail size={20} color={colors.textSecondary} />,
                    label: 'Contactar',
                    subtitle: 'soporte@kavas.online',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Linking.openURL('mailto:soporte@kavas.online');
                    }
                },
                {
                    id: 'legal',
                    icon: <FileText size={20} color={colors.textSecondary} />,
                    label: 'Aviso Legal',
                    subtitle: 'Términos y condiciones',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('Legal');
                    }
                },
            ]
        }
    ];

    const SettingItem = ({ icon, label, subtitle, value, onPress, disabled, type, onValueChange }) => (
        <TouchableOpacity
            style={[styles.item, disabled && { opacity: 0.5 }]}
            onPress={type === 'switch' ? () => onValueChange(!value) : onPress}
            disabled={disabled || (!onPress && type !== 'switch')}
            activeOpacity={type === 'switch' ? 1 : 0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                    {icon}
                </View>
                <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{label}</Text>
                    {subtitle && <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.itemRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: isDark ? '#767577' : '#D1D1D6', true: 'rgba(52, 199, 89, 0.3)' }}
                        thumbColor={value ? colors.bcvGreen : (isDark ? '#f4f3f4' : '#FFFFFF')}
                        ios_backgroundColor={isDark ? '#3e3e3e' : '#E9E9EB'}
                    />
                ) : value ? (
                    <Text style={[styles.itemValue, { color: colors.textSecondary }]}>{value}</Text>
                ) : (
                    onPress && <ChevronRight size={18} color={colors.textSecondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ajustes</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Configuración y transparencia</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {settingsSections.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                        {section.customContent ? (
                            section.customContent
                        ) : (
                            <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                                {section.items.map((item, itemIdx) => (
                                    <View key={item.id}>
                                        <SettingItem {...item} />
                                        {itemIdx < section.items.length - 1 && (
                                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                <NativeAdComponent style={{ marginHorizontal: 0, marginBottom: 20 }} />

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>Kuanto v1.0.0</Text>
                    <Text style={[styles.creatorText, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                        © 2025 - Tu aliado financiero
                    </Text>
                </View>
            </ScrollView>
            <AdBanner style={styles.adBanner} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginTop: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerLogo: {
        width: 60,
        height: 60,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        marginTop: 6,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 160,
    },
    adBanner: {
        position: 'absolute',
        bottom: 95,
        left: 0,
        right: 0,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemTextContainer: {
        flex: 1,
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginLeft: 64,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    creatorText: {
        fontSize: 10,
        marginTop: 4,
    },
    // Theme Selector Styles
    themeSelectorContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 16,
    },
    themeSelectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    themeSelectorTitleContainer: {
        flex: 1,
    },
    themeOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1.5,
    },
    themeIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    themeOptionLabel: {
        fontSize: 13,
    },
});

export default SettingsScreen;

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Share, Platform, Switch } from 'react-native';
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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../context/RateContext';
import { COLORS } from '../theme/colors';
import { requestNotificationPermissions, scheduleDailyRateAlerts, cancelAllNotifications } from '../services/notificationService';
import { registerBackgroundFetch, unregisterBackgroundFetch } from '../services/backgroundTaskService';
import { useToast } from '../context/ToastContext';

const SettingsScreen = ({ navigation }) => {
    const { rates } = useRates();
    const { showToast } = useToast();
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

    const settingsSections = [
        {
            title: 'General',
            items: [
                {
                    id: 'notify_daily',
                    icon: <Bell size={20} color={COLORS.parallelOrange} />,
                    label: 'Notificaciones',
                    subtitle: 'Recibe alertas de tasas',
                    type: 'switch',
                    value: notificationsEnabled,
                    onValueChange: toggleNotifications
                },
                {
                    id: 'sources',
                    icon: <Database size={20} color={COLORS.bcvGreen} />,
                    label: 'Fuentes de datos',
                    subtitle: 'BCV, Binance, Bybit',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('Sources');
                    }
                },
                {
                    id: 'welcome',
                    icon: <Info size={20} color={COLORS.textSecondary} />,
                    label: 'Ver Bienvenida',
                    subtitle: 'Pantalla de presentación',
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        await AsyncStorage.removeItem('@app_intro_shown');
                        showToast('Abriendo bienvenida...', 'info');
                        // No es necesario reiniciar, podemos navegar directamente
                        navigation.navigate('Welcome');
                    }
                },
            ]
        },
        {
            title: 'Comparte',
            items: [
                {
                    id: 'share',
                    icon: <Share2 size={20} color={COLORS.euroBlue} />,
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
                    icon: <Mail size={20} color={COLORS.textSecondary} />,
                    label: 'Contactar',
                    subtitle: 'soporte@alcambio.app',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Linking.openURL('mailto:soporte@alcambio.app');
                    }
                },
                {
                    id: 'legal',
                    icon: <FileText size={20} color={COLORS.textSecondary} />,
                    label: 'Aviso Legal',
                    subtitle: 'Términos y condiciones',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('Legal');
                    }
                },
                {
                    id: 'test_notify',
                    icon: <Bell size={20} color={COLORS.bcvGreen} />,
                    label: 'Enviar Prueba',
                    subtitle: 'Ver cómo llegan las alertas',
                    onPress: async () => {
                        const { status } = await Notifications.getPermissionsAsync();
                        if (status !== 'granted') {
                            showToast('Primero activa las notificaciones', 'error');
                            return;
                        }
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: '🔔 Prueba de Alerta',
                                body: '¡Así es como recibirás tus reportes de tasas!',
                                data: { screen: 'Inicio' },
                            },
                            trigger: null,
                        });
                        showToast('Prueba enviada', 'success');
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
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemLabel}>{label}</Text>
                    {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.itemRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: '#767577', true: 'rgba(52, 199, 89, 0.3)' }}
                        thumbColor={value ? COLORS.bcvGreen : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                    />
                ) : value ? (
                    <Text style={styles.itemValue}>{value}</Text>
                ) : (
                    onPress && <ChevronRight size={18} color={COLORS.textSecondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ajustes</Text>
                <Text style={styles.headerSubtitle}>Configuración y transparencia</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {settingsSections.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.customContent ? (
                            section.customContent
                        ) : (
                            <View style={styles.sectionCard}>
                                {section.items.map((item, itemIdx) => (
                                    <View key={item.id}>
                                        <SettingItem {...item} />
                                        {itemIdx < section.items.length - 1 && <View style={styles.divider} />}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Kuanto v1.0.0</Text>
                    <Text style={styles.creatorText}>© 2025 - Tu aliado financiero</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginTop: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginTop: 6,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: COLORS.card,
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    itemTextContainer: {
        flex: 1,
    },
    itemSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 64,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    versionText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    creatorText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        marginTop: 4,
    },
});

export default SettingsScreen;

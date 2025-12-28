import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share as NativeShare, Animated } from 'react-native';
import { Calendar, Clock, TrendingUp as Up, TrendingDown as Down, Share2 as ShareIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatting';

const RateCard = ({ title, rate, color, icon, nextRate, nextDate, nextRawDate, lastUpdated, change, onPress, index = 0 }) => {
    const { colors, isDark } = useTheme();
    const isPositive = change > 0;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        // Staggered animation based on card index
        const delay = index * 100;

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const today = new Date();
            const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

            const message =
                `💱 *Kuanto*

📊 *${title}*
💰 *${formatCurrency(rate)} Bs*

📅 ${formattedToday}

_Enviado desde Kuanto App_ 📲`;

            await NativeShare.share({
                message: message,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const getNextRateLabel = () => {
        if (!nextRawDate) return "Próxima tasa";

        // Get "today" in VET (UTC-4)
        const now = new Date();
        const vetTime = now.getTime() - (4 * 60 * 60 * 1000);
        const today = new Date(vetTime);

        // Create "tomorrow" date
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowISO = tomorrow.toISOString().split('T')[0];

        return nextRawDate === tomorrowISO ? "Para mañana" : "Próxima tasa";
    };

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            elevation: 5,
            shadowColor: isDark ? "#000" : "#888",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.2 : 0.15,
            shadowRadius: 5,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        iconContainer: {
            padding: 8,
            borderRadius: 10,
            marginRight: 12,
        },
        cardTitle: {
            fontSize: 16,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        rateRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        rateText: {
            fontSize: 40,
            fontWeight: '800',
        },
        changeBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            marginBottom: 8,
        },
        changeText: {
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 4,
        },
        footerInfo: {
            marginTop: 4,
        },
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignSelf: 'flex-start',
            marginBottom: 8,
        },
        badgeText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: '500',
        },
        shareButton: {
            padding: 8,
        },
    });

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                ],
            }}
        >
            <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                            {icon}
                        </View>
                        <Text style={styles.cardTitle}>{title}</Text>
                    </View>
                    <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                        <ShareIcon size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rateRow}>
                    <Text style={[styles.rateText, { color: color }]}>{formatCurrency(rate)} Bs</Text>
                    {change !== undefined && change !== 0 && (
                        <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)' }]}>
                            {isPositive ? <Up size={12} color="#34C759" /> : <Down size={12} color="#FF3B30" />}
                            <Text style={[styles.changeText, { color: isPositive ? '#34C759' : '#FF3B30' }]}>
                                {Math.abs(change).toFixed(2)}%
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.footerInfo}>
                    {nextRate && (
                        <View style={styles.badge}>
                            <Calendar size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={styles.badgeText}>
                                {getNextRateLabel()} ({nextDate}): <Text style={{ color: colors.textPrimary }}>{formatCurrency(nextRate)} Bs</Text>
                            </Text>
                        </View>
                    )}

                    {lastUpdated && (
                        <View style={styles.badge}>
                            <Clock size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={styles.badgeText}>
                                Actualizado: <Text style={{ color: colors.textPrimary }}>{lastUpdated}</Text>
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default RateCard;

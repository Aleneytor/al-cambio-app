import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, RefreshControl, FlatList, Animated, Platform, Image } from 'react-native';
import { Banknote, RefreshCcw, TrendingUp, DollarSign, History, ChevronRight, Info, WifiOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import RateCard from '../components/RateCard';
import SkeletonCard from '../components/SkeletonCard';
import { useRates } from '../context/RateContext';
import { formatCurrency } from '../utils/formatting';
import AdBanner from '../components/AdBanner';
import NativeAdComponent from '../components/NativeAd';

const HomeScreen = ({ navigation }) => {
    const { rates, loading, refreshRates, order, isOffline, getTimeSinceUpdate } = useRates();
    const { colors, isDark } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;

    const formatDate = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}`;
    };

    const handleCardPress = (currencyId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Calculadora', { initialCurrency: currencyId });
    };

    const cardData = useMemo(() => {
        const dataMap = {
            usd: {
                id: 'usd',
                title: 'Tasa BCV (USD)',
                rate: rates.bcv,
                color: colors.bcvGreen,
                icon: <DollarSign color={colors.bcvGreen} size={24} />,
                nextRate: rates.nextRates?.usd,
                nextDate: rates.nextRates?.date,
                nextRawDate: rates.nextRates?.rawDate,
                change: rates.usdChange
            },
            eur: {
                id: 'eur',
                title: 'Tasa BCV (EUR)',
                rate: rates.euro,
                color: colors.euroBlue,
                icon: <Banknote color={colors.euroBlue} size={24} />,
                nextRate: rates.nextRates?.eur,
                nextDate: rates.nextRates?.date,
                nextRawDate: rates.nextRates?.rawDate,
                change: rates.eurChange
            },
            parallel: {
                id: 'parallel',
                title: 'Promedio USDT',
                rate: rates.parallel,
                color: colors.parallelOrange,
                icon: <TrendingUp color={colors.parallelOrange} size={24} />,
                lastUpdated: rates.parallelUpdate
            }
        };

        return order.map(id => dataMap[id]);
    }, [rates, order, colors]);

    // Check if we have real data loaded
    const hasData = rates.bcv > 0;

    const renderItem = ({ item, index }) => <RateCard {...item} index={index} onPress={() => handleCardPress(item.id)} />;
    const renderSkeleton = ({ index }) => <SkeletonCard index={index} />;

    // Subtle animation for header scaling as you scroll
    const headerScale = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [1.1, 1, 0.95],
        extrapolate: 'clamp',
    });

    const OfflineBanner = () => {
        if (!isOffline) return null;

        const timeSince = getTimeSinceUpdate();

        return (
            <View style={[styles.offlineBanner, {
                backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.12)',
                borderColor: isDark ? 'rgba(255, 149, 0, 0.3)' : 'rgba(255, 149, 0, 0.25)'
            }]}>
                <WifiOff size={16} color={colors.parallelOrange} />
                <View style={styles.offlineTextContainer}>
                    <Text style={[styles.offlineTitle, { color: colors.parallelOrange }]}>
                        Sin conexión
                    </Text>
                    {timeSince && (
                        <Text style={[styles.offlineSubtitle, { color: colors.textSecondary }]}>
                            Última actualización {timeSince}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => refreshRates(true)}
                    style={[styles.retryButton, { backgroundColor: `${colors.parallelOrange}20` }]}
                >
                    <RefreshCcw size={14} color={colors.parallelOrange} />
                </TouchableOpacity>
            </View>
        );
    };

    const Header = (
        <Animated.View
            style={[
                styles.header,
                { transform: [{ scale: headerScale }] }
            ]}
        >
            <View style={styles.headerLeft}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
                <View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Tasas del Día</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.infoButton, {
                    backgroundColor: colors.glass,
                    borderColor: colors.glassBorder
                }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('Legal');
                }}
                activeOpacity={0.7}
            >
                <Info size={24} color={colors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );

    const Footer = (
        <>
            {/* Native Ad between content and history */}
            <NativeAdComponent style={{ marginHorizontal: 0 }} />

            {/* History Section */}
            {rates.history && rates.history.length > 0 && (
                <View style={styles.historySection}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => navigation.navigate('HistoryChart')}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <History size={18} color={colors.textSecondary} />
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Historial Última Semana</Text>
                        </View>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.historyHeader, { borderBottomColor: colors.divider }]}>
                            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Fecha</Text>
                            <Text style={[styles.historyLabel, { color: colors.textSecondary, textAlign: 'right' }]}>USD BCV</Text>
                            <Text style={[styles.historyLabel, { color: colors.textSecondary, textAlign: 'right' }]}>EUR BCV</Text>
                        </View>
                        {rates.history.map((item, index) => (
                            <View
                                key={item.date}
                                style={[
                                    styles.historyRow,
                                    { borderBottomColor: colors.divider },
                                    index === rates.history.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <Text style={[styles.historyDate, { color: colors.textPrimary }]}>{formatDate(item.date)}</Text>
                                <Text style={[styles.historyValue, { color: colors.textPrimary }]}>{formatCurrency(item.usd)}</Text>
                                <Text style={[styles.historyValue, { color: colors.textPrimary }]}>{formatCurrency(item.eur)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
            <View style={styles.footerInfo}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Datos oficiales del Banco Central de Venezuela</Text>
            </View>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <OfflineBanner />
            <Animated.FlatList
                data={hasData ? cardData : [{ id: 'sk1' }, { id: 'sk2' }, { id: 'sk3' }]}
                keyExtractor={(item) => item.id}
                renderItem={hasData ? renderItem : renderSkeleton}
                ListHeaderComponent={Header}
                ListFooterComponent={hasData ? Footer : null}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => refreshRates(true)}
                        tintColor={colors.bcvGreen}
                        colors={[colors.bcvGreen]}
                    />
                }
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 12,
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
    infoButton: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
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
    historySection: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    historyCard: {
        borderRadius: 20,
        padding: 16,
    },
    historyHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    historyLabel: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
    },
    historyRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    historyDate: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    historyValue: {
        flex: 1,
        fontSize: 14,
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
    },
    footerInfo: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
    },
    hintText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'left',
        opacity: 0.8
    },
    // Offline Banner Styles
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    offlineTextContainer: {
        flex: 1,
    },
    offlineTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    offlineSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    retryButton: {
        padding: 10,
        borderRadius: 10,
    },
});

export default HomeScreen;

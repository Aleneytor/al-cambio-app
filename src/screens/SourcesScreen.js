import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Platform, Image, Animated } from 'react-native';
import {
    Database,
    ExternalLink,
    ShieldCheck,
    TrendingUp,
    ArrowLeft,
    Activity
} from 'lucide-react-native';
import { useRates } from '../context/RateContext';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../utils/formatting';

const LiveIndicator = () => {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.liveContainer}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>EN VIVO</Text>
        </View>
    );
};

const SourcesScreen = ({ navigation }) => {
    const { rates } = useRates();

    const renderSource = (title, logo, label1, val1, label2, val2, link, isLive, lastUpdate, tintColor = null) => (
        <View style={styles.p2pSource}>
            <View style={styles.sourceHeader}>
                <View style={styles.logoContainer}>
                    <Image
                        source={typeof logo === 'string' ? { uri: logo } : logo}
                        style={[styles.logoImage, tintColor && { tintColor }]}
                        resizeMode="contain"
                    />
                </View>
                <View>
                    <Text style={styles.sourceLabel}>{title}</Text>
                    {isLive ? <LiveIndicator /> : <Text style={styles.updateTime}>{lastUpdate || 'Actualizado hace poco'}</Text>}
                </View>
                {link && (
                    <TouchableOpacity onPress={() => Linking.openURL(link)} style={{ marginLeft: 'auto' }}>
                        <ExternalLink size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={[styles.p2pValues, isLive && styles.liveBackground]}>
                <View style={styles.p2pValueItem}>
                    <Text style={styles.p2pLabel}>{label1}:</Text>
                    <Text style={styles.p2pValue}>{val1 || '--'}</Text>
                </View>
                <View style={styles.p2pDivider} />
                <View style={styles.p2pValueItem}>
                    <Text style={styles.p2pLabel}>{label2}:</Text>
                    <Text style={styles.p2pValue}>{val2 || '--'}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Fuentes de Datos</Text>
                    <Text style={styles.headerSubtitle}>Transparencia y precisión</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sourcesCard}>
                    {renderSource(
                        'BCV (Oficial)',
                        require('../../assets/bcv-logo.png'),
                        'USD OFICIAL',
                        rates.bcv ? `Bs. ${formatCurrency(rates.bcv)}` : null,
                        'EUR OFICIAL',
                        rates.euro ? `Bs. ${formatCurrency(rates.euro)}` : null,
                        'https://www.bcv.org.ve/',
                        false,
                        rates.lastUpdate, // Pass general last update 
                        '#fff'
                    )}

                    <View style={styles.divider} />

                    {renderSource(
                        'Binance P2P',
                        'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=035',
                        'COMPRA',
                        rates.p2p?.binance?.sell ? `Bs. ${formatCurrency(rates.p2p.binance.sell)}` : null,
                        'VENTA',
                        rates.p2p?.binance?.buy ? `Bs. ${formatCurrency(rates.p2p.binance.buy)}` : null,
                        null,
                        true,
                        null // Live sources handle their own indicator
                    )}

                    <View style={styles.divider} />

                    {renderSource(
                        'Bybit P2P',
                        require('../../assets/bybit-logo.png'),
                        'COMPRA',
                        rates.p2p?.bybit?.sell ? `Bs. ${formatCurrency(rates.p2p.bybit.sell)}` : null,
                        'VENTA',
                        rates.p2p?.bybit?.buy ? `Bs. ${formatCurrency(rates.p2p.bybit.buy)}` : null,
                        null,
                        true,
                        null
                    )}

                    <View style={styles.divider} />

                    {renderSource(
                        'Yadio',
                        require('../../assets/yadio-logo.png'),
                        'COMPRA',
                        rates.p2p?.yadio?.sell ? `Bs. ${formatCurrency(rates.p2p.yadio.sell)}` : null,
                        'VENTA',
                        rates.p2p?.yadio?.buy ? `Bs. ${formatCurrency(rates.p2p.yadio.buy)}` : null,
                        'https://yadio.io/',
                        true,
                        null
                    )}
                </View>

                <View style={[styles.noteContainer, { marginTop: 32 }]}>
                    <Activity size={20} color={COLORS.bcvGreen} style={{ alignSelf: 'center', marginBottom: 12 }} />
                    <Text style={styles.noteText}>
                        Nuestra plataforma agrega datos de fuentes oficiales y los mercados P2P más líquidos para ofrecerte el promedio más estable y confiable de Venezuela.
                    </Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: Platform.OS === 'ios' ? 0 : 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sourcesCard: {
        backgroundColor: COLORS.card,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    p2pSource: {
        paddingVertical: 12,
    },
    sourceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 14,
    },
    logoContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    sourceLabel: {
        fontSize: 17,
        color: COLORS.textPrimary,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    updateTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    liveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.bcvGreen,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.bcvGreen,
        letterSpacing: 0.5,
    },
    p2pValues: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    liveBackground: {
        backgroundColor: 'rgba(52, 199, 89, 0.03)',
        borderColor: 'rgba(52, 199, 89, 0.1)',
    },
    p2pValueItem: {
        flex: 1,
        alignItems: 'center',
    },
    p2pLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
        fontWeight: '600',
    },
    p2pValue: {
        fontSize: 17,
        color: COLORS.textPrimary,
        fontWeight: '800',
    },
    p2pDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
    },
    noteContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    noteText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default SourcesScreen;

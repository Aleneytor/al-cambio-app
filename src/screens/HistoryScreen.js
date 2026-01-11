import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Banknote } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../context/RateContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatting';
import AdBanner from '../components/AdBanner';
import NativeAdComponent from '../components/NativeAd';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
    const { rates, loading } = useRates();
    const { colors, isDark } = useTheme();
    const [selectedCurrency, setSelectedCurrency] = useState('usd');
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Prepare chart data based on selected currency
    const chartConfig = useMemo(() => {
        const history = rates.history || [];

        if (selectedCurrency === 'usd') {
            const data = history.map(item => ({
                value: item.usd,
                label: new Date(item.date).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
                fullDate: item.date,
                originalValue: item.usd
            })).reverse();

            const values = data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const padding = (max - min) * 0.3 || 2;

            return {
                data,
                color: colors.bcvGreen,
                yAxisOffset: Math.floor(min - padding),
                change: rates.usdChange,
                currentRate: rates.bcv,
                title: 'Dólar BCV',
                symbol: '$'
            };
        } else {
            const data = history.map(item => ({
                value: item.eur,
                label: new Date(item.date).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
                fullDate: item.date,
                originalValue: item.eur
            })).reverse();

            const values = data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const padding = (max - min) * 0.3 || 2;

            return {
                data,
                color: colors.euroBlue,
                yAxisOffset: Math.floor(min - padding),
                change: rates.eurChange,
                currentRate: rates.euro,
                title: 'Euro BCV',
                symbol: '€'
            };
        }
    }, [rates, selectedCurrency, colors]);

    if (loading && chartConfig.data.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.bcvGreen} />
            </View>
        );
    }

    const isPositive = chartConfig.change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Análisis Semanal</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Evolución de la Tasa BCV</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Currency Tabs */}
                <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCurrency === 'usd' && { backgroundColor: `${colors.bcvGreen}20` }
                        ]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedCurrency('usd');
                            setSelectedPoint(null);
                        }}
                    >
                        <DollarSign
                            size={20}
                            color={selectedCurrency === 'usd' ? colors.bcvGreen : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: selectedCurrency === 'usd' ? colors.bcvGreen : colors.textSecondary }
                        ]}>
                            Dólar USD
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCurrency === 'eur' && { backgroundColor: `${colors.euroBlue}20` }
                        ]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedCurrency('eur');
                            setSelectedPoint(null);
                        }}
                    >
                        <Banknote
                            size={20}
                            color={selectedCurrency === 'eur' ? colors.euroBlue : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: selectedCurrency === 'eur' ? colors.euroBlue : colors.textSecondary }
                        ]}>
                            Euro EUR
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Current Rate Card */}
                <View style={[styles.rateCard, { backgroundColor: colors.card }]}>
                    <View style={styles.rateCardHeader}>
                        <Text style={[styles.rateCardTitle, { color: colors.textSecondary }]}>
                            {chartConfig.title}
                        </Text>
                        <View style={[styles.changeBadge, { backgroundColor: isPositive ? `${colors.bcvGreen}15` : 'rgba(255,59,48,0.15)' }]}>
                            <TrendIcon size={14} color={isPositive ? colors.bcvGreen : '#FF3B30'} />
                            <Text style={[styles.changeText, { color: isPositive ? colors.bcvGreen : '#FF3B30' }]}>
                                {isPositive ? '+' : ''}{Number(chartConfig.change).toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.rateValue, { color: chartConfig.color }]}>
                        Bs. {formatCurrency(chartConfig.currentRate)}
                    </Text>
                    <Text style={[styles.rateSubtext, { color: colors.textSecondary }]}>
                        Tasa oficial del Banco Central de Venezuela
                    </Text>
                </View>

                {/* Selected Point Info */}
                {selectedPoint && (
                    <View style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: chartConfig.color }]}>
                        <View style={styles.selectedHeader}>
                            <Calendar size={14} color={colors.textSecondary} />
                            <Text style={[styles.selectedDate, { color: colors.textSecondary }]}>
                                {new Date(selectedPoint.fullDate).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </Text>
                        </View>
                        <Text style={[styles.selectedValue, { color: chartConfig.color }]}>
                            Bs. {formatCurrency(selectedPoint.originalValue)}
                        </Text>
                    </View>
                )}

                {/* Chart */}
                <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
                    <LineChart
                        data={chartConfig.data}
                        width={SCREEN_WIDTH - 80}
                        height={220}
                        spacing={(SCREEN_WIDTH - 100) / Math.max(chartConfig.data.length - 1, 1)}
                        initialSpacing={15}
                        endSpacing={15}
                        color={chartConfig.color}
                        thickness={3}
                        dataPointsColor={chartConfig.color}
                        dataPointsRadius={6}
                        noOfSections={4}
                        yAxisOffset={chartConfig.yAxisOffset}
                        yAxisColor="transparent"
                        xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}
                        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 9 }}
                        rulesType="solid"
                        rulesColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                        showVerticalLines={false}
                        curved
                        curvature={0.15}
                        areaChart
                        startFillColor={chartConfig.color}
                        endFillColor={colors.background}
                        startOpacity={0.3}
                        endOpacity={0.05}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: chartConfig.color,
                            pointerStripWidth: 2,
                            strokeDashArray: [4, 4],
                            pointerColor: chartConfig.color,
                            radius: 8,
                            pointerLabelWidth: 120,
                            pointerLabelHeight: 40,
                            activatePointersOnLongPress: false,
                            autoAdjustPointerLabelPosition: true,
                            pointerLabelComponent: items => {
                                if (items[0]) {
                                    Haptics.selectionAsync();
                                    setSelectedPoint(items[0]);
                                }
                                return null;
                            },
                        }}
                    />
                </View>

                {/* Footer hint */}
                <Text style={[styles.footerHint, { color: colors.textSecondary }]}>
                    Desliza sobre la gráfica para ver detalles
                </Text>

                <NativeAdComponent style={{ marginHorizontal: 0, marginBottom: 20 }} />
            </ScrollView>
            <AdBanner style={styles.adBanner} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: Platform.OS === 'ios' ? 40 : 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 6,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    rateCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    rateCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rateCardTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    changeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    rateValue: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    rateSubtext: {
        fontSize: 12,
        marginTop: 4,
    },
    selectedCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
    },
    selectedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    selectedDate: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    selectedValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 24,
        marginBottom: 16,
    },
    footerHint: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 20,
    },
    adBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default HistoryScreen;

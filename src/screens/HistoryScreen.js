import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ArrowLeft, TrendingUp, Calendar, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../context/RateContext';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../utils/formatting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
    const { rates, loading } = useRates();
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Prepare chart data
    const chartData = (rates.history || []).map(item => ({
        value: item.usd,
        label: new Date(item.date).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
        dataPointText: formatCurrency(item.usd),
        fullDate: item.date,
        eurValue: item.eur
    })).reverse(); // Reverse to show chronological order

    const eurData = (rates.history || []).map(item => ({
        value: item.eur,
        hideDataPoint: true,
    })).reverse();

    if (loading && chartData.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.bcvGreen} />
            </View>
        );
    }

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
                    <Text style={styles.headerTitle}>Análisis Semanal</Text>
                    <Text style={styles.headerSubtitle}>Evolución de la Tasa BCV</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Variación USD</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TrendingUp size={16} color={rates.usdChange >= 0 ? COLORS.bcvGreen : '#FF3B30'} />
                            <Text style={[styles.statValue, { color: rates.usdChange >= 0 ? COLORS.bcvGreen : '#FF3B30' }]}>
                                {rates.usdChange >= 0 ? '+' : ''}{rates.usdChange}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Variación EUR</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TrendingUp size={16} color={rates.eurChange >= 0 ? COLORS.bcvGreen : '#FF3B30'} />
                            <Text style={[styles.statValue, { color: rates.eurChange >= 0 ? COLORS.bcvGreen : '#FF3B30' }]}>
                                {rates.eurChange >= 0 ? '+' : ''}{rates.eurChange}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Selected Point Info */}
                <View style={styles.selectionInfo}>
                    {selectedPoint ? (
                        <View style={styles.selectionCard}>
                            <View style={styles.selectionHeader}>
                                <Calendar size={14} color={COLORS.textSecondary} />
                                <Text style={styles.selectionDate}>
                                    {new Date(selectedPoint.fullDate).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                            <View style={styles.selectionRow}>
                                <View>
                                    <Text style={styles.selectionLabel}>USD BCV</Text>
                                    <Text style={[styles.selectionValue, { color: COLORS.bcvGreen }]}>Bs. {formatCurrency(selectedPoint.value)}</Text>
                                </View>
                                <View style={styles.selectionDivider} />
                                <View>
                                    <Text style={styles.selectionLabel}>EUR BCV</Text>
                                    <Text style={[styles.selectionValue, { color: COLORS.euroBlue }]}>Bs. {formatCurrency(selectedPoint.eurValue)}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.hintContainer}>
                            <Info size={16} color={COLORS.textSecondary} />
                            <Text style={styles.hintText}>Desliza el dedo por la gráfica para ver detalles</Text>
                        </View>
                    )}
                </View>

                <View style={styles.chartContainer}>
                    <LineChart
                        data={chartData}
                        data2={eurData}
                        width={SCREEN_WIDTH - 60}
                        height={250}
                        spacing={50}
                        initialSpacing={20}
                        color1={COLORS.bcvGreen}
                        color2={COLORS.euroBlue}
                        thickness={3}
                        dataPointsColor1={COLORS.bcvGreen}
                        dataPointsRadius={4}
                        noOfSections={4}
                        yAxisColor="transparent"
                        xAxisColor="transparent"
                        yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                        hideRules
                        showVerticalLines={false}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: 'rgba(255,255,255,0.2)',
                            pointerStripWidth: 2,
                            strokeDashArray: [2, 5],
                            pointerColor: COLORS.bcvGreen,
                            radius: 6,
                            pointerLabelComponent: items => {
                                // Provide haptic feedback on point change
                                if (items[0]) {
                                    Haptics.selectionAsync();
                                }
                                return null;
                            },
                        }}
                        onPress={(item) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedPoint(item);
                        }}
                        // Enable interaction on slide/touch
                        activatePointersOnLongPress={false}
                        autoAdjustPointerLabelPosition={true}
                    />
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.bcvGreen }]} />
                        <Text style={styles.legendText}>USD BCV</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.euroBlue }]} />
                        <Text style={styles.legendText}>EUR BCV</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    selectionInfo: {
        height: 110,
        marginBottom: 20,
        justifyContent: 'center',
    },
    selectionCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    selectionDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    selectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    selectionLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 2,
    },
    selectionValue: {
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
    },
    selectionDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
        paddingVertical: 12,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    hintText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    chartContainer: {
        alignItems: 'center',
        paddingRight: 15,
        backgroundColor: COLORS.card,
        paddingVertical: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    }
});

export default HistoryScreen;

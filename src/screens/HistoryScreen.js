import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ArrowLeft, TrendingUp, Calendar, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../context/RateContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
    const { rates, loading } = useRates();
    const { colors, isDark } = useTheme();
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Prepare chart data
    const chartData = (rates.history || []).map(item => ({
        value: item.usd,
        label: new Date(item.date).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
        dataPointText: formatCurrency(item.usd),
        fullDate: item.date,
        eurValue: item.eur
    })).reverse();

    const eurData = (rates.history || []).map(item => ({
        value: item.eur,
        hideDataPoint: true,
    })).reverse();

    if (loading && chartData.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.bcvGreen} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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

            <View style={styles.content}>
                {/* Stats Summary */}
                <View style={[styles.statsContainer, {
                    backgroundColor: colors.card,
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Variación USD</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TrendingUp size={16} color={rates.usdChange >= 0 ? colors.bcvGreen : '#FF3B30'} />
                            <Text style={[styles.statValue, { color: rates.usdChange >= 0 ? colors.bcvGreen : '#FF3B30' }]}>
                                {rates.usdChange >= 0 ? '+' : ''}{rates.usdChange}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Variación EUR</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TrendingUp size={16} color={rates.eurChange >= 0 ? colors.bcvGreen : '#FF3B30'} />
                            <Text style={[styles.statValue, { color: rates.eurChange >= 0 ? colors.bcvGreen : '#FF3B30' }]}>
                                {rates.eurChange >= 0 ? '+' : ''}{rates.eurChange}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Selected Point Info */}
                <View style={styles.selectionInfo}>
                    {selectedPoint ? (
                        <View style={[styles.selectionCard, {
                            backgroundColor: colors.card,
                            borderColor: colors.glassBorder
                        }]}>
                            <View style={styles.selectionHeader}>
                                <Calendar size={14} color={colors.textSecondary} />
                                <Text style={[styles.selectionDate, { color: colors.textSecondary }]}>
                                    {new Date(selectedPoint.fullDate).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                            <View style={styles.selectionRow}>
                                <View>
                                    <Text style={[styles.selectionLabel, { color: colors.textSecondary }]}>USD BCV</Text>
                                    <Text style={[styles.selectionValue, { color: colors.bcvGreen }]}>Bs. {formatCurrency(selectedPoint.value)}</Text>
                                </View>
                                <View style={[styles.selectionDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                                <View>
                                    <Text style={[styles.selectionLabel, { color: colors.textSecondary }]}>EUR BCV</Text>
                                    <Text style={[styles.selectionValue, { color: colors.euroBlue }]}>Bs. {formatCurrency(selectedPoint.eurValue)}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.hintContainer, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }]}>
                            <Info size={16} color={colors.textSecondary} />
                            <Text style={[styles.hintText, { color: colors.textSecondary }]}>Desliza el dedo por la gráfica para ver detalles</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.chartContainer, {
                    backgroundColor: colors.card,
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }]}>
                    <LineChart
                        data={chartData}
                        data2={eurData}
                        width={SCREEN_WIDTH - 60}
                        height={250}
                        spacing={50}
                        initialSpacing={20}
                        color1={colors.bcvGreen}
                        color2={colors.euroBlue}
                        thickness={3}
                        dataPointsColor1={colors.bcvGreen}
                        dataPointsRadius={4}
                        noOfSections={4}
                        yAxisColor="transparent"
                        xAxisColor="transparent"
                        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                        hideRules
                        showVerticalLines={false}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                            pointerStripWidth: 2,
                            strokeDashArray: [2, 5],
                            pointerColor: colors.bcvGreen,
                            radius: 6,
                            pointerLabelComponent: items => {
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
                        activatePointersOnLongPress={false}
                        autoAdjustPointerLabelPosition={true}
                    />
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.bcvGreen }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>USD BCV</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.euroBlue }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>EUR BCV</Text>
                    </View>
                </View>
            </View>
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
        width: 40,
        height: 40,
        borderRadius: 20,
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
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
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
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    selectionDate: {
        fontSize: 12,
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
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    hintText: {
        fontSize: 13,
    },
    chartContainer: {
        alignItems: 'center',
        paddingRight: 15,
        paddingVertical: 20,
        borderRadius: 24,
        borderWidth: 1,
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
        fontSize: 12,
        fontWeight: '600',
    }
});

export default HistoryScreen;

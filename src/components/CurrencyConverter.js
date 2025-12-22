import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Share } from 'react-native';
import { ArrowLeftRight, Calendar, Copy, Check, RotateCcw, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../theme/colors';

const CurrencyConverter = ({ rates, initialCurrency }) => {
    const [foreignAmount, setForeignAmount] = useState('1,00');
    const [bsAmount, setBsAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency || 'usd'); // usd, eur, parallel
    const [useTomorrow, setUseTomorrow] = useState(false);

    // Update selected currency if initialCurrency prop changes (e.g. from navigation)
    useEffect(() => {
        if (initialCurrency) {
            setSelectedCurrency(initialCurrency);
        }
    }, [initialCurrency]);

    const getActiveColor = () => {
        switch (selectedCurrency) {
            case 'eur': return COLORS.euroBlue;
            case 'parallel': return COLORS.parallelOrange;
            default: return COLORS.bcvGreen;
        }
    };

    const activeColor = getActiveColor();

    // States for "copied" feedback
    const [copiedForeign, setCopiedForeign] = useState(false);
    const [copiedBs, setCopiedBs] = useState(false);

    // Helper functions for formatting
    const parseCurrency = (value) => {
        if (!value) return 0;
        // Clean string: keep only numbers
        const digits = value.replace(/\D/g, '');
        const parsed = parseFloat(digits) / 100;
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatCurrency = (value) => {
        if (value === 0 || isNaN(value)) return '';

        let num = parseFloat(value);
        // Ensure 2 decimals
        let [integer, decimal] = num.toFixed(2).split('.');

        // Add thousands separators
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return `${integer},${decimal}`;
    };

    const getCurrentRate = () => {
        if (useTomorrow && rates.nextRates && (selectedCurrency === 'usd' || selectedCurrency === 'eur')) {
            return selectedCurrency === 'usd' ? rates.nextRates.usd : rates.nextRates.eur;
        }
        return selectedCurrency === 'usd' ? rates.bcv :
            selectedCurrency === 'eur' ? rates.euro :
                rates.parallel;
    };

    const currentRate = getCurrentRate();

    const handleForeignChange = (val) => {
        // Strip everything but numbers
        const digits = val.replace(/\D/g, '');

        if (digits === '' || parseInt(digits) === 0) {
            setForeignAmount('');
            setBsAmount('');
            return;
        }

        const rawValue = parseFloat(digits) / 100; // 123 -> 1.23
        setForeignAmount(formatCurrency(rawValue));

        if (rawValue > 0) {
            setBsAmount(formatCurrency(rawValue * currentRate));
        }
    };

    const handleBsChange = (val) => {
        // Strip everything but numbers
        const digits = val.replace(/\D/g, '');

        if (digits === '' || parseInt(digits) === 0) {
            setBsAmount('');
            setForeignAmount('');
            return;
        }

        const rawValue = parseFloat(digits) / 100;
        setBsAmount(formatCurrency(rawValue));

        if (rawValue > 0) {
            setForeignAmount(formatCurrency(rawValue / currentRate));
        }
    };

    useEffect(() => {
        // Recalculate based on current foreign amount text
        if (!foreignAmount) return;

        // Check if we need to parse it as raw input or if it's already formatted
        // Actually, foreignAmount is always formatted or empty in this new logic.
        const digits = foreignAmount.replace(/\D/g, '');
        if (digits) {
            const rawValue = parseFloat(digits) / 100;
            if (rawValue > 0) {
                setBsAmount(formatCurrency(rawValue * currentRate));
            }
        }
    }, [selectedCurrency, useTomorrow, rates]);

    const copyToClipboard = async (text, type) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);

        if (type === 'foreign') {
            setCopiedForeign(true);
            setTimeout(() => setCopiedForeign(false), 2000);
        } else {
            setCopiedBs(true);
            setTimeout(() => setCopiedBs(false), 2000);
        }
    };

    const handleReset = () => {
        setForeignAmount('1,00');
        // Trigger recalculation effectively or set manually
        const digits = '100'; // 1.00
        const rawValue = 1.00;
        setBsAmount(formatCurrency(rawValue * currentRate));
    };

    const handleShare = async () => {
        try {
            const today = new Date();
            const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

            const dateStr = useTomorrow && hasNextRates ?
                `${getFriendlyNextDate()} (${rates.nextRates.date.substring(0, 5)})` :
                `Hoy (${formattedToday})`;

            const currencyName = selectedCurrency === 'parallel' ? 'USDT' : selectedCurrency.toUpperCase();

            const message = `📊 *Cambio al Día* \n\n` +
                `💵 *${foreignAmount} ${getSymbol()}* (${currencyName})\n` +
                `🇻🇪 *${bsAmount} Bs*\n\n` +
                `📈 Tasa: ${formatCurrency(currentRate)} Bs\n` +
                `📅 Fecha: ${dateStr}\n\n` +
                `_Calculado con Al Cambio App_`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getSymbol = () => {
        if (selectedCurrency === 'eur') return '€';
        return '$';
    };

    const getCurrencyLabel = () => {
        if (selectedCurrency === 'parallel') return 'USDT';
        return selectedCurrency.toUpperCase();
    };

    const getFriendlyNextDate = () => {
        if (!rates.nextRates) return '';
        const [d, m, y] = rates.nextRates.date.split('/');
        const nextDateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDateObj.setHours(0, 0, 0, 0);
        const diffTime = nextDateObj.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return 'Mañana';
        const daysArr = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return daysArr[nextDateObj.getDay()];
    };

    const hasNextRates = rates.nextRates && (selectedCurrency === 'usd' || selectedCurrency === 'eur');

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Conversor</Text>

                {hasNextRates && (
                    <TouchableOpacity
                        style={[styles.tomorrowToggle, useTomorrow && {
                            backgroundColor: `${activeColor}15`, // 10% opacity
                            borderColor: `${activeColor}40` // 25% opacity
                        }]}
                        onPress={() => setUseTomorrow(!useTomorrow)}
                        activeOpacity={0.7}
                    >
                        <Calendar size={14} color={useTomorrow ? activeColor : COLORS.textSecondary} />
                        <View style={{ marginLeft: 8 }}>
                            <Text style={[styles.tomorrowToggleSubtitle, useTomorrow && { color: activeColor }]}>
                                {useTomorrow ? 'Usando' : 'Ver'}
                            </Text>
                            <Text style={[styles.tomorrowToggleText, useTomorrow && { color: activeColor }]}>
                                {getFriendlyNextDate()} ({rates.nextRates.date.substring(0, 5)})
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {/* Currency Selector */}
            <View style={styles.selectorContainer}>
                {['usd', 'eur', 'parallel'].map((curr) => {
                    const isSelected = selectedCurrency === curr;
                    let chipColor = COLORS.bcvGreen;
                    if (curr === 'eur') chipColor = COLORS.euroBlue;
                    if (curr === 'parallel') chipColor = COLORS.parallelOrange;

                    return (
                        <TouchableOpacity
                            key={curr}
                            style={[
                                styles.chip,
                                isSelected && {
                                    backgroundColor: `${chipColor}26`, // 15% opacity
                                    borderColor: chipColor
                                }
                            ]}
                            onPress={() => setSelectedCurrency(curr)}
                        >
                            <Text style={[
                                styles.chipText,
                                isSelected && { color: chipColor }
                            ]}>
                                {curr === 'parallel' ? 'Promedio USDT' : `${curr.toUpperCase()} BCV`}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.converterBox}>
                {/* Foreign Input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>{getSymbol()}</Text>
                        <TextInput
                            style={styles.input}
                            value={foreignAmount}
                            onChangeText={handleForeignChange}
                            keyboardType="number-pad"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.copyButton, copiedForeign && { backgroundColor: `${activeColor}1A` }]}
                        onPress={() => copyToClipboard(foreignAmount, 'foreign')}
                    >
                        {copiedForeign ? <Check size={16} color={activeColor} /> : <Copy size={16} color={COLORS.textSecondary} />}
                    </TouchableOpacity>
                    <Text style={styles.currencySubLabel}>{getCurrencyLabel()}</Text>
                </View>

                <View style={styles.divider}>
                    <ArrowLeftRight color={COLORS.textSecondary} size={16} />
                </View>

                {/* Bs Input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Bs</Text>
                        <TextInput
                            style={[styles.input, { color: activeColor }]}
                            value={bsAmount}
                            onChangeText={handleBsChange}
                            keyboardType="number-pad"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.copyButton, copiedBs && { backgroundColor: `${activeColor}1A` }]}
                        onPress={() => copyToClipboard(bsAmount, 'bs')}
                    >
                        {copiedBs ? <Check size={16} color={activeColor} /> : <Copy size={16} color={COLORS.textSecondary} />}
                    </TouchableOpacity>
                    <Text style={styles.currencySubLabel}>BOLÍVARES</Text>
                </View>
            </View>

            <Text style={styles.rateInfo}>
                Tasa aplicada: <Text style={{ fontWeight: 'bold', color: useTomorrow && hasNextRates ? activeColor : COLORS.textPrimary }}>
                    {formatCurrency(currentRate)} Bs {useTomorrow && hasNextRates ? `(${getFriendlyNextDate()})` : '(Hoy)'}
                </Text>
            </Text>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleReset}>
                    <RotateCcw size={18} color={COLORS.textSecondary} />
                    <Text style={styles.actionButtonText}>Reiniciar</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Share2 size={18} color={activeColor} />
                    <Text style={[styles.actionButtonText, { color: activeColor }]}>Compartir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    tomorrowToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tomorrowToggleSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: -2,
    },
    tomorrowToggleText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
    },
    selectorContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 8,
    },
    chip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    converterBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        padding: 16,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: 20,
        fontWeight: '600',
        width: 35,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 26,
        fontWeight: '800',
        padding: 0,
    },
    copyButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: 8,
    },
    currencySubLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        width: 50,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rateInfo: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 16,
        textAlign: 'center',
        marginBottom: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 4,
        alignSelf: 'center',
        gap: 4
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 8,
        borderRadius: 12,
    },
    actionDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    actionButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    }
});

export default CurrencyConverter;

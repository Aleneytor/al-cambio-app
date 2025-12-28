import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CurrencyConverter from '../components/CurrencyConverter';
import { useRates } from '../context/RateContext';
import { RefreshCcw } from 'lucide-react-native';

const ConverterScreen = ({ route }) => {
    const { rates, refreshRates, loading } = useRates();
    const { colors, isDark } = useTheme();
    const initialCurrency = route.params?.initialCurrency;

    const [resetKey, setResetKey] = React.useState(0);

    const handleRefresh = () => {
        refreshRates(true);
        setResetKey(prev => prev + 1);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Calculadora</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Conversión de divisas al instante</Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshButton, {
                        backgroundColor: colors.glass,
                        borderColor: colors.glassBorder
                    }]}
                    onPress={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCcw color={colors.textPrimary} size={20} style={loading ? { opacity: 0.5 } : {}} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <CurrencyConverter key={resetKey} rates={rates} initialCurrency={initialCurrency} />

                <View style={[styles.infoBox, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }]}>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Esta calculadora utiliza las tasas oficiales del BCV y el promedio del paralelo para realizar los cálculos.
                    </Text>
                </View>
            </ScrollView>
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
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginTop: 8,
    },
    refreshButton: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
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
        paddingBottom: 40,
    },
    infoBox: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
    }
});

export default ConverterScreen;

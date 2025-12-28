import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import CurrencyConverter from '../components/CurrencyConverter';
import { useRates } from '../context/RateContext';
import { RefreshCcw } from 'lucide-react-native';

const ConverterScreen = ({ route }) => {
    const { rates, refreshRates, loading } = useRates();
    const initialCurrency = route.params?.initialCurrency; // Get param

    const [resetKey, setResetKey] = React.useState(0);

    const handleRefresh = () => {
        refreshRates(true);
        setResetKey(prev => prev + 1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Calculadora</Text>
                    <Text style={styles.headerSubtitle}>Conversión de divisas al instante</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCcw color={COLORS.textPrimary} size={20} style={loading ? { opacity: 0.5 } : {}} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <CurrencyConverter key={resetKey} rates={rates} initialCurrency={initialCurrency} />

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
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
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.glass,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
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
    infoBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
    }
});

export default ConverterScreen;

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowRight, TrendingUp, Calculator, Bell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
            {icon}
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const WelcomeScreen = ({ navigation }) => {
    const onGetStarted = async () => {
        try {
            await AsyncStorage.setItem('@app_intro_shown', 'true');
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (e) {
            console.error('Error saving welcome status', e);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.sloganText}>
                        No preguntes cuánto,{"\n"}
                        revisa <Text style={styles.sloganHighlight}>Kuanto</Text>.
                    </Text>
                </View>

                <View style={styles.featuresContainer}>
                    <FeatureItem
                        icon={<TrendingUp color={COLORS.bcvGreen} size={24} />}
                        title="Tasas en Tiempo Real"
                        description="Consulta el valor oficial del BCV y el promedio paralelo USDT al instante."
                    />
                    <FeatureItem
                        icon={<Calculator color={COLORS.euroBlue} size={24} />}
                        title="Calculadora Inteligente"
                        description="Convierte entre USD, EUR y Bolívares de forma rápida y sencilla."
                    />
                    <FeatureItem
                        icon={<Bell color={COLORS.parallelOrange} size={24} />}
                        title="Alertas Diarias"
                        description="Recibe notificaciones con la tasa actualizada del dólar, sin tener que entrar a la app."
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={onGetStarted}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Comenzar</Text>
                    <ArrowRight color="#000" size={20} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 40,
        alignItems: 'center',
        width: '100%',
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
    },
    logoWrapper: {
        marginBottom: 20,
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    sloganText: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    sloganHighlight: {
        color: COLORS.bcvGreen,
        fontWeight: '800',
    },
    featuresContainer: {
        gap: 32,
        width: '100%',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    button: {
        backgroundColor: COLORS.bcvGreen,
        borderRadius: 20,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.bcvGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        width: '100%',
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    }
});

export default WelcomeScreen;

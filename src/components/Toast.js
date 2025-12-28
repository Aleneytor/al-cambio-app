import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Dimensions, View } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const Toast = ({ message, visible, type = 'success', onHide }) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: -110, // Positioning above the tab bar
                    useNativeDriver: true,
                    friction: 8,
                    tension: 40,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide) onHide();
        });
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={20} color={COLORS.bcvGreen} />;
            case 'error': return <AlertCircle size={20} color="#ff3b30" />;
            default: return <Info size={20} color={COLORS.euroBlue} />;
        }
    };

    if (!visible && opacity._value === 0) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                {getIcon()}
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        gap: 10,
        width: 'auto',
        maxWidth: width - 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    message: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default Toast;

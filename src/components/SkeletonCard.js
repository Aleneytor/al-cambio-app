import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS } from '../theme/colors';

const SkeletonCard = ({ index = 0 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Entry animation
        const delay = index * 100;
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
        ]).start();

        // Shimmer loop
        const shimmerLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmerLoop.start();

        return () => shimmerLoop.stop();
    }, []);

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Header row */}
            <View style={styles.headerRow}>
                <Animated.View style={[styles.iconPlaceholder, { opacity: shimmerOpacity }]} />
                <Animated.View style={[styles.titlePlaceholder, { opacity: shimmerOpacity }]} />
            </View>

            {/* Rate row */}
            <Animated.View style={[styles.ratePlaceholder, { opacity: shimmerOpacity }]} />

            {/* Badge row */}
            <View style={styles.badgeRow}>
                <Animated.View style={[styles.badgePlaceholder, { opacity: shimmerOpacity }]} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.cardElevated,
        marginRight: 12,
    },
    titlePlaceholder: {
        width: 140,
        height: 18,
        borderRadius: 8,
        backgroundColor: COLORS.cardElevated,
    },
    ratePlaceholder: {
        width: 200,
        height: 44,
        borderRadius: 10,
        backgroundColor: COLORS.cardElevated,
        marginBottom: 16,
    },
    badgeRow: {
        marginTop: 4,
    },
    badgePlaceholder: {
        width: '70%',
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.cardElevated,
    },
});

export default SkeletonCard;

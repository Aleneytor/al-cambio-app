import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useTheme } from '../context/ThemeContext';

// Use test IDs in development, real IDs in production
const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-7187537412845196/3490287825';

const AdBanner = ({ style }) => {
    const { colors } = useTheme();
    const [adError, setAdError] = useState(false);

    // Don't render if ad failed
    if (adError) return null;

    return (
        <View style={[styles.container, style]}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(error) => {
                    console.log('Ad failed to load:', error);
                    setAdError(true);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default AdBanner;

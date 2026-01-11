import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import {
    NativeAd,
    NativeAdView,
    NativeAsset,
    NativeAssetType,
    NativeMediaView,
    TestIds
} from 'react-native-google-mobile-ads';
import { useTheme } from '../context/ThemeContext';

// Use test IDs in development, real IDs in production
const adUnitId = __DEV__
    ? TestIds.NATIVE
    : 'ca-app-pub-7187537412845196/3386346046';

const NativeAdComponent = ({ style }) => {
    const { colors, isDark } = useTheme();
    const [nativeAd, setNativeAd] = useState(null);
    const [adError, setAdError] = useState(false);
    const adRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        // Load the native ad
        NativeAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        })
            .then(ad => {
                if (isMounted) {
                    adRef.current = ad;
                    setNativeAd(ad);
                }
            })
            .catch(error => {
                console.log('Native ad failed to load:', error);
                if (isMounted) {
                    setAdError(true);
                }
            });

        // Cleanup
        return () => {
            isMounted = false;
            if (adRef.current) {
                adRef.current.destroy();
            }
        };
    }, []);

    // Don't render if ad failed or not loaded
    if (adError || !nativeAd) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }, style]}>
            <NativeAdView nativeAd={nativeAd} style={styles.adView}>
                {/* Ad Label */}
                <Text style={[styles.adLabel, { color: colors.textSecondary }]}>
                    Publicidad
                </Text>

                <View style={styles.adContent}>
                    {/* Icon */}
                    {nativeAd.icon && (
                        <NativeAsset assetType={NativeAssetType.ICON}>
                            <Image
                                source={{ uri: nativeAd.icon.url }}
                                style={styles.icon}
                            />
                        </NativeAsset>
                    )}

                    <View style={styles.textContent}>
                        {/* Headline */}
                        <NativeAsset assetType={NativeAssetType.HEADLINE}>
                            <Text style={[styles.headline, { color: colors.textPrimary }]} numberOfLines={2}>
                                {nativeAd.headline}
                            </Text>
                        </NativeAsset>

                        {/* Body */}
                        {nativeAd.body && (
                            <NativeAsset assetType={NativeAssetType.BODY}>
                                <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {nativeAd.body}
                                </Text>
                            </NativeAsset>
                        )}
                    </View>
                </View>

                {/* Media */}
                <NativeMediaView style={styles.media} />

                {/* Call to Action */}
                {nativeAd.callToAction && (
                    <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                        <View style={[styles.ctaButton, { backgroundColor: colors.bcvGreen }]}>
                            <Text style={styles.ctaText}>
                                {nativeAd.callToAction}
                            </Text>
                        </View>
                    </NativeAsset>
                )}
            </NativeAdView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 20,
        marginVertical: 12,
    },
    adView: {
        padding: 16,
    },
    adLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    adContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
    },
    headline: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
    },
    media: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    ctaButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    ctaText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default NativeAdComponent;

import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarketSummary } from '../component/MarketSummary';
import { MetalCard } from '../component/MetalCard';
import { MetalCardSkeleton } from '../component/MetalCardSkeleton';
import {
  mapMetalToCardProps,
  METALS_CONFIG,
  useFetchMetalPrices,
} from '../hook/useFetchMetalPrice';
import { formatUpdatedTime } from '../util/format';
import { colors, radius, spacing } from '../theme';

export function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { quotes, loading, error, refetch, lastUpdated } =
    useFetchMetalPrices();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const showFullSkeleton = loading && quotes.every(quote => !quote.data);

  const updatedLabel = lastUpdated
    ? `Updated ${formatUpdatedTime(lastUpdated)}`
    : loading
    ? 'Fetching live prices…'
    : 'Updated —';

  const handleCardPress = useCallback((code: string, hasData: boolean) => {
    if (!hasData) {
      return;
    }
    setSelectedCode(current => (current === code ? null : code));
  }, []);

  const handleRefresh = useCallback(() => {
    setSelectedCode(null);
    refetch();
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Metal Prices</Text>
            <Text style={styles.subtitle}>Spot prices · USD · Troy oz</Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.refreshButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh prices"
          >
            <Text style={styles.refreshIcon}>↻</Text>
            <Text style={styles.refreshLabel}>{loading ? '…' : 'Refresh'}</Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.liveDot,
              loading && styles.liveDotPulse,
              error && !lastUpdated ? styles.liveDotError : undefined,
            ]}
          />
          <Text style={styles.updated}>{updatedLabel}</Text>
        </View>

        {error ? (
          <Pressable onPress={handleRefresh} style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {!showFullSkeleton ? <MarketSummary quotes={quotes} /> : null}

        <Text style={styles.sectionLabel}>PRECIOUS METALS</Text>
        <Text style={styles.sectionHint}>
          Tap a card to view bid, ask & range
        </Text>

        {showFullSkeleton
          ? METALS_CONFIG.map(config => <MetalCardSkeleton key={config.code} />)
          : quotes.map(
              ({ config, data, error: itemError, loading: cardLoading }) => {
                if (cardLoading && !data) {
                  return <MetalCardSkeleton key={config.code} />;
                }

                const isSelected = selectedCode === config.code;

                return (
                  <MetalCard
                    key={config.code}
                    {...(data
                      ? mapMetalToCardProps(config, data)
                      : {
                          name: config.name,
                          symbol: config.symbol,
                          price: '—',
                          change: '—',
                          changePercent: '—',
                          isPositive: true,
                          accentBg: config.accentBg,
                          unit: itemError ?? 'Tap retry above',
                        })}
                    selected={isSelected}
                    onPress={() => handleCardPress(config.code, !!data)}
                  />
                );
              },
            )}

        <Text style={styles.disclaimer}>
          Pull down or tap Refresh to update. Not financial advice.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: colors.headerGradientEnd,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  refreshButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  refreshIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  refreshLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#86EFAC',
    marginRight: 8,
  },
  liveDotPulse: {
    backgroundColor: '#FDE047',
  },
  liveDotError: {
    backgroundColor: '#FCA5A5',
  },
  updated: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  errorBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.negativeBg,
    borderRadius: radius.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.negative,
    fontWeight: '500',
  },
  retryText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});

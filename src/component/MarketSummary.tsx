import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MetalQuote } from '../hook/useFetchMetalPrice';
import { formatChangePercent } from '../util/format';
import { colors, radius } from '../theme';

type MarketSummaryProps = {
  quotes: MetalQuote[];
};

export function MarketSummary({ quotes }: MarketSummaryProps): React.JSX.Element | null {
  const loaded = quotes.filter(quote => quote.data !== null);

  if (loaded.length === 0) {
    return null;
  }

  const gainers = loaded.filter(quote => quote.data!.ch >= 0).length;
  const losers = loaded.length - gainers;

  const topMover = loaded.reduce<MetalQuote | null>((best, quote) => {
    if (!best?.data) {
      return quote;
    }
    return Math.abs(quote.data!.chp) > Math.abs(best.data!.chp) ? quote : best;
  }, null);

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{loaded.length}</Text>
        <Text style={styles.statLabel}>Live</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, styles.positive]}>{gainers}</Text>
        <Text style={styles.statLabel}>Up</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, styles.negative]}>{losers}</Text>
        <Text style={styles.statLabel}>Down</Text>
      </View>
      {topMover?.data ? (
        <View style={[styles.statCard, styles.statCardWide]}>
          <Text style={styles.statLabel}>Top mover</Text>
          <Text style={styles.moverName} numberOfLines={1}>
            {topMover.config.name}
          </Text>
          <Text
            style={[
              styles.moverChange,
              topMover.data.ch >= 0 ? styles.positive : styles.negative,
            ]}>
            {formatChangePercent(topMover.data.chp)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardWide: {
    minWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  positive: {
    color: colors.positive,
  },
  negative: {
    color: colors.negative,
  },
  moverName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moverChange: {
    fontSize: 14,
    fontWeight: '700',
  },
});

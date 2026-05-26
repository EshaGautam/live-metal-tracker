import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export type MetalDetail = {
  label: string;
  value: string;
};

export type MetalCardProps = {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  unit?: string;
  accentBg: string;
  exchange?: string;
  details?: MetalDetail[];
  selected?: boolean;
  onPress?: () => void;
};

export function MetalCard({
  name,
  symbol,
  price,
  change,
  changePercent,
  isPositive,
  unit = 'per troy oz',
  accentBg,
  exchange,
  details = [],
  selected = false,
  onPress,
}: MetalCardProps): React.JSX.Element {
  const scale = useRef(new Animated.Value(1)).current;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const changeBg = isPositive ? colors.positiveBg : colors.negativeBg;
  const expanded = selected && details.length > 0;

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateScale(0.97)}
      onPressOut={() => animateScale(1)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, expanded }}>
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          { transform: [{ scale }] },
        ]}>
        <View style={styles.mainRow}>
          <View style={[styles.symbolBadge, { backgroundColor: accentBg }]}>
            <Text style={styles.symbol}>{symbol}</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.metalName}>{name}</Text>
                {exchange ? (
                  <Text style={styles.exchange}>{exchange}</Text>
                ) : null}
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.price}>{price}</Text>
                {onPress && details.length > 0 ? (
                  <Text style={styles.tapHint}>
                    {expanded ? 'Hide details' : 'Tap for details'}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.unit} numberOfLines={1}>
                {unit}
              </Text>
              <View style={[styles.changePill, { backgroundColor: changeBg }]}>
                <Text style={styles.changeArrow}>
                  {isPositive ? '↑' : '↓'}
                </Text>
                <Text style={[styles.changeText, { color: changeColor }]}>
                  {change} ({changePercent})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {expanded ? (
          <View style={styles.detailsPanel}>
            <View style={styles.detailsGrid}>
              {details.map(detail => (
                <View key={detail.label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.accentMuted,
    backgroundColor: colors.accentLight,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  metalName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  exchange: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  tapHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  unit: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 2,
  },
  changeArrow: {
    fontSize: 11,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  detailsPanel: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});

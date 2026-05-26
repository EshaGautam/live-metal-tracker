import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { colors, spacing } from '../theme';

export function MetalCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <SkeletonBox width={44} height={44} borderRadius={12} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <SkeletonBox width={72} height={16} borderRadius={4} />
          <SkeletonBox width={88} height={18} borderRadius={4} />
        </View>
        <View style={styles.bottomRow}>
          <SkeletonBox width="55%" height={12} borderRadius={4} />
          <SkeletonBox width={96} height={22} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

type MetalCardSkeletonListProps = {
  count?: number;
};

export function MetalCardSkeletonList({
  count = 4,
}: MetalCardSkeletonListProps): React.JSX.Element {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <MetalCardSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  body: {
    flex: 1,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});

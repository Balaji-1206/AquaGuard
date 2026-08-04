import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { AlertFilterBar, FilterCategory } from '../../components/alerts/AlertFilterBar';
import { AlertCard } from '../../components/alerts/AlertCard';
import { Skeleton } from '../../components/common/Skeleton';
import { Typography, Spacing } from '../../theme';

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    alerts,
    unresolvedCount,
    criticalCount,
    resolveAlert,
    resolveAllAlerts,
    clearResolvedAlerts,
    refreshAlerts,
    isLoading,
  } = useNotifications();

  const { theme } = useAppTheme();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAlerts();
    setIsRefreshing(false);
  };

  // Dynamic filter category counts
  const filterCounts = useMemo(() => {
    return {
      ALL: alerts.length,
      ACTIVE: alerts.filter((a) => !a.isResolved).length,
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
      WARNING: alerts.filter((a) => a.severity === 'WARNING').length,
      INFO: alerts.filter((a) => a.severity === 'INFO').length,
      RESOLVED: alerts.filter((a) => a.isResolved).length,
    };
  }, [alerts]);

  // Filtered & searched alerts list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (selectedFilter === 'ACTIVE' && alert.isResolved) return false;
      if (selectedFilter === 'RESOLVED' && !alert.isResolved) return false;
      if (selectedFilter === 'CRITICAL' && alert.severity !== 'CRITICAL') return false;
      if (selectedFilter === 'WARNING' && alert.severity !== 'WARNING') return false;
      if (selectedFilter === 'INFO' && alert.severity !== 'INFO') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(query);
        const matchesMessage = alert.message.toLowerCase().includes(query);
        const matchesDevice = alert.deviceName.toLowerCase().includes(query);
        const matchesZone = alert.zone.toLowerCase().includes(query);
        return matchesTitle || matchesMessage || matchesDevice || matchesZone;
      }

      return true;
    });
  }, [alerts, selectedFilter, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
        
        {/* Top Screen Navigation Header */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.backBtn,
              { backgroundColor: theme.isDark ? '#1C2541' : '#FFFFFF', borderColor: theme.colors.border },
            ]}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('DashboardHome' as never);
              }
            }}
          >
            <Text style={[styles.backBtnText, { color: theme.colors.textPrimary }]}>← Back</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.syncPill,
              { backgroundColor: theme.isDark ? '#1C2541' : '#E0F2FE', borderColor: theme.colors.border },
            ]}
            onPress={handleRefresh}
          >
            <Text style={[styles.syncPillText, { color: theme.colors.primary }]}>🔄 Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Hero System Status Banner */}
        <LinearGradient
          colors={theme.isDark ? ['#1E293B', '#0F172A'] : ['#0284C7', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTextSection}>
            <View style={styles.heroHeaderRow}>
              <Text style={styles.heroTitle}>AquaGuard Safety Center</Text>
              <View style={styles.heroLiveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.heroSub}>
              {unresolvedCount > 0
                ? `Attention needed: ${unresolvedCount} unresolved incident${unresolvedCount > 1 ? 's' : ''}`
                : 'All home sensors operating within normal thresholds'}
            </Text>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{unresolvedCount}</Text>
              <Text style={styles.metricLabel}>Pending</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: criticalCount > 0 ? '#F87171' : '#38BDF8' }]}>
                {criticalCount}
              </Text>
              <Text style={styles.metricLabel}>Critical</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#34D399' }]}>
                {filterCounts.RESOLVED}
              </Text>
              <Text style={styles.metricLabel}>Resolved</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar Input */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search by zone, alert title, or device..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Chips Bar */}
        <AlertFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          counts={filterCounts}
        />

        {/* Quick Batch Actions */}
        <View style={styles.batchActionsRow}>
          {unresolvedCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.batchBtn, { backgroundColor: theme.isDark ? '#1E293B' : '#E2E8F0' }]}
              onPress={resolveAllAlerts}
            >
              <Text style={[styles.batchBtnText, { color: theme.colors.textPrimary }]}>
                ✓ Resolve All ({unresolvedCount})
              </Text>
            </TouchableOpacity>
          )}

          {filterCounts.RESOLVED > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.batchBtn, { backgroundColor: theme.isDark ? '#1E293B' : '#E2E8F0' }]}
              onPress={clearResolvedAlerts}
            >
              <Text style={[styles.batchBtnText, { color: theme.colors.textMuted }]}>
                🗑️ Clear Resolved
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Alerts Feed List */}
        {isLoading ? (
          <View style={styles.skeletonFeed}>
            <Skeleton height={140} borderRadius={16} />
            <Skeleton height={140} borderRadius={16} />
          </View>
        ) : (
          <FlatList
            data={filteredAlerts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlertCard alert={item} onResolve={resolveAlert} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <View
                  style={[
                    styles.emptyCircle,
                    { backgroundColor: theme.isDark ? '#1C2541' : '#E0F2FE' },
                  ]}
                >
                  <Text style={{ fontSize: 36 }}>🛡️</Text>
                </View>
                <Text style={[styles.emptyHeadline, { color: theme.colors.textPrimary }]}>
                  {searchQuery || selectedFilter !== 'ALL'
                    ? 'No Alerts Match Your Search'
                    : 'System Fully Operational'}
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                  {searchQuery || selectedFilter !== 'ALL'
                    ? 'Try adjusting your search query or switching category tabs.'
                    : 'No pending leaks, TDS spikes, or UV filter replacements reported.'}
                </Text>

                {(searchQuery || selectedFilter !== 'ALL') && (
                  <TouchableOpacity
                    style={[styles.resetFiltersBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedFilter('ALL');
                    }}
                  >
                    <Text style={styles.resetFiltersBtnText}>Show All Alerts</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
  },
  syncPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  syncPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTextSection: {
    marginBottom: 12,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
  heroLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchSection: {
    marginVertical: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    height: '100%',
  },
  clearSearchBtn: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  batchActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  batchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  batchBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skeletonFeed: {
    gap: 12,
    marginTop: Spacing.md,
  },
  listContainer: {
    paddingTop: 4,
    paddingBottom: 120, // Avoid bottom tab bar overlap
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyHeadline: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFiltersBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

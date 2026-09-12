import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Platform,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';
import { spacing, borderRadius, shadows } from './src/theme/spacing';
import {
  ScreenType,
  UserProfile,
  CarbonSummary,
  ScannedReceipt,
  RecyclingLocation,
  EcoQuest,
  TokenTransaction,
  RewardItem,
  MerchantProfile,
  EcoPromotion,
  InventoryEcoItem,
  AreaLeaderboardEntry,
  CommunityMilestone,
} from './src/types';
import {
  mockUser,
  mockCarbonSummary,
  mockReceipts,
  mockRecyclingLocations,
  mockEcoQuests,
  mockTransactions,
  mockRewards,
  mockMerchant,
  mockPromotions,
  mockInventory,
  mockAreaLeaderboard,
  mockCommunityMilestone,
} from './src/mock/mockData';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ActionHubScreen } from './src/screens/ActionHubScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { MerchantScreen } from './src/screens/MerchantScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [summary] = useState<CarbonSummary>(mockCarbonSummary);
  const [receipts] = useState<ScannedReceipt[]>(mockReceipts);
  const [locations] = useState<RecyclingLocation[]>(mockRecyclingLocations);
  const [quests, setQuests] = useState<EcoQuest[]>(mockEcoQuests);
  const [transactions, setTransactions] = useState<TokenTransaction[]>(mockTransactions);
  const [rewards] = useState<RewardItem[]>(mockRewards);
  const [merchant] = useState<MerchantProfile>(mockMerchant);
  const [promotions, setPromotions] = useState<EcoPromotion[]>(mockPromotions);
  const [inventory] = useState<InventoryEcoItem[]>(mockInventory);
  const [leaderboard, setLeaderboard] = useState<AreaLeaderboardEntry[]>(mockAreaLeaderboard);
  const [milestone, setMilestone] = useState<CommunityMilestone>(mockCommunityMilestone);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Receipt Bounty Claim Handler
  const handleClaimReceiptReward = (points: number, tokens: number) => {
    setUser((prev) => ({
      ...prev,
      carbBalance: prev.carbBalance + tokens,
      ecoPoints: prev.ecoPoints + points,
    }));

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}`,
      title: 'Receipt Scan OCR Bounty',
      category: 'Receipt Scan',
      date: 'Just Now',
      tokenAmount: tokens,
      ecoPointsAmount: points,
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`🎉 Claimed +${points} EcoPoints & +${tokens} $CARB!`);
  };

  // Recycling Depot Check-in Handler
  const handleCheckInLocation = (loc: RecyclingLocation) => {
    const points = loc.ecoPointsPerVisit;
    const tokens = Number((points * 0.01).toFixed(2));

    setUser((prev) => ({
      ...prev,
      ecoPoints: prev.ecoPoints + points,
      carbBalance: prev.carbBalance + tokens,
    }));

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}`,
      title: `Drop-off at ${loc.name}`,
      category: 'Recycling',
      date: 'Just Now',
      tokenAmount: tokens,
      ecoPointsAmount: points,
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`♻️ Checked in at ${loc.name}! Earned +${points} EcoPoints.`);
  };

  // Quest Claim Handler
  const handleClaimQuest = (quest: EcoQuest) => {
    setUser((prev) => ({
      ...prev,
      ecoPoints: prev.ecoPoints + quest.rewardPoints,
      carbBalance: prev.carbBalance + quest.rewardTokens,
    }));

    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, completed: true, expiresIn: 'Claimed' } : q))
    );

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}`,
      title: `Quest: ${quest.title}`,
      category: 'Recycling',
      date: 'Just Now',
      tokenAmount: quest.rewardTokens,
      ecoPointsAmount: quest.rewardPoints,
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`🏆 Quest complete! +${quest.rewardPoints} Pts & +${quest.rewardTokens} $CARB.`);
  };

  // Reward Redemption Handler
  const handleRedeemReward = (reward: RewardItem) => {
    if (user.carbBalance < reward.costTokens || user.ecoPoints < reward.costEcoPoints) {
      showToast('⚠️ Insufficient $CARB or EcoPoints for this reward.');
      return;
    }

    setUser((prev) => ({
      ...prev,
      carbBalance: prev.carbBalance - reward.costTokens,
      ecoPoints: prev.ecoPoints - reward.costEcoPoints,
    }));

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}`,
      title: `Claimed ${reward.brand} ${reward.title}`,
      category: 'Redemption',
      date: 'Just Now',
      tokenAmount: -reward.costTokens,
      ecoPointsAmount: -reward.costEcoPoints,
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`🎁 Redeemed ${reward.title}! Check your email for details.`);
  };

  // Launch Merchant Promotion Handler
  const handleLaunchPromotion = (promo: EcoPromotion) => {
    setPromotions((prev) => [promo, ...prev]);
    showToast(`🚀 New Eco Promotion published: "${promo.title}"`);
  };

  // Boost Area Leaderboard Milestone Handler
  const handleBoostDistrict = () => {
    setMilestone((prev) => ({
      ...prev,
      currentKg: Math.min(prev.currentKg + 50, prev.targetKg),
      treesPlantedThisMonth: prev.treesPlantedThisMonth + 1,
    }));
    setUser((prev) => ({
      ...prev,
      ecoPoints: prev.ecoPoints + 20,
    }));
    showToast(`⚡ Boosted ${milestone.districtName}! +20 EcoPoints earned.`);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={() => setCurrentScreen('dashboard')} />;
      case 'dashboard':
        return (
          <DashboardScreen
            summary={summary}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'scanner':
        return (
          <ScannerScreen
            receipts={receipts}
            onClaimReward={handleClaimReceiptReward}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'actionHub':
        return (
          <ActionHubScreen
            locations={locations}
            quests={quests}
            onCheckIn={handleCheckInLocation}
            onClaimQuest={handleClaimQuest}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            user={user}
            transactions={transactions}
            rewards={rewards}
            onRedeemReward={handleRedeemReward}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'merchant':
        return (
          <MerchantScreen
            merchant={merchant}
            promotions={promotions}
            inventory={inventory}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLaunchPromotion={handleLaunchPromotion}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardScreen
            leaderboard={leaderboard}
            milestone={milestone}
            onBoostDistrict={handleBoostDistrict}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar style="light" />
      <View style={styles.phoneFrame}>
        {/* Top App Header */}
        <Header
          user={user}
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLogout={() => setCurrentScreen('login')}
        />

        {/* Dynamic Screen View */}
        <View style={styles.screenWrapper}>{renderActiveScreen()}</View>

        {/* Global Toast Banner */}
        {toastMessage && (
          <View style={styles.toastCard}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Bottom Floating Navigation Dock */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#020906',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        height: '100vh' as any,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.15)',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.12)',
      },
    }),
  },
  screenWrapper: {
    flex: 1,
  },
  toastCard: {
    position: 'absolute',
    top: 80,
    left: spacing.base,
    right: spacing.base,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    zIndex: 100,
    ...shadows.glow,
  },
  toastText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameViewport } from './components/3d/GameViewport';
import { InteractableTarget } from './components/3d/SupermarketScene';
import { MainMenu } from './components/ui/MainMenu';
import { GameHUD } from './components/ui/GameHUD';
import { MissionOverlay } from './components/ui/MissionOverlay';
import { BasketModal } from './components/ui/BasketModal';
import { HowToPlayModal } from './components/ui/HowToPlayModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { MissionSelectModal } from './components/ui/MissionSelectModal';
import { TeacherDashboard } from './components/ui/TeacherDashboard';
import {
  Product,
  MissionProgress,
  PlayerStats,
  GameSettings,
  CurrencyDenomination,
} from './types/game';
import {
  loadSettings,
  saveSettings,
  loadMissions,
  saveMissions,
  loadPlayerStats,
  savePlayerStats,
} from './game/storage';
import { sounds } from './game/audio';
import { speech } from './game/speech';

export default function App() {
  // Game mode: 'menu' or 'playing'
  const [gameMode, setGameMode] = useState<'menu' | 'playing'>('menu');

  // Core data states
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [missions, setMissions] = useState<MissionProgress[]>(loadMissions);

  // Active mission tracking
  const [currentMissionId, setCurrentMissionId] = useState<string>('mission_1');
  const currentMission = missions.find((m) => m.id === currentMissionId) || missions[0];

  // Shopping Basket
  const [basket, setBasket] = useState<Product[]>([]);

  // Modal / Overlay states
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showMissionSelect, setShowMissionSelect] = useState<boolean>(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);
  const [showBasketModal, setShowBasketModal] = useState<boolean>(false);

  // Active 3D Mission Interaction Overlay
  const [activeMissionOverlay, setActiveMissionOverlay] = useState<{
    type: 'mission_1' | 'mission_2' | 'mission_3';
    activeBanknoteValue?: CurrencyDenomination;
    activeProduct?: Product;
  } | null>(null);

  // Guided navigation station key
  const [guidedStation, setGuidedStation] = useState<string | null>(null);

  // Check URL parameters (e.g. ?autostart=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        setGameMode('playing');
      }
    }
  }, []);

  // Sync settings with audio and speech helpers
  useEffect(() => {
    sounds.setEnabled(settings.soundEnabled);
    speech.setEnabled(settings.voiceEnabled);
  }, [settings.soundEnabled, settings.voiceEnabled]);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateStats = (newStats: PlayerStats) => {
    setStats(newStats);
    savePlayerStats(newStats);
  };

  const handleDataReset = () => {
    setStats(loadPlayerStats());
    setMissions(loadMissions());
    setBasket([]);
  };

  // Interaction dispatcher from 3D Viewport
  const handleViewportInteract = useCallback(
    (target: InteractableTarget) => {
      if (target.type === 'banknote') {
        setActiveMissionOverlay({
          type: 'mission_1',
          activeBanknoteValue: target.banknoteValue,
        });
        setCurrentMissionId('mission_1');
      } else if (target.type === 'product' && target.product) {
        setActiveMissionOverlay({
          type: 'mission_2',
          activeProduct: target.product,
        });
        setCurrentMissionId('mission_2');
      } else if (target.type === 'cashier') {
        setActiveMissionOverlay({
          type: 'mission_3',
        });
        setCurrentMissionId('mission_3');
      }
    },
    []
  );

  const handleAddToBasket = (product: Product) => {
    setBasket((prev) => [...prev, product]);
  };

  const handleRemoveFromBasket = (index: number) => {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleMissionComplete = (missionId: string, starsEarned: number) => {
    setMissions((prevMissions) => {
      const updated = prevMissions.map((m) => {
        if (m.id === missionId) {
          return {
            ...m,
            completed: true,
            stars: Math.max(m.stars, starsEarned),
          };
        }
        return m;
      });
      saveMissions(updated);

      // Recalculate total stars in stats
      const totalStars = updated.reduce((sum, m) => sum + m.stars, 0);
      const newStats = {
        ...stats,
        totalStars,
        missionsCompleted: Array.from(new Set([...stats.missionsCompleted, missionId])),
      };
      handleUpdateStats(newStats);

      return updated;
    });

    // Advance to next mission
    if (missionId === 'mission_1') {
      setCurrentMissionId('mission_2');
      setGuidedStation('shelves');
    } else if (missionId === 'mission_2') {
      setCurrentMissionId('mission_3');
      setGuidedStation('cashier');
    }
  };

  const handleSelectMissionDirect = (missionId: string) => {
    setCurrentMissionId(missionId);
    setShowMissionSelect(false);
    setGameMode('playing');

    if (missionId === 'mission_1') {
      setGuidedStation('money_station');
      setActiveMissionOverlay({ type: 'mission_1', activeBanknoteValue: 1 });
    } else if (missionId === 'mission_2') {
      setGuidedStation('shelves');
    } else if (missionId === 'mission_3') {
      setGuidedStation('cashier');
      setActiveMissionOverlay({ type: 'mission_3' });
    }
  };

  const anyOverlayOpen =
    gameMode === 'menu' ||
    showHowToPlay ||
    showSettings ||
    showMissionSelect ||
    showTeacherDashboard ||
    showBasketModal ||
    activeMissionOverlay !== null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* 3D Supermarket Scene (Always rendered in background, seamless transitions) */}
      <GameViewport
        settings={settings}
        onInteract={handleViewportInteract}
        activeOverlay={anyOverlayOpen}
        guidedStation={guidedStation}
      />

      {/* Top HUD (visible during active gameplay) */}
      {gameMode === 'playing' && (
        <GameHUD
          currentMission={currentMission}
          totalStars={stats.totalStars}
          basket={basket}
          onOpenBasket={() => setShowBasketModal(true)}
          onOpenHelp={() => setShowHowToPlay(true)}
          onOpenMenu={() => setGameMode('menu')}
          onOpenTeacherDashboard={() => setShowTeacherDashboard(true)}
          settings={settings}
          onToggleSound={() =>
            handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
          }
          onToggleVoice={() =>
            handleUpdateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })
          }
        />
      )}

      {/* Main Menu Start Screen */}
      {gameMode === 'menu' && (
        <MainMenu
          onStartGame={() => {
            setGameMode('playing');
            sounds.playSuccessChime();
          }}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenMissionSelect={() => setShowMissionSelect(true)}
          onOpenTeacherDashboard={() => setShowTeacherDashboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          totalStars={stats.totalStars}
        />
      )}

      {/* Active Mission Interaction Overlay (Kenali Wang / Pilih Barang / Bayar di Kaunter) */}
      {activeMissionOverlay && (
        <MissionOverlay
          missionType={activeMissionOverlay.type}
          activeBanknoteValue={activeMissionOverlay.activeBanknoteValue}
          activeProduct={activeMissionOverlay.activeProduct}
          basket={basket}
          onAddToBasket={handleAddToBasket}
          onClose={() => setActiveMissionOverlay(null)}
          onMissionComplete={handleMissionComplete}
          stats={stats}
          onUpdateStats={handleUpdateStats}
          missions={missions}
        />
      )}

      {/* Shopping Basket Modal */}
      {showBasketModal && (
        <BasketModal
          basket={basket}
          onRemoveItem={handleRemoveFromBasket}
          onClearBasket={handleClearBasket}
          onGoToCashier={() => {
            setShowBasketModal(false);
            setActiveMissionOverlay({ type: 'mission_3' });
          }}
          onClose={() => setShowBasketModal(false)}
        />
      )}

      {/* Tutorial / Cara Bermain Modal */}
      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => setShowHowToPlay(false)}
          onStartPlaying={() => {
            setShowHowToPlay(false);
            setGameMode('playing');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
          onDataReset={handleDataReset}
        />
      )}

      {/* Mission Select Modal */}
      {showMissionSelect && (
        <MissionSelectModal
          missions={missions}
          onSelectMission={handleSelectMissionDirect}
          onClose={() => setShowMissionSelect(false)}
        />
      )}

      {/* Teacher Dashboard */}
      {showTeacherDashboard && (
        <TeacherDashboard
          stats={stats}
          missions={missions}
          onUpdateStats={handleUpdateStats}
          onClose={() => setShowTeacherDashboard(false)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/auth';
import { MISSIONS } from '@/lib/gameLogic';
import GameScreen from './GameScreen';

interface MissionsScreenProps {
  onBack: () => void;
}

export default function MissionsScreen({ onBack }: MissionsScreenProps) {
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const user = getCurrentUser();

  if (!user) return null;

  if (activeMission !== null) {
    return <GameScreen missionId={activeMission} onBack={() => setActiveMission(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-primary/50 hover:bg-primary/20"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">МИССИИ</h1>
        </div>

        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1">Прогресс</p>
              <p className="text-2xl font-bold text-foreground">
                {user.missionsCompleted} / {MISSIONS.length}
              </p>
            </div>
            {user.missionsCompleted === 6 && (
              <div className="text-center">
                <p className="pixel-font text-yellow-500 text-xl">🎖️</p>
                <p className="text-sm text-muted-foreground">Ветеран</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {MISSIONS.map((mission) => {
            const isCompleted = user.missionsCompleted >= mission.id;
            const isLocked = mission.id > 1 && user.missionsCompleted < mission.id - 1;

            return (
              <Card 
                key={mission.id}
                className={`p-6 ${
                  isCompleted 
                    ? 'bg-primary/10 border-primary/50' 
                    : isLocked
                    ? 'bg-muted/20 border-muted/30 opacity-60'
                    : 'bg-card/80 border-primary/30'
                } backdrop-blur-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${
                      isCompleted 
                        ? 'bg-primary/20' 
                        : isLocked
                        ? 'bg-muted/20'
                        : 'bg-accent/20'
                    }`}>
                      {isCompleted ? '✅' : isLocked ? '🔒' : '🎯'}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">
                          Миссия {mission.id}: {mission.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{mission.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Icon name="Users" size={16} />
                        <span>{mission.enemies} врагов</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <Icon name="Coins" size={16} />
                        <span>+{mission.reward} ₽</span>
                      </div>
                    </div>

                    {!isLocked && (
                      <Button
                        onClick={() => setActiveMission(mission.id)}
                        className={`mt-4 ${
                          isCompleted 
                            ? 'bg-primary/50 hover:bg-primary/70' 
                            : 'bg-accent hover:bg-accent/80'
                        }`}
                        disabled={isLocked}
                      >
                        {isCompleted ? 'Переиграть' : 'Начать миссию'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

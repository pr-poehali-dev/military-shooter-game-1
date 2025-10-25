import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/auth';
import { checkAchievements, RANKS, getRankByXP } from '@/lib/achievements';

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const user = getCurrentUser();
  const [userXP, setUserXP] = useState(() => {
    return parseInt(localStorage.getItem('userXP') || '0');
  });

  if (!user) return null;

  const stats = {
    kills: parseInt(localStorage.getItem('totalKills') || '0'),
    missionsCompleted: user.missionsCompleted,
    balance: user.balance,
    friendsCount: user.friends.length,
    bombsUsed: parseInt(localStorage.getItem('bombsUsed') || '0'),
    itemsBought: parseInt(localStorage.getItem('itemsBought') || '0'),
  };

  const achievements = checkAchievements(stats);
  const currentRank = getRankByXP(userXP);
  const nextRank = RANKS.find(r => r.level === currentRank.level + 1);
  const progressToNext = nextRank 
    ? ((userXP - currentRank.requiredXP) / (nextRank.requiredXP - currentRank.requiredXP)) * 100
    : 100;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-primary/50 hover:bg-primary/20"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">ДОСТИЖЕНИЯ</h1>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="ranks">Ранги</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Прогресс</p>
                  <p className="text-2xl font-bold text-foreground">
                    {unlockedCount} / {achievements.length}
                  </p>
                </div>
                <div className="text-5xl">{unlockedCount === achievements.length ? '🏆' : '🎯'}</div>
              </div>
              <Progress value={(unlockedCount / achievements.length) * 100} className="mt-4" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <Card 
                  key={achievement.id}
                  className={`p-4 ${
                    achievement.unlocked 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-card/70 border-muted/30'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-foreground mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      {achievement.maxProgress && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{achievement.progress} / {achievement.maxProgress}</span>
                            <span>{Math.floor(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
                          </div>
                          <Progress 
                            value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      {achievement.unlocked && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <Icon name="Check" size={14} />
                          <span>Разблокировано</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ranks">
            <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{currentRank.icon}</div>
                <h2 className="pixel-font text-2xl text-primary mb-1">{currentRank.name}</h2>
                <p className="text-muted-foreground">Уровень {currentRank.level}</p>
              </div>

              {nextRank && (
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Опыт: {userXP} XP</span>
                    <span>До {nextRank.name}: {nextRank.requiredXP - userXP} XP</span>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                </div>
              )}

              {!nextRank && (
                <div className="text-center text-primary font-bold">
                  🎉 Максимальный ранг достигнут! 🎉
                </div>
              )}
            </Card>

            <div className="space-y-3">
              <h3 className="font-bold text-lg text-foreground">Все ранги</h3>
              {RANKS.map(rank => {
                const isUnlocked = userXP >= rank.requiredXP;
                const isCurrent = rank.level === currentRank.level;

                return (
                  <Card 
                    key={rank.level}
                    className={`p-4 ${
                      isCurrent 
                        ? 'bg-primary/20 border-primary' 
                        : isUnlocked
                        ? 'bg-card/70 border-primary/30'
                        : 'bg-muted/20 border-muted/30 opacity-60'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {rank.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{rank.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Уровень {rank.level} • {rank.requiredXP} XP
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="bg-primary px-3 py-1 rounded text-xs font-bold text-primary-foreground">
                          ТЕКУЩИЙ
                        </div>
                      )}
                      {isUnlocked && !isCurrent && (
                        <Icon name="Check" className="text-primary" size={24} />
                      )}
                      {!isUnlocked && (
                        <Icon name="Lock" className="text-muted-foreground" size={24} />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

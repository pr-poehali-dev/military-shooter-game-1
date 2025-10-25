import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Joystick } from '@/components/ui/joystick';
import Icon from '@/components/ui/icon';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';
import { MISSIONS, initializeGame, GameState, getMapBackground } from '@/lib/gameLogic';
import { soundManager } from '@/lib/soundManager';
import { toast } from 'sonner';

interface GameScreenProps {
  missionId: number;
  onBack: () => void;
}

export default function GameScreen({ missionId, onBack }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(missionId));
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickDirection, setJoystickDirection] = useState({ x: 0, y: 0 });
  const gameLoopRef = useRef<number>();
  const user = getCurrentUser();
  const mission = MISSIONS[missionId - 1];

  useEffect(() => {
    const gameLoop = () => {
      setGameState(prev => {
        if (prev.isGameOver || prev.isVictory) return prev;

        const newState = { ...prev };

        if (joystickActive) {
          newState.playerX = Math.max(0, Math.min(750, prev.playerX + joystickDirection.x * 3));
          newState.playerY = Math.max(0, Math.min(450, prev.playerY + joystickDirection.y * 3));
        }

        newState.enemies = prev.enemies.map(enemy => {
          if (Math.random() < 0.02) {
            const dx = prev.playerX - enemy.x;
            const dy = prev.playerY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 300) {
              return {
                ...enemy,
                x: enemy.x + (dx / dist) * 1.5,
                y: enemy.y + (dy / dist) * 1.5
              };
            }
          }
          return enemy;
        });

        const hitByEnemy = newState.enemies.some(enemy => {
          const dist = Math.sqrt(
            Math.pow(enemy.x - newState.playerX, 2) + 
            Math.pow(enemy.y - newState.playerY, 2)
          );
          return dist < 30;
        });

        if (hitByEnemy && Math.random() < 0.05) {
          newState.playerHealth = Math.max(0, newState.playerHealth - 10);
          soundManager.playHit();
          if (newState.playerHealth <= 0) {
            newState.isGameOver = true;
            soundManager.playDefeat();
            toast.error('Миссия провалена!');
          }
        }

        if (newState.bombCooldown > 0) {
          newState.bombCooldown--;
        }

        if (newState.enemies.length === 0 && !newState.isVictory) {
          newState.isVictory = true;
          soundManager.playVictory();
          if (user) {
            const newMissionsCompleted = Math.max(user.missionsCompleted, missionId);
            const newBalance = user.balance + mission.reward;
            const newStatus = newMissionsCompleted === 6 ? 'Ветеран войны 🎖️' : user.status;
            updateCurrentUser({
              missionsCompleted: newMissionsCompleted,
              balance: newBalance,
              status: newStatus
            });
            toast.success(`Миссия выполнена! +${mission.reward} ₽`);
          }
        }

        return newState;
      });
    };

    gameLoopRef.current = window.setInterval(gameLoop, 50);
    return () => clearInterval(gameLoopRef.current);
  }, [joystickActive, joystickDirection, missionId, mission.reward, user]);

  const handleBomb = () => {
    if (gameState.bombCooldown > 0) {
      toast.error(`Перезарядка: ${(gameState.bombCooldown / 20).toFixed(1)}с`);
      return;
    }

    setGameState(prev => {
      const newEnemies = prev.enemies.filter(enemy => {
        const dist = Math.sqrt(
          Math.pow(enemy.x - prev.playerX, 2) + 
          Math.pow(enemy.y - prev.playerY, 2)
        );
        if (dist < 150) {
          const newHealth = enemy.health - 1;
          if (newHealth <= 0) {
            return false;
          }
          enemy.health = newHealth;
        }
        return true;
      });

      const killedCount = prev.enemies.length - newEnemies.length;
      
      return {
        ...prev,
        enemies: newEnemies,
        bombCooldown: 100,
        kills: prev.kills + killedCount
      };
    });

    soundManager.playExplosion();
    toast.success('💥 Бомбовый удар!');
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left - centerX) / centerX;
    const y = (clientY - rect.top - centerY) / centerY;
    
    setJoystickDirection({ x, y });
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getMapBackground(mission.mapTheme)} p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-primary/50 bg-black/50"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="pixel-font text-white text-sm md:text-base">
            {mission.name}
          </div>
          <div className="flex gap-2">
            <div className="bg-black/50 px-3 py-1 rounded text-white">
              ❤️ {gameState.playerHealth}
            </div>
            <div className="bg-black/50 px-3 py-1 rounded text-white">
              💀 {gameState.kills}/{mission.enemies}
            </div>
          </div>
        </div>

        <Card className="relative bg-black/30 backdrop-blur-sm border-primary/50 overflow-hidden" 
              style={{ height: '500px' }}>
          
          <div className="absolute inset-0">
            <div 
              className="absolute w-8 h-8 bg-primary rounded-sm transition-all duration-100 z-10"
              style={{ 
                left: `${gameState.playerX}px`, 
                top: `${gameState.playerY}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="pixel-font text-xs text-white text-center leading-8">🎖️</div>
            </div>

            {gameState.enemies.map(enemy => (
              <div
                key={enemy.id}
                className={`absolute ${enemy.type === 'tank' ? 'w-12 h-12' : 'w-8 h-8'} transition-all duration-200`}
                style={{ 
                  left: `${enemy.x}px`, 
                  top: `${enemy.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-center">
                  {enemy.type === 'tank' ? '🛡️' : '👤'}
                  {enemy.health > 1 && (
                    <div className="text-xs text-red-500 font-bold">❤️{enemy.health}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {gameState.isVictory && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="text-center">
                <h2 className="pixel-font text-3xl text-green-400 mb-4">ПОБЕДА!</h2>
                <p className="text-white mb-4">Награда: +{mission.reward} ₽</p>
                {missionId === 6 && (
                  <p className="pixel-font text-yellow-400 text-xl mb-4">
                    🎖️ ВЕТЕРАН ВОЙНЫ 🎖️
                  </p>
                )}
                <Button onClick={onBack} className="bg-primary">
                  Вернуться
                </Button>
              </div>
            </div>
          )}

          {gameState.isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="text-center">
                <h2 className="pixel-font text-3xl text-red-500 mb-4">ПОРАЖЕНИЕ</h2>
                <p className="text-white mb-4">Попробуйте ещё раз</p>
                <Button onClick={onBack} className="bg-accent">
                  Вернуться
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Joystick
            onMove={(x, y) => {
              setJoystickActive(x !== 0 || y !== 0);
              setJoystickDirection({ x, y });
            }}
            size={150}
            className="mx-auto"
          />

          <Button
            onClick={handleBomb}
            disabled={gameState.bombCooldown > 0}
            className="bg-accent/80 hover:bg-accent aspect-square max-w-[150px] mx-auto rounded-full text-3xl disabled:opacity-50"
          >
            {gameState.bombCooldown > 0 ? (
              <span className="text-sm">{(gameState.bombCooldown / 20).toFixed(1)}s</span>
            ) : (
              '💣'
            )}
          </Button>
        </div>

        <div className="mt-4 text-center text-white/70 text-sm">
          💡 Двойной клик на бомбу = авиаудар • Джойстик = движение
        </div>
      </div>
    </div>
  );
}
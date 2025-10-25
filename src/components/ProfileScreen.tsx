import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/auth';

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const user = getCurrentUser();
  
  if (!user) return null;

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">ПРОФИЛЬ</h1>
        </div>

        <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-primary/30">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-primary/20 rounded-lg flex items-center justify-center border-2 border-primary">
                <Icon name="User" size={64} className="text-primary" />
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                <p className="text-lg text-muted-foreground">{user.status}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Hash" size={18} className="text-primary" />
                    <span className="text-sm text-muted-foreground">ID игрока</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{user.id}</p>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Coins" size={18} className="text-primary" />
                    <span className="text-sm text-muted-foreground">Баланс</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{user.balance.toLocaleString()} ₽</p>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Gem" size={18} className="text-accent" />
                    <span className="text-sm text-muted-foreground">Донат баланс</span>
                  </div>
                  <p className="text-xl font-bold text-accent">{user.donatBalance.toLocaleString()} 💎</p>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Target" size={18} className="text-primary" />
                    <span className="text-sm text-muted-foreground">Миссии пройдено</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{user.missionsCompleted} / 6</p>
                </div>
              </div>

              {user.missionsCompleted === 6 && (
                <div className="bg-accent/20 border-2 border-accent p-4 rounded text-center">
                  <p className="pixel-font text-accent">🎖️ ВЕТЕРАН ВОЙНЫ 🎖️</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card/60 border-primary/30 text-center">
            <Icon name="Trophy" size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground mb-1">Рейтинг</p>
            <p className="text-xl font-bold text-foreground">1250</p>
          </Card>

          <Card className="p-4 bg-card/60 border-primary/30 text-center">
            <Icon name="Crosshair" size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground mb-1">Побед</p>
            <p className="text-xl font-bold text-foreground">42</p>
          </Card>

          <Card className="p-4 bg-card/60 border-primary/30 text-center">
            <Icon name="Skull" size={32} className="mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground mb-1">Врагов</p>
            <p className="text-xl font-bold text-foreground">389</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

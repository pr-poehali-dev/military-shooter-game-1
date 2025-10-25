import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { getCurrentUser, getAllUsers, getUserById, getUserByName } from '@/lib/auth';
import { toast } from 'sonner';

interface AdminScreenProps {
  onBack: () => void;
}

export default function AdminScreen({ onBack }: AdminScreenProps) {
  const [targetPlayer, setTargetPlayer] = useState('');
  const [amount, setAmount] = useState('');
  const [isDonation, setIsDonation] = useState(false);
  const user = getCurrentUser();

  if (!user || !user.isAdmin) {
    return null;
  }

  const handleGiveBalance = () => {
    if (!targetPlayer || !amount) {
      toast.error('Заполните все поля');
      return;
    }

    const targetUser = getUserByName(targetPlayer) || getUserById(targetPlayer);
    
    if (!targetUser) {
      toast.error('Игрок не найден');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Некорректная сумма');
      return;
    }

    const users = getAllUsers();
    const targetIndex = users.findIndex(u => u.id === targetUser.id);

    if (isDonation) {
      users[targetIndex].donatBalance += amountNum;
    } else {
      users[targetIndex].balance += amountNum;
    }

    localStorage.setItem('users', JSON.stringify(users));
    
    toast.success(
      `Выдано ${amountNum} ${isDonation ? '💎' : '₽'} игроку ${targetUser.name}`
    );
    
    setTargetPlayer('');
    setAmount('');
  };

  const allUsers = getAllUsers();

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
          <h1 className="pixel-font text-2xl md:text-3xl text-accent">АДМИН ПАНЕЛЬ</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/50">
            <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <Icon name="Gift" className="text-accent" />
              Выдать баланс
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  ID или имя игрока
                </label>
                <Input
                  placeholder="dev или plutka"
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Сумма
                </label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsDonation(false)}
                  variant={!isDonation ? 'default' : 'outline'}
                  className={!isDonation ? 'bg-primary' : ''}
                >
                  <Icon name="Coins" size={16} className="mr-2" />
                  Обычный баланс
                </Button>
                <Button
                  onClick={() => setIsDonation(true)}
                  variant={isDonation ? 'default' : 'outline'}
                  className={isDonation ? 'bg-accent' : ''}
                >
                  <Icon name="Gem" size={16} className="mr-2" />
                  Донат баланс
                </Button>
              </div>

              <Button 
                onClick={handleGiveBalance}
                className="w-full bg-accent hover:bg-accent/80"
              >
                <Icon name="Send" size={20} className="mr-2" />
                Выдать баланс
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
            <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <Icon name="Users" className="text-primary" />
              Все игроки ({allUsers.length})
            </h2>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allUsers.map((player) => (
                <div 
                  key={player.id} 
                  className="p-3 bg-muted/30 rounded border border-border"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {player.id}</p>
                    </div>
                    <div className="flex gap-2">
                      {player.isAdmin && (
                        <span className="text-xs bg-accent/30 text-accent px-2 py-1 rounded">
                          ADMIN
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        player.isOnline 
                          ? 'bg-green-500/30 text-green-300' 
                          : 'bg-gray-500/30 text-gray-400'
                      }`}>
                        {player.isOnline ? 'Онлайн' : 'Оффлайн'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Баланс: {player.balance.toLocaleString()} ₽ | 
                    Донат: {player.donatBalance.toLocaleString()} 💎 | 
                    Миссий: {player.missionsCompleted}/6
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6 bg-card/80 backdrop-blur-sm border-accent/30">
          <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
            <Icon name="BarChart" className="text-accent" />
            Статистика сервера
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{allUsers.length}</p>
              <p className="text-sm text-muted-foreground">Всего игроков</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {allUsers.filter(u => u.isOnline).length}
              </p>
              <p className="text-sm text-muted-foreground">Онлайн</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {allUsers.filter(u => u.missionsCompleted === 6).length}
              </p>
              <p className="text-sm text-muted-foreground">Ветеранов</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {allUsers.filter(u => u.isAdmin).length}
              </p>
              <p className="text-sm text-muted-foreground">Админов</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

interface ShopScreenProps {
  onBack: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  price: number;
  isDonation: boolean;
  icon: string;
  description: string;
}

const weapons: ShopItem[] = [
  { id: 'ak47', name: 'AK-47', price: 5000, isDonation: false, icon: '🔫', description: 'Классический автомат' },
  { id: 'sniper', name: 'Снайперская винтовка', price: 8000, isDonation: false, icon: '🎯', description: 'Дальнобойное оружие' },
  { id: 'rpg', name: 'РПГ-7', price: 15000, isDonation: false, icon: '🚀', description: 'Гранатомёт' },
  { id: 'golden_ak', name: 'Золотой AK-47', price: 500, isDonation: true, icon: '✨', description: 'Эксклюзивное оружие' },
];

const tanks: ShopItem[] = [
  { id: 't34', name: 'Т-34', price: 25000, isDonation: false, icon: '🛡️', description: 'Средний танк' },
  { id: 'tiger', name: 'Tiger', price: 35000, isDonation: false, icon: '🐯', description: 'Тяжёлый танк' },
  { id: 'modern', name: 'Современный танк', price: 1000, isDonation: true, icon: '⚡', description: 'Топовый танк' },
];

const vehicles: ShopItem[] = [
  { id: 'jeep', name: 'Военный джип', price: 8000, isDonation: false, icon: '🚙', description: 'Быстрая машина' },
  { id: 'truck', name: 'Грузовик', price: 12000, isDonation: false, icon: '🚚', description: 'Вместительный транспорт' },
  { id: 'helicopter', name: 'Вертолёт', price: 2000, isDonation: true, icon: '🚁', description: 'Воздушный транспорт' },
];

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const user = getCurrentUser();
  
  if (!user) return null;

  const handlePurchase = (item: ShopItem) => {
    const hasEnough = item.isDonation 
      ? user.donatBalance >= item.price 
      : user.balance >= item.price;

    if (!hasEnough) {
      toast.error('Недостаточно средств');
      return;
    }

    if (item.isDonation) {
      updateCurrentUser({ donatBalance: user.donatBalance - item.price });
    } else {
      updateCurrentUser({ balance: user.balance - item.price });
    }

    toast.success(`Куплено: ${item.name}`);
    setTimeout(() => window.location.reload(), 500);
  };

  const ShopItemCard = ({ item }: { item: ShopItem }) => (
    <Card className="p-4 bg-card/70 border-primary/30 hover:border-primary/60 transition-all">
      <div className="text-4xl mb-3 text-center">{item.icon}</div>
      <h3 className="font-bold text-foreground mb-2">{item.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
      <div className="flex items-center justify-between">
        <span className={`font-bold ${item.isDonation ? 'text-accent' : 'text-primary'}`}>
          {item.price.toLocaleString()} {item.isDonation ? '💎' : '₽'}
        </span>
        <Button 
          size="sm"
          onClick={() => handlePurchase(item)}
          className={item.isDonation ? 'bg-accent hover:bg-accent/80' : 'bg-primary hover:bg-primary/80'}
        >
          Купить
        </Button>
      </div>
    </Card>
  );

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">МАГАЗИН</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-card/80 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Coins" size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">Баланс</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{user.balance.toLocaleString()} ₽</p>
          </Card>
          <Card className="p-4 bg-card/80 border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Gem" size={20} className="text-accent" />
              <span className="text-sm text-muted-foreground">Донат</span>
            </div>
            <p className="text-2xl font-bold text-accent">{user.donatBalance.toLocaleString()} 💎</p>
          </Card>
        </div>

        <Tabs defaultValue="weapons" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weapons">Оружие</TabsTrigger>
            <TabsTrigger value="tanks">Танки</TabsTrigger>
            <TabsTrigger value="vehicles">Машины</TabsTrigger>
          </TabsList>

          <TabsContent value="weapons">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weapons.map(item => <ShopItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="tanks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tanks.map(item => <ShopItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="vehicles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(item => <ShopItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

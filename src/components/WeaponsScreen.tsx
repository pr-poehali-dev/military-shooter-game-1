import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/auth';

interface WeaponsScreenProps {
  onBack: () => void;
}

interface Weapon {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'melee';
  damage: number;
  rateOfFire: number;
  icon: string;
  owned: boolean;
}

interface Loadout {
  primary: string | null;
  secondary: string | null;
  melee: string | null;
}

const AVAILABLE_WEAPONS: Weapon[] = [
  { id: 'ak47', name: 'AK-47', type: 'primary', damage: 35, rateOfFire: 600, icon: '🔫', owned: true },
  { id: 'm4a1', name: 'M4A1', type: 'primary', damage: 30, rateOfFire: 750, icon: '🔫', owned: true },
  { id: 'sniper', name: 'AWP', type: 'primary', damage: 100, rateOfFire: 50, icon: '🎯', owned: false },
  { id: 'shotgun', name: 'Дробовик', type: 'primary', damage: 80, rateOfFire: 100, icon: '💥', owned: true },
  { id: 'smg', name: 'MP5', type: 'primary', damage: 25, rateOfFire: 900, icon: '🔫', owned: true },
  
  { id: 'pistol', name: 'Пистолет', type: 'secondary', damage: 20, rateOfFire: 300, icon: '🔫', owned: true },
  { id: 'deagle', name: 'Desert Eagle', type: 'secondary', damage: 50, rateOfFire: 200, icon: '🔫', owned: false },
  { id: 'revolver', name: 'Револьвер', type: 'secondary', damage: 45, rateOfFire: 150, icon: '🔫', owned: true },
  
  { id: 'knife', name: 'Нож', type: 'melee', damage: 50, rateOfFire: 0, icon: '🔪', owned: true },
  { id: 'axe', name: 'Топор', type: 'melee', damage: 75, rateOfFire: 0, icon: '🪓', owned: false },
  { id: 'bat', name: 'Бита', type: 'melee', damage: 60, rateOfFire: 0, icon: '⚾', owned: true },
];

export default function WeaponsScreen({ onBack }: WeaponsScreenProps) {
  const [loadout, setLoadout] = useState<Loadout>(() => {
    const saved = localStorage.getItem('playerLoadout');
    return saved ? JSON.parse(saved) : { primary: 'ak47', secondary: 'pistol', melee: 'knife' };
  });
  const user = getCurrentUser();

  useEffect(() => {
    localStorage.setItem('playerLoadout', JSON.stringify(loadout));
  }, [loadout]);

  if (!user) return null;

  const equipWeapon = (weaponId: string, type: 'primary' | 'secondary' | 'melee') => {
    setLoadout(prev => ({
      ...prev,
      [type]: weaponId
    }));
  };

  const getWeapon = (id: string | null) => 
    AVAILABLE_WEAPONS.find(w => w.id === id);

  const WeaponCard = ({ weapon }: { weapon: Weapon }) => {
    const isEquipped = 
      loadout.primary === weapon.id || 
      loadout.secondary === weapon.id || 
      loadout.melee === weapon.id;

    return (
      <Card className={`p-4 ${
        isEquipped 
          ? 'bg-primary/20 border-primary' 
          : weapon.owned 
          ? 'bg-card/70 border-primary/30' 
          : 'bg-muted/20 border-muted/30 opacity-60'
      } hover:border-primary/60 transition-all`}>
        <div className="text-4xl mb-3 text-center">{weapon.icon}</div>
        <h3 className="font-bold text-foreground mb-1">{weapon.name}</h3>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Урон</span>
            <span className="text-foreground font-semibold">{weapon.damage}</span>
          </div>
          {weapon.type !== 'melee' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Скорострельность</span>
              <span className="text-foreground font-semibold">{weapon.rateOfFire}</span>
            </div>
          )}
        </div>
        {weapon.owned ? (
          <Button 
            onClick={() => equipWeapon(weapon.id, weapon.type)}
            disabled={isEquipped}
            className={isEquipped ? 'bg-primary' : 'bg-primary/70 hover:bg-primary'}
            size="sm"
          >
            {isEquipped ? (
              <>
                <Icon name="Check" size={16} className="mr-1" />
                Экипировано
              </>
            ) : (
              'Экипировать'
            )}
          </Button>
        ) : (
          <Button 
            variant="outline"
            size="sm"
            className="border-muted"
            disabled
          >
            <Icon name="Lock" size={16} className="mr-1" />
            Заблокировано
          </Button>
        )}
      </Card>
    );
  };

  const currentPrimary = getWeapon(loadout.primary);
  const currentSecondary = getWeapon(loadout.secondary);
  const currentMelee = getWeapon(loadout.melee);

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">ОРУЖИЕ</h1>
        </div>

        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
          <h2 className="font-bold text-xl mb-4 text-foreground">Текущая экипировка</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Crosshair" size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Основное оружие</span>
              </div>
              {currentPrimary ? (
                <div>
                  <p className="text-3xl mb-1">{currentPrimary.icon}</p>
                  <p className="font-bold text-foreground">{currentPrimary.name}</p>
                  <p className="text-sm text-muted-foreground">Урон: {currentPrimary.damage}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Не выбрано</p>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Target" size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Дополнительное</span>
              </div>
              {currentSecondary ? (
                <div>
                  <p className="text-3xl mb-1">{currentSecondary.icon}</p>
                  <p className="font-bold text-foreground">{currentSecondary.name}</p>
                  <p className="text-sm text-muted-foreground">Урон: {currentSecondary.damage}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Не выбрано</p>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sword" size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Ближний бой</span>
              </div>
              {currentMelee ? (
                <div>
                  <p className="text-3xl mb-1">{currentMelee.icon}</p>
                  <p className="font-bold text-foreground">{currentMelee.name}</p>
                  <p className="text-sm text-muted-foreground">Урон: {currentMelee.damage}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Не выбрано</p>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="primary">Основное</TabsTrigger>
            <TabsTrigger value="secondary">Доп. оружие</TabsTrigger>
            <TabsTrigger value="melee">Ближний бой</TabsTrigger>
          </TabsList>

          <TabsContent value="primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_WEAPONS.filter(w => w.type === 'primary').map(weapon => (
                <WeaponCard key={weapon.id} weapon={weapon} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="secondary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_WEAPONS.filter(w => w.type === 'secondary').map(weapon => (
                <WeaponCard key={weapon.id} weapon={weapon} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="melee">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_WEAPONS.filter(w => w.type === 'melee').map(weapon => (
                <WeaponCard key={weapon.id} weapon={weapon} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

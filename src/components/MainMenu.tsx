import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import ProfileScreen from './ProfileScreen';
import FriendsScreen from './FriendsScreen';
import ShopScreen from './ShopScreen';
import ChatScreen from './ChatScreen';
import AdminScreen from './AdminScreen';

type MenuScreen = 'main' | 'profile' | 'friends' | 'weapons' | 'multiplayer' | 'shop' | 'admin' | 'play' | 'chat';

interface MainMenuProps {
  onLogout: () => void;
}

export default function MainMenu({ onLogout }: MainMenuProps) {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [notifications, setNotifications] = useState(0);
  const user = getCurrentUser();

  if (!user) return null;

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const menuItems = [
    { id: 'profile' as MenuScreen, label: 'Профиль', icon: 'User' },
    { id: 'friends' as MenuScreen, label: 'Друзья', icon: 'Users' },
    { id: 'weapons' as MenuScreen, label: 'Оружие', icon: 'Swords' },
    { id: 'multiplayer' as MenuScreen, label: 'Мультиплеер', icon: 'Gamepad2' },
    { id: 'shop' as MenuScreen, label: 'Магазин', icon: 'ShoppingCart' },
    ...(user.isAdmin ? [{ id: 'admin' as MenuScreen, label: 'Админ меню', icon: 'Shield' }] : []),
    { id: 'play' as MenuScreen, label: 'Играть', icon: 'Play' },
    { id: 'chat' as MenuScreen, label: 'Чат', icon: 'MessageCircle' },
  ];

  if (currentScreen === 'profile') {
    return <ProfileScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'friends') {
    return <FriendsScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'shop') {
    return <ShopScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'chat') {
    return <ChatScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'admin' && user.isAdmin) {
    return <AdminScreen onBack={() => setCurrentScreen('main')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 p-4 bg-card/50 backdrop-blur-sm border border-primary/30 rounded">
          <h1 className="pixel-font text-3xl md:text-5xl text-primary">WZ</h1>
          <div className="flex items-center gap-4">
            {notifications > 0 && (
              <div className="relative">
                <Icon name="Bell" className="text-accent" size={24} />
                <span className="absolute -top-2 -right-2 bg-accent text-xs pixel-font px-2 py-1 rounded">
                  {notifications}
                </span>
              </div>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-primary/50 hover:bg-primary/20"
            >
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className="h-32 flex flex-col items-center justify-center gap-3 bg-card/70 hover:bg-card border-2 border-primary/30 hover:border-primary/60 transition-all group"
            >
              <Icon 
                name={item.icon as any} 
                size={40} 
                className="text-primary group-hover:scale-110 transition-transform"
              />
              <span className="pixel-font text-sm md:text-base text-foreground">
                {item.label}
              </span>
            </Button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm border border-primary/30 rounded text-center">
          <p className="text-muted-foreground mb-2">♫ Вайбовая военная музыка играет ♫</p>
          <p className="text-xs text-muted-foreground">
            Добро пожаловать в War Zone, {user.name}!
          </p>
        </div>
      </div>
    </div>
  );
}

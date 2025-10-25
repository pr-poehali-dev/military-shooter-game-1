import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { getCurrentUser, updateCurrentUser, getAllUsers, getUserById, getUserByName } from '@/lib/auth';
import { toast } from 'sonner';

interface FriendsScreenProps {
  onBack: () => void;
}

export default function FriendsScreen({ onBack }: FriendsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const user = getCurrentUser();
  
  if (!user) return null;

  const friends = user.friends
    .map(id => getUserById(id))
    .filter(f => f !== null);

  const friendRequests = user.friendRequests
    .map(id => getUserById(id))
    .filter(f => f !== null);

  const handleSendRequest = () => {
    const targetUser = getUserByName(searchQuery) || getUserById(searchQuery);
    
    if (!targetUser) {
      toast.error('Игрок не найден');
      return;
    }

    if (targetUser.id === user.id) {
      toast.error('Нельзя добавить самого себя');
      return;
    }

    if (user.friends.includes(targetUser.id)) {
      toast.error('Уже в друзьях');
      return;
    }

    const users = getAllUsers();
    const targetIndex = users.findIndex(u => u.id === targetUser.id);
    
    if (!users[targetIndex].friendRequests.includes(user.id)) {
      users[targetIndex].friendRequests.push(user.id);
      localStorage.setItem('users', JSON.stringify(users));
      toast.success(`Заявка отправлена игроку ${targetUser.name}`);
      setSearchQuery('');
    } else {
      toast.error('Заявка уже отправлена');
    }
  };

  const handleAcceptRequest = (friendId: string) => {
    const users = getAllUsers();
    const currentUserIndex = users.findIndex(u => u.id === user.id);
    const friendIndex = users.findIndex(u => u.id === friendId);

    users[currentUserIndex].friends.push(friendId);
    users[currentUserIndex].friendRequests = users[currentUserIndex].friendRequests.filter(id => id !== friendId);
    users[friendIndex].friends.push(user.id);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[currentUserIndex]));
    
    toast.success('Заявка принята!');
    window.location.reload();
  };

  const handleRejectRequest = (friendId: string) => {
    const users = getAllUsers();
    const currentUserIndex = users.findIndex(u => u.id === user.id);
    
    users[currentUserIndex].friendRequests = users[currentUserIndex].friendRequests.filter(id => id !== friendId);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[currentUserIndex]));
    
    toast.success('Заявка отклонена');
    window.location.reload();
  };

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">ДРУЗЬЯ</h1>
        </div>

        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
          <h3 className="font-bold text-lg mb-4 text-foreground">Найти друга</h3>
          <div className="flex gap-2">
            <Input
              placeholder="ID или имя игрока"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input border-border"
            />
            <Button 
              onClick={handleSendRequest}
              className="bg-primary hover:bg-primary/80"
            >
              <Icon name="UserPlus" size={20} />
            </Button>
          </div>
        </Card>

        {friendRequests.length > 0 && (
          <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-accent/50">
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
              <Icon name="Bell" className="text-accent" size={20} />
              Заявки в друзья ({friendRequests.length})
            </h3>
            <div className="space-y-3">
              {friendRequests.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {friend.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptRequest(friend.id)}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRejectRequest(friend.id)}
                      className="border-accent/50 hover:bg-accent/20"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
          <h3 className="font-bold text-lg mb-4 text-foreground">
            Мои друзья ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              У вас пока нет друзей. Найдите игроков выше!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center relative">
                      <Icon name="User" size={20} className="text-primary" />
                      {friend.isOnline && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {friend.isOnline ? '🟢 Онлайн' : '⚫ Оффлайн'}
                      </p>
                    </div>
                  </div>
                  {friend.isOnline && (
                    <Button 
                      size="sm"
                      className="bg-accent hover:bg-accent/80"
                    >
                      <Icon name="Swords" size={16} className="mr-2" />
                      На бой
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

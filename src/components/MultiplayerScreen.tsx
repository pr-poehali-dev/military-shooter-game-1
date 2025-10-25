import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { getCurrentUser, getAllUsers, getUserById, getUserByName } from '@/lib/auth';
import { toast } from 'sonner';

interface MultiplayerScreenProps {
  onBack: () => void;
}

interface Lobby {
  id: string;
  hostId: string;
  hostName: string;
  mode: '2v2';
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'playing';
}

export default function MultiplayerScreen({ onBack }: MultiplayerScreenProps) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const storedLobbies = localStorage.getItem('multiplayerLobbies');
    if (storedLobbies) {
      setLobbies(JSON.parse(storedLobbies));
    }
  }, []);

  if (!user) return null;

  const createLobby = () => {
    const newLobby: Lobby = {
      id: Math.random().toString(36).substr(2, 9),
      hostId: user.id,
      hostName: user.name,
      mode: '2v2',
      players: [user.id],
      maxPlayers: 4,
      status: 'waiting'
    };

    const updatedLobbies = [...lobbies, newLobby];
    setLobbies(updatedLobbies);
    localStorage.setItem('multiplayerLobbies', JSON.stringify(updatedLobbies));
    toast.success('Лобби создано!');
  };

  const joinLobby = (lobbyId: string) => {
    const updatedLobbies = lobbies.map(lobby => {
      if (lobby.id === lobbyId && lobby.players.length < lobby.maxPlayers) {
        if (!lobby.players.includes(user.id)) {
          lobby.players.push(user.id);
          toast.success(`Вы присоединились к лобби ${lobby.hostName}`);
        }
      }
      return lobby;
    });
    setLobbies(updatedLobbies);
    localStorage.setItem('multiplayerLobbies', JSON.stringify(updatedLobbies));
  };

  const leaveLobby = (lobbyId: string) => {
    const updatedLobbies = lobbies.map(lobby => {
      if (lobby.id === lobbyId) {
        lobby.players = lobby.players.filter(id => id !== user.id);
      }
      return lobby;
    }).filter(lobby => lobby.players.length > 0);

    setLobbies(updatedLobbies);
    localStorage.setItem('multiplayerLobbies', JSON.stringify(updatedLobbies));
    toast.success('Вы покинули лобби');
  };

  const invitePlayer = () => {
    const targetUser = getUserByName(searchQuery) || getUserById(searchQuery);
    
    if (!targetUser) {
      toast.error('Игрок не найден');
      return;
    }

    if (!targetUser.isOnline) {
      toast.error('Игрок оффлайн');
      return;
    }

    toast.success(`Приглашение отправлено игроку ${targetUser.name}`);
    setSearchQuery('');
  };

  const findMatch = () => {
    setSearching(true);
    toast.info('Поиск противников...');
    
    setTimeout(() => {
      setSearching(false);
      toast.success('Матч найден! 2v2');
    }, 3000);
  };

  const userLobby = lobbies.find(l => l.players.includes(user.id));

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">МУЛЬТИПЛЕЕР</h1>
        </div>

        <Tabs defaultValue="quickplay" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="quickplay">Быстрая игра</TabsTrigger>
            <TabsTrigger value="lobbies">Лобби</TabsTrigger>
            <TabsTrigger value="invite">Пригласить</TabsTrigger>
          </TabsList>

          <TabsContent value="quickplay">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/30 text-center">
              <Icon name="Crosshair" size={64} className="mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">Найти матч 2v2</h2>
              <p className="text-muted-foreground mb-6">
                Автоматический поиск противников для командного боя
              </p>
              <Button 
                onClick={findMatch}
                disabled={searching}
                className="bg-accent hover:bg-accent/80 text-lg px-8 py-6"
              >
                {searching ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={24} />
                    Поиск игры...
                  </>
                ) : (
                  <>
                    <Icon name="Search" className="mr-2" size={24} />
                    Найти матч
                  </>
                )}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="lobbies">
            <div className="space-y-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-foreground">Создать лобби</h3>
                  <Button 
                    onClick={createLobby}
                    disabled={!!userLobby}
                    className="bg-primary hover:bg-primary/80"
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Создать
                  </Button>
                </div>
              </Card>

              {userLobby && (
                <Card className="p-6 bg-accent/10 border-accent/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-foreground">
                      Ваше лобби {userLobby.hostId === user.id && '(Хост)'}
                    </h3>
                    <Button 
                      onClick={() => leaveLobby(userLobby.id)}
                      variant="outline"
                      size="sm"
                      className="border-accent/50"
                    >
                      Покинуть
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {userLobby.players.map((playerId, idx) => {
                      const player = getUserById(playerId);
                      return (
                        <div key={idx} className="bg-muted/30 p-3 rounded text-center">
                          <Icon name="User" size={24} className="mx-auto mb-1 text-primary" />
                          <p className="text-sm font-semibold text-foreground">
                            {player?.name || 'Игрок'}
                          </p>
                        </div>
                      );
                    })}
                    {Array.from({ length: userLobby.maxPlayers - userLobby.players.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-muted/10 p-3 rounded text-center border-2 border-dashed border-muted">
                        <Icon name="UserPlus" size={24} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Ждём...</p>
                      </div>
                    ))}
                  </div>
                  {userLobby.players.length === userLobby.maxPlayers && userLobby.hostId === user.id && (
                    <Button className="w-full mt-4 bg-accent hover:bg-accent/80">
                      <Icon name="Play" size={20} className="mr-2" />
                      Начать игру
                    </Button>
                  )}
                </Card>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground">Доступные лобби</h3>
                {lobbies.filter(l => !l.players.includes(user.id) && l.status === 'waiting').length === 0 ? (
                  <Card className="p-8 bg-card/50 text-center">
                    <p className="text-muted-foreground">Нет доступных лобби</p>
                  </Card>
                ) : (
                  lobbies
                    .filter(l => !l.players.includes(user.id) && l.status === 'waiting')
                    .map(lobby => (
                      <Card key={lobby.id} className="p-4 bg-card/70 border-primary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{lobby.hostName}</p>
                            <p className="text-sm text-muted-foreground">
                              {lobby.players.length}/{lobby.maxPlayers} игроков • {lobby.mode}
                            </p>
                          </div>
                          <Button 
                            onClick={() => joinLobby(lobby.id)}
                            disabled={lobby.players.length >= lobby.maxPlayers}
                            size="sm"
                            className="bg-primary hover:bg-primary/80"
                          >
                            Присоединиться
                          </Button>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invite">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
              <h3 className="font-bold text-lg mb-4 text-foreground">
                Пригласить друга
              </h3>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="ID или имя игрока"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input border-border"
                />
                <Button 
                  onClick={invitePlayer}
                  className="bg-primary hover:bg-primary/80"
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground mb-2">Онлайн друзья</h4>
                {user.friends.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Нет друзей онлайн</p>
                ) : (
                  getAllUsers()
                    .filter(u => user.friends.includes(u.id) && u.isOnline)
                    .map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-foreground">{friend.name}</span>
                        </div>
                        <Button size="sm" className="bg-accent hover:bg-accent/80">
                          <Icon name="Swords" size={16} className="mr-1" />
                          Пригласить
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

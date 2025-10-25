import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/auth';

interface ChatScreenProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export default function ChatScreen({ onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      message: inputMessage,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setInputMessage('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

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
          <h1 className="pixel-font text-2xl md:text-3xl text-primary">ГЛОБАЛЬНЫЙ ЧАТ</h1>
        </div>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30 h-[calc(100vh-200px)] flex flex-col">
          <ScrollArea className="flex-grow mb-4 pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Пока нет сообщений. Начните общение!
                </p>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg ${
                      msg.userId === user.id 
                        ? 'bg-primary/20 ml-8' 
                        : 'bg-muted/30 mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">
                        {msg.userName}
                      </span>
                      {msg.userId === 'dev' && (
                        <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-foreground">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-input border-border"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/80"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

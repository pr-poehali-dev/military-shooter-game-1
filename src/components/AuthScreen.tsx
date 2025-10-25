import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { loginUser, registerUser, initializeStorage } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useState(() => {
    initializeStorage();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const user = loginUser(email, password);
      if (user) {
        toast.success(`Добро пожаловать, ${user.name}!`);
        onLogin();
      } else {
        toast.error('Неверные данные для входа');
      }
    } else {
      if (!name || !email || !password) {
        toast.error('Заполните все поля');
        return;
      }
      const user = registerUser(name, email, password);
      if (user) {
        toast.success(`Аккаунт создан! Добро пожаловать, ${user.name}!`);
        onLogin();
      } else {
        toast.error('Email уже используется');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-4">
      <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-sm border-primary/30">
        <div className="flex justify-center mb-8">
          <h1 className="pixel-font text-4xl text-primary">WZ</h1>
        </div>
        
        <h2 className="pixel-font text-xl text-center mb-6 text-foreground">
          {isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Input
                type="text"
                placeholder="Имя игрока"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}
          
          <div>
            <Input
              type="text"
              placeholder={isLogin ? "Email или логин" : "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
          >
            {isLogin ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { getCurrentUser, getAllUsers } from '@/lib/auth';
import { toast } from 'sonner';

interface SuperAdminScreenProps {
  onBack: () => void;
}

interface LogEntry {
  timestamp: number;
  type: 'info' | 'error' | 'warning' | 'success';
  message: string;
  user?: string;
}

export default function SuperAdminScreen({ onBack }: SuperAdminScreenProps) {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    const storedLogs = localStorage.getItem('systemLogs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const initialLogs: LogEntry[] = [
        { timestamp: Date.now() - 3600000, type: 'success', message: 'Сервер запущен', user: 'SYSTEM' },
        { timestamp: Date.now() - 1800000, type: 'info', message: 'Подключен новый игрок: plutka', user: 'plutka' },
        { timestamp: Date.now() - 900000, type: 'warning', message: 'Высокая нагрузка на сервер', user: 'SYSTEM' },
        { timestamp: Date.now() - 300000, type: 'info', message: 'Миссия #1 завершена', user: 'plutka' },
        { timestamp: Date.now() - 60000, type: 'success', message: 'Обновление базы данных завершено', user: 'SYSTEM' },
      ];
      localStorage.setItem('systemLogs', JSON.stringify(initialLogs));
      setLogs(initialLogs);
    }
  }, []);

  if (!user || !user.isAdmin) {
    return null;
  }

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      timestamp: Date.now(),
      type,
      message,
      user: user.name
    };
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    localStorage.setItem('systemLogs', JSON.stringify(updatedLogs));
  };

  const executeCode = (type: 'html' | 'css' | 'js') => {
    try {
      let code = '';
      switch (type) {
        case 'html':
          code = htmlCode;
          break;
        case 'css':
          code = cssCode;
          break;
        case 'js':
          code = jsCode;
          break;
      }

      if (!code.trim()) {
        toast.error('Код пустой');
        return;
      }

      addLog('success', `Выполнен ${type.toUpperCase()} код: ${code.substring(0, 50)}...`);
      toast.success(`${type.toUpperCase()} код выполнен!`);
      
      if (type === 'js') {
        try {
          eval(code);
        } catch (err) {
          addLog('error', `Ошибка выполнения JS: ${err}`);
          toast.error('Ошибка в JS коде');
        }
      }
    } catch (err) {
      addLog('error', `Ошибка: ${err}`);
      toast.error('Ошибка выполнения');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.setItem('systemLogs', JSON.stringify([]));
    toast.success('Логи очищены');
  };

  const resetAllData = () => {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
      localStorage.clear();
      addLog('warning', 'Выполнен сброс всех данных');
      toast.success('Все данные удалены. Перезагрузите страницу.');
    }
  };

  const exportData = () => {
    const data = {
      users: getAllUsers(),
      logs: logs,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warzone-backup-${Date.now()}.json`;
    a.click();
    addLog('info', 'Экспорт данных выполнен');
    toast.success('Данные экспортированы');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-accent/50 hover:bg-accent/20"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="pixel-font text-2xl md:text-3xl text-accent">СУПЕР АДМИН</h1>
          <div className="ml-auto flex gap-2">
            <Button 
              onClick={exportData}
              variant="outline"
              size="sm"
              className="border-primary/50"
            >
              <Icon name="Download" size={16} className="mr-1" />
              Экспорт
            </Button>
            <Button 
              onClick={resetAllData}
              variant="outline"
              size="sm"
              className="border-accent/50 text-accent"
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Сброс
            </Button>
          </div>
        </div>

        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="code">Код</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
            <TabsTrigger value="database">База данных</TabsTrigger>
            <TabsTrigger value="system">Система</TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Icon name="Code" size={18} className="text-accent" />
                    HTML
                  </h3>
                  <Button 
                    onClick={() => executeCode('html')}
                    size="sm"
                    className="bg-accent hover:bg-accent/80"
                  >
                    Выполнить
                  </Button>
                </div>
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<div>Введите HTML...</div>"
                  className="font-mono text-sm h-64 bg-muted/50"
                />
              </Card>

              <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Icon name="Palette" size={18} className="text-accent" />
                    CSS
                  </h3>
                  <Button 
                    onClick={() => executeCode('css')}
                    size="sm"
                    className="bg-accent hover:bg-accent/80"
                  >
                    Выполнить
                  </Button>
                </div>
                <Textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  placeholder=".class { color: red; }"
                  className="font-mono text-sm h-64 bg-muted/50"
                />
              </Card>

              <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Icon name="Braces" size={18} className="text-accent" />
                    JavaScript
                  </h3>
                  <Button 
                    onClick={() => executeCode('js')}
                    size="sm"
                    className="bg-accent hover:bg-accent/80"
                  >
                    Выполнить
                  </Button>
                </div>
                <Textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  placeholder="console.log('Hello');"
                  className="font-mono text-sm h-64 bg-muted/50"
                />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Icon name="FileText" className="text-accent" />
                  Системные логи ({logs.length})
                </h2>
                <Button 
                  onClick={clearLogs}
                  variant="outline"
                  size="sm"
                  className="border-accent/50"
                >
                  <Icon name="Trash2" size={16} className="mr-1" />
                  Очистить
                </Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Логи отсутствуют</p>
                  ) : (
                    logs.slice().reverse().map((log, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-muted/30 rounded border border-border font-mono text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getLogIcon(log.type)}</span>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${getLogColor(log.type)}`}>
                                [{log.type.toUpperCase()}]
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(log.timestamp)}
                              </span>
                              {log.user && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                  {log.user}
                                </span>
                              )}
                            </div>
                            <p className="text-foreground">{log.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/30">
              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Icon name="Database" className="text-accent" />
                База данных LocalStorage
              </h2>
              
              <div className="space-y-3">
                <div className="bg-muted/30 p-4 rounded">
                  <h3 className="font-semibold mb-2 text-foreground">Ключи в LocalStorage:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.keys(localStorage).map((key) => (
                      <div key={key} className="text-sm bg-card p-2 rounded border border-border">
                        <code className="text-primary">{key}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded">
                  <h3 className="font-semibold mb-2 text-foreground">Размер данных:</h3>
                  <p className="text-muted-foreground">
                    Использовано: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/30">
                <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                  <Icon name="Activity" className="text-accent" />
                  Статистика системы
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Всего игроков:</span>
                    <span className="font-bold text-foreground">{getAllUsers().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Онлайн:</span>
                    <span className="font-bold text-green-500">
                      {getAllUsers().filter(u => u.isOnline).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Записей в логах:</span>
                    <span className="font-bold text-foreground">{logs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Версия:</span>
                    <span className="font-bold text-primary">1.0.0</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/30">
                <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                  <Icon name="Settings" className="text-accent" />
                  Быстрые действия
                </h3>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      addLog('info', 'Тестовое событие добавлено');
                      toast.info('Тест выполнен');
                    }}
                    className="w-full justify-start bg-primary/20 hover:bg-primary/30"
                  >
                    <Icon name="TestTube" size={18} className="mr-2" />
                    Добавить тестовый лог
                  </Button>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(getAllUsers(), null, 2));
                      toast.success('JSON скопирован');
                    }}
                    className="w-full justify-start bg-primary/20 hover:bg-primary/30"
                  >
                    <Icon name="Copy" size={18} className="mr-2" />
                    Копировать данные игроков
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full justify-start bg-primary/20 hover:bg-primary/30"
                  >
                    <Icon name="RefreshCw" size={18} className="mr-2" />
                    Перезагрузить страницу
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

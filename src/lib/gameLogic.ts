export interface Mission {
  id: number;
  name: string;
  description: string;
  enemies: number;
  reward: number;
  mapTheme: 'forest' | 'desert' | 'city' | 'snow' | 'bunker' | 'factory';
}

export interface GameState {
  playerX: number;
  playerY: number;
  playerHealth: number;
  enemies: Enemy[];
  bombCooldown: number;
  kills: number;
  isGameOver: boolean;
  isVictory: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  type: 'soldier' | 'tank';
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    name: 'Разведка',
    description: 'Пробейся через вражеский патруль в лесной зоне',
    enemies: 5,
    reward: 500,
    mapTheme: 'forest'
  },
  {
    id: 2,
    name: 'Пустынный штурм',
    description: 'Захват вражеской базы в пустыне',
    enemies: 8,
    reward: 800,
    mapTheme: 'desert'
  },
  {
    id: 3,
    name: 'Городская война',
    description: 'Зачистка городских кварталов от врагов',
    enemies: 12,
    reward: 1200,
    mapTheme: 'city'
  },
  {
    id: 4,
    name: 'Снежная операция',
    description: 'Уничтожь танковую колонну в снегах',
    enemies: 10,
    reward: 1500,
    mapTheme: 'snow'
  },
  {
    id: 5,
    name: 'Штурм бункера',
    description: 'Проникни в укреплённый бункер противника',
    enemies: 15,
    reward: 2000,
    mapTheme: 'bunker'
  },
  {
    id: 6,
    name: 'Последний рубеж',
    description: 'Финальная битва на военном заводе',
    enemies: 20,
    reward: 5000,
    mapTheme: 'factory'
  }
];

export const createEnemy = (x: number, y: number, type: 'soldier' | 'tank'): Enemy => ({
  id: Math.random().toString(36).substr(2, 9),
  x,
  y,
  health: type === 'tank' ? 3 : 1,
  type
});

export const initializeGame = (missionId: number): GameState => {
  const mission = MISSIONS[missionId - 1];
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < mission.enemies; i++) {
    const isTank = i % 4 === 0 && missionId >= 3;
    enemies.push(
      createEnemy(
        Math.random() * 700 + 50,
        Math.random() * 400 + 50,
        isTank ? 'tank' : 'soldier'
      )
    );
  }

  return {
    playerX: 50,
    playerY: 250,
    playerHealth: 100,
    enemies,
    bombCooldown: 0,
    kills: 0,
    isGameOver: false,
    isVictory: false
  };
};

export const getMapBackground = (theme: string): string => {
  const colors = {
    forest: 'from-green-900 to-green-700',
    desert: 'from-yellow-800 to-yellow-600',
    city: 'from-gray-700 to-gray-500',
    snow: 'from-blue-200 to-blue-100',
    bunker: 'from-stone-800 to-stone-600',
    factory: 'from-red-900 to-red-700'
  };
  return colors[theme as keyof typeof colors] || colors.forest;
};

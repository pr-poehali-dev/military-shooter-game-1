export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface Rank {
  level: number;
  name: string;
  icon: string;
  requiredXP: number;
}

export const RANKS: Rank[] = [
  { level: 1, name: 'Новобранец', icon: '🎖️', requiredXP: 0 },
  { level: 2, name: 'Рядовой', icon: '🪖', requiredXP: 100 },
  { level: 3, name: 'Капрал', icon: '⭐', requiredXP: 300 },
  { level: 4, name: 'Сержант', icon: '⭐⭐', requiredXP: 600 },
  { level: 5, name: 'Лейтенант', icon: '🎯', requiredXP: 1000 },
  { level: 6, name: 'Капитан', icon: '🏅', requiredXP: 1500 },
  { level: 7, name: 'Майор', icon: '🎖️🎖️', requiredXP: 2200 },
  { level: 8, name: 'Полковник', icon: '⚔️', requiredXP: 3000 },
  { level: 9, name: 'Генерал', icon: '👑', requiredXP: 4000 },
  { level: 10, name: 'Маршал', icon: '👑👑', requiredXP: 5000 },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'Первая кровь',
    description: 'Убейте первого врага',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'mission_complete',
    name: 'Боевое крещение',
    description: 'Завершите первую миссию',
    icon: '✅',
    unlocked: false
  },
  {
    id: 'all_missions',
    name: 'Ветеран войны',
    description: 'Пройдите все 6 миссий',
    icon: '🎖️',
    unlocked: false
  },
  {
    id: 'killer_10',
    name: 'Снайпер',
    description: 'Убейте 10 врагов',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'killer_50',
    name: 'Убийца',
    description: 'Убейте 50 врагов',
    icon: '💀',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'killer_100',
    name: 'Машина смерти',
    description: 'Убейте 100 врагов',
    icon: '☠️',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'bomber',
    name: 'Бомбардир',
    description: 'Используйте бомбу 20 раз',
    icon: '💣',
    unlocked: false,
    progress: 0,
    maxProgress: 20
  },
  {
    id: 'rich',
    name: 'Богач',
    description: 'Накопите 10,000₽',
    icon: '💰',
    unlocked: false
  },
  {
    id: 'social',
    name: 'Социальный',
    description: 'Добавьте 5 друзей',
    icon: '👥',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'shopper',
    name: 'Коллекционер',
    description: 'Купите 10 предметов в магазине',
    icon: '🛒',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
];

export const checkAchievements = (stats: {
  kills: number;
  missionsCompleted: number;
  balance: number;
  friendsCount: number;
  bombsUsed: number;
  itemsBought: number;
}): Achievement[] => {
  const achievements = JSON.parse(localStorage.getItem('achievements') || JSON.stringify(ACHIEVEMENTS));
  
  const updates: Achievement[] = achievements.map((ach: Achievement) => {
    switch (ach.id) {
      case 'first_blood':
        if (stats.kills >= 1) ach.unlocked = true;
        break;
      case 'mission_complete':
        if (stats.missionsCompleted >= 1) ach.unlocked = true;
        break;
      case 'all_missions':
        if (stats.missionsCompleted >= 6) ach.unlocked = true;
        break;
      case 'killer_10':
        ach.progress = stats.kills;
        if (stats.kills >= 10) ach.unlocked = true;
        break;
      case 'killer_50':
        ach.progress = stats.kills;
        if (stats.kills >= 50) ach.unlocked = true;
        break;
      case 'killer_100':
        ach.progress = stats.kills;
        if (stats.kills >= 100) ach.unlocked = true;
        break;
      case 'bomber':
        ach.progress = stats.bombsUsed;
        if (stats.bombsUsed >= 20) ach.unlocked = true;
        break;
      case 'rich':
        if (stats.balance >= 10000) ach.unlocked = true;
        break;
      case 'social':
        ach.progress = stats.friendsCount;
        if (stats.friendsCount >= 5) ach.unlocked = true;
        break;
      case 'shopper':
        ach.progress = stats.itemsBought;
        if (stats.itemsBought >= 10) ach.unlocked = true;
        break;
    }
    return ach;
  });

  localStorage.setItem('achievements', JSON.stringify(updates));
  return updates;
};

export const getRankByXP = (xp: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].requiredXP) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

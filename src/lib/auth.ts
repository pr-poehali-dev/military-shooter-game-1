export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  balance: number;
  donatBalance: number;
  status: string;
  isAdmin: boolean;
  missionsCompleted: number;
  isOnline: boolean;
  friends: string[];
  friendRequests: string[];
}

const ADMIN_CREDENTIALS = {
  username: 'plutka',
  password: 'user'
};

export const initializeStorage = () => {
  if (!localStorage.getItem('users')) {
    const adminUser: User = {
      id: 'dev',
      name: 'plutka',
      email: 'admin@warzone.game',
      password: 'user',
      balance: 999999,
      donatBalance: 999999,
      status: 'Admin 👑',
      isAdmin: true,
      missionsCompleted: 6,
      isOnline: true,
      friends: [],
      friendRequests: []
    };
    localStorage.setItem('users', JSON.stringify([adminUser]));
  }
};

export const registerUser = (name: string, email: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.some((u: User) => u.email === email)) {
    return null;
  }

  const newUser: User = {
    id: Math.floor(100000 + Math.random() * 900000).toString(),
    name,
    email,
    password,
    balance: 1000,
    donatBalance: 0,
    status: 'Новобранец 🎖️',
    isAdmin: false,
    missionsCompleted: 0,
    isOnline: true,
    friends: [],
    friendRequests: []
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return newUser;
};

export const loginUser = (emailOrUsername: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  const user = users.find((u: User) => 
    (u.email === emailOrUsername || u.name === emailOrUsername) && u.password === password
  );

  if (user) {
    user.isOnline = true;
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  return null;
};

export const logoutUser = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].isOnline = false;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const updateCurrentUser = (updates: Partial<User>) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
  }
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getUserById = (id: string): User | null => {
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
};

export const getUserByName = (name: string): User | null => {
  const users = getAllUsers();
  return users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
};

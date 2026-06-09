import 'dotenv/config';
import mongoose from 'mongoose';
import { format, subDays } from 'date-fns';

import { connectDB } from '../config/db.js';

import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import AIInsight from '../models/AIInsight.js';

const EMAIL = 'rohitsaintest@gmail.com';
const PASSWORD = 'Password1!';
const NAME = 'Rohit Sain';

const HABITS = [
  {
    name: 'Morning Workout',
    description: '30 minutes of exercise',
    category: 'Fitness',
    frequency: 'daily',
    targetDays: 5,
    color: '#3b82f6',
    icon: '💪',
    _streakProb: 0.8,
  },
  {
    name: 'Read 10 Pages',
    description: 'Daily reading habit',
    category: 'Learning',
    frequency: 'daily',
    targetDays: 6,
    color: '#8b5cf6',
    icon: '📚',
    _streakProb: 0.75,
  },
  {
    name: 'Meditation',
    description: '10 minutes mindfulness',
    category: 'Mindfulness',
    frequency: 'daily',
    targetDays: 7,
    color: '#f59e0b',
    icon: '🧘',
    _streakProb: 0.65,
  },
  {
    name: 'No Phone After 10 PM',
    description: 'Leave phone outside bedroom',
    category: 'Health',
    frequency: 'daily',
    targetDays: 6,
    color: '#10b981',
    icon: '📵',
    _streakProb: 0.7,
  },
  {
    name: 'Side Project',
    description: 'Work on side project for 1 hour',
    category: 'Productivity',
    frequency: 'daily',
    targetDays: 5,
    color: '#14b8a6',
    icon: '🚀',
    _streakProb: 0.78,
  },
];

const todayKey = () => format(new Date(), 'yyyy-MM-dd');

const buildLogs = (habit, totalDays = 90) => {
  const logs = [];

  const today = new Date();

  for (let i = 0; i < totalDays; i++) {
    const date = subDays(today, i);

    const probability = habit._streakProb;

    if (Math.random() < probability) {
      logs.push({
        completedDate: format(date, 'yyyy-MM-dd'),
      });
    }
  }

  return logs;
};

const run = async () => {
  await connectDB();

  let user = await User.findOne({
    email: EMAIL,
  });

  if (user) {
    console.log(`Found existing user ${EMAIL}. Clearing old data...`);

    await Habit.deleteMany({
      userId: user._id,
    });

    await HabitLog.deleteMany({
      userId: user._id,
    });

    await AIInsight.deleteMany({
      userId: user._id,
    });

    user.name = NAME;
    user.avatar = NAME.charAt(0).toUpperCase();
    user.morningMotivation = true;
    user.password = PASSWORD;

    await user.save();
  } else {
    user = await User.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      avatar: NAME.charAt(0).toUpperCase(),
      morningMotivation: true,
    });

    console.log(`Created user ${EMAIL}`);
  }

  const createdHabits = [];

  for (let i = 0; i < HABITS.length; i++) {
    const h = HABITS[i];

    const habit = await Habit.create({
      userId: user._id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      targetDays: h.targetDays,
      color: h.color,
      icon: h.icon,
      order: i,
    });

    createdHabits.push({
      habit,
      config: h,
    });
  }

  let totalLogs = 0;

  for (const { habit, config } of createdHabits) {
    const logs = buildLogs(config);

    const docs = logs.map(log => ({
      userId: user._id,
      habitId: habit._id,
      completedDate: log.completedDate,
    }));

    if (docs.length) {
      await HabitLog.insertMany(docs);

      totalLogs += docs.length;
    }
  }

  const today = todayKey();

  for (const { habit } of createdHabits.slice(0, 3)) {
    await HabitLog.updateOne(
      {
        userId: user._id,
        habitId: habit._id,
        completedDate: today,
      },
      {
        $setOnInsert: {
          userId: user._id,
          habitId: habit._id,
          completedDate: today,
        },
      },
      {
        upsert: true,
      },
    );
  }

  console.log('\nSeed complete');
  console.log(`User: ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
  console.log(`Habits: ${createdHabits.length}`);
  console.log(`Logs: ${totalLogs}`);

  await mongoose.disconnect();
};

run().catch(async err => {
  console.error('Seed failed:', err);

  await mongoose.disconnect();

  process.exit(1);
});

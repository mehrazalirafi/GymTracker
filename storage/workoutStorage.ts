import AsyncStorage from '@react-native-async-storage/async-storage';

export type Set = {
    reps: number;
    weight: number;
};

export type Exercise = {
    name: string;
    sets: Set[];
};

export type WorkoutSession = {
    id: string;
    date: string;
    programName: string;
    exercises: Exercise[];
};

const WORKOUT_KEY = 'workout_sessions';

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
    const existing = await getWorkoutSessions();
    const updated = [...existing, session];
    await AsyncStorage.setItem(WORKOUT_KEY, JSON.stringify(updated));
}

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
    const data = await AsyncStorage.getItem(WORKOUT_KEY);
    return data ? JSON.parse(data) : [];
}

export async function deleteWorkoutSession(id: string): Promise<void> {
    const existing = await getWorkoutSessions();
    const updated = existing.filter(session => session.id !== id);
    await AsyncStorage.setItem(WORKOUT_KEY, JSON.stringify(updated));
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProgramExercise = {
    name: string;
    sets: number;
    reps: number;
};

export type Program = {
    id: string;
    name: string;
    exercises: ProgramExercise[];
};

const PROGRAM_KEY = 'programs';

export async function saveProgram(program: Program): Promise<void> {
    const existing = await getPrograms();
    const updated = [...existing, program];
    await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify(updated));
}

export async function getPrograms(): Promise<Program[]> {
    const data = await AsyncStorage.getItem(PROGRAM_KEY);
    return data ? JSON.parse(data) : [];
}

export async function deleteProgram(id: string): Promise<void> {
    const existing = await getPrograms();
    const updated = existing.filter(program => program.id !== id);
    await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify(updated));
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StepEntry = {
    date: string;
    steps: number;
};

const STEPS_KEY = 'step_entries';

export async function saveStepEntry(entry: StepEntry): Promise<void> {
    const existing = await getStepEntries();
    const updated = [...existing, entry];
    await AsyncStorage.setItem(STEPS_KEY, JSON.stringify(updated));
}

export async function getStepEntries(): Promise<StepEntry[]> {
    const data = await AsyncStorage.getItem(STEPS_KEY);
    return data ? JSON.parse(data) : [];
}

export async function deleteStepEntry(date: string): Promise<void> {
    const existing = await getStepEntries();
    const updated = existing.filter(entry => entry.date !== date);
    await AsyncStorage.setItem(STEPS_KEY, JSON.stringify(updated));
}
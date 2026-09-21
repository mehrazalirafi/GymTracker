import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightEntry = {
    date: string;
    weight: number;
};

const WEIGHT_KEY = 'weight_entries';

export async function saveWeightEntry(entry: WeightEntry): Promise<void> {
    const existing = await getWeightEntries();
    const updated = [...existing, entry];
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
}

export async function getWeightEntries(): Promise<WeightEntry[]> {
    const data = await AsyncStorage.getItem(WEIGHT_KEY);
    return data ? JSON.parse(data) : [];
}

export async function deleteWeightEntry(date: string): Promise<void> {
    const existing = await getWeightEntries();
    const updated = existing.filter(entry => entry.date !== date);
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
}
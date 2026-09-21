import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteWeightEntry, getWeightEntries, saveWeightEntry, WeightEntry } from '../../storage/weightStorage';
import { LineChart } from 'react-native-gifted-charts';

export default function WeightScreen() {
  const [weight, setWeight] = useState('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const data = await getWeightEntries();
    setEntries(data.reverse());
  }

  async function handleSave() {
    if (!weight) return;
    const entry: WeightEntry = {
      date: new Date().toISOString(),
      weight: parseFloat(weight),
    };
    await saveWeightEntry(entry);
    setWeight('');
    loadEntries();
  }

  async function handleDelete(date: string) {
    await deleteWeightEntry(date);
    loadEntries();
  }

  function getChartData() {
    return entries
      .slice()
      .reverse()
      .map(entry => ({
        value: entry.weight,
        label: new Date(entry.date).toLocaleDateString(),
      }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weight (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      {entries.length > 1 && (
        <LineChart
          data={getChartData()}
          color="#007AFF"
          thickness={2}
          hideDataPoints={false}
          curved
          hideRules
          yAxisTextStyle={{ color: '#888', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#888', fontSize: 10 }}
          noOfSections={4}
          width={300}
          yAxisOffset={60}
        />
      )}
      <FlatList
        data={entries}
        keyExtractor={item => item.date}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={{ color: '#ffffff' }}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={{ color: '#ffffff' }}>{item.weight} kg</Text>
            <TouchableOpacity onPress={() => handleDelete(item.date)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ffffff' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 , color: '#ffffff' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  entry: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#ccc', backgroundColor: '#1c1c1e' },
  delete: { color: 'red' },
});
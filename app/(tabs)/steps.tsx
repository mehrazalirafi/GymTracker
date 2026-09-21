import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { deleteStepEntry, getStepEntries, saveStepEntry, StepEntry } from '../../storage/stepsStorage';

export default function StepsScreen() {
  const [steps, setSteps] = useState('');
  const [entries, setEntries] = useState<StepEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const data = await getStepEntries();
    setEntries(data.reverse());
  }

  async function handleSave() {
    if (!steps) return;
    const entry: StepEntry = {
      date: new Date().toISOString(),
      steps: parseInt(steps),
    };
    await saveStepEntry(entry);
    setSteps('');
    loadEntries();
  }

  async function handleDelete(date: string) {
    await deleteStepEntry(date);
    loadEntries();
  }

  function getChartData() {
    return entries
      .slice()
      .reverse()
      .map(entry => ({
        value: entry.steps,
        label: new Date(entry.date).toLocaleDateString(),
      }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter steps"
        keyboardType="numeric"
        value={steps}
        onChangeText={setSteps}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      {entries.length > 1 && (
        <LineChart
          data={getChartData()}
          color="#34C759"
          thickness={2}
          hideDataPoints={false}
          curved
          hideRules
          yAxisTextStyle={{ color: '#888', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#888', fontSize: 10 }}
          noOfSections={4}
          width={300}
        />
      )}
      <FlatList
        data={entries}
        keyExtractor={item => item.date}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={{ color: '#ffffff' }}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={{ color: '#ffffff' }}>{item.steps} steps</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: '#ffffff' },
  button: { backgroundColor: '#34C759', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  entry: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  delete: { color: 'red' },
});
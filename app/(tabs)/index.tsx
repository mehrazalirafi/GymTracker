import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getWeightEntries, WeightEntry } from '../../storage/weightStorage';
import { getStepEntries, StepEntry } from '../../storage/stepsStorage';
import { getWorkoutSessions, WorkoutSession } from '../../storage/workoutStorage';

export default function Dashboard() {
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [latestSteps, setLatestSteps] = useState<StepEntry | null>(null);
  const [latestSession, setLatestSession] = useState<WorkoutSession | null>(null);
  const [weeklySteps, setWeeklySteps] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const weights = await getWeightEntries();
    const steps = await getStepEntries();
    const sessions = await getWorkoutSessions();

    if (weights.length > 0) setLatestWeight(weights[weights.length - 1]);
    if (steps.length > 0) setLatestSteps(steps[steps.length - 1]);
    if (sessions.length > 0) setLatestSession(sessions[sessions.length - 1]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const total = steps
      .filter(e => new Date(e.date) >= oneWeekAgo)
      .reduce((sum, e) => sum + e.steps, 0);
    setWeeklySteps(total);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Latest Weight</Text>
        <Text style={styles.cardValue}>
          {latestWeight ? `${latestWeight.weight} kg` : 'No data yet'}
        </Text>
        {latestWeight && (
          <Text style={styles.cardDate}>{new Date(latestWeight.date).toLocaleDateString()}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Latest Steps</Text>
        <Text style={styles.cardValue}>
          {latestSteps ? `${latestSteps.steps} steps` : 'No data yet'}
        </Text>
        {latestSteps && (
          <Text style={styles.cardDate}>{new Date(latestSteps.date).toLocaleDateString()}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Steps This Week</Text>
        <Text style={styles.cardValue}>{weeklySteps.toLocaleString()} steps</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Last Workout</Text>
        <Text style={styles.cardValue}>
          {latestSession ? latestSession.programName : 'No data yet'}
        </Text>
        {latestSession && (
          <Text style={styles.cardDate}>{new Date(latestSession.date).toLocaleDateString()}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ffffff' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 20, marginBottom: 16 },
  cardLabel: { fontSize: 13, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#555' },
});

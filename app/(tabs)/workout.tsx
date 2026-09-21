import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteProgram, getPrograms, Program, ProgramExercise, saveProgram } from '../../storage/programStorage';
import { getWorkoutSessions, saveWorkoutSession, WorkoutSession } from '../../storage/workoutStorage';

export default function WorkoutScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [showLogWorkout, setShowLogWorkout] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [logData, setLogData] = useState<{ [key: string]: { sets: string; reps: string; weight: string } }>({});


  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const p = await getPrograms();
    const s = await getWorkoutSessions();
    setPrograms(p);
    setSessions(s.reverse());
  }

  async function handleCreateProgram() {
    if(!programName || exercises.length === 0) return;
    const program: Program = {
      id: Date.now().toString(),
      name: programName,
      exercises,
    };
    await saveProgram(program);
    setProgramName('');
      setExercises([]);
      setShowCreateProgram(false);
      loadData();
  }

  function handleAddExercise() {
    setExercises([...exercises, { name: '', sets: 3, reps: 10 }]);
  }

  async function handleLogWorkout() {
    if (!selectedProgram) return;
    const session: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      programName: selectedProgram.name,
      exercises: selectedProgram.exercises.map(ex => ({
        name: ex.name,
        sets: Array.from({ length: parseInt(logData[ex.name]?.sets || ex.sets.toString()) }, (_, i) => ({
          reps: parseInt(logData[ex.name]?.reps || ex.reps.toString()),
          weight: parseFloat(logData[ex.name]?.weight || '0'),
        })),
      })),
    };
    await saveWorkoutSession(session);
    setShowLogWorkout(false);
    setSelectedProgram(null);
    setLogData({});
    loadData();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Workout</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowCreateProgram(true)}>
        <Text style={styles.buttonText}>+ Create Program</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Programs</Text>
      {programs.map(program => (
        <View key={program.id} style={styles.card}>
          <Text style={styles.cardTitle}>{program.name}</Text>
          <Text style={styles.cardSub}>{program.exercises.length} exercises</Text>
          {program.exercises.map(ex => (
            <Text key={ex.name} style={styles.cardSub}>{ex.name} — {ex.sets} sets x {ex.reps} reps</Text>
          ))}
          <View style={styles.cardButtons}>
            <TouchableOpacity style={styles.logButton} onPress={() => {
              setSelectedProgram(program);
              setShowLogWorkout(true);
            }}>
              <Text style={styles.logButtonText}>Log Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { deleteProgram(program.id); loadData(); }}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      {sessions.map(session => (
        <View key={session.id} style={styles.card}>
          <Text style={styles.cardTitle}>{session.programName}</Text>
          <Text style={styles.cardSub}>{new Date(session.date).toLocaleDateString()}</Text>
          {session.exercises.map(ex => (
            <Text key={ex.name} style={styles.cardSub}>{ex.name} — {ex.sets.length} sets</Text>
          ))}
        </View>
      ))}

      <Modal visible={showCreateProgram} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>Create Program</Text>
          <TextInput
            style={styles.input}
            placeholder="Program name"
            placeholderTextColor="#888"
            value={programName}
            onChangeText={setProgramName}
          />
          {exercises.map((ex, index) => (
            <View key={index} style={styles.exerciseRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Exercise name"
                placeholderTextColor="#888"
                value={ex.name}
                onChangeText={text => {
                  const updated = [...exercises];
                  updated[index].name = text;
                  setExercises(updated);
                }}
              />
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Sets"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={ex.sets.toString()}
                onChangeText={text => {
                  const updated = [...exercises];
                  updated[index].sets = parseInt(text) || 0;
                  setExercises(updated);
                }}
              />
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Reps"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={ex.reps.toString()}
                onChangeText={text => {
                  const updated = [...exercises];
                  updated[index].reps = parseInt(text) || 0;
                  setExercises(updated);
                }}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAddExercise}>
            <Text style={styles.buttonText}>+ Add Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCreateProgram}>
            <Text style={styles.buttonText}>Save Program</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateProgram(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <Modal visible={showLogWorkout} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>Log Workout</Text>
          <Text style={styles.sectionTitle}>{selectedProgram?.name}</Text>
          {selectedProgram?.exercises.map(ex => (
            <View key={ex.name} style={styles.card}>
              <Text style={styles.cardTitle}>{ex.name}</Text>
              <Text style={styles.cardSub}>Target: {ex.sets} sets x {ex.reps} reps</Text>
              <View style={styles.exerciseRow}>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder={`Sets (${ex.sets})`}
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  onChangeText={text => setLogData(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], sets: text } }))}
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder={`Reps (${ex.reps})`}
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  onChangeText={text => setLogData(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], reps: text } }))}
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Weight (kg)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  onChangeText={text => setLogData(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], weight: text } }))}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={handleLogWorkout}>
            <Text style={styles.buttonText}>Save Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowLogWorkout(false); setSelectedProgram(null); }}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ffffff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#ffffff' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  secondaryButton: { backgroundColor: '#444', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  cancelButton: { backgroundColor: '#888', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 8, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#888', marginBottom: 4 },
  cardButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  logButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 6 },
  logButtonText: { color: 'white', fontSize: 13 },
  delete: { color: 'red', padding: 8 },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: '#ffffff', backgroundColor: '#1c1c1e' },
  smallInput: { width: 70, marginLeft: 8 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  modal: { flex: 1, padding: 20, backgroundColor: '#000000' },
});
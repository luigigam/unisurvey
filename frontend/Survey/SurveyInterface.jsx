import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const App = () => {
  const [surveyCount, setSurveyCount] = useState(3); // Variable que determina el número de encuestas

  const handleBack = () => {
    // Lógica para el botón "Back"
    // ...
  };

  const handleFinish = () => {
    // Lógica para el botón "Finish"
    // ...
  };

  const handleSurvey = (surveyId) => {
    // Lógica para el botón de encuesta específico
    // ...
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey</Text>

      {/* Botones de encuestas */}
      {Array.from({ length: surveyCount }, (_, index) => (
        <Button
          key={index}
          title={`Encuesta ${index + 1}`}
          onPress={() => handleSurvey(index + 1)}
        />
      ))}

      {/* Botones "Back" y "Finish" */}
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={handleBack} />
        <Button title="Finish" onPress={handleFinish} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
});

export default App;

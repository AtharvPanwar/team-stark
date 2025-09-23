// Simple 4-motor constant speed test with L293D

// Enable pins for L293D (must be HIGH to allow motor drive)
#define ligarA 2
#define ligarB 4
#define ligarC 7
#define ligarD 8

// Motor input pins (each motor has 2 inputs)
#define motorA1 3
#define motorA2 5
#define motorB1 6
#define motorB2 9
#define motorC1 10
#define motorC2 11
#define motorD1 12
#define motorD2 13

int speedValue = 200; // Motor speed (0–255)

void setup() {
  // Enable pins
  pinMode(ligarA, OUTPUT);
  pinMode(ligarB, OUTPUT);
  pinMode(ligarC, OUTPUT);
  pinMode(ligarD, OUTPUT);

  // Motor pins
  pinMode(motorA1, OUTPUT); pinMode(motorA2, OUTPUT);
  pinMode(motorB1, OUTPUT); pinMode(motorB2, OUTPUT);
  pinMode(motorC1, OUTPUT); pinMode(motorC2, OUTPUT);
  pinMode(motorD1, OUTPUT); pinMode(motorD2, OUTPUT);

  // Enable all L293D outputs
  digitalWrite(ligarA, HIGH);
  digitalWrite(ligarB, HIGH);
  digitalWrite(ligarC, HIGH);
  digitalWrite(ligarD, HIGH);
}

void loop() {
  // Run all motors forward at constant speed
  analogWrite(motorA1, speedValue); digitalWrite(motorA2, LOW);
  analogWrite(motorB1, speedValue); digitalWrite(motorB2, LOW);
  analogWrite(motorC1, speedValue); digitalWrite(motorC2, LOW);
  analogWrite(motorD1, speedValue); digitalWrite(motorD2, LOW);
}

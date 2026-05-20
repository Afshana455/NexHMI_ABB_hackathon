# NexHMI — Next-Generation Industrial Control System Interface
### The right information. The right person. The right time.

An AI-powered, plug-and-play smart HMI framework for small-scale industrial automation. NexHMI connects to any industrial hardware, configures itself from a plain English description, and generates purpose-built interfaces for every role in your organisation automatically.

## what is NexHMI
NexHMI is not a dashboard. It is a smart HMI framework, a middleware system that sits between any industrial hardware and the people who operate it, and intelligently generates the right interface for each person in real time.
Traditional HMIs show the same screen to every user and treat every alarm with equal urgency. NexHMI learns your facility, understands your hardware, and builds a different purpose-built experience for each role — operator, engineer, plant manager, maintenance technician — from a single configuration source.
The core principle: Any industrial device. Any industry. Five minutes to configure. Intelligent from day one.

## The Problem It Solves 

| Problem | Impact | NexHMI's Solution |
|----------|--------|-------------------|
| All alarms look equally urgent | Operators miss critical events | AI priority scoring (1–10) based on context |
| Same screen for every user | Cognitive overload for operators | Role-based adaptive interfaces |
| Expert engineers needed for configuration | Days of setup time per facility | Conversational AI setup in minutes |
| Reactive alarm-only systems | Failures detected too late | Predictive anomaly detection + fingerprinting |
| No maintenance foresight | Unplanned downtime | ML-based Remaining Useful Life predictor |
| Interface fixed to one hardware type | Cannot adapt to new systems | Plug-and-play connector framework |


## 3. Demo Hardware
NexHMI is demonstrated on a real, running automated chocolate production system built by the hardware team.
Hardware: STM32-Based Chocolate Production Line
The prototype manages a complete small-scale production process for white, dark, and normal chocolate variants. It integrates four subsystems controlled simultaneously by an STM32 microcontroller.

### Hardware: STM32-Based Chocolate Production Line
The prototype manages a complete small-scale production process for white, dark, and normal chocolate variants. It integrates four subsystems controlled simultaneously by an STM32 microcontroller.

| Subsystem | Component | How It Works |
|-----------|-----------|---------------|
| Central Controller | STM32 Microcontroller | Processes all sensor inputs and generates control signals for every component |
| Material Transport | PWM-driven Conveyor Belt | Speed controlled via Pulse Width Modulation — smooth adjustment from stop to full speed |
| Ingredient Mixing | Bi-directional Stirrer Motor | Rotates clockwise and counterclockwise via relay circuits for uniform chocolate consistency |
| Thermal Control | Nichrome Wire Heater + Sensors | Closed-loop temperature regulation — sensor feedback automatically adjusts heat output |

### Hardware Communication
The STM32 transmits live sensor data every second over USB serial in a structured text format:

         TEMP:46.2,SPEED:78,LIDAR:0,MIXER:1,PRESSURE:2.4

NexHMI's Serial Connector module reads this stream, parses it into a normalised data packet, and feeds it into the AI engine — establishing the hardware-to-software bridge.

| Component | Role |
|-----------|------|
| MOSFET + Flyback Diode | PWM-based motor speed control |
| Relay Driver (NPN Transistor) | Switching high-power loads via low-power MCU signals |
| Solid State Relay (SSR) | Silent, wear-free switching for the heating element |
| SMPS Power Supply | Stable regulated DC for all electronic modules |
| TTL-to-USB Converter | Serial communication bridge between STM32 and laptop |

## Architecture
<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/53f7c43d-9b1c-42c5-aea8-27c9470f716d" />

## Key Features
### MDL Engine — Machine Description Language
Auto-generates the entire interface from a configuration file or plain English description. Add a new sensor to the config and a new widget appears on the dashboard automatically. No engineering time, no code changes.

### AI-Powered Alarm Priority Scoring
Every alert is scored from 1 to 10 based on alert type and current system context. Multi-signal combinations score higher than individual readings. Dashboard always surfaces the most critical alert at the top. Operators never manually filter noise.

### Anomaly Detection
Isolation Forest model trained on normal operating data. Detects unusual sensor behaviour before thresholds are breached — flags patterns, not just values.

### Predictive Temperature Engine
Linear Regression model running on a rolling 60-reading window. Forecasts each signal's value 60 seconds and 5 minutes ahead. Converts reactive response into proactive intervention.

### Alarm DNA Fingerprinting
Builds a library of multi-signal failure signatures from historical fault data. When live readings begin assembling a known failure pattern, a predictive warning fires — before any individual threshold is crossed.

### Remaining Useful Life (RUL) Predictor
ML-based degradation model tracking every component's operational history. Forecasts days remaining before maintenance is required. Displayed as a health timeline per component.

### Role-Based Adaptive Interface
Each role gets a separate, purpose-built login and screen — operator, engineer, plant manager, maintenance technician, or any custom role. Same hardware, same data, entirely different experiences.

### Cognitive Load Scoring
Tracks operator interaction rate, active alert count, and signal warning states. Dynamically simplifies the interface under high cognitive load — reducing noise exactly when the operator is most overwhelmed.

### Widget Analytics Modal
Click any signal card for a deep-dive panel showing shift statistics, trend sparkline, 60s prediction, component health score, operating efficiency, AI anomaly score, RUL bar, recommended action, and recent event log.

### Natural Language Query Interface
Powered by Claude API. Operators and engineers ask plain English questions — "What was the peak temperature today?" or "How many LIDAR alerts this week?" — and receive direct answers from the historian database.


## AI Engine
### Module 1 — Anomaly Detector

Algorithm: Isolation Forest (scikit-learn)
Training: 2–3 hours of normal operating data collected from the running prototype
Input: Live multivariate sensor readings (temperature, speed, pressure, mixer status)
Output: Anomaly score 0–1 with plain English description of what deviates and which signals contributed
Key distinction: Detects unusual patterns, not just threshold breaches

### Module 2 — Alarm Priority Scorer

Algorithm: Rule-based contextual weighting
Logic: Base score from alert type + contextual elevation when multiple warnings coincide
Output: Integer score 1–10. Score 10 = LIDAR intrusion, system halts. Score 1 = informational only
Dashboard behaviour: Always sorted highest-first. Operator attention directed automatically

### Module 3 — Prediction Engine

Algorithm: Linear Regression on sliding 60-reading window
Refresh rate: Every second
Output: Predicted value at +60 seconds and +5 minutes for each signal
Impact: Converts reactive alarm response into proactive intervention

### Module 4 — Failure Fingerprinting

Approach: Logs full sensor state at every confirmed fault event
Library: Builds multi-signal temporal patterns per failure type
Trigger: Raises warning when live readings match ≥40% of a known fingerprint sequence
Output: "Failure fingerprint [ID] is [X]% assembled — intervene now"


## Configuration System

### Option A — AI Configuration
Describe your facility in plain English. Claude API extracts signal definitions, units, thresholds, and role assignments from natural language and writes the config automatically.
Input:  "We have temperature sensors (20-75°C), a conveyor belt, a 
         stirring motor, and a LIDAR perimeter. Operators need simple 
         status views. Engineers need full analytics access."

Output: Complete config file generated. Dashboard rebuilds live.

### Option B — Guided Wizard
Four-step flow: select components → set parameters → configure roles → assign access control. No technical knowledge required. Smart defaults pre-fill every field.

### How the Interface Auto-Generates
When the dashboard loads it calls GET /api/config/signals, receives the signal schema, and generates every widget automatically from that response. The interface never has hardcoded signal definitions. Change the config on the server — the interface adapts on next load.

## Role based Interface

| Role | What They See | What They Can Do |
|------|----------------|------------------|
| Operator | Signal cards, priority alerts, AI insights, LIDAR status | Monitor and acknowledge alerts |
| Engineer | Full signals, anomaly timeline, trend graphs, fingerprint library | Adjust thresholds, export reports, full configuration access |
| Plant Manager | KPI summary, health scores, shift performance table | View and export summary reports |
| Maintenance Tech | Component health matrix, RUL per component, risk levels | View maintenance schedules |
| Custom Roles | Configured per facility — any signal combination and permission set | Defined during setup |


## Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Hardware Interface | PySerial | Reads STM32 serial stream over USB |
| Industrial Protocols | PyModbus, Paho-MQTT | Modbus TCP and MQTT device support |
| Data Storage | SQLite (built-in) | Historian — stores all sensor readings and events |
| Data Handling | Pandas | Preprocessing and time-series manipulation |
| Anomaly Detection | Scikit-learn — Isolation Forest | Unsupervised pattern detection |
| Prediction Engine | Scikit-learn — Linear Regression | 60-second and 5-minute forecasting |
| Model Persistence | Joblib | Save and load trained model files |
| AI Configuration | Anthropic Claude API (Haiku) | Natural language to configuration extraction |
| NL Query Interface | Anthropic Claude API (Haiku) | Plain English database queries |
| API Server | FastAPI | REST endpoints and WebSocket broadcast |
| Dashboard | React (JSX) | Frontend interface for all screens |
| Styling | Inline Styles + DM Sans Font | Enterprise design system |
| Authentication | JWT Tokens | Role-based session management |
| Training Environment | Jupyter Notebook | One-time offline model training |
| Version Control | Git + GitHub | Code management |
| Development | VS Code + Python 3.11 | Primary development environment |


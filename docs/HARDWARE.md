# Hardware development

## Soil parameters sketch

Source: `Server/ArduinoCode/SoilParametersData.ino`.

The draft includes DHT22 and ESP8266 libraries, placeholder Wi-Fi settings and a placeholder HTTP destination. Nutrient, pH, moisture and water-reading functions need implementation. DHT initialization also needs correction.

The sketch mixes board-specific assumptions. Confirm the exact controller, pin mapping, sensor models, voltage levels and library versions before compiling or wiring. No verified bill of materials or calibration procedure is currently supplied.

## Rover sketch

Source: `Server/ArduinoCode/RoverMovementCode.ino`.

The draft references an Adafruit Motor Shield, two motors, a camera servo and serial voice input. Movement helpers exist, but command interpretation and navigation are placeholders. LiDAR, GPS, vision and autonomous navigation are comments describing future work.

## Implementation order

1. Record board and sensor part numbers, wiring and power requirements.
2. Compile and test each sensor separately; document calibration and units.
3. Define validated telemetry fields and implement an authenticated ingestion endpoint.
4. Test reconnect behavior, timeouts and duplicate readings.
5. Test rover movement with wheels lifted and add an emergency stop and communication-loss stop before field operation.

Do not describe these sketches as validated autonomous farming hardware until the corresponding tests are recorded.

# Device reporting API

## Register and keep the key private

Sign in to the website, open Workspace and register a device with a short name. The server creates a random device key and stores only its hash. Save the key when shown; it is not included in later device lists. Key rotation invalidates the old key.

Registering a logical device does not prove that physical hardware is connected. The initial display says it is waiting for a report.

## Reporting contract

Send JSON to `POST /api/soil-data` with the HTTP header:

```text
Authorization: Bearer YOUR_PRIVATE_DEVICE_KEY
Content-Type: application/json
```

Example **synthetic test** payload:

```json
{"temperature":23.5,"humidity":61,"moisture":42,"ph":6.7}
```

At least one supported field is required. Missing fields remain null; they are not invented. Values must be finite JSON numbers:

| Field | Unit | Accepted range |
| --- | --- | --- |
| temperature | °C | -40 to 85 |
| humidity | % | 0 to 100 |
| moisture | % | 0 to 100 |
| ph | pH | 0 to 14 |

A successful write returns HTTP 201 with `{"status":"recorded"}`. Invalid credentials return 401 and invalid measurements return 400. The server records receipt time; this is not an independently verified sensor measurement time or calibration certificate.

## Browser history

Authenticated owners may request `GET /api/devices` and `GET /api/devices/DEVICE_ID/readings`. The latter returns the latest 100 stored reports, newest first. Other users cannot view or rotate the device. Database persistence does not currently implement automatic long-term retention cleanup.

## Original firmware

The original soil sketch still uses placeholder Wi-Fi settings, a placeholder destination and unimplemented sensor functions. It must be updated for the confirmed board, sensor drivers, JSON contract and device key before physical use. Do not populate unsupported readings with arbitrary constants.

The API defaults to localhost for safe development. Real devices need a deliberately configured reachable host. Use HTTPS before transmitting device keys across an untrusted network; production deployment is separate from local development. Do not commit device keys or Wi-Fi passwords to sketches.

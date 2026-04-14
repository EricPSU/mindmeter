# MindMeter

**[Live App](https://www.omegaminds.com/mindmeter/)**

A mobile-first lap timer for track & field races. Configure your event, hit Start, and press Lap at each split — MindMeter tracks your pace, estimates your finish time, and saves your race history.

## Features

- **Lap timing** with split, cumulative time, and delta vs. previous lap
- **Estimated finish time** using a recency-weighted average pace across all completed laps
- **Target time** — set a goal finish time and get a live target split that updates each lap
- **Race history** — finished races are saved to your device and can be reviewed or deleted at any time
- **Relay support** — 4x800m mode displays per-runner totals at each exchange
- **Pacemaker** — calculate finish time from a target pace, or back-calculate pace from a goal finish time, with a full split breakdown

## Supported Events

| Event | Laps (400m) | Laps (200m) |
|---|---|---|
| 800 Meter | 2 | 4 |
| 1500 Meter | 4 | 8 |
| 1600 Meter | 4 | 8 |
| 3000 Meter | 8 | 15 |
| 3200 Meter | 8 | 16 |
| 4x800 Relay | 8 | 16 |

## Settings

| Setting | Description |
|---|---|
| **Track Event** | The race distance to time |
| **Lap Distance** | Where you capture splits — every 200m or every 400m |
| **Partial Lap** | Whether the short lap (e.g. 300m in a 1500m) falls at the start or end of the race |
| **Target Time** | Optional goal finish time — enables a live target split display |

Settings are saved to a cookie and restored automatically on your next visit.


## How It Works

### Estimated Finish Time

After each lap, MindMeter calculates a pace in seconds-per-meter for every completed lap, then computes a recency-weighted average (later laps carry more weight). That average pace is projected over the remaining distance to produce the estimate. This means the estimate converges toward your actual pace as the race progresses rather than locking in from a single early lap.

### Target Split

When a target finish time is set, MindMeter calculates the required pace over the remaining distance after each lap and displays the split you need to hit for the next lap to stay on goal. If you fall too far behind, it displays N/A.


## Pacemaker

Select a distance (800m–10000m), then enter either a **pace** (min:sec per mile) or a **goal time** (min:sec) — the other field calculates automatically. Below the inputs, a split table shows projected times at every 200m or 400m interval, toggled with the buttons in the header. Partial last laps (e.g. the final 100m of a 1500m at 200m splits) are shown proportionally.

## Tech Stack

- Vanilla HTML, CSS, and JavaScript — no framework, no build step
- Font Awesome for icons
- Settings persisted via cookies
- Race history persisted via `localStorage`
- Google Analytics (GA4) for usage tracking

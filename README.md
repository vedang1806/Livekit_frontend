# Interpreter Frontend

React frontend for the AI Medical Interpreter Platform — Layer 1.
Connects to the FastAPI backend for tokens and egress control.
Uses `@livekit/components-react` for the video call UI.

## Setup

```bash
cp .env.example .env
# Set REACT_APP_BACKEND_URL=http://localhost:8000

npm install
npm start
# Opens http://localhost:3000
```

## .env variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | `http://localhost:8000` | FastAPI backend URL |
| `REACT_APP_DEFAULT_ROOM` | _(empty)_ | Pre-fill the session ID field |

## Testing a full session (3 tabs)

1. Open `http://localhost:3000` in **3 browser tabs**
2. Tab 1 → join as **Doctor**
3. Tab 2 → join as **Patient**
4. Tab 3 → join as **Interpreter**
5. Use the same Session ID across all 3 (or leave blank — first tab creates it, copy from the URL/console)
6. Once all 3 are live, click **Start Recording** in any tab
7. Talk across tabs
8. Click **Stop Recording** → MP4 saved to S3
9. Click **Leave** → session ends

## File structure

```
src/
├── App.js                    # Root — routes between screens
├── index.js                  # React entry point
├── index.css                 # Design tokens + global styles
├── api/
│   └── backend.js            # All fetch calls to FastAPI
├── hooks/
│   └── useSession.js         # Session state machine
└── components/
    ├── JoinScreen.jsx         # Pre-join lobby
    ├── MeetingRoom.jsx        # Active call (LiveKit)
    ├── SessionControls.jsx    # Top bar: recording + leave
    ├── RoleOverlay.jsx        # Floating role badges panel
    └── EndedScreen.jsx        # Post-session summary
```

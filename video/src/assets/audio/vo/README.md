# Voiceover Audio Files

AI-generated voiceover for Libertas Explainer Video.

## Technical Requirements

- **Format:** WAV (uncompressed)
- **Sample Rate:** 44.1kHz or 48kHz
- **Bit Depth:** 16-bit or 24-bit
- **Channels:** Mono
- **Levels:** Normalized to -3dB peak, -18dB LUFS average

## Voice Requirements

- **Tone:** Gravitas with urgency - authoritative deep voice
- **Style:** Documentary narrator with edge
- **Pacing:** ~150 words per minute (slower on key phrases)
- **Reference:** Keith David, James Earl Jones style

## Files

| File | Section | Actual Duration | Budget |
|------|---------|-----------------|--------|
| `vo-problem.mp3` | The Problem | 15.9s | ~12s |
| `vo-solution.mp3` | The Solution | 17.8s | ~17s |
| `vo-engine.mp3` | The Engine | 23.7s | ~22s |
| `vo-proof.mp3` | Proof | 17.8s | ~15s |
| `vo-cta.mp3` | Call to Action | 9.0s | ~10s |

**Note:** Some files run slightly over budget. Timing will be adjusted during composition (either speed up audio or extend section duration).

## Scripts

### vo-problem.mp3
```
Every day, information is censored. Communications are severed.
In 2025, over 200 internet shutdowns hit 28 countries.
When regimes cut the signal, the world goes dark.
```

### vo-solution.mp3
```
Libertas is an automated research engine for freedom technology.
It tracks global signals autonomously.
```

### vo-engine.mp3
```
Sources flow in from across the world.
AI agents classify them, assess credibility, extract insights.
High-signal content is published automatically.
Weekly digests compile the most important signals.
Agents analyze patterns to create project ideas for freedom builders to act on.
```

### vo-proof.mp3
```
New Signals.
Iran's digital darkness. Over two thousand killed without being able to reach the outside world.
Uganda's government warning against mesh networks. Proof the tools work.
Freedom tech signals. Compiled. Published. Open to all.
```

### vo-cta.mp3
```
The agents are live now. Find them by their signals.
Libertas dot F-G-U dot tech.
Built by Cypherpunks.
```

## ElevenLabs Settings (Recommended)

- **Voice:** Adam, Antoni, or Daniel (deep voice library)
- **Stability:** 0.50
- **Similarity Boost:** 0.75
- **Style Exaggeration:** 0.00
- **Speaker Boost:** On

## Post-Processing

After generation:
1. Normalize audio to -3dB peak
2. Apply subtle de-essing if needed
3. Ensure consistent levels across all files
4. No room reverb or effects (dry audio)

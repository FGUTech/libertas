# Sound Effects Library

Sound effects for the Libertas Explainer Video. All sounds should be CC0 or permissively licensed.

## Sound Effects Library

| Sound | Filename | Duration | Purpose | Status |
|-------|----------|----------|---------|--------|
| Keyboard typing 1 | `type-1.wav` | 150ms | TypewriterText component | [x] |
| Keyboard typing 2 | `type-2.wav` | 120ms | TypewriterText component | [x] |
| Keyboard typing 3 | `type-3.wav` | 180ms | TypewriterText component | [x] |
| Command execute | `cmd-execute.wav` | 448ms | Terminal command confirmation | [x] |
| Glitch transition | `glitch.wav` | 1.34s | Scene transitions | [x] |
| Warning alert | `warning.wav` | 1.5s | Error/threat indicators | [x] |
| Success chime | `success.wav` | 2.05s | Positive confirmations | [x] |
| Data transmission hum | `data-hum.wav` | 10s | Flow diagram ambient (loopable) | [x] |
| CRT power on | `crt-on.wav` | 2s | Solution scene boot | [x] |
| CRT power off | `crt-off.wav` | 1.5s | Problem scene shutdown | [x] |

**All sounds:** 48kHz WAV format, normalized

## Recommended Downloads (CC0 Licensed)

### 1. Keyboard Typing Sounds

**Primary:** [Mechanical Keyboard Typing Pack by stu556](https://freesound.org/people/stu556/packs/25510/)
- Multiple variations of mechanical keyboard sounds
- Pick 3 distinct samples, rename to `type-1.wav`, `type-2.wav`, `type-3.wav`

**Alternative:** [Keyboard Typing by Trollarch2](https://freesound.org/people/Trollarch2/sounds/331656/)

### 2. Command Execute (Synth + Whoosh)

**Primary:** [Free Whoosh Sound Pack by qubodup](https://freesound.org/people/qubodup/packs/12143/)
- CC0 licensed
- Layer a short synth hit with a data whoosh
- Export as `cmd-execute.wav`

**Alternative:** [WHOOSH PACK by gaussiansoundco](https://freesound.org/people/gaussiansoundco/packs/43533/)

### 3. Glitch Transition

**Primary:** [Glitch Corruption by dotY21](https://freesound.org/people/dotY21/sounds/348585/)
- CC0 licensed
- Perfect for digital corruption/glitch transitions

**Alternative:** [Corruption/Glitch Sound 2 by Kierham](https://freesound.org/people/Kierham/sounds/631793/)
- CC0 licensed
- Made by importing Blender project as raw audio

### 4. Warning Alert Tone

**Primary:** [Electronic Samples Misc (CC0) by Erokia](https://freesound.org/people/Erokia/packs/26717/)
- Browse pack for low-frequency alert tones
- CC0 licensed

**Alternative:** Browse [Freesound alert tags](https://freesound.org/browse/tags/alert/) with CC0 filter

### 5. Success Chime

**Primary:** [Success notification by _lucy](https://freesound.org/people/_lucy/sounds/780010/)
- CC0 licensed
- Made in Ableton with Operator synth

**Alternative:** Browse [Pixabay CC0 notifications](https://pixabay.com/sound-effects/search/cc0/)

### 6. Data Transmission Hum

**Primary:** [ambient spacecraft hum by AlaskaRobotics](https://freesound.org/people/AlaskaRobotics/sounds/221570/)
- Ominous ambient background hum, heavy bass
- Loopable, good for dramatic scenes

**Alternative:** [Electric Hum pack by adamamazing](https://freesound.org/people/adamamazing/packs/16903/)
- Clean 50Hz hum and variations

### 7. CRT Power On/Off

**Primary:** [CRT monitor power on with 15.6kHz HF Noise by dav0r](https://freesound.org/people/dav0r/sounds/382312/)
- CC0 licensed
- Authentic CRT power-on sound with HF noise layers

**Secondary:** [Analog CRT TV Electronic Static Noise by grcekh](https://freesound.org/people/grcekh/sounds/546047/)
- CC0 licensed
- Good for static/shutdown effect

## Download Instructions

1. Visit each Freesound link above
2. Create a free Freesound account (required for downloads)
3. Download the highest quality format available (WAV preferred)
4. Rename files according to the filename column above
5. Place all files in this directory (`src/assets/audio/sfx/`)
6. Update `../LICENSE-AUDIO.md` with attribution details

## Audio Specifications

- **Format:** WAV (16-bit or 24-bit)
- **Sample Rate:** 48kHz preferred, 44.1kHz acceptable
- **Channels:** Mono or Stereo (Remotion handles both)
- **Normalization:** -6dB peak recommended

## Processing Tips

For best results, process downloaded sounds in a DAW (Audacity, Logic, Ableton):

1. **Typing sounds:** Trim to ~100-200ms per keystroke, remove silence
2. **Command execute:** Layer synth hit + whoosh, ~500ms total
3. **Glitch:** Keep aggressive, ~300-500ms
4. **Warning:** Low-pass filter to emphasize bass, ~1s
5. **Success:** Bright and short, ~500ms
6. **Data hum:** Create seamless loop, ~5-10s
7. **CRT on/off:** Trim to essential sound, ~500ms-1s each

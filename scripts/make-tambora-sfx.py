"""Synthesises the sound bed for the Tambora reel (no voice):
a dark drone, a boom at the eruption, distant cannon-like thuds, an airy pad
over the globe, wind over the snow, a whoosh at every cut and a riser into
the end card. Scene times come from src/reels/tambora/script.json.

Run with: python3 scripts/make-tambora-sfx.py
"""

import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = json.loads((ROOT / 'src/reels/tambora/script.json').read_text())
OUT = ROOT / 'public/audio/tambora-part1-sfx.wav'

SR = 48000
FPS = 30
rng = np.random.default_rng(1815)


def frames(sec):
    return round(sec * FPS)


# Same rounding as src/reels/timeline.ts.
cursor = frames(SCRIPT['coverSec'])
starts = {}
for scene in SCRIPT['scenes']:
    starts.setdefault(scene['bg'], cursor / FPS)
    cursor += sum(frames(c['sec']) for c in scene['captions'])
end_card = cursor / FPS
total = (cursor + frames(SCRIPT['endCardSec'])) / FPS
cuts = [frames(SCRIPT['coverSec']) / FPS] + [starts[s['bg']] for s in SCRIPT['scenes'][1:]] + [end_card]

n = int(total * SR)
t = np.arange(n) / SR
left = np.zeros(n)
right = np.zeros(n)


def band(x, lo, hi):
    """Band-pass by zeroing FFT bins outside [lo, hi] Hz."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def norm(x):
    m = np.max(np.abs(x))
    return x / m if m > 0 else x


def add(sig, at, gain, pan=0.0):
    i = int(at * SR)
    if i >= n:
        return
    sig = sig[: n - i]
    left[i : i + len(sig)] += sig * gain * (1 - max(0.0, pan))
    right[i : i + len(sig)] += sig * gain * (1 + min(0.0, pan))


def boom(length=3.0, f0=90, f1=28, decay=1.2):
    tt = np.arange(int(length * SR)) / SR
    freq = (f0 - f1) * np.exp(-tt / 0.6) + f1
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-tt / decay)
    crack = band(rng.standard_normal(len(tt)), 30, 1800) * np.exp(-tt / 0.18)
    return norm(body + 0.6 * norm(crack))


def thud(length=1.2):
    return boom(length, f0=70, f1=40, decay=0.35)


def whoosh(length=0.45):
    tt = np.arange(int(length * SR)) / SR
    env = np.where(tt < length * 0.8, (tt / (length * 0.8)) ** 2, np.exp(-(tt - length * 0.8) / 0.04))
    return norm(band(rng.standard_normal(len(tt)), 400, 4000)) * env


# Dark drone under everything, dipping for the "but..." beat.
drone = 0.6 * np.sin(2 * np.pi * 55 * t) + 0.35 * np.sin(2 * np.pi * 82.5 * t + 1.0)
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
wind_low = norm(band(rng.standard_normal(n), 40, 260))
bed = norm(drone + 0.5 * wind_low)
dip = np.ones(n)
d0, d1 = starts['dark'], starts['globe']
dip[(t >= d0) & (t < d1)] = 0.35
fade_in = np.clip(t / 0.4, 0, 1)
bed *= dip * fade_in
left += bed * 0.16
right += bed * 0.16

# Whoosh into every cut.
for i, c in enumerate(cuts):
    add(whoosh(), c - 0.4, 0.22, pan=0.4 if i % 2 else -0.4)

# Eruption: big boom and a long rumble.
e0 = starts['eruption']
add(boom(), e0, 0.9)
rum_len = starts['mapSound'] + 2.0 - e0
tt = np.arange(int(rum_len * SR)) / SR
rumble = norm(band(rng.standard_normal(len(tt)), 25, 140)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt))
rumble *= np.clip(tt / 0.3, 0, 1) * np.clip((rum_len - tt) / 2.0, 0, 1)
add(rumble, e0, 0.45)

# "Heard 2000 km away, mistaken for cannon fire": distant thuds.
s0 = starts['mapSound']
for k, dt in enumerate([0.5, 1.6, 2.3, 3.6, 4.4]):
    add(thud(), s0 + dt, 0.35, pan=(-0.5 if k % 2 else 0.5))

# The top of the mountain blows off.
add(boom(2.2, f0=110, f1=35, decay=0.8), starts['mountain'] + 0.6, 0.6)

# Deep hit on "but...".
add(boom(2.5, f0=60, f1=30, decay=1.0), starts['dark'], 0.55)

# Airy pad while the haze spreads round the globe.
g0, g1 = starts['globe'], starts['snow']
gl = g1 - g0
tt = np.arange(int(gl * SR)) / SR
pad = sum(np.sin(2 * np.pi * f * tt + p) for f, p in [(220, 0), (220.7, 1.3), (261.6, 0.5), (329.6, 2.1)])
pad = norm(pad) * np.clip(tt / 1.5, 0, 1) * np.clip((gl - tt) / 1.0, 0, 1)
add(pad, g0, 0.07)

# Wind over the snow.
w0, w1 = starts['snow'], starts['end']
wl = w1 - w0 + 0.5
tt = np.arange(int(wl * SR)) / SR
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * tt) * np.sin(2 * np.pi * 0.07 * tt + 1)
wind = norm(band(rng.standard_normal(len(tt)), 250, 1400)) * gust
wind *= np.clip(tt / 0.6, 0, 1) * np.clip((wl - tt) / 0.8, 0, 1)
add(wind, w0, 0.18, pan=-0.2)

# Riser into the end card, then a final hit.
r0 = starts['end']
rl = end_card - r0
tt = np.arange(int(rl * SR)) / SR
riser = norm(band(rng.standard_normal(len(tt)), 200, 6000)) * (tt / rl) ** 2.5
add(riser, r0, 0.22)
add(boom(2.5, f0=80, f1=32, decay=1.1), end_card, 0.7)

# Master: fade out and normalise to -3 dBFS.
fade_out = np.clip((total - t) / 1.2, 0, 1)
stereo = np.stack([left * fade_out, right * fade_out], axis=1)
stereo *= 10 ** (-3 / 20) / np.max(np.abs(stereo))

OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())

print(f'{OUT.relative_to(ROOT)}: {total:.1f}s, cuts at ' + ', '.join(f'{c:.1f}' for c in cuts))

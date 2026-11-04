"""Narration for the Tambora reel (part 1) in Microsoft's free Arabic voice
"Hamed" (ar-SA-HamedNeural), through edge-tts.

Run it on a computer with normal internet access (it does not work in the
cloud session, which cannot reach the voice service):

    pip install edge-tts
    python hamed-tts.py

It writes tambora-part1-voice.zip next to this file: one MP3 per sentence
plus timings.json. Send that zip back and the reel is re-timed to the voice.

Options: --rate +10%  (faster)   --voice ar-SA-HamedNeural   --out file.zip

The sentences are the "speak" (or "text") fields of
src/reels/tambora/script.json, in order. Keep them in sync.
"""

import argparse
import asyncio
import json
import zipfile
from pathlib import Path

import edge_tts

SENTENCES = [
    "في العاشر من أبريل، عام ألف وثمانمئة وخمسة عشر...",
    "جزيرة سومباوا في إندونيسيا.",
    "جبل تامبورا ينفجر...",
    "في أقوى ثوران بركاني عرفه التاريخ المسجَّل.",
    "سُمع دويّه على بُعد أكثر من ألفي كيلومتر.",
    "وظنّه الناس طلقات مدافع.",
    "قذف أكثر من مئة كيلومتر مكعب من الرماد والصخور.",
    "وفقد الجبل نحو ألف وأربعمئة متر من ارتفاعه.",
    "مات أكثر من واحد وسبعين ألف شخص...",
    "أغلبهم من الجوع والمرض بعد الثوران.",
    "لكن الكارثة الحقيقية لم تبدأ بعد.",
    "صعد الكبريت إلى أعلى طبقات الجو...",
    "وانتشر حول الأرض، فحجب جزءاً من أشعة الشمس.",
    "فانخفضت حرارة الأرض بنحو نصف درجة.",
    "عام ألف وثمانمئة وستة عشر...",
    "تساقط الثلج في شهر يونيو في أمريكا الشمالية.",
    "وفسدت المحاصيل في أوروبا، وجاع الناس.",
    "سمّاها العالم: سنة بلا صيف.",
    "فماذا لو ثار بركان بهذه القوة... الليلة؟",
    "الجواب في الجزء الثاني.",
]

# edge-tts sends constant-bitrate 48 kbit/s MP3, so bytes give the duration.
BYTES_PER_SECOND = 48000 / 8


async def synth(text, voice, rate):
    audio = bytearray()
    speech_end = 0.0
    async for chunk in edge_tts.Communicate(text, voice, rate=rate).stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            speech_end = max(speech_end, (chunk["offset"] + chunk["duration"]) / 1e7)
    return bytes(audio), speech_end


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="ar-SA-HamedNeural")
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--out", default=str(Path(__file__).with_name("tambora-part1-voice.zip")))
    args = parser.parse_args()

    timings = []
    with zipfile.ZipFile(args.out, "w") as z:
        for i, text in enumerate(SENTENCES, 1):
            audio, speech_end = await synth(text, args.voice, args.rate)
            name = f"{i:02d}.mp3"
            z.writestr(name, audio)
            timings.append(
                {"file": name, "text": text, "duration": round(len(audio) / BYTES_PER_SECOND, 3), "speechEnd": round(speech_end, 3)}
            )
            print(f"{name}  {timings[-1]['duration']:5.2f}s  {text}")
        z.writestr(
            "timings.json",
            json.dumps({"voice": args.voice, "rate": args.rate, "sentences": timings}, ensure_ascii=False, indent=2),
        )
    total = sum(t["duration"] for t in timings)
    print(f"\n{len(timings)} sentences, {total:.1f}s of speech -> {args.out}")


if __name__ == "__main__":
    asyncio.run(main())

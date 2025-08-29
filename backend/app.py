# app.py
from flask import Flask, jsonify
from pathlib import Path
import json, requests, datetime
from zoneinfo import ZoneInfo

# === 파일 기반 설정 로드 ===
CFG_PATH = Path(__file__).parent / "config.json"
with open(CFG_PATH, "r", encoding="utf-8") as f:
    CFG = json.load(f)

OPENWEATHER_KEY = CFG["openweather_key"]
CITY     = CFG.get("city", "Seoul")
COUNTRY  = CFG.get("country", "KR")
UNITS    = CFG.get("units", "metric")
TZ       = CFG.get("timezone", "Asia/Seoul")

app = Flask(__name__)

def fetch_weather():
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": f"{CITY},{COUNTRY}", "appid": OPENWEATHER_KEY, "units": UNITS}
    r = requests.get(url, params=params, timeout=5)
    r.raise_for_status()
    j = r.json()
    return {
        "temp_c": j["main"]["temp"],
        "cond": j["weather"][0]["main"],
        "icon": f"https://openweathermap.org/img/wn/{j['weather'][0]['icon']}.png"
    }

@app.get("/api/status")
def status():
    now = datetime.datetime.now(ZoneInfo(TZ))
    try:
        weather = fetch_weather()
    except Exception:
        weather = None
    return jsonify({
        "time": now.isoformat(),
        "location": {"city": CITY, "country": COUNTRY},
        "weather": weather,
        "supporters": {
            "recent": ["Illumi","Nagi-san","bread","Lady Faya","Kisne","Moon Foxy"],
            "tier3": ["emmathyst","Kirsi'vali","Humphreaky","WiFiPunk","Cirrus Shark"]
        },
        "alerts": ["OK"]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

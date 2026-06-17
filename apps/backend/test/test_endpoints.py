import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing /health endpoint...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health check status: {r.status_code}, response: {r.json()}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        return

    # 1. Test /api/analyze
    payload = {
        "source": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "language": "english"
    }
    print(f"\nTesting /api/analyze with payload: {payload}")
    try:
        r = requests.post(f"{BASE_URL}/api/analyze", json=payload, timeout=180)
        print(f"Analyze status: {r.status_code}")
        if r.ok:
            data = r.json()
            print("Response fields retrieved:")
            for k, v in data.items():
                print(f"- {k}: {str(v)[:300]}...")
        else:
            print(f"Error: {r.text}")
            return
    except Exception as e:
        print(f"Failed during analyze call: {e}")
        return

    # 2. Test /api/chat
    chat_payload = {
        "question": "What is the main promise or message of the song?"
    }
    print(f"\nTesting /api/chat with payload: {chat_payload}")
    try:
        r = requests.post(f"{BASE_URL}/api/chat", json=chat_payload, timeout=60)
        print(f"Chat status: {r.status_code}")
        if r.ok:
            print(f"Response: {r.json()}")
        else:
            print(f"Error: {r.text}")
    except Exception as e:
        print(f"Failed during chat call: {e}")

if __name__ == "__main__":
    test_api()

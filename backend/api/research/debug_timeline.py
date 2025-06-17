import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('PERPLEXITY_API_KEY')

# Minimal timeline request to test what's broken
url = "https://api.perplexity.ai/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Test 1: Super minimal request
payload1 = {
    "model": "llama-3.1-sonar-small-128k-online",
    "messages": [{"role": "user", "content": "Create a timeline for Frank Ocean's career"}],
    "max_tokens": 1000
}

print("Testing minimal timeline request...")
response = requests.post(url, headers=headers, json=payload1)
print(f"Status Code: {response.status_code}")
if response.status_code != 200:
    print(f"Error Response: {response.text}")
else:
    print("✅ Basic timeline request works!")

# Test 2: With domain filter
payload2 = {
    "model": "llama-3.1-sonar-small-128k-online",
    "messages": [{"role": "user", "content": "Create a timeline for Frank Ocean using reliable music sources"}],
    "max_tokens": 1000,
    "search_domain_filter": ["rollingstone.com", "pitchfork.com"]
}

print("\nTesting with domain filter...")
response2 = requests.post(url, headers=headers, json=payload2)
print(f"Status Code: {response2.status_code}")
if response2.status_code != 200:
    print(f"Error Response: {response2.text}")
else:
    print("✅ Domain filter works!")

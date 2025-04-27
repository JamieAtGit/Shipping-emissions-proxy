import requests

url = "http://localhost:5000/predict"

data = {
    "title": "Reusable Bamboo Straw",
    "material": "Bamboo",
    "weight": 0.05,
    "transport": "Land",
    "recyclability": "High",
    "origin": "China"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())

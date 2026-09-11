from agent.orchestrator import agent

profile = {
    "name": "Test User",
    "age": 25,
    "state": "Maharashtra",
    "occupation": "Student",
    "annual_income": 180000
}

result = {
    "eligible_schemes": [
        "Scholarship Scheme",
        "State Student Benefit"
    ],
    "conflicts": [],
    "documents": [
        "Income Certificate"
    ]
}

reply = agent.explain(profile, result)

print("\n==============================")
print("      YOJNASETU AI RESPONSE")
print("==============================\n")

print(reply)
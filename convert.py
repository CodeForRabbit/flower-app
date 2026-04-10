import pandas as pd
import json

df = pd.read_excel("花开富贵.xlsx")

result = []

for _, row in df.iterrows():
    result.append({
        "name": str(row[0]).strip(),
        "flowers": str(row[1]).strip()
    })

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("✅ data.json 已生成")
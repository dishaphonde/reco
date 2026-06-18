from faker import Faker
import random
import csv
import sys

fake = Faker()

industries = {
    "FMCG": ["Food Processing", "Beverages", "Personal Care"],
    "Technology": ["SaaS", "AI", "Cybersecurity"],
    "Manufacturing": ["Automotive", "Electronics", "Textiles"],
    "Healthcare": ["Pharmaceuticals", "Medical Devices"],
    "Retail": ["E-commerce", "Fashion"]
}

intents = [
    "Seeking Distributor",
    "Seeking Supplier",
    "Seeking Buyer",
    "Export",
    "Investment",
    "Partnership"
]

COUNTRIES = ["India", "UAE", "USA", "UK", "China", "Germany"]

def generate_row(i):
    industry = random.choice(list(industries.keys()))
    return {
        "id": i,
        "company_name": fake.company(),
        "industry": industry,
        "sub_industry": random.choice(industries[industry]),
        "country": random.choice(COUNTRIES),
        "city": fake.city(),
        "revenue_band": random.choice(["<1 Cr", "1-10 Cr", "10-50 Cr", "50+ Cr"]),
        "team_size": random.choice(["1-10", "11-50", "51-200", "200+"]),
        "business_intent": random.choice(intents),
        "products_services": fake.bs(),
        "MOQ": random.choice(["100", "500", "1000"]),
        "export_ready": random.choice(["Yes", "No"]),
        "profile_completeness": random.randint(50, 100),
        "verified": random.choice(["Yes", "No"]),
    }

if __name__ == "__main__":
    count = 200
    out = "bridge_business_dataset.csv"
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        out = sys.argv[2]

    with open(out, "w", newline='', encoding='utf-8') as f:
        writer = None
        for i in range(1, count+1):
            row = generate_row(i)
            if writer is None:
                writer = csv.DictWriter(f, fieldnames=list(row.keys()))
                writer.writeheader()
            writer.writerow(row)

    print(f"Wrote {count} rows to {out}")

import pandas as pd

from ml.trainer import train_model


df = pd.read_csv("data/customer_churn_test.csv")

result = train_model(
    df=df,
    target_column="churn"
)

print("\nML Training Result")
print("------------------")

for key, value in result.items():
    print(f"{key}: {value}")
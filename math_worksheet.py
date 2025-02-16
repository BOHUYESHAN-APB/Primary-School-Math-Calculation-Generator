import random

for _ in range(10):
    # Generate three-digit sum between 100 and 999
    sum_total = random.randint(100, 999)
    
    # Generate first addend (ensure both addends are at least two digits)
    addend1 = random.randint(10, sum_total - 10)
    addend2 = sum_total - addend1

    # Format with vertical alignment and consistent 5-character width
    print(f"{addend1:5}")
    print(f"+{addend2:4}")  # 4 spaces width after + sign
    print("-----")  # Fixed 5 dashes for three-digit sums
    print()  # Blank line between problems

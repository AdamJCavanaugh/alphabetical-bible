import csv
import json

# Read books and chapter counts from books.csv, skipping the header
books = []
with open("books.csv", newline="", encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    next(reader, None)  # Skip header row
    for row in reader:
        if not row or row[0].startswith("#"):
            continue  # Skip empty lines or comments
        book = row[0].strip()
        try:
            chapters = int(row[1].strip())
        except (IndexError, ValueError):
            continue  # Skip malformed lines
        books.append((book, chapters))

# Flatten all chapters into a list of (book, chapter)
chapters = []
for book, count in books:
    for chapter in range(1, count + 1):
        chapters.append((book, chapter))

# Calculate chapters per day
total_days = 365
chapters_per_day = len(chapters) // total_days
extra = len(chapters) % total_days

plan = []
i = 0
for day in range(1, total_days + 1):
    # Distribute extra chapters to the first 'extra' days
    num_chapters = chapters_per_day + (1 if day <= extra else 0)
    day_chapters = chapters[i:i+num_chapters]
    i += num_chapters

    # Group by book for reference string
    ref_parts = []
    j = 0
    while j < len(day_chapters):
        book = day_chapters[j][0]
        start = day_chapters[j][1]
        end = start
        while j + 1 < len(day_chapters) \
                and day_chapters[j+1][0] == book \
                and day_chapters[j+1][1] == end + 1:
            end += 1
            j += 1
        if start == end:
            ref_parts.append(f"{book} {start}")
        else:
            ref_parts.append(f"{book} {start}-{end}")
        j += 1

    reference = "; ".join(ref_parts)
    # Use the first book/chapter for the URL
    url = (
        f"https://www.bible.com/bible/111/"
        f"{day_chapters[0][0].replace(' ', '')}.{day_chapters[0][1]}.NIV"
    )
    plan.append({
        "day": day,
        "reference": reference,
        "url": url
    })

# Write to JSON
with open("reading-plan.json", "w", encoding="utf-8") as f:
    json.dump(plan, f, indent=2, ensure_ascii=False)

print("reading-plan.json generated with 365 days.")

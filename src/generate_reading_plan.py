import csv
import json

TOTAL_DAYS = 365


def load_chapters():
    with open("books.csv", newline="", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        next(reader, None)
        books = [
            (row[0].strip(), int(row[1].strip()))
            for row in reader
            if row and not row[0].startswith("#")
        ]

    return [
        (book, chapter)
        for book, count in books
        for chapter in range(1, count + 1)
    ]


def load_word_counts():
    with open("word-counts.csv", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        return [
            (row["book"], int(row["chapter"]), int(row["words"]))
            for row in reader
        ]


def format_chapter_reference(chapters):
    parts = []
    index = 0
    while index < len(chapters):
        book, start = chapters[index]
        end = start
        while (
            index + 1 < len(chapters)
            and chapters[index + 1][0] == book
            and chapters[index + 1][1] == end + 1
        ):
            end = chapters[index + 1][1]
            index += 1
        parts.append(f"{book} {start}" if start == end else f"{book} {start}-{end}")
        index += 1
    return "; ".join(parts)


def create_plan(units, formatter):
    base_size = len(units) // TOTAL_DAYS
    extra = len(units) % TOTAL_DAYS
    plan = []
    offset = 0

    for day in range(1, TOTAL_DAYS + 1):
        size = base_size + (1 if day <= extra else 0)
        day_units = units[offset:offset + size]
        offset += size
        reference = formatter(day_units)
        first_unit = day_units[0]
        plan.append({
            "day": day,
            "reference": reference,
            "url": (
                "https://www.bible.com/bible/111/"
                f"{first_unit[0].replace(' ', '')}.{first_unit[1]}.NIV"
            )
        })
    return plan


def create_word_balanced_plan(chapters):
    total_words = sum(words for _, _, words in chapters)
    plan = []
    start = 0
    words_read = 0

    for day in range(1, TOTAL_DAYS + 1):
        remaining_days = TOTAL_DAYS - day
        max_end = len(chapters) - remaining_days
        target_words_read = total_words * day / TOTAL_DAYS
        candidate_end = start + 1
        candidate_words_read = words_read + chapters[start][2]

        for end in range(start + 1, max_end + 1):
            words_at_end = sum(chapter[2] for chapter in chapters[start:end])
            if abs(words_read + words_at_end - target_words_read) < abs(candidate_words_read - target_words_read):
                candidate_end = end
                candidate_words_read = words_read + words_at_end

        day_chapters = chapters[start:candidate_end]
        plan.append({
            "day": day,
            "reference": format_chapter_reference(
                [(book, chapter) for book, chapter, _ in day_chapters]
            ),
            "url": (
                "https://www.bible.com/bible/111/"
                f"{day_chapters[0][0].replace(' ', '')}.{day_chapters[0][1]}.NIV"
            )
        })
        start = candidate_end
        words_read = candidate_words_read

    return plan


chapters = load_chapters()
chapter_plan = create_plan(chapters, format_chapter_reference)

word_counts = load_word_counts()
book_order = {book: index for index, (book, _) in enumerate(chapters)}
word_counts.sort(key=lambda item: (book_order[item[0]], item[1]))
word_plan = create_word_balanced_plan(word_counts)

with open("../docs/data/reading-plan.json", "w", encoding="utf-8") as output:
    json.dump(chapter_plan, output, indent=2, ensure_ascii=False)

with open("../docs/data/word-reading-plan.json", "w", encoding="utf-8") as output:
    json.dump(word_plan, output, indent=2, ensure_ascii=False)

print("Chapter and word-balanced reading plans generated with 365 days.")

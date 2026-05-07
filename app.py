from flask import Flask, jsonify, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

DATASET = [
    {
        "name": "Oats Berry Bowl",
        "price": 180,
        "calories": 290,
        "veg": True,
        "cuisine": "healthy",
        "description": "Rolled oats, berries, chia seeds, and honey.",
        "tags": ["healthy", "veg", "fiber"],
    },
    {
        "name": "Paneer Wrap",
        "price": 220,
        "calories": 410,
        "veg": True,
        "cuisine": "indian",
        "description": "Grilled paneer with mint yogurt and fresh salad.",
        "tags": ["protein", "veg"],
    },
    {
        "name": "Chicken Rice Bowl",
        "price": 320,
        "calories": 560,
        "veg": False,
        "cuisine": "grill",
        "description": "Tender chicken, rice, yogurt sauce, and greens.",
        "tags": ["high-protein", "non-veg"],
    },
    {
        "name": "Thai Tofu Noodles",
        "price": 280,
        "calories": 490,
        "veg": True,
        "cuisine": "asian",
        "description": "Rice noodles, tofu, peanuts, and fresh herbs.",
        "tags": ["vegan", "asian"],
    },
    {
        "name": "Dal Khichdi Comfort Bowl",
        "price": 240,
        "calories": 430,
        "veg": True,
        "cuisine": "indian",
        "description": "Rice, lentils, ghee, and seasonal vegetables.",
        "tags": ["comfort", "veg", "budget"],
    },
    {
        "name": "Tandoori Chicken Grill",
        "price": 350,
        "calories": 540,
        "veg": False,
        "cuisine": "indian",
        "description": "Char-grilled chicken with mint chutney and salad.",
        "tags": ["protein", "non-veg"],
    },
]


def build_text(item):
    return " ".join(
        [
            item["name"],
            item["cuisine"],
            item["description"],
            " ".join(item["tags"]),
            "veg" if item["veg"] else "non veg",
        ]
    )


def score_item(item, preferences, history):
    score = 0
    diet = preferences.get("diet", "any")
    cuisines = [value.lower() for value in preferences.get("cuisines", [])]
    budget = float(preferences.get("budget", 0))

    if diet == "veg" and item["veg"]:
        score += 30
    if diet == "vegan" and "vegan" in item["tags"]:
        score += 30
    if diet == "non-veg" and not item["veg"]:
        score += 20
    if item["cuisine"] in cuisines:
        score += 20
    if item["price"] <= budget:
        score += 15
    if item["name"] in history:
        score -= 12
    if "high-protein" in item["tags"]:
        score += 8
    if "budget" in item["tags"]:
        score += 8

    return score


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/recommend")
def recommend():
    payload = request.get_json(force=True) or {}
    preferences = payload.get("preferences", {})
    history = payload.get("history", [])
    menu_items = payload.get("menuItems") or DATASET

    corpus = [build_text(item) for item in menu_items]
    query = " ".join([
        preferences.get("diet", "any"),
        " ".join(preferences.get("cuisines", [])),
        str(preferences.get("budget", "")),
    ])

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(corpus + [query])
    similarities = cosine_similarity(matrix[-1], matrix[:-1]).flatten()

    ranked = []
    for index, item in enumerate(menu_items):
        if item["price"] > float(preferences.get("budget", item["price"])):
            continue
        if preferences.get("diet") == "veg" and not item.get("veg", True):
            continue
        if preferences.get("diet") == "vegan" and "vegan" not in item.get("tags", []):
            continue

        ranked.append(
            {
                **item,
                "score": round((similarities[index] * 100) + score_item(item, preferences, history), 2),
            }
        )

    ranked.sort(key=lambda item: (item["score"], -item["price"]), reverse=True)
    return jsonify({"recommendations": ranked[:6]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

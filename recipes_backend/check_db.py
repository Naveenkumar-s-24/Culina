import sqlite3

conn = sqlite3.connect('recipes.db')
cursor = conn.cursor()

# Count total recipes
cursor.execute("SELECT COUNT(*) FROM recipes")
print(f"Total recipes: {cursor.fetchone()[0]}")

# Show top 5 rated recipes
cursor.execute("SELECT title, cuisine, rating FROM recipes ORDER BY rating DESC LIMIT 5")
print("\nTop 5 rated recipes:")
for row in cursor.fetchall():
    print(f"  {row[0]} ({row[1]}) - Rating: {row[2]}")

conn.close()

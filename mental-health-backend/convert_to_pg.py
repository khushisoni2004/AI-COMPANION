import re

with open("main.py", "r") as f:
    code = f.read()

# 1. Replace sqlite3 import with psycopg2
code = code.replace("import sqlite3", "import psycopg2\nfrom psycopg2.extras import RealDictCursor\nimport os\nfrom dotenv import load_dotenv\n\nload_dotenv()")

# 2. Connection logic
sqlite_conn_block = """# =========================
# SQLITE SETUP
# =========================
conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
conn.row_factory = sqlite3.Row

with conn:
    cur = conn.cursor()"""

pg_conn_block = """# =========================
# POSTGRES SETUP
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True

def get_cursor():
    return conn.cursor(cursor_factory=RealDictCursor)

cur = get_cursor()"""

code = code.replace(sqlite_conn_block, pg_conn_block)

# 3. Replace schema creation (AUTOINCREMENT -> SERIAL, INTEGER PRIMARY KEY -> SERIAL PRIMARY KEY)
code = code.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
code = code.replace("INTEGER PRIMARY KEY,", "SERIAL PRIMARY KEY,")

# 4. Replace parameter placeholders `?` with `%s`
# Note: we only want to replace `?` if it's not in the prompt strings.
# Wait, are there `?` in CRISIS_RESPONSE or PROMPT?
# Let's check: CRISIS_RESPONSE has "alone." DIAGNOSIS_PATTERNS doesn't have ?. 
# Let's use regex to replace `?` only inside cur.execute( or conn.cursor().execute( strings.
# Actually, I can just use a simple replacer for queries.
def repl_query(match):
    s = match.group(0)
    return s.replace("?", "%s")

code = re.sub(r'execute\(\s*f?r?\"\"\"[\s\S]*?\"\"\"', repl_query, code)
code = re.sub(r'execute\(\s*f?r?\"[^\"]*\"', repl_query, code)

# 5. Date casting `date(time)` -> `CAST(time AS DATE)`
code = code.replace("date(time)", "CAST(time AS DATE)")
code = code.replace("date(?)", "CAST(%s AS DATE)")

# 6. lastrowid fix
# From:
#         cur.execute("""
#             INSERT INTO users (name, email, password_hash, age, created_at)
#             VALUES (?, ?, ?, ?, ?)
#         """, (name, email, password_hash, req.age, utc_now_iso()))
#         user_id = cur.lastrowid
# To:
#         cur.execute("""
#             INSERT INTO users (name, email, password_hash, age, created_at)
#             VALUES (%s, %s, %s, %s, %s) RETURNING id
#         """, (name, email, password_hash, req.age, utc_now_iso()))
#         user_id = cur.fetchone()["id"]

code = code.replace(
'''        cur.execute("""
            INSERT INTO users (name, email, password_hash, age, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, email, password_hash, req.age, utc_now_iso()))
        user_id = cur.lastrowid''',
'''        cur.execute("""
            INSERT INTO users (name, email, password_hash, age, created_at)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (name, email, password_hash, req.age, utc_now_iso()))
        user_id = cur.fetchone()["id"]'''
)

# 7. Replace conn.cursor() calls since psycopg2 context manager for conn doesn't give a cursor directly
# Actually, `with conn:` in psycopg2 starts a transaction, but we set `autocommit=True`.
# But `with conn:` doesn't work the same way. We should just replace `with conn:` with nothing, or just leave it if it works.
# `with conn:` in psycopg2 just commits at the end of the block.
# Let's replace `conn.cursor().execute` with `cur.execute`
code = code.replace("conn.cursor().execute(", "cur.execute(")
code = code.replace("conn.cursor().fetchone(", "cur.fetchone(")

with open("main.py", "w") as f:
    f.write(code)

print("Conversion complete.")

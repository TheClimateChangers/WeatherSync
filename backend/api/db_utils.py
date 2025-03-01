import psycopg2

def get_db_connection():
    """Connect to the PostgreSQL database."""
    conn = psycopg2.connect(
        dbname="tripsync",
        user="postgres",
        password="123",
        host="localhost",
        port="5432"
    )
    return conn

def fetch_events_from_db():
    """Fetch all events from the database using psycopg2."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, location, start_time FROM events;")
    events = cursor.fetchall()
    cursor.close()
    conn.close()
    return events
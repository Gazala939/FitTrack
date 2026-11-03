
from database import engine

try:
    connection = engine.connect()
    print("MySQL Database Connected Successfully!")
    connection.close()

except Exception as e:
    print("Database Connection Failed:", e)

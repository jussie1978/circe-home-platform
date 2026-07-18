from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL do banco de dados SQLite local
SQLALCHEMY_DATABASE_URL = "sqlite:///./circe_home.db"

# engine do SQLAlchemy para SQLite.
# connect_args={"check_same_thread": False} é necessário para o SQLite no FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência do DB para o FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

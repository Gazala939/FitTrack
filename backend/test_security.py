from security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

# Test password hashing
password = "FitTrack@123"

hashed = hash_password(password)

print("Hashed Password:", hashed)
print("Password Verified:", verify_password(password, hashed))

# Test JWT
token = create_access_token({"sub": "1"})

print("JWT Token Created:", bool(token))

decoded = decode_access_token(token)

print("Decoded User ID:", decoded["sub"])
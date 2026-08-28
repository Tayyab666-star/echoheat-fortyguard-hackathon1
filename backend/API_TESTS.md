# EchoHeat API Test Collection
# Base URL: Change this to your deployed URL or http://localhost:4000
BASE_URL=http://localhost:4000

# ─────────────────────────────────────────────────────────────
# TEST 1: Health Check
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with status "ok"

curl -X GET "$BASE_URL/api/v1/health" \
  -H "Content-Type: application/json"

# ─────────────────────────────────────────────────────────────
# TEST 2: Register New User
# ─────────────────────────────────────────────────────────────
# Expected: 201 Created with user + tokens

curl -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Operator",
    "email": "test@echoheat.com",
    "password": "TestPass123!",
    "role": "operator"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 3: Login
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with user + tokens

curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echoheat.com",
    "password": "TestPass123!"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 4: Get Current User (requires token from login)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with user profile
# Replace YOUR_JWT_TOKEN with the token from Test 3

curl -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ─────────────────────────────────────────────────────────────
# TEST 5: Forgot Password (sends OTP email)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with success message

curl -X POST "$BASE_URL/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echoheat.com"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 6: Verify OTP (replace OTP with code from email)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with resetToken
# Replace 123456 with the actual OTP from the email

curl -X POST "$BASE_URL/api/v1/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echoheat.com",
    "otp": "123456"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 7: Reset Password (requires resetToken from Test 6)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with success message
# Replace YOUR_RESET_TOKEN with the token from Test 6

curl -X POST "$BASE_URL/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "YOUR_RESET_TOKEN",
    "newPassword": "NewPass456!"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 8: Login with New Password
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with user + tokens

curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echoheat.com",
    "password": "NewPass456!"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 9: Get Assets (requires token)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with asset list

curl -X GET "$BASE_URL/api/v1/assets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ─────────────────────────────────────────────────────────────
# TEST 10: Get Alerts (requires token)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with alert list

curl -X GET "$BASE_URL/api/v1/alerts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ─────────────────────────────────────────────────────────────
# TEST 11: Get Analytics (requires token)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with analytics data

curl -X GET "$BASE_URL/api/v1/analytics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ─────────────────────────────────────────────────────────────
# TEST 12: Thermal Engine Status (requires token)
# ─────────────────────────────────────────────────────────────
# Expected: 200 OK with thermal engine data

curl -X GET "$BASE_URL/api/v1/thermal-engine/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ─────────────────────────────────────────────────────────────
# TEST 13: Protected Route Without Token (should fail)
# ─────────────────────────────────────────────────────────────
# Expected: 401 Unauthorized

curl -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Content-Type: application/json"

# ─────────────────────────────────────────────────────────────
# TEST 14: Register Duplicate User (should fail)
# ─────────────────────────────────────────────────────────────
# Expected: 409 Conflict

curl -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Operator 2",
    "email": "test@echoheat.com",
    "password": "TestPass123!",
    "role": "operator"
  }'

# ─────────────────────────────────────────────────────────────
# TEST 15: Login with Wrong Password (should fail)
# ─────────────────────────────────────────────────────────────
# Expected: 401 Unauthorized

curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echoheat.com",
    "password": "WrongPassword!"
  }'

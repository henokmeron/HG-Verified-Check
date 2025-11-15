# Complete Database Schema Reference

This document lists ALL tables and columns in your Neon database.

## 📊 Table: `users`

**Primary Key:** `id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique user ID (UUID) | Yes | Auto-generated |
| email | varchar | User email address | Yes | - |
| first_name | varchar | User's first name | No | - |
| last_name | varchar | User's last name | No | - |
| profile_image_url | varchar | Google profile image URL | No | - |
| credit_balance | integer | Current credit balance | Yes | 0 |
| stripe_customer_id | varchar | Stripe customer ID for payments | No | - |
| role | varchar | User role ('user' or 'admin') | Yes | 'user' |
| is_active | boolean | Whether account is active | Yes | true |
| last_login_at | timestamp | Last login timestamp | No | - |
| preferences | jsonb | User preferences (JSON) | Yes | {} |
| auth_provider | varchar | Authentication provider ('google', 'local') | Yes | 'local' |
| provider_id | varchar | OAuth provider user ID | No | - |
| password_hash | text | Hashed password (for local auth) | No | - |
| email_verified | boolean | Whether email is verified | Yes | false |
| mfa_enabled | boolean | Whether MFA is enabled | Yes | false |
| last_login_ip | varchar | IP address of last login | No | - |
| created_at | timestamp | Account creation timestamp | Yes | Auto (now) |
| updated_at | timestamp | Last update timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_role` - Filter by role
- `idx_users_created_at` - Sort by creation date
- `idx_users_auth_provider` - Filter by auth provider
- `idx_users_provider_id` - OAuth provider ID lookups

---

## 📊 Table: `vehicle_lookups`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique lookup ID (UUID) | Yes | Auto-generated |
| user_id | varchar | User who performed lookup | Yes | - |
| registration | varchar | Vehicle registration number | Yes | - |
| vehicle_data | jsonb | Full DVLA API response (JSON) | No | - |
| report_raw | jsonb | Complete VIDcheck JSON response | No | - |
| credits_cost | integer | Credits deducted for lookup | Yes | 1 |
| success | boolean | Whether lookup succeeded | Yes | true |
| error_message | text | Error message if failed | No | - |
| report_type | varchar | Type of report ('free', 'comprehensive') | Yes | 'comprehensive' |
| processing_time | integer | Time taken in milliseconds | No | - |
| api_provider | varchar | API provider used | Yes | 'vidcheck' |
| metadata | jsonb | Additional metadata (JSON) | Yes | {} |
| created_at | timestamp | Lookup timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_vehicle_lookups_user_id` - Find all lookups by user
- `idx_vehicle_lookups_registration` - Find lookups by registration
- `idx_vehicle_lookups_created_at` - Sort by date
- `idx_vehicle_lookups_success` - Filter by success/failure

---

## 📊 Table: `credit_transactions`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique transaction ID (UUID) | Yes | Auto-generated |
| user_id | varchar | User who made transaction | Yes | - |
| type | varchar | Transaction type ('purchase', 'deduction', 'refund', 'bonus', 'expired') | Yes | - |
| amount | integer | Credit amount (positive or negative) | Yes | - |
| description | text | Transaction description | No | - |
| stripe_payment_intent_id | varchar | Stripe payment ID | No | - |
| metadata | jsonb | Additional transaction data (JSON) | Yes | {} |
| created_at | timestamp | Transaction timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_credit_transactions_user_id` - Find all transactions by user
- `idx_credit_transactions_type` - Filter by transaction type
- `idx_credit_transactions_created_at` - Sort by date

---

## 📊 Table: `saved_reports`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`, `lookup_id` → `vehicle_lookups.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique report ID (UUID) | Yes | Auto-generated |
| user_id | varchar | User who saved report | Yes | - |
| vrm | varchar | Vehicle registration number | Yes | - |
| check_type | varchar | Type of check ('comprehensive' or 'free') | Yes | - |
| bytes | integer | PDF file size in bytes | Yes | - |
| file_name | varchar | PDF filename | Yes | - |
| storage_key | varchar | Storage location key | Yes | - |
| download_url | varchar | URL to download PDF | Yes | - |
| lookup_id | varchar | Related vehicle lookup ID | No | - |
| download_count | integer | Number of times downloaded | Yes | 0 |
| expires_at | timestamp | When report expires | No | - |
| created_at | timestamp | Report creation timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_saved_reports_user_id` - Find all reports by user
- `idx_saved_reports_vrm` - Find reports by registration
- `idx_saved_reports_created_at` - Sort by date

---

## 📊 Table: `shared_reports`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`, `lookup_id` → `vehicle_lookups.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique share ID (UUID) | Yes | Auto-generated |
| share_code | varchar | Unique share code for public access | Yes | - |
| lookup_id | varchar | Related vehicle lookup ID | Yes | - |
| user_id | varchar | User who shared report | Yes | - |
| expires_at | timestamp | When share expires | No | - |
| view_count | integer | Number of times viewed | Yes | 0 |
| created_at | timestamp | Share creation timestamp | Yes | Auto (now) |

---

## 📊 Table: `analytics`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique analytics ID (UUID) | Yes | Auto-generated |
| event_type | varchar | Event type ('page_view', 'lookup', 'download', 'share', etc.) | Yes | - |
| user_id | varchar | User who triggered event | No | - |
| session_id | varchar | Session identifier | No | - |
| page | varchar | Page where event occurred | No | - |
| referrer | varchar | Referrer URL | No | - |
| user_agent | text | Browser user agent | No | - |
| ip_address | varchar | IP address | No | - |
| metadata | jsonb | Additional event data (JSON) | Yes | {} |
| created_at | timestamp | Event timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_analytics_event_type` - Filter by event type
- `idx_analytics_user_id` - Find events by user
- `idx_analytics_created_at` - Sort by date
- `idx_analytics_session_id` - Track user sessions

---

## 📊 Table: `api_usage`

**Primary Key:** `id`  
**Foreign Key:** `user_id` → `users.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique usage ID (UUID) | Yes | Auto-generated |
| user_id | varchar | User who made API call | No | - |
| endpoint | varchar | API endpoint called | Yes | - |
| method | varchar | HTTP method ('GET', 'POST', etc.) | Yes | - |
| status_code | integer | HTTP status code | Yes | - |
| response_time | integer | Response time in milliseconds | Yes | - |
| request_size | integer | Request size in bytes | No | - |
| response_size | integer | Response size in bytes | No | - |
| ip_address | varchar | IP address of request | No | - |
| user_agent | text | Browser user agent | No | - |
| created_at | timestamp | Request timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_api_usage_user_id` - Find API calls by user
- `idx_api_usage_endpoint` - Filter by endpoint
- `idx_api_usage_created_at` - Sort by date
- `idx_api_usage_status_code` - Filter by status code

---

## 📊 Table: `system_config`

**Primary Key:** `id`  
**Foreign Key:** `updated_by` → `users.id`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| id | varchar | Unique config ID (UUID) | Yes | Auto-generated |
| key | varchar | Configuration key (unique) | Yes | - |
| value | jsonb | Configuration value (JSON) | Yes | - |
| description | text | Configuration description | No | - |
| is_public | boolean | Whether config is public | Yes | false |
| updated_by | varchar | User who last updated | No | - |
| created_at | timestamp | Creation timestamp | Yes | Auto (now) |
| updated_at | timestamp | Last update timestamp | Yes | Auto (now) |

**Indexes:**
- `idx_system_config_key` - Fast key lookups
- `idx_system_config_is_public` - Filter public configs

---

## 📊 Table: `sessions`

**Primary Key:** `sid`

| Column Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| sid | varchar | Session ID | Yes | - |
| sess | jsonb | Session data (JSON) | Yes | - |
| expire | timestamp | Session expiration | Yes | - |

**Indexes:**
- `IDX_session_expire` - Find expired sessions

---

## 🔗 Relationships

- **users** → **vehicle_lookups** (one-to-many)
- **users** → **credit_transactions** (one-to-many)
- **users** → **saved_reports** (one-to-many)
- **users** → **shared_reports** (one-to-many)
- **users** → **analytics** (one-to-many)
- **users** → **api_usage** (one-to-many)
- **vehicle_lookups** → **saved_reports** (one-to-many)
- **vehicle_lookups** → **shared_reports** (one-to-many)

---

## 📝 Notes

- All timestamps are in UTC
- JSONB columns store structured data (can query with PostgreSQL JSON operators)
- Foreign keys use CASCADE or SET NULL for cleanup
- Indexes improve query performance
- UUIDs are generated automatically using `gen_random_uuid()`


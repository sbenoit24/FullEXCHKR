# Unit.co Integration Guide

This document describes the Unit.co integration in Exchkr for deposit accounts, money movement, card issuing, and capital.

## Features Implemented

### 1. Deposit Accounts
- **Club bank accounts**: Create Unit business customers and deposit accounts for clubs
- **Member wallets**: Create Unit individual customers and wallet accounts for members

### 2. Money Movement
- **ACH payments**: Send ACH to external accounts or between Unit accounts
- **Wire payments**: Send wire transfers
- **Internal transfers**: Book transfers between Unit accounts

### 3. Card Issuing
- **Debit/credit cards**: Issue cards linked to club or member deposit accounts

### 4. Capital
- **Credit applications**: Apply for loans or credit lines for clubs

### 5. Webhooks
- **Application approved**: Auto-create deposit account when Unit approves application
- **Account created**: Update local records

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchkr/api/unit/identity` | Verify Unit API connection |
| POST | `/exchkr/api/unit/club/account` | Create club Unit account |
| POST | `/exchkr/api/unit/member/wallet` | Create member Unit wallet |
| GET | `/exchkr/api/unit/club/{clubId}/balance` | Get club balance |
| GET | `/exchkr/api/unit/member/{userId}/balance` | Get member balance |
| GET | `/exchkr/api/unit/club/{clubId}/status` | Get club Unit status |
| GET | `/exchkr/api/unit/member/{userId}/status` | Get member Unit status |
| GET | `/exchkr/api/unit/applications/{id}/sync` | Sync application status (no webhook needed) |
| POST | `/exchkr/api/unit/applications/sync-all` | Sync all pending applications |
| POST | `/exchkr/api/unit/payments/ach` | Create ACH payment |
| POST | `/exchkr/api/unit/payments/wire` | Create wire payment |
| POST | `/exchkr/api/unit/payments/transfer` | Create internal transfer |
| POST | `/exchkr/api/unit/cards` | Create card |
| GET | `/exchkr/api/unit/cards?ownerType=CLUB&ownerId=1` | Get cards |
| POST | `/exchkr/api/unit/credit/apply` | Apply for capital |
| GET | `/exchkr/api/unit/credit/{id}/status` | Get credit application status |

---

## Configuration

### Environment Variables
- `UNIT_API_TOKEN` – Your Unit API token (required)
- `UNIT_WEBHOOK_SECRET` – Optional, for webhook signature verification
- `DB_USERNAME` – Database username (for app startup)

### Unit Dashboard Setup
1. Create API token at [app.s.unit.sh](https://app.s.unit.sh) → Developer → API Tokens
2. Configure webhook URL: `https://your-domain/exchkr/webhook/unit`
3. Subscribe to events: `application.approved`, `customer.created`, `account.created`

---

## Database Tables

- `ecm_club_unit` – Club → Unit customer/account mapping
- `ecm_member_unit` – Member → Unit customer/account mapping  
- `ecm_unit_card` – Unit-issued cards

---

## Flow: Club Onboarding

1. **POST** `/api/unit/club/account` with club details (name, EIN, address, contact)
2. Unit creates application; status is `Pending` or `Approved`
3. When approved:
   - **With webhook:** Unit sends webhook → we create deposit account and update `ecm_club_unit`
   - **Without webhook (pre-launch):** Call `GET /api/unit/applications/{applicationId}/sync` or `POST /api/unit/applications/sync-all` to poll and create
4. Club can then receive payments, issue cards, apply for capital

---

## Flow: Member Wallet

1. **POST** `/api/unit/member/wallet` with member details (name, SSN, DOB, address)
2. Unit creates individual application
3. When approved: webhook creates deposit account, or use sync endpoints (pre-launch)
4. Member can receive/send payments, get a card

---

## Pre-Launch (No Live Site)

When you don't have a public URL for webhooks:
- Use **Sync endpoints** instead of webhooks:
  - `GET /api/unit/applications/{applicationId}/sync` – poll one application
  - `POST /api/unit/applications/sync-all` – sync all pending club and member applications
- After submitting an application, call sync when Unit has approved it (or poll periodically)
- Sync endpoints are public for local testing; restrict in production

---

## Notes

- **Sandbox**: Use `https://api.s.unit.sh` (default)
- **Live**: Set `unit.api.url=https://api.unit.co` in application.properties
- **PCI**: Card-sensitive operations (PIN, CVV) require Unit Customer Tokens and 2FA
- **Bank partner**: Features may vary by Unit bank partner; check Unit docs for your program

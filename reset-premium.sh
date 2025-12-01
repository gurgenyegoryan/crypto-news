#!/bin/bash

# Reset premium subscription for gurgen@2vmdls.com

docker exec -it cryptomonitor-postgres psql -U postgres -d cryptomonitor -c "
UPDATE \"User\" 
SET 
    tier = 'free',
    \"subscriptionStatus\" = 'expired',
    \"premiumUntil\" = NULL,
    \"lastPaymentDate\" = NULL
WHERE email = 'gurgen@2vmdls.com';
"

echo "✅ Premium subscription removed for gurgen@2vmdls.com"

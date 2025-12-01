#!/bin/bash

# Reset premium subscription for gurgen@2vmdls.com

docker exec -it cryptomonitor-postgres psql -U postgres -d cryptomonitor -c "
UPDATE users 
SET 
    tier = 'free',
    subscription_status = 'expired',
    premium_until = NULL,
    last_payment_date = NULL
WHERE email = 'gurgen@2vmdls.com';
"

echo "✅ Premium subscription removed for gurgen@2vmdls.com"

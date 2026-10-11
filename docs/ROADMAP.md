# Development roadmap

## Completed in the integration branch

Repository documentation and cleanup; explicit environment configuration; versioned account/jobs/device schema; persisted sessions and logout; administrator job publishing; searchable sample catalog; device keys, validated reports and owner isolation; responsive website pages; unit/API tests and full-stack CI configuration.

## Before production

1. Revoke the previously exposed Google service-account key.
2. Confirm the full MySQL/browser CI checks pass and test the Windows setup on the target machine.
3. Configure HTTPS hosting, a matching origin, least-privilege database credentials and deployment-specific proxy/rate limits.
4. Verify backups and restore, error monitoring, telemetry retention and storage capacity.
5. Implement email verification, password recovery and account-management requirements.

## Physical IoT

Confirm controller and sensor part numbers, wiring and voltages. Implement/calibrate supported sensor drivers, update firmware to the authenticated JSON contract, and record network/reconnect tests. Never substitute invented readings for absent measurements.

## Rover and image processing

Develop these as separate verified features. Add emergency stopping and communication-loss behavior before rover operation. Train and evaluate image models against a documented dataset before enabling their API.

## Commerce

Seller accounts, real products, inventory, cart, orders, payment processing and refunds require a separately designed schema and complete transaction workflows. The current sample catalog does not represent a functioning store.

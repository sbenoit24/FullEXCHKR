#!/bin/bash
# Run the Exchkr app with Unit API token. Set UNIT_API_TOKEN before running, or paste below.
# Requires: PostgreSQL running on localhost:5432 with database 'exchkr'

cd "$(dirname "$0")"

# Set your Unit token here or export UNIT_API_TOKEN before running
# export UNIT_API_TOKEN=your_token_here

./mvnw spring-boot:run

#!/bin/bash

# Load Cypress environment variables if the file exists
if [ -f .env.cypress.local ]; then
  export $(cat .env.cypress.local | grep -v '^#' | xargs)
fi

# Run the Cypress command passed as arguments
"$@"
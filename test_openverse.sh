#!/bin/bash

# Diagnostic script for Openverse Validated Image Pipeline

echo "🔍 Testing Openverse Image Pipeline..."

# 1. Test Openverse Search + Validation
# This calls the internal API which triggers the search and validation logic.
echo "📡 Requesting a validated image for 'Roman Aqueduct'..."

curl -s -X POST http://localhost:3000/api/openverse \
  -H "Content-Type: application/json" \
  -d '{ 
    "query": "Roman aqueduct", 
    "contextSnippet": "Roman engineers built massive stone structures called aqueducts to transport water from distant sources into cities and industrial sites." 
  }' | jq '.'

echo -e "\n✅ Diagnostic complete."

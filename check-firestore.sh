#!/bin/bash

# FIRESTORE DIAGNOSTIC SCRIPT
# This helps identify Firestore connectivity issues

echo "🔍 Firestore Diagnostic Check"
echo "=============================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Extract Firebase config
    PROJECT_ID=$(grep "VITE_FIREBASE_PROJECT_ID" .env | cut -d '=' -f 2)
    API_KEY=$(grep "VITE_FIREBASE_API_KEY" .env | cut -d '=' -f 2)
    
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ VITE_FIREBASE_PROJECT_ID not found in .env"
    else
        echo "✅ Project ID: $PROJECT_ID"
    fi
    
    if [ -z "$API_KEY" ]; then
        echo "❌ VITE_FIREBASE_API_KEY not found in .env"
    else
        echo "✅ API Key found (first 20 chars): ${API_KEY:0:20}..."
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "📋 REQUIRED FIRESTORE CHECKS:"
echo "1. Go to Firebase Console → Firestore Database"
echo "2. Check that database shows 'Ready' status"
echo "3. Check Security tab - rules should allow auth access"
echo "4. Create test user in Authentication"
echo "5. Test login in app"
echo ""

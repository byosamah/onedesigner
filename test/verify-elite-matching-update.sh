#!/bin/bash

echo "🔍 Verifying Elite Matching System Updates"
echo "=========================================="
echo ""

echo "1. Checking enhanced-matching-prompt.ts for new instructions..."
if grep -q "elite designer-client matchmaker AI" src/lib/ai/enhanced-matching-prompt.ts; then
  echo "✅ Enhanced prompt updated with elite matchmaker instructions"
else
  echo "❌ Enhanced prompt NOT updated"
fi

echo ""
echo "2. Checking deepseek.ts system prompt..."
if grep -q "THE SINGLE PERFECT MATCH" src/lib/ai/providers/deepseek.ts; then
  echo "✅ DeepSeek system prompt updated for single match"
else
  echo "❌ DeepSeek system prompt NOT updated"
fi

echo ""
echo "3. Checking deepseek.ts matching prompt..."
if grep -q "YOUR MISSION ====" src/lib/ai/providers/deepseek.ts; then
  echo "✅ DeepSeek matching prompt updated with new format"
else
  echo "❌ DeepSeek matching prompt NOT updated"
fi

echo ""
echo "4. Checking for single match response handling..."
if grep -q "selectedDesignerIndex" src/lib/ai/providers/deepseek.ts; then
  echo "✅ Response parser updated for single match format"
else
  echo "❌ Response parser NOT updated"
fi

echo ""
echo "5. Checking scoring algorithm..."
if grep -q "CATEGORY MASTERY (30 pts)" src/lib/ai/providers/deepseek.ts; then
  echo "✅ New scoring matrix implemented"
else
  echo "❌ Scoring matrix NOT updated"
fi

echo ""
echo "=========================================="
echo "Summary: Elite matching system update verification complete"
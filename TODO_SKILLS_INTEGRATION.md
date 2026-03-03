# Skills Integration from Extracted Data - Implementation Plan

## Overview
Store extracted skills from the document extraction API in the database and display them in the portfolio page.

## Changes Required

### 1. Database Schema Update
- Add `extracted_data` JSONB column to `proofs` table in Supabase

### 2. Update proofsApi.js
- Modify `uploadProof` function to accept and save `extractedData`

### 3. Update upload.jsx  
- Pass extracted data (including skills) to uploadProof

### 4. Update portfolio.jsx
- Retrieve extracted_data from proofs
- Use extracted skills when available, fallback to keyword-based extraction

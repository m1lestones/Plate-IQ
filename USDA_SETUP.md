# USDA FoodData Central API Setup

## Get Your Free API Key

1. Go to: https://fdc.nal.usda.gov/api-key-signup.html
2. Fill out the form (name, email, organization)
3. Check your email for the API key
4. Copy the API key

## Add to Your Project

1. Open `.env` file (create if it doesn't exist)
2. Add your USDA API key:
   ```
   VITE_USDA_API_KEY=your_api_key_here
   ```
3. Restart your dev server

## How It Works

**With USDA API Key:**
- Demo meals are enhanced with real USDA nutrition data
- More accurate calorie, macro, and micronutrient values
- Based on USDA's 380K+ food database

**Without USDA API Key:**
- App uses pre-cached demo nutrition data
- Still fully functional for testing and demos
- All features work normally

## API Limits

- **Free tier:** 1,000 requests per hour
- More than enough for development and demos
- No credit card required

## Testing

Once configured, check browser console for:
```
USDA API detected - enhancing meal with real nutrition data...
```

If not configured:
```
USDA API not configured - using demo nutrition data
```

## API Documentation

Full docs: https://fdc.nal.usda.gov/api-guide.html

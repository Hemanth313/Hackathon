// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log(genAI)
app.post('/api/gemini', async (req, res) => {
  const { prompt, ingredients, cookTime } = req.body;

  let finalPrompt;

  // If prompt is sent directly (from chatbot)
  if (prompt && typeof prompt === 'string') {
    finalPrompt = prompt;
  }
  // If ingredients + cookTime are provided (for recipe generation)
  else if (
    Array.isArray(ingredients) &&
    ingredients.length > 0 &&
    cookTime &&
    !isNaN(cookTime) &&
    cookTime > 0
  ) {
    finalPrompt = `I have these ingredients: ${ingredients.join(
      ', '
    )}. Suggest 3 different recipes I can cook in under ${cookTime} minutes. The response should be 3 paragraphs. Don't include ingredient lists etc. in the response, and no decorative text like "Here's a recipe for you" or "Another recipe you'd enjoy...".`;
  } else {
    return res.status(400).json({ error: 'A valid prompt or recipe info is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();

    // Format: split into lines or return raw
    const isChatbot = !!prompt;
    const response =
      isChatbot
        ? responseText.trim()
        : responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, 3);

    return res.status(200).json({ response, recipes: Array.isArray(response) ? response : undefined });
  } catch (error) {
    console.error('Gemini error:', error);
    return res.status(500).json({ error: 'Failed to get response from Gemini API.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Gemini server running at http://localhost:${port}`);
});

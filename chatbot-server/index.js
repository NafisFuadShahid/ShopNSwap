const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');  // Import the OpenAI class

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create an instance of OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post('/api/chatbot', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // You can use a different model as needed
      messages: [{ role: 'user', content: req.body.text }],
    });

    res.json({ reply: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error connecting to OpenAI.' });
  }
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

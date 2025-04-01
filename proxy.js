const express = require('express');
const cors = require('cors');
// Fix for fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/emissions', async (req, res) => {
  try {
    console.log("Received emission request:", req.body); // 🪵 Debug log

    const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARBON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log("Carbon API response:", data); // 🪵 Debug log

    res.json(data);
  } catch (err) {
    console.error("Error in /emissions:", err); // 💥 This will show in Render
    res.status(500).json({ error: 'Failed to fetch emissions' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

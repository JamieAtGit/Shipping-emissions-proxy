const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/emissions', async (req, res) => {
  try {
    const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        Authorization: 'I4RDfpabCApH53rqkUAQ', // 👈 replace this
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch emissions' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

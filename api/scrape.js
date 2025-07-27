const axios = require('axios');

module.exports = async function (req, res) {
  const { url } = req.query;

  if (!url || !url.includes('cedok.cz')) {
    return res.status(400).json({ error: 'Zadej platnou URL ze stránky Čedoku.' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;

    res.status(200).json({
      originalUrl: url,
      html
    });

  } catch (error) {
    console.error('Chyba při stahování HTML:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst stránku.' });
  }
};

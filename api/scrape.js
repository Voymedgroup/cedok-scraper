const axios = require('axios');

module.exports = async function (req, res) {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl) {
      return res.status(400).json({ error: 'Chybí parametr "url".' });
    }

    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith('https://www.cedok.cz/')) {
      return res.status(400).json({ error: 'URL musí začínat na https://www.cedok.cz/' });
    }

    const response = await axios.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;

    // Rozdělíme HTML na části (např. po 150000 znaků)
    const chunkSize = 150000;
    const chunks = [];
    for (let i = 0; i < html.length; i += chunkSize) {
      chunks.push(html.slice(i, i + chunkSize));
    }

    return res.status(200).json({
      originalUrl: decodedUrl,
      chunks // např. [část1, část2, část3]
    });

  } catch (err) {
    console.error('Chyba:', err.message);
    return res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

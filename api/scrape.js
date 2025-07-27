const axios = require('axios');

module.exports = async function (req, res) {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl) {
      return res.status(400).json({ error: 'Chybí parametr "url".' });
    }

    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith('https://www.cedok.cz/')) {
      return res.status(400).json({ error: 'URL musí být z domény www.cedok.cz.' });
    }

    const response = await axios.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      // Limituj velikost odpovědi, aby se server nezhroutil
      maxContentLength: 2 * 1024 * 1024, // 2 MB
      timeout: 10000 // 10s timeout
    });

    const html = response.data;

    // Volitelně zkrať obsah pro GPT, např. na prvních 300 000 znaků
    const trimmedHtml = html.length > 300000 ? html.slice(0, 300000) : html;

    return res.status(200).json({
      originalUrl: decodedUrl,
      html: trimmedHtml
    });

  } catch (err) {
    console.error('SCRAPE ERROR:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: `HTTP chyba ${err.response.status} při načítání stránky.`
      });
    }

    return res.status(500).json({
      error: 'Nepodařilo se načíst nebo zpracovat stránku.',
      details: err.message
    });
  }
};

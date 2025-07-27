const axios = require('axios');
const cheerio = require('cheerio');

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
      timeout: 10000
    });

    // Načti celý HTML dokument
    const $ = cheerio.load(response.data);

    // Získej pouze <body>
    const bodyHtml = $('body').html() || '';

    // Omez velikost na max. 300 000 znaků pro bezpečnost
    const trimmed = bodyHtml.length > 300000 ? bodyHtml.slice(0, 300000) : bodyHtml;

    return res.status(200).json({
      originalUrl: decodedUrl,
      html: trimmed
    });

  } catch (err) {
    console.error('SCRAPE ERROR:', err.message);
    return res.status(500).json({
      error: 'Nepodařilo se načíst nebo zpracovat stránku.',
      details: err.message
    });
  }
};

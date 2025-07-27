const axios = require('axios');

module.exports = async function (req, res) {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl) {
      return res.status(400).json({ error: 'Chybí parametr "url".' });
    }

    // Dekóduj URL – protože při předání přes query string bude zakódovaná
    const decodedUrl = decodeURIComponent(rawUrl);

    // Kontrola domény
    if (!decodedUrl.startsWith('https://www.cedok.cz/')) {
      return res.status(400).json({ error: 'URL musí začínat na https://www.cedok.cz/' });
    }

    // Stáhni obsah stránky
    const response = await axios.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;

    return res.status(200).json({
      originalUrl: decodedUrl,
      html
    });

  } catch (err) {
    console.error('Chyba:', err.message);
    return res.status(500).json({ error: 'Nepodařilo se načíst nebo

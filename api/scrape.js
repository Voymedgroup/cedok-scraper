const axios = require('axios');

module.exports = async function (req, res) {
  try {
    const rawUrl = req.query.url;
    const part = parseInt(req.query.part || '1', 10);

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
    const chunkSize = 150000;

    const totalParts = Math.ceil(html.length / chunkSize);

    if (part < 1 || part > totalParts) {
      return res.status(400).json({ error: `Part musí být mezi 1 a ${totalParts}` });
    }

    const start = (part - 1) * chunkSize;
    const end = start + chunkSize;

    return res.status(200).json({
      originalUrl: decodedUrl,
      part,
      totalParts,
      content: html.slice(start, end)
    });

  } catch (err) {
    console.error('Chyba:', err.message);
    return res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

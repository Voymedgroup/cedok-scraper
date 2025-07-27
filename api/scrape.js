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
      return res.status(400).json({ error: 'URL musí začínat na https://www.cedok.cz/' });
    }

    const response = await axios.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Najdeme embedded JSON ve <script id="__NEXT_DATA__">
    const jsonScript = $('#__NEXT_DATA__').html();

    if (!jsonScript) {
      return res.status(500).json({ error: 'Embedded JSON nenalezen.' });
    }

    const jsonData = JSON.parse(jsonScript);

    // Teď můžeme extrahovat, co potřebujeme
    const hotelData = jsonData?.props?.pageProps?.hotel || null;

    if (!hotelData) {
      return res.status(500).json({ error: 'Hotelová data nebyla nalezena v JSONu.' });
    }

    return res.status(200).json({
      originalUrl: decodedUrl,
      hotelName: hotelData.name,
      priceFrom: hotelData.priceFrom,
      hotelData
    });

  } catch (err) {
    console.error('Chyba:', err.message);
    return res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

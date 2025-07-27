const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function (req, res) {
  const { url } = req.query;

  if (!url || !url.includes('cedok.cz')) {
    return res.status(400).json({ error: 'Zadej platnou URL z webu Čedoku.' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const scriptContent = $('#__NEXT_DATA__').html();

    if (!scriptContent) {
      return res.status(404).json({ error: 'Data ve stránce nebyla nalezena.' });
    }

    const data = JSON.parse(scriptContent);
    const product = data?.props?.pageProps?.product;

    if (!product) {
      return res.status(404).json({ error: 'Produktová data nebyla nalezena.' });
    }

    const title = product.name || 'Neznámý hotel';
    const priceTotal = product.price?.current || 'neuvedeno';
    const departureDate = product.date || product.datum || '';
    const nights = product.nights ? `${product.nights} nocí` : '';
    const board = product.board || '';

    const numericPrice = parseInt(priceTotal.replace(/[^\d]/g, '')) || 0;
    const pricePerPerson = numericPrice ? Math.round(numericPrice / 2) + ' Kč' : null;

    res.status(200).json({
      originalUrl: url,
      title,
      departureDate,
      nights,
      board,
      priceTotal,
      pricePerPerson
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

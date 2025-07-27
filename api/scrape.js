const axios = require('axios');
const cheerio = require('cheerio');

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
    const $ = cheerio.load(html);

    let jsonData = null;

    $('script[type="application/ld+json"]').each((i, el) => {
      const content = $(el).html();

      try {
        const parsed = JSON.parse(content);

        // Např. hledáme objekt typu Product, kde bude "name", "price" atd.
        if (parsed && parsed.name && parsed.offers?.price) {
          jsonData = parsed;
        }
      } catch (err) {
        // ignoruj chyby v parse
      }
    });

    if (!jsonData) {
      return res.status(404).json({ error: 'Data nebyla nalezena ve stránce.' });
    }

    const title = jsonData.name;
    const priceTotal = jsonData.offers?.price + ' Kč';
    const departureDate = jsonData.validFrom || '';
    const nights = jsonData.description?.match(/(\d+)\s+nocí/)?.[1] + ' nocí' || '';
    const board = jsonData.description?.match(/Strava:\s*([^\.\n]+)/)?.[1] || '';

    const numericPrice = parseInt(jsonData.offers?.price) || 0;
    const pricePerPerson = numericPrice ? Math.round(numericPrice / 2) + ' Kč' : null;

    res.json({
      originalUrl: url,
      title,
      departureDate,
      nights,
      board,
      priceTotal,
      pricePerPerson
    });

  } catch (error) {
    console.error('Scraper error:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

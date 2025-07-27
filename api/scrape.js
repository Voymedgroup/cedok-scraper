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

    // 🧠 Hledáme objekt window.__INITIAL_STATE__ = {...};
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);

    if (!stateMatch || !stateMatch[1]) {
      return res.status(404).json({ error: 'Nepodařilo se najít data ve stránce.' });
    }

    let state;
    try {
      state = JSON.parse(stateMatch[1]);
    } catch (e) {
      return res.status(500).json({ error: 'Chyba při parsování dat.' });
    }

    // 🧠 Zkusíme najít první zájezd v objektu
    const detailData = state?.productDetail?.product || {};

    const title = detailData?.name || 'Neznámý hotel';
    const priceTotal = detailData?.price?.current || '';
    const departureDate = detailData?.datum || '';
    const nights = detailData?.nights ? `${detailData.nights} nocí` : '';
    const board = detailData?.board || '';

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
    console.error('Chyba:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};

const qs = require("querystring");
const axios = require("axios");

const ATL_BASE = "https://atlantich2h.com";
const ATL_KEY = "TBdyF1Yp2mn63eoR1jkAX1ZrE3K96j41fo3tpN84A4TubYf7hflBKH9n5EBvsgGsFm3WPY482eAQ06zbN1WOgM1RvoY1w30gCdPh"; // ← GANTI

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { action, reff_id, nominal, id } = req.body || {};

    if (!action) return res.status(400).json({ error: "action required" });

    let url = "";
    let payload = {};

    switch (action) {

      case "create":
        url = `${ATL_BASE}/deposit/create`;
        payload = {
          api_key: ATL_KEY,
          reff_id,
          nominal,
          type: "ewallet",
          metode: "QRIS",
        };
        break;

      case "status":
        url = `${ATL_BASE}/deposit/status`;
        payload = { api_key: ATL_KEY, id };
        break;

      case "cancel":
        url = `${ATL_BASE}/deposit/cancel`;
        payload = { api_key: ATL_KEY, id };
        break;

      default:
        return res.status(400).json({ error: "invalid action" });
    }

    const response = await axios.post(url, qs.stringify(payload), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
      validateStatus: () => true,
    });

    return res.status(200).json(response.data);

  } catch (e) {
    return res.status(500).json({ error: e.message || "server error" });
  }
};

const { bannerModel } = require('../models/bannerSchema');

async function listAllBanners(req, res) {
    res.render("../views/Admin/banner.ejs")
    // try {
    //     const banners = await bannerModel.find({}).sort({ createdAt: 1 });

    //     if (!banners || banners.length === 0) {
    //         return res.status(404).json({ error: 'No banners found.' });
    //     }

    //     res.status(200).json({ banners });
    // } catch (err) {
    //     console.error('Error fetching banners:', err);
    //     res.status(500).json({ error: 'Internal server error.' });
    // }
}

module.exports = { listAllBanners };

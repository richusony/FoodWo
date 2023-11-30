const { bannerModel } = require('../models/bannerSchema');

function viewBannerPage(req, res) {

    res.render("../views/Admin/banner.ejs")
}

async function listAllBanners(req, res) {
    try {
        const banners = await bannerModel.find({}).sort({ createdAt: 1 });

        if (!banners || banners.length === 0) {
            return res.status(404).json({ error: 'No banners found.' });
        }
        console.log(banners)
        res.status(200).json({ banners });
    } catch (err) {
        console.error('Error fetching banners:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

async function uploadBanner(req, res) {
    try {
        const images = req.files ? req.files.map(file => file.path) : [];
        console.log("banners: ", images)
        if (images.length === 0) {
            return res.status(400).json({ error: "Banner images are required" });
        }

        const uploadResult = await bannerModel.create({ imageUrl: images[0] });

        if (uploadResult) {
            return res.status(200).json({ uploaded: true, success: "Banner uploaded" });
        } else {
            return res.status(400).json({ error: "Failed to upload banners" });
        }
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteBanner(req, res) {
    try {
        const imageUrl = req.query.image;
        const deletionResult = await bannerModel.deleteOne({ imageUrl: imageUrl });

        if (deletionResult && deletionResult.deletedCount > 0) {
            return res.status(200).json({ success: "Banner has been removed" });
        } else {
            return res.status(404).json({ error: "Banner not found or already deleted" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error while removing banner" });
    }
}



module.exports = {
    listAllBanners,
    uploadBanner,
    viewBannerPage,
    deleteBanner
};

const mongoose = require('mongoose');

const recentSearchSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    recent: {
        type: [String],
        required: true,
        validate: [arrayLimit, 'Exceeded the limit of 3 recent searches']
    }
});

function arrayLimit(val) {
    return val.length <= 3;
}

recentSearchSchema.statics.addRecentSearch = async function (userId, newSearch) {
    try {
        // Find or create a document for the user
        let recentSearchDoc = await this.findOne({ userId });

        if (!recentSearchDoc) {
            recentSearchDoc = new this({ userId, recent: [newSearch] });
        } else {
            // Add new search to the beginning of the array
            recentSearchDoc.recent.unshift(newSearch);

            // Keep only the first 3 searches
            recentSearchDoc.recent = recentSearchDoc.recent.slice(0, 3);
        }

        // Save the updated recent searches
        await recentSearchDoc.save();
        return recentSearchDoc;
    } catch (error) {
        throw error;
    }
};

const recentSearchModel = mongoose.model('recentSearch', recentSearchSchema);

module.exports = {
    recentSearchModel
};

const CoreConfiguration = require('../models/CoreConfiguration');

exports.createConfig = async (req, res) => {
    try {
        const { name, type, configData } = req.body;
        const newConfig = new CoreConfiguration({ name, type, configData });
        await newConfig.save();
        res.status(201).json(newConfig);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.viewConfig = async (req, res) => {
    try {
        console.log('req.params.name', req.query);

        if (!req.query.name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const config = await CoreConfiguration.findOne({ name: req.query.name });
        if (!config) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateConfigById = async (req, res) => {
    try {
        const { name, type, configData, active } = req.body;
        const updatedConfig = await CoreConfiguration.findByIdAndUpdate(
            req.params.id,
            { name, type, configData, active },
            { new: true }
        );
        if (!updatedConfig) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteConfigById = async (req, res) => {
    try {
        const deletedConfig = await CoreConfiguration.findByIdAndDelete(req.params.id);
        if (!deletedConfig) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
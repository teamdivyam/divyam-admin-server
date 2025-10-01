import AreaRadiusModel from "../models/arearadius.model.js";

export const setLocationRadius = async (req, res) => {
  try {
    const { areaRadius, lat, lon } = req.body;

    const FareaRadius = await AreaRadiusModel.create({ areaRadius, lat, lon });

    return res.status(200).json({ success: true, FareaRadius });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const ChangeLocationRadius = async (req, res) => {
  try {
    const { areaRadius, lat, lon } = req.body;

    let FareaRadius;
    const isAreaRadius = await AreaRadiusModel.findOne({});

    if (!isAreaRadius) {
      FareaRadius = await AreaRadiusModel.create({ areaRadius, lat, lon });
    } else {
      FareaRadius = await AreaRadiusModel.updateOne({ areaRadius, lat, lon });
    }

    return res.status(200).json({ success: true, FareaRadius });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const GetAreaDetail = async (req, res) => {
  try {
    const FareaRadius = await AreaRadiusModel.find({});

    return res.status(200).json({ success: true, FareaRadius });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

//------------------------------------------------------------------------------------------------------

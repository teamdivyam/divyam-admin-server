// model for area radious
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const areaRadiusSchema = new Schema({
    areaRadius: { type: Number, required: true },
    lat: { type: String, required: true },
    lon: { type: String, required: true },
})

const AreaRadiusModel = mongoose.model("AreaRadius", areaRadiusSchema)
export default AreaRadiusModel;
// latitude: 25.4476016866547
// ​​
// longitude: 81.86731858905999
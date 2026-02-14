const Form = require("../models/Form");

exports.getFormsByWorkspace = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;
    const forms = await Form.find({ workspace: workspaceId });
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

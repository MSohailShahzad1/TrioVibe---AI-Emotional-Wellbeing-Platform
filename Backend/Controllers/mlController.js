import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const predictTextEmotion = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "Text is required" });
        }

        // Path to the Python script (located in the parent directory of Controllers)
        const scriptPath = path.join(__dirname, "../ml_predict.py");

        // Spawn Python process
        const pythonProcess = spawn("python", [scriptPath, text]);

        let dataString = "";
        let errorString = "";

        pythonProcess.stdout.on("data", (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorString += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Error: ${errorString}`);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error during prediction",
                    error: errorString
                });
            }

            try {
                const result = JSON.parse(dataString);
                res.json(result);
            } catch (parseError) {
                console.error("Error parsing Python output:", parseError);
                res.status(500).json({
                    success: false,
                    message: "Error parsing prediction result"
                });
            }
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

import express from "express";
import CORS from "cors";
import { execFile } from "child_process";
import { promisify } from "util";

const app = express();
const initScriptPath = "./init.sh";
const terminateScriptPath = "./terminate.sh"
const PORT = 8080;
const execFilePromise = promisify(execFile);

app.use(CORS());
app.use(express.json());

function generateAlias(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

app.post("/api/v1/start", async (req, res) => {
  const { userID, environment } = req.body;
  const alias = generateAlias(5);
  const args = [alias, environment];
  try {
    const { stdout, stderr } = await execFilePromise(initScriptPath, args);

    if (stderr) {
      res.status(500).json({
        error: stderr,
      });
    }
    res.status(200).json({
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

app.delete("/api/v1/stop", async (req, res) => {
  const { userID, alias } = req.body
  const args = [alias];

  try {
    const { stdout, stderr } = await execFilePromise(terminateScriptPath, args);

    if (stderr) {
      res.status(500).json({
        error: stderr,
      });
    }
    res.status(200).json({
      message: "Environment terminated succesfully",
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
})

app.listen(PORT, () => console.log("Server is up"));

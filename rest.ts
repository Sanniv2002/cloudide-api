import express from "express";
import CORS from "cors";
import { promisify } from "util";
import child_process from "child_process";
import {
  createProject,
  getAllProjects,
  getProjectByAlias,
  updateProjectStatus,
} from "./utils/db";
import { generateAlias, findFreePort } from "./utils/helperUtils";

const app = express();
const initScriptPath = "./init.sh";
const resumeScriptPath = "./resume.sh";
const pauseScriptPath = "./pause.sh";
const terminateScriptPath = "./terminate.sh";
const execFile = promisify(child_process.execFile);

app.use(CORS());
app.use(express.json());

app.get("/api/v1", (_, res) => {
  res.status(200).json({
    message: "Server is healthy",
  });
});

app.post("/api/v1/start", async (req, res) => {
  const { userId, environment, name } = req.body;
  const alias = generateAlias(5);

  const PORT = await findFreePort();
  const args = [alias, environment, PORT];

  // Create entry in db
  await createProject(alias, environment, PORT, name, userId);

  try {
    const { stdout } = await execFile(initScriptPath, args);

    await updateProjectStatus(alias, "RUNNING");

    res.status(200).json({
      alias: alias,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

app.patch("/api/v1/resume", async (req, res) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const { stdout } = await execFile(resumeScriptPath, args);

    const project = await getProjectByAlias(alias);

    // Check if the project exists and is not already running
    if (!project) {
      res.status(400).json({
        error: "Project not found",
      });
      return;
    }

    if (project.status === "RUNNING") {
      res.status(400).json({
        message: "Resource is already running",
      });
      return;
    } else if (project.status === "TERMINATED") {
      res.status(400).json({
        message: "Resource is terminated, start a new project instead",
      });
      return;
    }

    await updateProjectStatus(alias, "RUNNING", { resumedAt: new Date() });

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

app.patch("/api/v1/stop", async (req, res) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const project = await getProjectByAlias(alias);

    if (!project) {
      res.status(400).json({
        error: "Project not found",
      });
      return;
    }

    if (project.status === "STOPPED") {
      res.status(400).json({
        message: "Resource is already at rest",
      });
      return;
    }
    const { stdout, stderr } = await execFile(pauseScriptPath, args);

    if (stderr) {
      res.status(500).json({
        error: stderr,
      });
      return;
    }

    await updateProjectStatus(alias, "STOPPED", { stoppedAt: new Date() });

    res.status(200).json({
      message: "Resource stopped successfully",
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

app.delete("/api/v1/terminate", async (req, res) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const project = await getProjectByAlias(alias);

    if (!project) {
      res.status(400).json({
        error: "Project not found",
      });
      return;
    }

    if (project.status === "TERMINATED") {
      res.status(400).json({
        message: "Resource is already terminated",
      });
      return;
    }
    const { stdout, stderr } = await execFile(terminateScriptPath, args);

    if (stderr) {
      res.status(500).json({
        error: stderr,
      });
      return;
    }

    await updateProjectStatus(alias, "TERMINATED", {
      stoppedAt: new Date(),
      PORT: null,
    });

    res.status(200).json({
      message: "Environment terminated successfully",
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

app.get("/api/v1/resource/:alias", async (req, res) => {
  const alias = req.params.alias;

  try {
    const project = await getProjectByAlias(alias);

    if (!project) {
      res.status(404).json({
        success: false,
        message: `Project with alias ${alias} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error fetching project by alias:", error.message || error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the project",
      error: error.message || error,
    });
  }
});

app.get("/api/v1/resources", async (_, res) => {
  const result = await getAllProjects();
  res.status(200).json(result);
});

export default app;

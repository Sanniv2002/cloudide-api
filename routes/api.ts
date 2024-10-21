import { Router } from 'express';
import { promisify } from 'util';
import child_process from 'child_process';
import {
  createProject,
  getAllProjects,
  getAllProjectsByUserId,
  getProjectByAlias,
  updateProjectStatus,
} from '../utils/db';
import { generateAlias, findFreePort, sendMessage } from '../utils/helperUtils';
import {
  createDNSRecordInCloudflareZone,
  removeDNSRecordInCloudflareZone,
} from '../utils/cloudflare';
import {
  addResourceInNginxConf,
  clearResourceInNginxConf,
} from '../utils/nginxConfig';
import { isLoggedIn } from '../middleware/isLoggedIn';

const router = Router();

router.use(isLoggedIn);

const initScriptPath = './scripts/init.sh';
const resumeScriptPath = './scripts/resume.sh';
const pauseScriptPath = './scripts/pause.sh';
const terminateScriptPath = './scripts/terminate.sh';
const execFile = promisify(child_process.execFile);

router.post('/start', async (req: any, res: any) => {
  const { userId, environment, name } = req.body;
  const alias = generateAlias(5);

  const PORT = await findFreePort();
  const args = [alias, environment, PORT];

  try {
    // Create DNS Record for the alias
    sendMessage(res, { status: 'Starting DNS record creation...' });
    const result = await createDNSRecordInCloudflareZone(
      'A',
      alias,
      process.env.EC2_URI as string,
      `DNS Record for resource aliased as ${alias}`,
    );
    sendMessage(res, { status: 'DNS record created successfully!' });

    const dns_record_id = result.result.id;
    // Add resource in nginx config
    await addResourceInNginxConf(alias, PORT);

    // Create entry in db
    await createProject(alias, environment, PORT, name, dns_record_id, userId);
    sendMessage(res, { status: 'Resource added in database' });

    sendMessage(res, { status: 'Booting resource...' });
    const { stdout } = await execFile(initScriptPath, args);
    sendMessage(res, { status: 'Resource succesfully started!' });

    await updateProjectStatus(alias, 'RUNNING');

    res.status(200).json({
      alias: alias,
    });
  } catch (error: any) {
    sendMessage(res, { status: 'Failed to start resource' });
    res.status(500).json({
      error: error.message || error,
    });
  }
});

router.patch('/resume', async (req: any, res: any) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const { stdout } = await execFile(resumeScriptPath, args);

    const project = await getProjectByAlias(alias);

    // Check if the project exists and is not already running
    if (!project) {
      res.status(400).json({
        error: 'Project not found',
      });
      return;
    }

    if (project.status === 'RUNNING') {
      res.status(400).json({
        message: 'Resource is already running',
      });
      return;
    } else if (project.status === 'TERMINATED') {
      res.status(400).json({
        message: 'Resource is terminated, start a new project instead',
      });
      return;
    }

    await updateProjectStatus(alias, 'RUNNING', { resumedAt: new Date() });

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

router.patch('/stop', async (req: any, res: any) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const project = await getProjectByAlias(alias);

    if (!project) {
      res.status(400).json({
        error: 'Project not found',
      });
      return;
    }

    if (project.status === 'STOPPED') {
      res.status(400).json({
        message: 'Resource is already at rest',
      });
      return;
    }
    const { stdout, stderr } = await execFile(pauseScriptPath, args);

    await updateProjectStatus(alias, 'STOPPED', { stoppedAt: new Date() });

    res.status(200).json({
      message: 'Resource stopped successfully',
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

router.delete('/terminate', async (req: any, res: any) => {
  const { alias } = req.body;
  const args = [alias];

  try {
    const project = await getProjectByAlias(alias);

    if (!project) {
      res.status(400).json({
        error: 'Project not found',
      });
      return;
    }

    if (project.status === 'TERMINATED') {
      res.status(400).json({
        message: 'Resource is already terminated',
      });
      return;
    }

    await removeDNSRecordInCloudflareZone(project.dns_record_id);

    const { stdout, stderr } = await execFile(terminateScriptPath, args);

    await updateProjectStatus(alias, 'TERMINATED', {
      stoppedAt: new Date(),
      PORT: null,
    });

    res.status(200).json({
      message: 'Environment terminated successfully',
      alias: alias,
      output: stdout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || error,
    });
  }
});

router.get('/resources/:userId', async (req: any, res: any) => {
  const userId = req.params.userId;
  try {
    const resources = await getAllProjectsByUserId(parseInt(userId));
    res.status(200).json(resources);
  } catch (error: any) {
    console.error('Error fetching project by alias:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the project',
      error: error.message || error,
    });
  }
});

router.get('/resource/:alias', async (req: any, res: any) => {
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
    console.error('Error fetching project by alias:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the project',
      error: error.message || error,
    });
  }
});

router.get('/resources', async (req: any, res: any) => {
  req.user.role === 'ADMIN'
    ? res.status(200).json(await getAllProjects())
    : res.status(403).json({ message: 'Forbidden' });
});

router.put('/regenerate_config', async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden' });
    }
    const result = await getAllProjects();
    await clearResourceInNginxConf();

    const projects = Array.isArray(result.data) ? result.data : [];

    for (const project of projects) {
      if (project.status !== 'TERMINATED') {
        await addResourceInNginxConf(project.alias, project.PORT);
      }
    }

    res.status(200).json({
      message: 'Resources refreshed and cleared',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        'An error occurred while regenerating the configuration.',
    });
  }
});

export default router;

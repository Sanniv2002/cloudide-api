import { promisify } from "util";
import child_process from "child_process";

const configScriptPath = "./nginx_config.sh";
const execFile = promisify(child_process.execFile);

export const addResourceInNginxConf = async (alias: string, port: number) => {
  try {
    const uri = `${alias}.${process.env.API_DOMAIN}`;
    const args = ["add", uri, `${port}`];
    const { stdout } = await execFile(configScriptPath, args);
    return true;
  } catch (error) {
    throw error;
  }
};

export const clearResourceInNginxConf = async () => {
  try {
    const args = ["clear"];
    const { stdout } = await execFile(configScriptPath, args);
    return true;
  } catch (error) {
    throw error;
  }
};

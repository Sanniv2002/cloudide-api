/**
 * This utility file provides functions to manage Nginx server configurations dynamically 
 * using a shell script (`nginx_config.sh`). It includes functions to add a resource (server block) 
 * to the Nginx configuration and clear all existing resources.
 * 
 * - `addResourceInNginxConf`: Adds a new server block to the Nginx configuration with the provided alias and port.
 * - `clearResourceInNginxConf`: Clears all existing server blocks from the Nginx configuration.
 * 
 * The Nginx configurations are handled via a shell script that accepts parameters like domain alias and port.
 * 
 * @module nginx_config
 * 
 * @requires util.promisify - For converting callback-based `execFile` into a promise-based function.
 * @requires child_process - For executing the shell script to update the Nginx configuration.
 * 
 * @function addResourceInNginxConf
 * @param {string} alias - The alias (subdomain) for the server to be added.
 * @param {number} port - The port that the server will listen on.
 * @returns {Promise<boolean>} - Resolves with true if successful, or throws an error.
 * 
 * @function clearResourceInNginxConf
 * @returns {Promise<boolean>} - Resolves with true if the resources are cleared successfully, or throws an error.
 */

import { promisify } from "util";
import child_process from "child_process";

const configScriptPath = "../scripts/nginx_config.sh";
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

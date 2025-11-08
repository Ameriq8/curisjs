/**
 * New project command - Scaffolds from backend template
 */

import { join, dirname } from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import ora from 'ora';
import { success, error as showError, info, warn, fileExists, ensureDirectory } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectOptions {
  name: string;
  template?: string;
  packageManager?: 'pnpm' | 'npm' | 'yarn' | 'bun';
  database?: boolean;
  git?: boolean;
}

export async function runNewCommand(name?: string, options?: Partial<ProjectOptions>) {
  try {
    let projectName = name;

    // Interactive mode if name not provided
    if (!projectName) {
      const response = await prompts({
        type: 'text',
        name: 'name',
        message: 'What is your project name?',
        validate: (value) => (value.length > 0 ? true : 'Project name is required'),
      });

      if (!response.name) {
        process.exit(0);
      }
      projectName = response.name as string;
    }

    // TypeScript guard - projectName is definitely a string here
    if (!projectName) {
      showError('Project name is required');
      process.exit(1);
    }

    // Validate project name
    if (!/^[a-z0-9-_]+$/i.test(projectName)) {
      showError('Project name can only contain letters, numbers, hyphens, and underscores');
      process.exit(1);
    }

    const targetPath = join(process.cwd(), projectName);

    // Check if directory already exists
    if (await fileExists(targetPath)) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `Directory "${projectName}" already exists. Overwrite?`,
        initial: false,
      });

      if (!overwrite) {
        info('Operation cancelled');
        process.exit(0);
      }

      // Remove existing directory
      await fs.rm(targetPath, { recursive: true, force: true });
    }

    // Interactive options
    const answers = await prompts([
      {
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager do you want to use?',
        choices: [
          { title: 'pnpm (recommended)', value: 'pnpm' },
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'bun', value: 'bun' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'database',
        message: 'Do you want to include database support (@curisjs/db)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'git',
        message: 'Initialize a git repository?',
        initial: true,
      },
    ]);

    const config: ProjectOptions = {
      name: projectName,
      packageManager: answers.packageManager || options?.packageManager || 'pnpm',
      database: answers.database ?? options?.database ?? true,
      git: answers.git ?? options?.git ?? true,
    };

    // Create project
    await createProject(targetPath, config);

    // Success message
    console.log('');
    success(`Project "${projectName}" created successfully!`);
    console.log('');
    info('Next steps:');
    console.log('');
    console.log(`  cd ${projectName}`);
    console.log(`  ${config.packageManager} install`);
    console.log(`  ${config.packageManager} dev`);
    console.log('');
    success('Happy coding!');
  } catch (err: unknown) {
    showError(`Failed to create project: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function createProject(targetPath: string, config: ProjectOptions) {
  const spinner = ora('Creating project from template...').start();

  try {
    // Resolve template directory path
    // Go from packages/cli/dist/src/commands/new.js -> template/backend
    const templatePath = join(__dirname, '../../../../../template/backend');

    if (!(await fileExists(templatePath))) {
      throw new Error(`Template not found at ${templatePath}`);
    }

    spinner.text = 'Copying template files...';

    // Copy template directory
    await copyDirectory(templatePath, targetPath, [
      'node_modules',
      'dist',
      '.env',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ]);

    spinner.text = 'Updating project configuration...';

    // Update package.json
    const packageJsonPath = join(targetPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    packageJson.name = config.name;
    packageJson.version = '0.1.0';
    packageJson.description = `${config.name} - A CurisJS application`;

    // Update dependencies based on database choice
    if (!config.database) {
      delete packageJson.dependencies['@curisjs/db'];
      delete packageJson.scripts['db:migrate'];
      delete packageJson.scripts['db:seed'];
      delete packageJson.scripts['db:rollback'];

      // Remove database-related files
      const dbFiles = [join(targetPath, 'database.json'), join(targetPath, 'src/database')];
      for (const file of dbFiles) {
        if (await fileExists(file)) {
          await fs.rm(file, { recursive: true, force: true });
        }
      }
    }

    // Update scripts to use selected package manager
    if (config.packageManager !== 'pnpm') {
      packageJson.dependencies['@curisjs/core'] = '^0.1.0';
      if (config.database) {
        packageJson.dependencies['@curisjs/db'] = '^0.1.0';
      }
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    // Update README.md
    const readmePath = join(targetPath, 'README.md');
    if (await fileExists(readmePath)) {
      let readme = await fs.readFile(readmePath, 'utf-8');
      readme = readme.replace(/curisjs-backend-template/g, config.name);
      readme = readme.replace(
        /Production-ready CurisJS backend API template[^-]*-/,
        `${config.name} -`
      );

      // Update package manager commands in README
      if (config.packageManager !== 'pnpm') {
        readme = readme.replace(/pnpm install/g, `${config.packageManager} install`);
        readme = readme.replace(/pnpm dev/g, `${config.packageManager} dev`);
        readme = readme.replace(/pnpm build/g, `${config.packageManager} build`);
        readme = readme.replace(/pnpm start/g, `${config.packageManager} start`);
      }

      await fs.writeFile(readmePath, readme);
    }

    // Copy .env.example to .env
    const envExamplePath = join(targetPath, '.env.example');
    const envPath = join(targetPath, '.env');
    if (await fileExists(envExamplePath)) {
      await fs.copyFile(envExamplePath, envPath);
    }

    spinner.text = 'Initializing git repository...';

    // Initialize git
    if (config.git) {
      try {
        const { execSync } = await import('node:child_process');
        execSync('git init', { cwd: targetPath, stdio: 'ignore' });
        execSync('git add -A', { cwd: targetPath, stdio: 'ignore' });
        execSync('git commit -m "Initial commit from CurisJS template"', {
          cwd: targetPath,
          stdio: 'ignore',
        });
      } catch {
        warn('Failed to initialize git repository');
      }
    }

    spinner.succeed('Project created successfully!');
  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

/**
 * Recursively copy directory
 */
async function copyDirectory(src: string, dest: string, exclude: string[] = []): Promise<void> {
  await ensureDirectory(dest);

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded files/directories
    if (exclude.includes(entry.name)) {
      continue;
    }

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Determine the script path relative to the project root
        const scriptPath = join(process.cwd(), 'scripts', 'update_masterlist.js');

        console.log(`Executing merge script at: ${scriptPath}`);

        // Run the script using node
        const { stdout, stderr } = await execAsync(`node "${scriptPath}"`);

        if (stderr) {
            console.warn('Script stderr:', stderr);
        }

        console.log('Script stdout:', stdout);

        return NextResponse.json({
            success: true,
            output: stdout
        });

    } catch (error: any) {
        console.error('Merge script execution failed:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Script execution failed',
            output: error.stdout
        }, { status: 500 });
    }
}

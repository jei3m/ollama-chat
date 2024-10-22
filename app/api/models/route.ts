import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execPromise('ollama list');
    const models = stdout.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.split(' ')[0])
      .filter(model => model !== 'NAME');

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json([]); // Return an empty array instead of an error object
  }
}
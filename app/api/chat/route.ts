import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { message, model } = await req.json();

    if (!message || !model) {
      return NextResponse.json({ error: 'Message and model are required' }, { status: 400 });
    }

    const command = `ollama run ${model} "${message}"`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error('Ollama command error:', stderr);
      return NextResponse.json({ error: 'Error executing Ollama command', details: stderr }, { status: 500 });
    }

    return NextResponse.json({ response: stdout.trim() });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in chat API:', error);
      return NextResponse.json({ error: 'Failed to process the request', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown error in chat API:', error);
      return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
  }
}
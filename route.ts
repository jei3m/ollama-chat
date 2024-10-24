// app/api/process-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Convert the File object to a buffer
    const buffer = Buffer.from(await pdfFile.arrayBuffer());

    // Parse the PDF
    const data = await pdf(buffer);

    // Extract the text content
    const text = data.text;

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
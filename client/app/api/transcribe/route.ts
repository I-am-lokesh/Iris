import { toFile } from 'openai/uploads';
import OpenAI from 'openai';
import { Readable } from 'stream';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
    console.log("--- API HIT: /api/transcribe POST received ---");
    // 1. Read the incoming multipart/form-data
    const formData = await request.formData();
    const fileEntry = formData.get('file');

    if (!(fileEntry instanceof Blob)) {
        return new Response('File not found in form data.', { status: 400 });
    }

    // 2. Convert Blob to Buffer/Readable Stream
    // We need the data as a Buffer, which can be done by converting the Blob's arrayBuffer.
    const audioBuffer = Buffer.from(await fileEntry.arrayBuffer());

    // 3. Prepare file for OpenAI SDK using toFile
    // This utility takes a Buffer/Stream and gives it the necessary properties (name, type).
    const transcriptionFile = await toFile(
        audioBuffer,
        fileEntry.name || 'input.webm', // Use the filename from the Blob/FormData
        { type: fileEntry.type || 'audio/webm' }
    );

    // 4. Call the Whisper API
    const transcription = await openai.audio.transcriptions.create({
        file: transcriptionFile,
        model: 'whisper-1',
        language: "en", // this is optional but helps the model
    });

    return Response.json({ transcription: transcription.text });
}
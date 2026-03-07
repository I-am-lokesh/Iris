import OpenAI from "openai";
import fs from "fs";
import { NextResponse } from "next/server";

const openAi = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function POST(request: Request) {
    console.log("--- API HIT: /api/textToSpeech  POST received ---");
    // 1. Read the incoming multipart/form-data
    const formData = await request.formData();
    const inputText = formData.get('inputText');
    if (typeof inputText !== 'string') {
        return new Response('Input Query not found', { status: 400 });
    }  

    const chatCompletion = await openAi.chat.completions.create({
      model: 'gpt-4o', // Or any other suitable model
      messages: [
        { role: 'system', content: 'You are a helpful chatbot named Iris.' },
        { role: 'user', content: inputText }
    ],
    });
    const textResponse = chatCompletion.choices[0].message.content;

    if (!textResponse) {
        return NextResponse.json({ error: 'Failed to generate text response.' }, { status: 500 });
    }

    const response = await openAi.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "nova",
        input: textResponse,
        instructions: "You are Iris, an ai chatbot. Speak in a cheerful and positive tone.",
        response_format: "wav",
    });
    console.log(response);

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');   

    // return Response.json({ reponseText: reponseText,
    // audioData: audioData
    //  });
    return NextResponse.json({audioData: audioBase64 ,  textResponse: textResponse}, {
        status: 200,
        // headers: {
        //     'Content-Type': 'audio/wav',
        //     // Optional: Force browser to treat it as a stream, not a download
        //     'Cache-Control': 'no-cache', 
        // },
    });

}
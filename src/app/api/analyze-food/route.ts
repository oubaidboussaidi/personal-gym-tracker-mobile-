import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // We use gemini-2.0-flash as it is confirmed available for your key 
        // and is better at visual food analysis.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const prompt = `Analyze this food image. Provide:
        1. Name of the dish.
        2. Estimated Calories (kcal).
        3. Estimated Protein (g).
        4. Estimated Carbohydrates (g).
        5. Estimated Fats (g).

        IMPORTANT: Respond ONLY with a raw JSON object. Use these keys:
        { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON safely
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis error:", error);

        // Final fallback to 1.5-flash if 2.0-flash somehow fails
        if (error.message?.includes('404')) {
            return NextResponse.json({
                error: "Model error. Check if gemini-2.0-flash is enabled in your AI Studio."
            }, { status: 500 });
        }

        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}

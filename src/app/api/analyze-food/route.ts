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

        // Initialize with Stable v1 (avoids the v1beta 404 issue)
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-1.5-flash (Standard Stable Model)
        // This model has the most generous free-tier quota (15 RPM / 1M TPM)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
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

        // Extract JSON safely (handles potential markdown wrapping)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis error:", error);

        // If we still get a 404 or 429, it might be a project-specific restriction
        if (error.message?.includes('429')) {
            return NextResponse.json({
                error: "AI Quota limit reached. Please wait a minute and try again."
            }, { status: 429 });
        }

        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}

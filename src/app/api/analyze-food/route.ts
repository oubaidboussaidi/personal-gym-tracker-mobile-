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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Analyze this food image. Provide:
            1. A short, descriptive name of the dish.
            2. Estimated calories (kcal).
            3. Estimated protein (g).
            4. Estimated carbohydrates (g).
            5. Estimated fats (g).

            Format the response as a valid JSON object ONLY, with these exact keys:
            { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }
            
            Be as accurate as possible for a standard portion. If multiple items are present, estimate for the total meal shown.
        `;

        // The image data is expected to be a base64 string without the prefix
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("Could not parse AI response as JSON");
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}

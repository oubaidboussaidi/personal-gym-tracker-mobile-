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

        const prompt = `
            Analyze this food image. Provide:
            1. A short, descriptive name of the dish (e.g., "Apple", "Grilled Salmon", "Chicken Sandwich").
            2. Estimated calories (kcal).
            3. Estimated protein (g).
            4. Estimated carbohydrates (g).
            5. Estimated fats (g).

            Format the response as a valid JSON object ONLY, with these exact keys:
            { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }
            
            Be as accurate as possible for a standard portion. If multiple items are present, estimate for the total meal shown.
        `;

        // Use direct REST API to avoid SDK version conflicts (forces v1 stable)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: "image/jpeg",
                                        data: image,
                                    },
                                },
                            ],
                        },
                    ],
                    generation_config: {
                        response_mime_type: "application/json",
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "AI Analysis failed");
        }

        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("Empty response from AI");
        }

        // Resilient JSON parsing (handles potential markdown wrapping)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}

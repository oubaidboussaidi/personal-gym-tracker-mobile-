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

        // We use the most absolute stable config for visual analysis
        const prompt = `Analyze this food image and return a JSON object with: 
        "name" (string), "calories" (number), "protein" (number), "carbs" (number), "fat" (number). 
        Return ONLY the raw JSON.`;

        // Direct Fetch using snake_case (Mandatory for the REST API)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: image,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error?.message || "AI Analysis failed");
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No analysis received from AI.");
        }

        // Clean any markdown code blocks from the string
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(jsonStr);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}

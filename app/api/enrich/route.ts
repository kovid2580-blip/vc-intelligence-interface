import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url, domain } = await req.json();
        if (!url && !domain) {
            return NextResponse.json({ error: 'url or domain required' }, { status: 400 });
        }

        const targetUrl = url || `https://${domain}`;
        const jinaUrl = `https://r.jina.ai/${targetUrl}`;

        // 1. Fetch page content via Jina Reader (free, no auth needed)
        let pageContent = '';
        try {
            const jinaRes = await fetch(jinaUrl, {
                headers: { Accept: 'text/markdown' },
                signal: AbortSignal.timeout(20000),
            });
            if (jinaRes.ok) {
                pageContent = await jinaRes.text();
                // Trim to first 8000 chars to stay within token limits
                pageContent = pageContent.slice(0, 8000);
            }
        } catch {
            pageContent = '';
        }

        if (!pageContent) {
            return NextResponse.json({ error: 'Could not fetch content from the website.' }, { status: 502 });
        }

        // 2. Try Gemini API for structured extraction
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `You are a venture capital analyst. Based on the following website content, extract structured intelligence.

Website content:
${pageContent}

Return ONLY a valid JSON object with exactly these fields:
{
  "summary": "2-3 sentence company overview",
  "bullets": ["what they do bullet 1", "bullet 2", "bullet 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "signals": ["investment signal 1", "signal 2", "signal 3"]
}

Do not include any text outside the JSON object.`
                                }]
                            }],
                            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
                        }),
                        signal: AbortSignal.timeout(25000),
                    }
                );

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        return NextResponse.json({
                            summary: parsed.summary || '',
                            bullets: parsed.bullets || [],
                            keywords: parsed.keywords || [],
                            signals: parsed.signals || [],
                            sources: [{ url: targetUrl, timestamp: new Date().toISOString() }],
                            enrichedAt: new Date().toISOString(),
                        });
                    }
                }
            } catch {
                // Fall through to rule-based extraction
            }
        }

        // 3. Rule-based fallback extraction
        const lines = pageContent.split('\n').map(l => l.trim()).filter(Boolean);
        const sentences = pageContent.replace(/\n+/g, ' ').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 30);

        const summary = sentences.slice(0, 3).join('. ').slice(0, 400) + '.';

        const bullets = sentences
            .filter(s => s.length > 40 && s.length < 200)
            .slice(0, 4)
            .map(s => s.replace(/^[-*•]\s*/, ''));

        const stopwords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'have', 'from', 'they', 'with', 'this', 'that', 'your', 'more', 'will', 'what', 'when', 'been', 'also', 'into', 'then', 'than', 'which', 'about', 'their', 'there']);
        const keywords = Array.from(
            new Set(
                pageContent.toLowerCase()
                    .split(/\W+/)
                    .filter(w => w.length > 4 && !stopwords.has(w))
            )
        )
            .slice(0, 8)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1));

        const signals = [
            lines.find(l => /fund|raise|invest|round|seed|series/i.test(l))?.slice(0, 150),
            lines.find(l => /launch|release|product|feature|platform/i.test(l))?.slice(0, 150),
            lines.find(l => /partner|integrat|customer|client|enterprise/i.test(l))?.slice(0, 150),
        ].filter((s): s is string => !!s);

        return NextResponse.json({
            summary,
            bullets,
            keywords,
            signals,
            sources: [{ url: targetUrl, timestamp: new Date().toISOString() }],
            enrichedAt: new Date().toISOString(),
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// AI feedback for a saved recording.
// Downloads the audio from the private bucket, sends it to Lovable AI (Gemini)
// with a structured tool-call schema, persists the result, and returns it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FEEDBACK_TOOL = {
  type: "function",
  function: {
    name: "submit_feedback",
    description:
      "Return structured speaking-coach feedback for a single practice recording.",
    parameters: {
      type: "object",
      properties: {
        transcript: {
          type: "string",
          description: "Best-effort verbatim transcript of the recording.",
        },
        summary: {
          type: "string",
          description: "2-3 sentence overall coach summary.",
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "2-4 specific things the speaker did well.",
        },
        improvements: {
          type: "array",
          items: { type: "string" },
          description: "2-4 concrete, actionable improvements.",
        },
        next_drill: {
          type: "string",
          description: "One short drill to practice next time.",
        },
        scores: {
          type: "object",
          description: "Scores from 0 to 100.",
          properties: {
            clarity: { type: "number" },
            pace: { type: "number" },
            structure: { type: "number" },
            confidence: { type: "number" },
            filler_words: {
              type: "number",
              description: "Higher = fewer filler words.",
            },
          },
          required: ["clarity", "pace", "structure", "confidence", "filler_words"],
          additionalProperties: false,
        },
      },
      required: [
        "transcript",
        "summary",
        "strengths",
        "improvements",
        "next_drill",
        "scores",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase env not configured");

    // Auth: identify user from JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const recordingId = body?.recordingId as string | undefined;
    if (!recordingId) {
      return new Response(JSON.stringify({ error: "recordingId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recording, ensure ownership
    const { data: rec, error: recErr } = await admin
      .from("recordings")
      .select("*")
      .eq("id", recordingId)
      .eq("user_id", userId)
      .maybeSingle();
    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: "Recording not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return existing feedback if present
    const { data: existing } = await admin
      .from("recording_feedback")
      .select("*")
      .eq("recording_id", recordingId)
      .maybeSingle();
    if (existing && !body?.force) {
      return new Response(JSON.stringify({ feedback: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download audio
    const { data: blob, error: dlErr } = await admin.storage
      .from("recordings")
      .download(rec.storage_path);
    if (dlErr || !blob) throw new Error(`Download failed: ${dlErr?.message}`);

    const buf = new Uint8Array(await blob.arrayBuffer());
    // base64 encode
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        buf.subarray(i, i + chunk) as unknown as number[],
      );
    }
    const base64 = btoa(binary);
    const mime = blob.type || "audio/webm";

    const systemPrompt =
      "You are an expert public-speaking coach. Listen to the user's short practice recording and return concise, actionable, encouraging feedback. Be specific. Score honestly on a 0-100 scale.";
    const userText = `Prompt the speaker was practicing: ${rec.prompt_text ?? "(none)"}\nDifficulty: ${rec.difficulty ?? "(n/a)"}\nDuration: ${Math.round((rec.duration_ms ?? 0) / 1000)}s${rec.target_seconds ? ` / target ${rec.target_seconds}s` : ""}.\n\nTranscribe the audio and then give feedback via the submit_feedback tool.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "input_audio", input_audio: { data: base64, format: mime.includes("webm") ? "webm" : "mp3" } },
            ],
          },
        ],
        tools: [FEEDBACK_TOOL],
        tool_choice: { type: "function", function: { name: "submit_feedback" } },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI gateway error", aiRes.status, text);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("No tool call in AI response", JSON.stringify(aiJson));
      throw new Error("AI did not return structured feedback");
    }
    let parsed: any;
    try {
      parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch (e) {
      console.error("Failed to parse tool args", argsRaw);
      throw new Error("Malformed AI response");
    }

    // Upsert (delete + insert because of UNIQUE recording_id)
    if (existing) {
      await admin.from("recording_feedback").delete().eq("recording_id", recordingId);
    }
    const { data: inserted, error: insErr } = await admin
      .from("recording_feedback")
      .insert({
        recording_id: recordingId,
        user_id: userId,
        transcript: parsed.transcript ?? null,
        summary: parsed.summary ?? "",
        strengths: parsed.strengths ?? [],
        improvements: parsed.improvements ?? [],
        next_drill: parsed.next_drill ?? null,
        scores: parsed.scores ?? {},
        model: "google/gemini-2.5-flash",
      })
      .select()
      .single();

    if (insErr) throw new Error(`Insert failed: ${insErr.message}`);

    return new Response(JSON.stringify({ feedback: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-recording error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface JobResult {
  title: string;
  company: string;
  pay: string;
  rating: number;
  source: string;
  url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const searchQuery = query || "freelance remote data entry virtual assistant";
    const jobs: JobResult[] = [];

    // Fetch from SerpAPI
    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (serpApiKey) {
      try {
        const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&num=10`;
        const serpRes = await fetch(serpUrl);
        if (serpRes.ok) {
          const serpData = await serpRes.json();
          const serpJobs = serpData.jobs_results || [];
          for (const job of serpJobs.slice(0, 6)) {
            jobs.push({
              title: job.title || "Unknown Title",
              company: job.company_name || "Unknown Company",
              pay: job.detected_extensions?.salary || job.salary || "$ Competitive",
              rating: 4.0 + Math.random() * 1.0,
              source: "SerpAPI",
              url: job.apply_options?.[0]?.apply_link,
            });
          }
        }
      } catch (e) {
        console.error("SerpAPI error:", e);
      }
    }

    // Fetch from Jooble
    const joobleApiKey = Deno.env.get("JOOBLE_API_KEY");
    if (joobleApiKey && jobs.length < 8) {
      try {
        const joobleUrl = `https://jooble.org/api/${joobleApiKey}?keywords=${encodeURIComponent(searchQuery)}&page=1`;
        const joobleRes = await fetch(joobleUrl);
        if (joobleRes.ok) {
          const joobleData = await joobleRes.json();
          const joobleJobs = joobleData.jobs || [];
          for (const job of joobleJobs.slice(0, 6)) {
            if (jobs.length >= 12) break;
            jobs.push({
              title: job.title || "Unknown Title",
              company: job.company || "Unknown Company",
              pay: job.salary || "$ Competitive",
              rating: 4.0 + Math.random() * 1.0,
              source: "Jooble",
              url: job.link,
            });
          }
        }
      } catch (e) {
        console.error("Jooble error:", e);
      }
    }

    // Deduplicate by title+company
    const seen = new Set<string>();
    const uniqueJobs = jobs.filter(j => {
      const key = `${j.title}-${j.company}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(JSON.stringify({ jobs: uniqueJobs.slice(0, 12) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal error", jobs: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

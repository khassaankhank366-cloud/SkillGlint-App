import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "freelance remote";
    const source = url.searchParams.get("source") || "jooble";

    let jobs: Array<{ title: string; company: string; pay: string; rating: number; url?: string; location?: string }> = [];

    if (source === "serpapi") {
      const serpApiKey = Deno.env.get("SERPAPI_KEY");
      if (serpApiKey) {
        const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
        const serpRes = await fetch(serpUrl);
        if (serpRes.ok) {
          const serpData = await serpRes.json();
          const jobResults = serpData.jobs_results || [];
          jobs = jobResults.slice(0, 10).map((j: any) => ({
            title: j.title || "Untitled",
            company: j.company_name || "Unknown",
            pay: j.salary?.short || "Negotiable",
            rating: 4.5,
            url: j.apply_link?.link,
            location: j.location || "Remote",
          }));
        }
      }
    }

    if (jobs.length === 0) {
      const joobleKey = Deno.env.get("JOOBLE_API_KEY");
      if (joobleKey) {
        const joobleUrl = `https://jooble.org/api/${joobleKey}?keywords=${encodeURIComponent(query)}&page=1`;
        const joobleRes = await fetch(joobleUrl);
        if (joobleRes.ok) {
          const joobleData = await joobleRes.json();
          const jobItems = joobleData.jobs || [];
          jobs = jobItems.slice(0, 10).map((j: any) => ({
            title: j.title || "Untitled",
            company: j.company || "Unknown",
            pay: j.salary || "Negotiable",
            rating: 4.5,
            url: j.link,
            location: j.location || "Remote",
          }));
        }
      }
    }

    if (jobs.length === 0) {
      return new Response(JSON.stringify({ jobs: [], message: "No live jobs found. Showing fallback data." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal error", jobs: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

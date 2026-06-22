async function run() {
  console.log("Sending extraction request to real API...");
  const start = Date.now();
  try {
    const res = await fetch("http://localhost:3001/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseUrl: "https://maven.com/web-adventures/how-to-build-a-startup" })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", Object.keys(data));
    if (data.retryAfter) console.log("Retry After:", data.retryAfter);
  } catch (e) {
    console.log("Fetch Error:", e);
  }
  console.log("Time taken:", (Date.now() - start)/1000, "s");
}
run();

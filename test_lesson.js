async function run() {
  console.log("Generating lesson (streaming)...");
  const start = Date.now();
  const res = await fetch("http://localhost:3001/api/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId: "cmqcrn8p30029g6p0wjtd3rq2", strength: 10, forceGenerate: true })
  });
  console.log("Status:", res.status);
  
  if (res.ok) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
    console.log("\n\nTime taken:", (Date.now() - start)/1000, "s");
  } else {
    const errorText = await res.text();
    console.log("Error:", errorText);
  }
}
run();

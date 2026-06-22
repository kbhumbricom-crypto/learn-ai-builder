async function run() {
  const res = await fetch('http://localhost:3000/api/extract', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ courseUrl: 'https://maven.com/p/1', notes: 'test persona' })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();

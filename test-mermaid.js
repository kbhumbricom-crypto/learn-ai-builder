import mermaid from 'mermaid';
try {
  await mermaid.parse('invalid syntax');
  console.log("Parsed successfully");
} catch (e) {
  console.log("Parse failed");
}

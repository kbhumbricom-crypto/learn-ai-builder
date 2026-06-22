const cheerio = require('cheerio');

async function test() {
  const response = await fetch('https://maven.com/customer-centric-solutions-llc/customer-jtbd-frameworks-and-methods', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const nextDataScript = $('#__NEXT_DATA__').html();
  if (nextDataScript) {
    const nextData = JSON.parse(nextDataScript);
    const props = nextData.props?.pageProps;
    const syllabus = props.defaultPublicCohortMaterials?.expanded_syllabus?.sections || [];
    
    if (typeof syllabus === 'object') {
       const sections = Object.values(syllabus);
       for (const section of sections) {
         console.log("Section Title:", section.title || "No section title");
         if (section.items) {
           for (const item of section.items) {
             console.log("  - Item Type:", item.section_type);
             if (item.module) {
               console.log("    - Module Title:", item.module.title);
               if (item.module.module_items) {
                 for (const mi of item.module.module_items) {
                   console.log("      - Lesson:", mi.lesson?.title);
                 }
               } else {
                 console.log("      - (No module_items)");
               }
             }
           }
         }
       }
    }
  }
}
test();

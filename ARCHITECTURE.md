# LMS-Generator Architecture

## Reading Experience
The Lesson Reader architecture provides a Medium/LinkedIn style pure-text reading experience focused on premium typography. 
The previous 'Slides' format has been completely abandoned to improve reading flow and accessibility.

## Content Generation
- **Streaming**: Structured JSON streaming is deprecated. The system relies on `streamText` from the Vercel AI SDK to stream plain-text/markdown content smoothly to the client.
- **Rendering**: The raw markdown text stream is processed and rendered via `react-markdown` to provide rich text formatting, code blocks, and other markdown features seamlessly.

## Testing Protocols
Tests such as `test_lesson.js` have been updated to expect and parse raw text streams rather than structured JSON blocks.
When testing lesson generation APIs, ensure that you consume the stream correctly using a `TextDecoder` to assemble the text.

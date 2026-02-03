const fs = require('fs');
const path = 'f:\\frameflowProject\\src\\components\\ShareModal.jsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length > 631) {
        const newContent = lines.slice(0, 631).join('\n');
        fs.writeFileSync(path, newContent);
        console.log(`Fixed. Truncated from ${lines.length} to 631 lines.`);
    } else {
        console.log('No fix needed. Line count:', lines.length);
    }
} catch (e) {
    console.error(e);
}

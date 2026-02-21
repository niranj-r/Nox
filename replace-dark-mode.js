import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, 'src', 'components');

const replacements = [
    // Standardizing the dark greys to the user requested #212121 explicitly matching the previous script replacements.
    { regex: /dark:(hover:|focus:|active:|group-hover:)?bg-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}bg-[#1A1A1A]${p2 ? '/' + p2 : ''}` },

    { regex: /dark:(hover:|focus:|active:|group-hover:)?text-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}text-[#1A1A1A]${p2 ? '/' + p2 : ''}` },

    { regex: /dark:(hover:|focus:|active:|group-hover:)?border-\[\#333333\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}border-[#242424]${p2 ? '/' + p2 : ''}` },
    { regex: /dark:border-white\/10/gi, replacement: 'dark:border-white/10' },

    { regex: /dark:(hover:|focus:|active:|group-hover:)?shadow-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}shadow-[#1A1A1A]${p2 ? '/' + p2 : ''}` },
    { regex: /dark:(hover:|focus:|active:|group-hover:)?ring-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}ring-[#1A1A1A]${p2 ? '/' + p2 : ''}` },
    { regex: /dark:(hover:|focus:|active:|group-hover:)?from-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}from-[#1A1A1A]${p2 ? '/' + p2 : ''}` },
    { regex: /dark:(hover:|focus:|active:|group-hover:)?to-\[\#212121\](?:\/(\d+))?/gi, replacement: (m, p1, p2) => `dark:${p1 || ''}to-[#1A1A1A]${p2 ? '/' + p2 : ''}` },
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;

            for (const { regex, replacement } of replacements) {
                newContent = newContent.replace(regex, replacement);
            }

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${file}`);
            }
        }
    }
}

processDirectory(dirPath);

const appPath = path.join(__dirname, 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    let newContent = content;
    for (const { regex, replacement } of replacements) {
        newContent = newContent.replace(regex, replacement);
    }
    if (content !== newContent) {
        fs.writeFileSync(appPath, newContent);
        console.log('Updated App.tsx');
    }
}

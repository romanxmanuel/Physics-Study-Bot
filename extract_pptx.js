const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function extractPptxText(pptxPath) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(pptxPath);
  const zipEntries = zip.getEntries();
  
  let allText = [];
  
  for (const entry of zipEntries) {
    if (entry.entryName.startsWith('ppt/slides/slide')) {
      const content = entry.getData().toString('utf8');
      const parser = new xml2js.Parser();
      const xml = await parser.parseStringPromise(content);
      
      // Extract text from various elements
      const texts = [];
      function extractTexts(obj) {
        if (typeof obj === 'string') {
          texts.push(obj);
        } else if (Array.isArray(obj)) {
          obj.forEach(extractTexts);
        } else if (obj && typeof obj === 'object') {
          Object.values(obj).forEach(extractTexts);
        }
      }
      
      if (xml['p:sld']) {
        extractTexts(xml['p:sld']);
      }
      
      allText.push(texts.join(' | '));
    }
  }
  
  return allText;
}

const args = process.argv.slice(2);
const pptxPath = args[0] || 'Relevent Training Material/Ch 20.pptx';

extractPptxText(pptxPath).then(texts => {
  texts.forEach((t, i) => console.log(`SLIDE ${i+1}: ${t}`));
}).catch(console.error);

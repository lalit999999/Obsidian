import { strToU8, zipSync } from "fflate";

import { extractDocx } from "@/lib/documents/parsers/docx";
import { extractOdt } from "@/lib/documents/parsers/odt";
import { extractPlainText } from "@/lib/documents/parsers/text";
import { extractRtf } from "@/lib/documents/parsers/rtf";
import type { ExtractionResult } from "@/lib/documents/types";

let failures = 0;

function report(name: string, result: ExtractionResult, expectedSubstrings: string[]) {
  console.log(`\n--- ${name} ---`);
  console.log(result.text);
  console.log(`(pages: ${result.pageCount}, truncated: ${result.truncated})`);

  for (const expected of expectedSubstrings) {
    if (!result.text.includes(expected)) {
      console.error(`FAIL [${name}]: expected text to include ${JSON.stringify(expected)}`);
      failures += 1;
    }
  }
}

function buildFixtureDocx(): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello from a fixture docx file.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Second paragraph for the verifier.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  return zipSync({
    "[Content_Types].xml": strToU8(contentTypes),
    _rels: { ".rels": strToU8(rootRels) },
    word: { "document.xml": strToU8(documentXml) },
  });
}

function buildFixtureOdt(): Uint8Array {
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body>
    <office:text>
      <text:h text:outline-level="1">Fixture ODT Heading</text:h>
      <text:p>First paragraph with a<text:s text:c="3"/>gap and a<text:tab/>tab.</text:p>
      <text:p>Second paragraph.</text:p>
    </office:text>
  </office:body>
</office:document-content>`;

  return zipSync({
    mimetype: strToU8("application/vnd.oasis.opendocument.text"),
    "content.xml": strToU8(contentXml),
  });
}

const BACKSLASH = String.fromCharCode(92);

const FIXTURE_RTF =
  String.raw`{\rtf1\ansi\ansicpg1252\deff0
{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\colortbl ;\red0\green0\blue255;}
{\*\generator Msftedit 5.41.21.2510;}
\viewkind4\uc1\pard\sa200\sl276\slmult1\f0\fs22
Hello \b world\b0 , this is a test of the RTF tokenizer.\par
Special char: caf\'e9 and euro sign: \'80.\par
Unicode heart: ` +
  `${BACKSLASH}u9829?` +
  String.raw`\par
Before\tab After the tab.\par
}`;

async function main() {
  report(
    "txt",
    extractPlainText(new TextEncoder().encode("  Hello   plain\ttext.\n\n\n\nDone.  "), "sample.txt"),
    ["Hello plain", "Done."],
  );

  report(
    "md",
    extractPlainText(new TextEncoder().encode("# Heading\n\nSome *markdown* content."), "sample.md"),
    ["# Heading", "*markdown*"],
  );

  report(
    "rtf",
    extractRtf(new TextEncoder().encode(FIXTURE_RTF), "sample.rtf"),
    [
      "Hello world",
      "test of the RTF tokenizer",
      "café",
      "euro sign: €",
      "Unicode heart: ♥",
      "Before After the tab.",
    ],
  );
  {
    const rtfResult = extractRtf(new TextEncoder().encode(FIXTURE_RTF), "sample.rtf");
    if (rtfResult.text.includes("Calibri") || rtfResult.text.includes("Msftedit")) {
      console.error("FAIL [rtf]: discarded destination (fonttbl/generator) leaked into output");
      failures += 1;
    }
  }

  report(
    "odt",
    extractOdt(buildFixtureOdt(), "sample.odt"),
    ["Fixture ODT Heading", "First paragraph with a gap and a tab.", "Second paragraph."],
  );

  report(
    "docx",
    await extractDocx(buildFixtureDocx(), "sample.docx"),
    ["Hello from a fixture docx file.", "Second paragraph for the verifier."],
  );

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll parser fixture checks passed.");
}

main().catch((error) => {
  console.error("verify-parsers crashed:", error);
  process.exit(1);
});

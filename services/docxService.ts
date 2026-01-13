
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun, HeightRule, VerticalAlign } from "docx";
import FileSaver from "file-saver";
import { DossierProfile } from "../types";

// --- CONFIGURATION ---

// OPTION 1: Best for reliability/offline. 
// Convert your PNG to Base64 (online tool like https://www.base64-image.de/) and paste the string here.
// If this string is populated, the app will use it and skip the network fetch.
const LOGO_BASE64: string = ""; 

// OPTION 2: Network Fetch
const LOGO_URL_DIRECT = "https://adra.org.nz/wp-content/uploads/2021/08/ADRA-Horizontal-Logo.png";
// Using corsproxy.io which is often more reliable than allorigins for images
const LOGO_URL_PROXY = `https://corsproxy.io/?${encodeURIComponent(LOGO_URL_DIRECT)}`;

// --- HELPERS ---

const convertBase64ToUint8Array = (base64String: string): Uint8Array => {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64Clean = base64String.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
  const binaryString = atob(base64Clean);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 1x1 Transparent Pixel Fallback
const FALLBACK_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const getImageData = async (url: string, retries = 2): Promise<Uint8Array> => {
  // 1. Prefer Hardcoded Base64 if available
  if (LOGO_BASE64.length > 100) {
    try {
      return convertBase64ToUint8Array(LOGO_BASE64);
    } catch (e) {
      console.error("Invalid Base64 string provided", e);
    }
  }

  // 2. Try Fetching
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.warn(`Attempt ${i + 1} to load logo failed.`);
      // Short delay
      if (i < retries - 1) await new Promise(res => setTimeout(res, 500));
    }
  }

  // 3. Fail Gracefully to Fallback (prevents app crash)
  console.warn("Using fallback image due to network errors.");
  return convertBase64ToUint8Array(FALLBACK_IMAGE);
};

export const generateDossierDocx = async (data: DossierProfile) => {
  
  // Fetch logo image data
  const imageBytes = await getImageData(LOGO_URL_PROXY);

  const FONT_HEADER = "Arial"; 
  const FONT_BODY = "Arial Narrow";
  const FONT_SIZE_NORMAL = 22; // 11pt
  const FONT_SIZE_LABEL = 22;

  const createFieldLine = (label: string, value: string) => {
    return new Paragraph({
      children: [
        new TextRun({ text: label + ": ", bold: true, font: FONT_BODY, size: FONT_SIZE_LABEL }),
        new TextRun({ text: value || "", font: FONT_BODY, size: FONT_SIZE_NORMAL }),
      ],
      spacing: { after: 100 },
    });
  };

  const createQuestionBlock = (question: string, answer: string) => {
    return new Paragraph({
      children: [
        new TextRun({ text: question + " ", bold: true, font: FONT_BODY, size: FONT_SIZE_LABEL }),
        new TextRun({ text: answer || "", font: FONT_BODY, size: FONT_SIZE_NORMAL }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {
            page: {
                margin: {
                    top: 500,
                    right: 720,
                    bottom: 500,
                    left: 720,
                },
            },
        },
        children: [
          // Header Table: Logo | Text
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: imageBytes,
                                            transformation: {
                                                width: 150,
                                                height: 50,
                                            },
                                            type: "png",
                                        }),
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            verticalAlign: VerticalAlign.BOTTOM,
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ 
                                            text: "Adventist Development and Relief Agency Bangladesh", 
                                            bold: true, 
                                            size: 24, // 12pt
                                            font: FONT_HEADER 
                                        }),
                                    ],
                                    spacing: { after: 100 }
                                })
                            ]
                        })
                    ]
                })
            ]
          }),
          
          new Paragraph({
            text: "Child Annual Progress Report (APR) 2025",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            run: {
                bold: true,
                size: 28, // 14pt
                font: FONT_HEADER,
                color: "000000"
            }
          }),

          // School Name
          new Paragraph({
             children: [
                 new TextRun({ text: "Name of School: ", bold: true, font: FONT_BODY, size: FONT_SIZE_LABEL }),
                 new TextRun({ text: data.schoolName, bold: true, font: FONT_BODY, size: FONT_SIZE_NORMAL }),
             ],
             spacing: { after: 200 }
          }),

          // 3-Column Layout: Left Data | Middle Data | Picture Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  // Column 1: Left Bio (37%)
                  new TableCell({
                    width: { size: 37, type: WidthType.PERCENTAGE },
                    children: [
                        createFieldLine("Name of Child", data.childName),
                        createFieldLine("Date of Birth", data.dob),
                        createFieldLine("Sponsorship Category", data.sponsorshipCategory),
                        createFieldLine("Gender", data.gender),
                        createFieldLine("Height", data.height + (data.height ? " cm" : "")),
                        createFieldLine("Personality", data.personality),
                        createFieldLine("Father's Name", data.fathersName),
                        createFieldLine("Father's Status", data.fathersStatus),
                        createFieldLine("Family Income Source", data.familyIncomeSource),
                    ],
                  }),
                  // Column 2: Middle Bio (37%)
                  new TableCell({
                    width: { size: 37, type: WidthType.PERCENTAGE },
                    children: [
                        createFieldLine("Aid No", data.aidNo),
                        createFieldLine("Donor Agency", data.donorAgency),
                        createFieldLine("Aim in Life", data.aimInLife),
                        createFieldLine("Grade", data.grade),
                        createFieldLine("Weight", data.weight + (data.weight ? " kg" : "")),
                        createFieldLine("Academic Year", data.academicYear),
                        createFieldLine("Mother's Name", data.mothersName),
                        createFieldLine("Mother's Status", data.mothersStatus),
                        createFieldLine("Monthly Income (BDT)", data.monthlyIncome),
                    ],
                  }),
                  // Column 3: Picture Box (26%)
                  new TableCell({
                    width: { size: 26, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP, // Aligns picture box to top
                    children: [
                        // The Picture Frame Table
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    height: { value: 3600, rule: HeightRule.EXACT }, // Fixed Height
                                    children: [
                                        new TableCell({
                                            children: [], // Empty for the picture
                                            borders: {
                                                top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                                                bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                                                left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                                                right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        new Paragraph({
                            text: "Picture",
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 100 },
                            run: { font: FONT_BODY, size: 20 }
                        })
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer

          // Descriptive Sections
          createQuestionBlock("Write about yourself and your future:", data.aboutSelfAndFuture),
          createQuestionBlock("Write a brief description about your home in the village and surroundings:", data.homeDescription),
          createQuestionBlock("Give a short description of your school and of the study environment:", data.schoolDescription),
          createQuestionBlock("What interesting story/experience has happened in your life/family?", data.interestingStory),
          
          new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer

          createQuestionBlock("Teacher's remarks about the child:", data.teachersRemarks),

          new Paragraph({ text: "", spacing: { after: 600 } }), // Spacer before footer

          // Footer Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Prepared By: ", bold: true, font: FONT_BODY, size: FONT_SIZE_NORMAL }),
                                new TextRun({ text: data.preparedBy, font: FONT_BODY, size: FONT_SIZE_NORMAL })
                            ]
                        })
                    ],
                  }),
                  new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Prepared Date: ", bold: true, font: FONT_BODY, size: FONT_SIZE_NORMAL }),
                                new TextRun({ text: data.preparedDate, font: FONT_BODY, size: FONT_SIZE_NORMAL })
                            ],
                            alignment: AlignmentType.RIGHT
                        })
                    ],
                  }),
                ],
              }),
            ],
          }),

        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  
  // Safe filename sanitizer
  const sanitize = (input: string | undefined) => {
    if (!input) return "";
    return input.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
  };
  
  const aid = sanitize(data.aidNo);
  const name = sanitize(data.childName);
  
  const filename = `${aid || "AID"} - ${name || "Child"}.docx`;
  
  saveAs(blob, filename);
};

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun, HeightRule, VerticalAlign } from "docx";
import FileSaver from "file-saver";
import { DossierProfile } from "../types";

// Hardcoded Base64 for ADRA Logo (Green Logo)
// This avoids network/CORS issues during DOCX generation.
const LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAJYAAAAyCAYAAACjbLjCAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF10lEQVR4nO2cW2wUVRzG/zO73XZbWqBAUbG0F6hcbC88gAmC0SRGEx940BeiL74YNRHTB42J8UF9MZEQEw0KxnBCSIyJEA0vlQtiBGkLhbYUuVVoW9rutu3OzI5nZnc6u512Z3bO7Hj+ky/tnDnzf/7fmfOfM2e2CIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCCIf9O0604jO1hY01/uQ5/UAAAoFhMciGL8xhuGr9xCORhWdm56E09qEzo4WvN5UDwDweT1oa/KjpaEeAAIBP25fv4+hK6OKzk592tpb0N7aAgDweT14rqHu/3/z+7y4dOkqRkZuKTrfC0F320s40NUCn8cDAMjzeLC/uw37u9sAALleD3rabqCns1XRuRkM5rY2dO9oBQDkeT146flGvNRUDwAo5HnQ3uTHC831AAAgT0Dbcz60N/kUnZ8e6G57Cfs6mwEABV4P9ne1Yl9nCwAgz+NBd2crutpbFZ2bwdC160xje3M98jz/9622Jj9eaKoHAOR5PdjW5EdrQ/3/f9vX5MP+7jZF56Yn4bQ2obOtBbne//pWnrcA+7vb0N7aAgDwF/iwv6sV+7vaFJ2bwdDd9hL2dbbA5/H8p2/1tL2IntZW5Hk88Hk86OlsRU/bC0XnZiD07TrT2N7SjDyvBwDQ3ORDW5MfAJDnLZjXty7fGMNwOApB58L3Qk11Hna0NOGF5noAQJ7Xg5ea6tHW5AcA5Hk82NfVgv1dC/atgK8A3Z2t6G57UdG5GQzmtjZ072hFntcDAHDaCuhua0F32wJ9K+ArQHenct/K90JN9f8v1N7kR1uTHwCQ5/Vgf1cL9ne1KDo3PQmn9T/XW3negv9cb+V5POjpbEVPe6uiczMYuttu4uD+Vng9HgBAoddbsG/leTzo7mxFV3urovMzGLp3tKKQ5wEAOO0F7O9qxb6uFgBAnsddsG/leTzY392G/d1tis7NYDB37EBPSzMAwGkvoLutBd1tLwEA8rwF6O5sRXdnq6JzMxi6217Cvs5m5HkLAAB5Xg/2d7Vif9eCfasC3Z2t6GpvVXR+etC360wjejpaUcjzAACc9gL2dbViv0r6VoG+XWca0dnagpZ6H/K8HgBAoYDwWATjN8YwfPUewtGoovMyCMyX61t53gL2dbVif1eLovMyCIy3AN1tyxdqT9sL2NfVouj8DAKjyr5VoK+nHQv2rTyPBz2drei5w76V74Wa6jzs3tGCF5rqAQB5Xg/am/xoa/IDAPI8HuzrakFfe6uiczMYzG1t6N7RigKvBwDgKyjYtwK+AnR3tqK77UVF52YwGE8B9nW2oJDrAQDkeT3Y39WK/Z0tAIA8jwfdna3oam9VdG4Gg/EUoK+zBYU8DwDAaV+wb/kK0N3Ziq72VkXnZjB0t72EfZ3NyPMWAADyvB7s72rF/q4W5Hk88Hk86OlsRU/bC4rOzWDoa3sRPS0t8Ho8AIDCXG/lK0BPZyt62l5QdG4GQ09LM9rqfQCAQp4H7U1+tDX5AQB5Xg/2dbVgX1erovMzCIy3AN1tL2FfZzMAIM9bgP1dbdhfom8FfAXo7mxFd2erovMzCIy3AH097SjwFgAAeT6CvhXwFaC7sxXdbS8qOi+Doa/nLHbs2A6v1wMAcNor6Fu9hP1dC/atgK8A3Z2t6G57UdG5GQzmtjZ072hFntcDAHDaC+hua0F32wJ9K+ArQHenct/K90JN9f8v1N7kR1uTHwCQ5/Vgf1cL9ne1KDo3PQmn9T/XW3negv9cb+V5POjpbEVPe6uiczMY/gI3m3z6v+nQ7wAAAABJRU5ErkJggg==";

export const generateDossierDocx = async (data: DossierProfile) => {
  
  // Convert Base64 to Uint8Array
  const imageBytes = Uint8Array.from(atob(LOGO_BASE64), c => c.charCodeAt(0));

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
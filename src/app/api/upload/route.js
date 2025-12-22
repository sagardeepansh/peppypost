import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

/**
 * POST /api/upload
 * Accepts multipart/form-data
 * Returns uploaded file path
 */
// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json(
//         { success: false, message: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // Ensure upload directory exists
//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // Generate safe unique filename
//     const ext = path.extname(file.name);
//     const filename = `${crypto.randomUUID()}${ext}`;
//     const filepath = path.join(uploadDir, filename);

//     // Convert to buffer
//     const buffer = Buffer.from(await file.arrayBuffer());
//     fs.writeFileSync(filepath, buffer);

//     return NextResponse.json({
//       success: true,
//       path: `/uploads/${filename}`,
//       filename,
//       size: file.size,
//       type: file.type,
//     });
//   } catch (error) {
//     console.error("UPLOAD ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "Upload failed" },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";

// import crypto from "crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Enforce 200 KB limit
    const MAX_SIZE = 200 * 1024; // 200 KB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File exceeds 200 KB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}


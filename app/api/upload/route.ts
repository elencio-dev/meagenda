import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.AWS_ENDPOINT, // Optional for Cloudflare R2
}) : null;

export async function POST(request: NextRequest) {
  // 1. Strict Auth and Plan Check
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  // Rule: ONLY PRO users can upload images
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((user as any).planId !== "PRO") {
    return NextResponse.json(
      { error: "Upload de fotos de serviços é um recurso exclusivo do Plano PRO. Faça o upgrade para utilizar." }, 
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "A imagem não pode ultrapassar 4MB." }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Validate "Magic Bytes"
    const typeInfo = await fileTypeFromBuffer(buffer);
    if (!typeInfo || !["image/jpeg", "image/png", "image/webp"].includes(typeInfo.mime)) {
      return NextResponse.json({ error: "Formato de arquivo inválido. Use JPG, PNG ou WEBP." }, { status: 415 });
    }

    // 3. Security Re-encoding with Sharp (strips EXIF, prevents payloads)
    const processedBuffer = await sharp(buffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 }) // Unify everything to WebP!
      .toBuffer();

    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.webp`;

    let imageUrl = "";

    // 4. Save to Cloud vs Local Strategy
    if (s3Client && process.env.AWS_BUCKET_NAME) {
      // S3 / Cloudflare R2 Upload
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `services/${filename}`,
        Body: processedBuffer,
        ContentType: "image/webp",
        // ACL: 'public-read' // Only if bucket supports it, alternatively leave it default and rely on bucket policy
      });
      await s3Client.send(command);

      // The public URL can be constructed if the bucket is public, or routed through API.
      // Assuming public bucket read access for simplicity on Booking Pages:
      imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/services/${filename}`;
    } else {
      // FALLBACK DEV ENVIRONMENT: Local public folder
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), processedBuffer);
      imageUrl = `/uploads/${filename}`; // Public URI
    }

    return NextResponse.json({ success: true, url: imageUrl }, { status: 201 });
  } catch (error) {
    console.error("[UPLOAD API ERROR]", error);
    return NextResponse.json({ error: "Falha catastrófica ao processar arquivo" }, { status: 500 });
  }
}

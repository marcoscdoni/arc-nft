import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export async function POST(request: NextRequest) {
  try {
    // Validar configuração
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !BUCKET_NAME || !PUBLIC_URL) {
      return NextResponse.json(
        { error: 'R2 storage not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máx 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPEG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Converter para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gerar ID único para o arquivo
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const imageKey = `images/${fileId}.png`;

    // Upload para R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: buffer,
        ContentType: file.type || 'image/png',
      })
    );

    const imageUrl = `${PUBLIC_URL}/${imageKey}`;

    return NextResponse.json(
      { imageUrl },
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

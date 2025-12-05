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

    const body = await request.json();
    const { metadata } = body;

    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata provided' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (!metadata.name || !metadata.description || !metadata.image) {
      return NextResponse.json(
        { error: 'Missing required metadata fields: name, description, image' },
        { status: 400 }
      );
    }

    // Validar tamanho do metadata (máx 100KB)
    const metadataSize = JSON.stringify(metadata).length;
    if (metadataSize > 100 * 1024) {
      return NextResponse.json(
        { error: 'Metadata too large. Maximum size is 100KB' },
        { status: 400 }
      );
    }

    // Gerar ID único para o arquivo
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const metadataKey = `metadata/${fileId}.json`;

    // Converter metadata para JSON
    const metadataJson = JSON.stringify(metadata, null, 2);

    // Upload para R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: metadataKey,
        Body: metadataJson,
        ContentType: 'application/json',
      })
    );

    const metadataUrl = `${PUBLIC_URL}/${metadataKey}`;

    return NextResponse.json({ metadataUrl });
  } catch (error) {
    console.error('Error uploading metadata to R2:', error);
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}

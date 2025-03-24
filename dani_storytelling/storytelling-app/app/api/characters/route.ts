import prisma from '../../../lib/prisma'; import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json(await prisma.character.findMany()); }
export async function POST(req: Request) { const data = await req.json(); return NextResponse.json(await prisma.character.create({ data })); }

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();
    const res = await prisma.behavior.create({
      data,
    });
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(err);
  }
};

export const GET = async (req: NextRequest) => {
  const res = await prisma.behavior.findMany();
  return NextResponse.json(res);
};

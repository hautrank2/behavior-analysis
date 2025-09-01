import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";

export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");
  if (!type) {
    return new Response("Behavior type not provided", { status: 400 });
  }
  try {
    const data = await req.json();
    const res = await prisma.behavior.create({
      data: {
        ...data,
        type,
      },
    });
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(err);
  }
};

export const GET = async (req: NextRequest) => {
  const filter: Record<string, any> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    filter[key] = value;
  });

  // truyền filter vào Prisma
  const res = await prisma.behavior.findMany({
    where: filter,
  });

  return NextResponse.json(res);
};

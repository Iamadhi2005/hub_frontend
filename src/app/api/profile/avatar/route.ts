import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as any;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // -- MOCK MODE --
  // For now, just pretend we saved it and return a fake URL
  // (In dev, you could even save it to /public/uploads temporarily)
  const name = file.name ?? `avatar-${Date.now()}`;
  return NextResponse.json({ url: `/uploads/${Date.now()}-${name}` });

  // -- REAL MODE (once FastAPI + Cloudinary/S3 is ready) --
  /*
  const backendForm = new FormData();
  backendForm.append("file", file);

  const res = await fetch("http://localhost:8000/api/v1/profile/avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: backendForm,
  });

  const data = await res.json();
  return NextResponse.json({ url: data.avatar_url }); // FastAPI returns the Cloudinary URL
  */
}

export async function DELETE(req: NextRequest) {
  // In mock mode we simply acknowledge the delete. In real mode, call backend.
  return NextResponse.json({ ok: true });
}

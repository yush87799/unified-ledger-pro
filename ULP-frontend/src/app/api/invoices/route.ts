import { NextResponse } from 'next/server';

const INVOICING_SERVICE_URL = 'http://localhost:3003';

export async function GET() {
  try {
    const response = await fetch(INVOICING_SERVICE_URL);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from invoicing service:', error);
    return new NextResponse('Error fetching data from invoicing service', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(INVOICING_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error posting to invoicing service:', error);
    return new NextResponse('Error posting data to invoicing service', { status: 500 });
  }
}

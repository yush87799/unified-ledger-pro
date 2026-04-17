import { NextResponse } from 'next/server';

const INVENTORY_SERVICE_URL = 'http://localhost:3002';

export async function GET() {
  try {
    const response = await fetch(INVENTORY_SERVICE_URL);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from inventory service:', error);
    return new NextResponse('Error fetching data from inventory service', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(INVENTORY_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error posting to inventory service:', error);
    return new NextResponse('Error posting data to inventory service', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(INVENTORY_SERVICE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error putting to inventory service:', error);
    return new NextResponse('Error putting data to inventory service', { status: 500 });
  }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    const response = await fetch(`${INVENTORY_SERVICE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting from inventory service:', error);
    return new NextResponse('Error deleting data from inventory service', { status: 500 });
  }
}

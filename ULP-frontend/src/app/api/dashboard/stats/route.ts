import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:3001/stats');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from dashboard service:', error);
    return new NextResponse('Error fetching data from dashboard service', { status: 500 });
  }
}

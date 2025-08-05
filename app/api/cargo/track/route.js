// app/api/cargo/track/route.js
import { NextResponse } from 'next/server';
import { trackShipment } from '../../utils/cargoTrack';

export async function POST(req) {
    try {
        const body = await req.json();
        const { cargoKey } = body;

        if (!cargoKey) {
            return NextResponse.json(
                { error: 'cargoKey parametresi gereklidir' },
                { status: 400 }
            );
        }

        const trackingResult = await trackShipment(cargoKey);

        return NextResponse.json(trackingResult);
    } catch (error) {
        console.error("Kargo takip hatası:", error);
        return NextResponse.json(
            {
                error: 'Kargo takip hatası',
                details: error.message
            },
            { status: 500 }
        );
    }
}
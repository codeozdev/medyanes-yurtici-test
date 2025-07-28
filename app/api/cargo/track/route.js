// app/api/cargo/track/route.js
import { NextResponse } from 'next/server';
import { trackShipment } from '../../utils/cargoTrack';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const orderNo = searchParams.get('orderNo');

        if (!orderNo) {
            return NextResponse.json(
                { error: 'Sipariş numarası gerekli' },
                { status: 400 }
            );
        }

        const result = await trackShipment(orderNo);

        const response = {
            success: result.includes('SUCCESS') || result.includes('<return>0</return>'),
            orderNo: orderNo,
            status: result.match(/<shipmentStatus>(.*?)<\/shipmentStatus>/)?.[1] || 'Durum bilgisi bulunamadı',
            details: result,
            trackingUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${orderNo}`
        };

        return NextResponse.json(response);

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
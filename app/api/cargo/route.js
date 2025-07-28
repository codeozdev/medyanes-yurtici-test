import { NextResponse } from 'next/server';
import { createSoapClient, soapConfig, SHIPPING_WSDL } from '../utils/cargoCreate';

export async function POST(req) {
    try {
        const body = await req.json();

        // Benzersiz sipariş numarası oluştur
        const timestamp = new Date().getTime();
        const uniqueOrderNo = `ORD${timestamp}`;

        const params = {
            wsUserName: soapConfig.username,
            wsPassword: soapConfig.password,
            userLanguage: soapConfig.language,
            ShippingOrderVO: {
                cargoKey: uniqueOrderNo, // Benzersiz numara kullan
                invoiceKey: uniqueOrderNo, // Benzersiz numara kullan
                receiverCustName: body.customerName,
                receiverAddress: body.address,
                cityName: body.city,
                townName: body.district,
                receiverPhone1: body.phone,
                emailAddress: body.email,
                cargoCount: 1,
                specialField1: `53$${uniqueOrderNo}#` // Benzersiz numara kullan
            }
        };

        console.log("İstek parametreleri:", params);

        const result = await createSoapClient(params);

        // XML yanıtını daha okunabilir hale getir
        const response = {
            success: result.includes('<outFlag>0</outFlag>'),
            orderNo: uniqueOrderNo,
            message: result.match(/<outResult>(.*?)<\/outResult>/)?.[1] || 'İşlem tamamlandı',
            rawResponse: result
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Detaylı hata:", error);
        return NextResponse.json(
            {
                error: 'Kargo oluşturma hatası',
                details: error.message
            },
            { status: 500 }
        );
    }
}
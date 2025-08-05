// app/api/utils/cargoTrack.js
import axios from 'axios';

export const TRACKING_WSDL = 'https://testws.yurticikargo.com/KOPSWebServices/WsReportWithReferenceServices';
export const soapConfig = {
    username: 'YKTEST',
    password: 'YK',
    language: 'TR'
};

export const trackShipment = async (cargoKey) => {
    const soapEnvelope = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tns="http://yurticikargo.com.tr/sswIntegrationServices">
        <soapenv:Header/>
        <soapenv:Body>
          <tns:listInvDocumentInterfaceByReference>
             <userName>${soapConfig.username}</userName>
             <password>${soapConfig.password}</password>
             <language>${soapConfig.language}</language>
             <fieldName>14</fieldName>
             <fieldValueArray>
                <item>${cargoKey}</item>
             </fieldValueArray>
          </tns:listInvDocumentInterfaceByReference>
        </soapenv:Body>
        </soapenv:Envelope>`;

    try {
        const response = await axios.post(
            TRACKING_WSDL,
            soapEnvelope,
            {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': 'listInvDocumentInterfaceByReference'
                },
                timeout: 30000
            }
        );

        console.log('SOAP yanıtı:', response.data);

        // Yanıttan docCargoId değerini çıkarmak için
        const docCargoIdMatch = response.data.match(/<docCargoId>(.*?)<\/docCargoId>/);
        const docCargoId = docCargoIdMatch ? docCargoIdMatch[1] : null;

        return {
            rawResponse: response.data,
            docCargoId: docCargoId,
            success: !response.data.includes('<errorCode>')
        };
    } catch (error) {
        const errorDetail = error.response?.data || error.message;
        console.error('SOAP takip isteği detaylı hata:', errorDetail);

        // Daha açıklayıcı hata mesajı
        if (errorDetail.includes('Endpoint')) {
            throw new Error('Yurtiçi Kargo servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
            throw error;
        }
    }
};
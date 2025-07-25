import axios from 'axios';

export const SHIPPING_WSDL = 'https://testws.yurticikargo.com/KOPSWebServices/ShippingOrderDispatcherServices';
export const TRACKING_WSDL = 'https://testws.yurticikargo.com/KOPSWebServices/WsReportWithReferenceServices';

export const soapConfig = {
    username: 'YKTEST',
    password: 'YK',
    language: 'TR'
};

export const createSoapClient = async (params) => {
    const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:ship="http://yurticikargo.com.tr/ShippingOrderDispatcherServices">
            <soapenv:Header/>
            <soapenv:Body>
                <ship:createShipment>
                    <wsUserName>${params.wsUserName}</wsUserName>
                    <wsPassword>${params.wsPassword}</wsPassword>
                    <userLanguage>${params.userLanguage}</userLanguage>
                    <ShippingOrderVO>
                        <cargoKey>${params.ShippingOrderVO.cargoKey}</cargoKey>
                        <invoiceKey>${params.ShippingOrderVO.invoiceKey}</invoiceKey>
                        <receiverCustName>${params.ShippingOrderVO.receiverCustName}</receiverCustName>
                        <receiverAddress>${params.ShippingOrderVO.receiverAddress}</receiverAddress>
                        <cityName>${params.ShippingOrderVO.cityName}</cityName>
                        <townName>${params.ShippingOrderVO.townName}</townName>
                        <receiverPhone1>${params.ShippingOrderVO.receiverPhone1}</receiverPhone1>
                        <emailAddress>${params.ShippingOrderVO.emailAddress}</emailAddress>
                        <cargoCount>${params.ShippingOrderVO.cargoCount}</cargoCount>
                        <specialField1>${params.ShippingOrderVO.specialField1}</specialField1>
                    </ShippingOrderVO>
                </ship:createShipment>
            </soapenv:Body>
        </soapenv:Envelope>`;

    try {
        const response = await axios.post(SHIPPING_WSDL, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': 'createShipment'
            },
            timeout: 30000 // 30 saniye timeout
        });

        return response.data;
    } catch (error) {
        console.error('SOAP isteği hatası:', error);
        throw error;
    }
};


export const trackShipment = async (orderNo) => {
    const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:ws="http://yurticikargo.com.tr/WsReportWithReferenceServices">
            <soapenv:Header/>
            <soapenv:Body>
                <ws:listInvDocumentInterfaceByReference>
                    <userName>${soapConfig.username}</userName>
                    <password>${soapConfig.password}</password>
                    <language>${soapConfig.language}</language>
                    <fieldName>53</fieldName>
                    <fieldValueArray>
                        <item>${orderNo}</item>
                    </fieldValueArray>
                </ws:listInvDocumentInterfaceByReference>
            </soapenv:Body>
        </soapenv:Envelope>`;

    try {
        const response = await axios.post(
            'https://testws.yurticikargo.com/KOPSWebServices/WsReportWithReferenceServices',
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
        return response.data;
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
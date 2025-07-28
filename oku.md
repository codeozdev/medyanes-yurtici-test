

# **Sipariş Numarası ile Kargo Durumu Sorgulama Sistemi**

## **Yurtiçi Kargo - Teknik Entegrasyon Rehberi**

---

## ✨ Amaç

Bu döküman, elinizdeki **sipariş numarası**, **alıcı bilgileri** ve **fatura verileri** ile **Yurtiçi Kargo API entegrasyonu** kullanılarak, sipariş bazlı kargo durumunun sorgulanabilmesini sağlayacak sistemin kurulumunu açıklar.

### Bu sistemin temel amaçları:

* Takibi, **müşteri sistemindeki sipariş ID** üzerinden yapmak
* Kargo barkodu veya Yurtiçi iç numaralarıyla uğraşmamak
* API üzerinden **otomatik takip sistemi** kurarak operasyonu hızlandırmak

---

## 🧩 Sistemin Genel Akışı

1. Sipariş numarası ile kargo etiketi oluşturulur.
2. `createShipment` servisi ile gönderi Yurtiçi Kargo sistemine bildirilir.
3. `specialField1` alanına sipariş numarası özel formatla aktarılır.
4. Kargo şubeye geldiğinde, Yurtiçi sistemi bu veriyle eşleşme yapar.
5. `listInvDocumentInterfaceByReference` API’si kullanılarak yalnızca sipariş numarası ile kargo takibi yapılabilir.

---

## ⚙️ Gereksinimler

### ✔ Sunucudan Erişim Tanımı

* Sabit IP adresiniz Yurtiçi Kargo’ya bildirilmelidir.
* "Erişim Yetkilendirme Formu" ile bölge müdürlüğüne iletilmelidir.

### ✔ Kullanıcı Bilgileri

#### Test Ortamı

* **Username:** `YKTEST`
* **Password:** `YK`
* **WSDL:**

    * Gönderi Oluşturma:
      `https://testws.yurticikargo.com/KOPSWebServices/ShippingOrderDispatcherServices?wsdl`
    * Sipariş No ile Sorgulama:
      `https://testws.yurticikargo.com/KOPSWebServices/WsReportWithReferenceServices?wsdl`

#### Canlı Ortam

* Bilgiler Yurtiçi Kargo bölge müdürlüğü tarafından sağlanır.

---

## 🛠️ Adım Adım Uygulama

### 1. Gönderi Oluşturma (`createShipment`)

Kurye’ye teslim etmeden önce SOAP üzerinden aşağıdaki XML yapısıyla bildirim yapılır:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
xmlns:ship="http://yurticikargo.com.tr/ShippingOrderDispatcherServices">
  <soapenv:Body> 
    <ship:createShipment>
      <wsUserName>YKTEST</wsUserName> 
      <wsPassword>YK</wsPassword> 
      <userLanguage>TR</userLanguage> 
      <ShippingOrderVO>
        <cargoKey>ORD123456</cargoKey> 
        <invoiceKey>ORD123456</invoiceKey> 
        <receiverCustName>Ahmet Yılmaz</receiverCustName> 
        <receiverAddress>Test Cad. No: 5, Kadıköy / İstanbul</receiverAddress> 
        <cityName>İstanbul</cityName>
        <townName>Kadıköy</townName> 
        <receiverPhone1>05321234567</receiverPhone1> 
        <emailAddress>ahmet@example.com</emailAddress> 
        <cargoCount>1</cargoCount> 
        <specialField1>53$ORD123456#</specialField1>
      </ShippingOrderVO> 
    </ship:createShipment>
  </soapenv:Body> 
</soapenv:Envelope>
```

#### Açıklamalar:

* `cargoKey`: Sipariş numarası, hem sizin sisteminizde hem Yurtiçi sisteminde ortak ID olur.
* `specialField1`: `53` kodu, Yurtiçi sisteminde özel müşteri alanıdır. Sipariş numarası burada taşınır ve sorgu buradan yapılır.

---

### 2. Kuryeye Verilecek Bilgiler

* Fatura ve kargo paketinde sipariş numarası **(ORD123456)** açıkça yazmalıdır.
* Kurye, şubeye gittiğinde bu bilgiyi taşıma belgesine işler.
* Bu eşleşme olmadan API sorgusu yapılamaz.

---

### 3. Sipariş Numarası ile Kargo Sorgulama

Aşağıdaki SOAP yapısı ile `listInvDocumentInterfaceByReference` servisi çağrılır:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
xmlns:ws="http://yurticikargo.com.tr/WsReportWithReferenceServices">
  <soapenv:Body> 
    <ws:listInvDocumentInterfaceByReference>
      <userName>YKTEST</userName> 
      <password>YK</password> 
      <language>TR</language> 
      <fieldName>53</fieldName> 
      <fieldValueArray>
        <item>ORD123456</item> 
      </fieldValueArray>
    </ws:listInvDocumentInterfaceByReference> 
  </soapenv:Body>
</soapenv:Envelope>
```

#### Dönen Veriler:

* Kargo referans numarası
* Teslim durumu (kim aldı, ne zaman teslim edildi)
* Teslim tarihi ve saati
* Takip linki
* Gönderici/Alıcı şube bilgisi
* Hareket geçmişi

---

## 🧑‍💻 Yazılımcıya Teknik Tavsiyeler

* **SOAP entegrasyonu için**:

    * `axios-soap` (Node.js)
    * `.NET WCF`
    * `node-soap` kütüphaneleri önerilir.

* Her gönderiden sonra:

    * `cargoKey`, `siparişNo`, `docId` verileri lokal veritabanında saklanmalı.
    * Sorgu ekranında önce lokal veriye bakılmalı, yoksa API çağrısı yapılmalı.

* **Cache sistemi** kurulmalı, tekrar eden sorgular engellenmelidir.

---

## 📄 Ek Notlar

* API çağrıları **HTTPS** üzerinden gerçekleşir.
* Aynı anda çok fazla sorgu yapılırsa sistem hata verebilir.
* Canlıya geçmeden önce tüm işlemler test ortamında senaryolarla denenmelidir.

---

## 🌐 Bağlantılar

* **Test Shipment API**
  `https://testws.yurticikargo.com/KOPSWebServices/ShippingOrderDispatcherServices?wsdl`

* **Test Sorgulama API**
  `https://testws.yurticikargo.com/KOPSWebServices/WsReportWithReferenceServices?wsdl`

---

## 📊 Özet

Bu sistemle **sipariş numarası üzerinden kargo durumu sorgulamak** mümkündür.
Doğru kurgulandığında hem geliştirici hem operasyon ekibi için **%100 otomasyon** sağlanır.

### Neden Bu Yöntem?

* Yurtiçi Kargo, `fieldName: 53` üzerinden **müşteri özel alanı** tanımlar.
* Takip kodu gibi değişken bilgilere gerek kalmadan, **yalnızca sipariş numarası** ile sorgu yapılabilir.

### Uygulama Özet:

**createShipment** → `specialField1 = 53$siparisNo#`
→ **listInvDocumentInterfaceByReference** ile sorgulama yapılır.

---

Hazır PDF veya HTML dökümana dönüştürmek istersen, sadece belirtmen yeterli.


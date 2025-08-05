## Sorunun Açıklaması
Bu yanıta göre:
1. **Test ortamında bile manuel onay gerekiyor**: `createShipment` API'si ile gönderdiğiniz kargo bilgileri, şube onayı olmadan tam olarak aktif hale gelmiyor.
2. **Kargo takip sistemine bağlanması gerek**: Sipariş bilgisi otomatik olarak kargo takip sistemine bağlanmıyor, bu nedenle `listInvDocumentInterfaceByReference` metodu "kayıt bulunamadı" hatası veriyor.
3. **Test ortamı için Yurtiçi Kargo'nun manuel müdahalesi gerekiyor**: Yurtiçi Kargo teknik ekibinin, oluşturduğunuz `cargoKey` değerini kullanarak taşıma belgesini manuel olarak düzenlemesi gerekiyor.

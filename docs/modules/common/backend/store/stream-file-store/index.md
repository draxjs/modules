# StreamFileStore

## Propósito

`StreamFileStore` persiste un stream a disco usando `pipeline`.

## Qué hace

Pasa el stream por `StreamSizeValidator`, escribe en el destino final y devuelve `bytesWritten`.

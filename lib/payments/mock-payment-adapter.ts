import { PaymentAdapter, PaymentRequest, PaymentResult } from "./payment-types";

export class MockIyzicoPaymentAdapter implements PaymentAdapter {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate network delay for realistic gateway interaction
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (request.paymentMethod === "cash_on_delivery") {
      return {
        success: true,
        transactionId: `COD-${Math.floor(100000 + Math.random() * 900000)}`,
        statusMessage: "Kapıda ödeme siparişi onaylandı.",
      };
    }

    // Basic frontend card verification mock
    if (request.cardDetails) {
      const cleanNum = request.cardDetails.cardNumber.replace(/\s+/g, "");
      if (cleanNum.length < 15) {
        return {
          success: false,
          errorCode: "ERR_INVALID_CARD",
          statusMessage: "Geçersiz kart numarası. Lütfen kontrol ediniz.",
        };
      }

      return {
        success: true,
        transactionId: `IYZICO-${Math.floor(10000000 + Math.random() * 90000000)}`,
        statusMessage: "Ödeme işlemi başarıyla gerçekleştirildi (3D Secure Onaylı).",
      };
    }

    return {
      success: false,
      errorCode: "ERR_MISSING_DETAILS",
      statusMessage: "Ödeme bilgileri eksik.",
    };
  }
}

export const paymentAdapter = new MockIyzicoPaymentAdapter();

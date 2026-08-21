export interface CardPaymentDetails {
  cardHolderName: string;
  cardNumber: string; // only last 4 digits stored in mock
  expiryMonth: string;
  expiryYear: string;
  cvv: string; // NEVER stored
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: "credit_card" | "cash_on_delivery";
  cardDetails?: CardPaymentDetails;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  statusMessage: string;
  errorCode?: string;
}

export interface PaymentAdapter {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
}

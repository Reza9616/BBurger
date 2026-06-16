// types/crm.ts
export type SendSMSRequest = {
  customerIds?: number[];
  message: string;
  subject?: string;
  scheduleDate?: string;
  isBulk?: boolean;
};

export type SendSMSResponse = {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  totalCount: number;
};

export type Message = {
  id: number;
  customer_id: number | null;
  customer_code: string | null;
  message_type: 'sms' | 'email' | 'notification';
  subject: string | null;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at: Date | null;
  created_by: string;
  created_at: Date;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
};
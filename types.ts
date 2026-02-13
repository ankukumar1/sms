
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Sent' | 'Sending';
export type CampaignType = 'Email' | 'SMS';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  content: string;
  recipientsCount: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  scheduledAt?: string;
}

export interface Template {
  id: string;
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  createdAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export interface Contact {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  tags: string[];
  groupId?: string;
  status: 'Subscribed' | 'Unsubscribed' | 'Bounced';
}

export interface AnalyticsData {
  date: string;
  sent: number;
  opens: number;
  clicks: number;
}

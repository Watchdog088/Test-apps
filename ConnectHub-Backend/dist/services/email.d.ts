interface EmailData {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
}
export declare const sendEmail: ({ to, subject, template, data }: EmailData) => Promise<void>;
export declare const sendBulkEmails: (emails: EmailData[]) => Promise<void>;
declare const _default: {
    sendEmail: ({ to, subject, template, data }: EmailData) => Promise<void>;
    sendBulkEmails: (emails: EmailData[]) => Promise<void>;
};
export default _default;

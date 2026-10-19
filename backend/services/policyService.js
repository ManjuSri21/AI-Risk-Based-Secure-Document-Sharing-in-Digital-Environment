export const generateAdaptivePolicy = (riskLevel) => {
  switch (riskLevel) {
    case 'HIGH':
      return {
        encryption: 'AES-256 Military Grade',
        authentication: 'Password + OTP',
        accessDuration: '1 Hour',
        downloadLimit: '0 / View Only',
        watermark: 'Dynamic Forensics Watermark',
        auditLogging: 'Full Immutable Trail',
        recipientVerification: 'Required OTP',
      };
    case 'MEDIUM':
      return {
        encryption: 'AES-256',
        authentication: 'Password Protection',
        accessDuration: '6 Hours',
        downloadLimit: '1 Download',
        watermark: 'Standard Watermark',
        auditLogging: 'Enabled',
        recipientVerification: 'Email Check',
      };
    case 'LOW':
    default:
      return {
        encryption: 'Basic AES-128',
        authentication: 'Secure Link',
        accessDuration: '24 Hours',
        downloadLimit: 'Allowed',
        watermark: 'Disabled',
        auditLogging: 'Enabled',
        recipientVerification: 'None',
      };
  }
};

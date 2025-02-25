// services/zelleTestService.ts
interface ZelleTestCredentials {
    bankId: string;
    username: string;
    password: string;
  }
  
  interface ZelleTestResponse {
    success: boolean;
    message: string;
    data?: any;
  }
  
  // Mock bank accounts for testing
  const TEST_BANK_ACCOUNTS = {
    'test_user': {
      bankId: 'chase',
      password: 'test123',
      balance: 1000,
      phone: '555-0123',
      isZelleEnabled: true
    }
  };
  
  export class ZelleTestService {
    // Simulate bank authentication
    static async authenticate(credentials: ZelleTestCredentials): Promise<ZelleTestResponse> {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const account = TEST_BANK_ACCOUNTS[credentials.username];
      
      if (!account) {
        throw new Error('Invalid credentials');
      }
  
      if (account.password !== credentials.password) {
        throw new Error('Invalid password');
      }
  
      if (!account.isZelleEnabled) {
        throw new Error('Zelle is not enabled for this account');
      }
  
      return {
        success: true,
        message: 'Authentication successful',
        data: {
          verificationPhone: account.phone
        }
      };
    }
  
    // Simulate verification code sending
    static async sendVerificationCode(username: string): Promise<ZelleTestResponse> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const account = TEST_BANK_ACCOUNTS[username];
      if (!account) {
        throw new Error('Account not found');
      }
  
      // In test environment, always use '123456' as verification code
      return {
        success: true,
        message: 'Verification code sent',
        data: {
          codeLength: 6
        }
      };
    }
  
    // Simulate verification code validation
    static async verifyCode(username: string, code: string): Promise<ZelleTestResponse> {
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // In test environment, accept '123456' as valid code
      if (code !== '123456') {
        throw new Error('Invalid verification code');
      }
  
      return {
        success: true,
        message: 'Code verified successfully'
      };
    }
  
    // Simulate payment processing
    static async processPayment(
      username: string, 
      amount: number, 
      recipient: string
    ): Promise<ZelleTestResponse> {
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      const account = TEST_BANK_ACCOUNTS[username];
      
      if (!account) {
        throw new Error('Account not found');
      }
  
      if (account.balance < amount) {
        throw new Error('Insufficient funds');
      }
  
      // Simulate successful payment
      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId: 'test_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          amount: amount,
          recipient: recipient,
          remainingBalance: account.balance - amount
        }
      };
    }
  }
  
  // Example test cases
  export const ZELLE_TEST_CASES = {
    // Valid test credentials
    validUser: {
      username: 'test_user',
      password: 'test123',
      bankId: 'chase'
    },
    
    // Test verification code
    validCode: '123456',
    
    // Test error scenarios
    invalidCredentials: {
      username: 'wrong_user',
      password: 'wrong_pass',
      bankId: 'chase'
    },
    
    // Test recipients
    testRecipients: {
      valid: 'test.recipient@example.com',
      invalid: 'invalid@example.com'
    }
  };
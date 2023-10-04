
import { Test, TestingModule } from '@nestjs/testing';

import { OpenAIService } from 'src/providers/openai.provider';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerRepository } from 'src/customer/customer.repository';
import { GeneratorService } from './generator.service';
import { BadRequestException } from '@nestjs/common';
import { Customer } from 'src/customer/entities/customer.entity';

jest.mock('src/providers/openai.provider');
jest.mock('src/providers/utility.provider');
jest.mock('src/providers/cloudwatch-logs.service');
jest.mock('src/customer/customer.service');
jest.mock('src/customer/customer.repository');


describe('GeneratorService', () => {
  let service: GeneratorService;
  let mockUtilityService: jest.Mocked<UtilityService>;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;

  const mockOpenAIService = {
    generateGPTLangChainPrompt: jest.fn(),
    getChain: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorService,
        {
          provide: OpenAIService,
          useValue: mockOpenAIService
        },
        {
          provide: UtilityService,
          useValue: {
            removeAuth0Prefix: jest.fn(),
            getNeededOpenAiTokenCountForString: jest.fn(),
            extractJavaScriptFromHTML: jest.fn(),
            replaceScriptTags: jest.fn()
          }
        },
        { provide: CloudWatchLogsService, useValue: { logMessage: jest.fn() } }, // mock implementation as needed
        { provide: CustomerService, useValue: {} }, // mock implementation as needed
        { provide: CustomerRepository, useValue: { getById: jest.fn(), update: jest.fn() } },
      ],
    }).compile();

    service = module.get<GeneratorService>(GeneratorService);
    mockUtilityService = module.get(UtilityService);
    mockCustomerRepository = module.get(CustomerRepository);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined()
  });

  describe('calculateTokensNeededForMultipleFiles', () => {
    it('should calculate total tokens for given files', () => {
      const mockFiles = [
        { buffer: Buffer.from('<script>console.log("file 1");</script>', 'utf-8') },
        { buffer: Buffer.from('<script>console.log("file 2");</script>', 'utf-8') },
        // Add more mock files as needed
      ];

      // Mocking the function call that calculates token count
      mockUtilityService.getNeededOpenAiTokenCountForString.mockImplementationOnce(() => 5).mockImplementationOnce(() => 3);
      mockUtilityService.extractJavaScriptFromHTML.mockReturnValueOnce('console.log("file 1");').mockReturnValueOnce('console.log("file 2");')


      const tokens = service.calculateTokensNeededForMultipleFiles(mockFiles as any);

      expect(tokens).toBe(8);
      expect(mockUtilityService.getNeededOpenAiTokenCountForString).toHaveBeenCalledWith('console.log("file 1");');
      expect(mockUtilityService.getNeededOpenAiTokenCountForString).toHaveBeenCalledWith('console.log("file 2");');
    });
  });

  describe('checkVueFileContentLength', () => {
    it('should validate vue file content length based on tokens', () => {
      const mockVueFileContent = '<script>console.log("Hello World");</script>';
      const mockExtractedScript = 'console.log("Hello World");';

      // Mocking the function calls
      mockUtilityService.extractJavaScriptFromHTML.mockReturnValue(mockExtractedScript);
      mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(5);

      const validationResult = service.checkVueFileContentLength(mockVueFileContent);

      expect(validationResult).toEqual({ valid: true });
      expect(mockUtilityService.extractJavaScriptFromHTML).toHaveBeenCalledWith(mockVueFileContent);
      expect(mockUtilityService.getNeededOpenAiTokenCountForString).toHaveBeenCalledWith(mockExtractedScript);
    });

    it('should invalidate vue file content length if tokens exceed MAX_TOKEN_COUNT', () => {
      const mockVueFileContent = '<script>console.log("This is a very large file content");</script>';
      const mockExtractedScript = 'console.log("This is a very large file content");';

      // Considering the MAX_TOKEN_COUNT in the service is set to 10000. Mock the returned token count to exceed this value
      mockUtilityService.extractJavaScriptFromHTML.mockReturnValue(mockExtractedScript);
      mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(15000);

      const validationResult = service.checkVueFileContentLength(mockVueFileContent);

      expect(validationResult).toEqual({ valid: false });
      expect(mockUtilityService.extractJavaScriptFromHTML).toHaveBeenCalledWith(mockVueFileContent);
      expect(mockUtilityService.getNeededOpenAiTokenCountForString).toHaveBeenCalledWith(mockExtractedScript);
    });
  });
  describe('generateSingleVue3Template', () => {
    it('should successfully convert a Vue2 template to Vue3', async () => {
      const mockVueFileRequest = {
        content: '<template></template><script>console.log("Vue2 script");</script>',
        customerId: 'auth0|12345',
        fileName: 'testFile.vue',
      };

      const mockCustomer = {
        id: '12345',
        aiCredits: 1000,
      };

      mockCustomerRepository.getById.mockResolvedValue(mockCustomer as Customer);
      mockUtilityService.extractJavaScriptFromHTML.mockReturnValue('console.log("Vue2 script");');
      mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(10);
      mockUtilityService.removeAuth0Prefix.mockReturnValue('12345');

      mockOpenAIService.generateGPTLangChainPrompt.mockReturnValue('conversionPrompt');
      mockOpenAIService.getChain.mockReturnValue({
        call: jest.fn().mockResolvedValue({ text: 'convertedScript' }),
      });
      mockUtilityService.replaceScriptTags.mockReturnValue('<template></template><script>convertedScript</script>');

      const result = await service.generateSingleVue3Template(mockVueFileRequest);

      expect(result).toEqual({
        content: '<template></template><script>convertedScript</script>',
        fileName: 'testFile.vue',
        tokensNeeded: expect.any(Number)
      });
    });

    it('should throw BadRequestException if file is too large', async () => {
      const mockVueFileRequest = {
        content: '<template></template><script>veryLargeScript</script>',
        customerId: 'auth0|12345',
        fileName: 'largeFile.vue',
      };

      const mockCustomer = {
        id: '12345',
        aiCredits: 1000,
      };

      mockCustomerRepository.getById.mockResolvedValue(mockCustomer as Customer);
      mockUtilityService.extractJavaScriptFromHTML.mockReturnValue('veryLargeScript');
      mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(15000);

      await expect(service.generateSingleVue3Template(mockVueFileRequest)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if customer does not have enough AI Tokens', async () => {
      const mockVueFileRequest = {
        content: '<template></template><script>console.log("Vue2 script");</script>',
        customerId: 'auth0|12345',
        fileName: 'testFile.vue',
      };

      const mockCustomer = {
        id: '12345',
        aiCredits: 5,
      };

      mockUtilityService.extractJavaScriptFromHTML.mockReturnValue('console.log("Vue2 script");');
      mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(10);
      mockUtilityService.removeAuth0Prefix.mockReturnValue('12345');
      mockCustomerRepository.getById.mockResolvedValue(mockCustomer as Customer);

      await expect(service.generateSingleVue3Template(mockVueFileRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateMultipleVue3Templates', () => {
    const mockFiles = [
      {
        originalname: 'testFile1.vue',
        buffer: Buffer.from('<template></template><script>validScript1</script>'),
      },
      {
        originalname: 'testFile2.vue',
        buffer: Buffer.from('<template></template><script>validScript2</script>'),
      },
    ] as Array<Express.Multer.File>;
    const mockCustomerId = 'auth0|12345';
    it('should successfully process multiple Vue files', async () => {

      // Mock all the dependent methods:
      jest.spyOn(service, 'calculateTokensNeededForMultipleFiles').mockReturnValue(10);
      jest.spyOn(service, 'checkIfCustomerHasEnoughTokens').mockReturnValue(undefined);

      mockUtilityService
        .extractJavaScriptFromHTML
        .mockReturnValueOnce('<script>validScript1</script>')
        .mockReturnValueOnce('<script>validScript2</script>')

      const mockCustomer = { id: mockCustomerId, aiCredits: 20 } as Customer;
      mockCustomerRepository.getById.mockResolvedValueOnce(mockCustomer)


      const result = await service.generateMultipleVue3Templates(mockFiles, mockCustomerId);

      expect(result).toEqual({ presignedUrl: 'mock-presigned-url' });
    });

    it('should throw an error if a file is invalid', async () => {
      // ... similar setup to the previous test ...

      jest.spyOn(service, 'checkIfCustomerHasEnoughTokens').mockImplementation(() => {
        throw new BadRequestException('File is invalid');
      });

      await expect(service.generateMultipleVue3Templates(mockFiles, mockCustomerId)).rejects.toThrow(BadRequestException);
    });

    // Add more tests, for example:
    // - Customer doesn't have enough tokens.
    // - S3 upload fails.
    // - Zip creation fails.
    // - ... and any other edge cases specific to your application.
  });
});
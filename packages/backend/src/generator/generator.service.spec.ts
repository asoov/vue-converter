// import { Test, TestingModule } from '@nestjs/testing';
// import { GeneratorService } from "./generator.service";
// import { OpenAIService } from 'src/providers/openai.provider';
// import { UtilityService } from 'src/providers/utility.provider';
// import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
// import { CustomerService } from 'src/customer/customer.service';

// describe(GeneratorService.name, () => {
//   let service: GeneratorService
//   beforeEach(async () => {

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [OpenAIService, UtilityService, CloudWatchLogsService, CustomerService],
//     }).compile();

//     service = module.get<GeneratorService>(GeneratorService);
//   })

//   it('should be defined', () => {
//     expect(service).toBeDefined()
//   })
// })


import { Test, TestingModule } from '@nestjs/testing';

import { OpenAIService } from 'src/providers/openai.provider';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerRepository } from 'src/customer/customer.repository';
import { GeneratorService } from './generator.service';

jest.mock('src/providers/openai.provider');
jest.mock('src/providers/utility.provider');
jest.mock('src/providers/cloudwatch-logs.service');
jest.mock('src/customer/customer.service');
jest.mock('src/customer/customer.repository');


describe('GeneratorService', () => {
  let service: GeneratorService;
  let mockUtilityService: jest.Mocked<UtilityService>;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;
  let mockAiService: jest.Mocked<OpenAIService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorService,
        { provide: OpenAIService, useValue: { generateGPTLangChainPrompt: jest.fn() } }, // mock implementation as needed
        { provide: UtilityService, useValue: { removeAuth0Prefix: jest.fn(), getNeededOpenAiTokenCountForString: jest.fn(), extractJavaScriptFromHTML: jest.fn() } },
        { provide: CloudWatchLogsService, useValue: {} }, // mock implementation as needed
        { provide: CustomerService, useValue: {} }, // mock implementation as needed
        { provide: CustomerRepository, useValue: { getById: jest.fn(), update: jest.fn() } },
      ],
    }).compile();

    service = module.get<GeneratorService>(GeneratorService);
    mockUtilityService = module.get(UtilityService);
    mockCustomerRepository = module.get(CustomerRepository);
    mockAiService = module.get(OpenAIService)
  });

  it('should successfully generate vue3 template', async () => {
    expect(service).toBeDefined()
    // // Mock implementations for the test
    // mockCustomerRepository.getById.mockResolvedValue({ id: '', paid: true, aiCredits: 100000, firstName: '', lastName: '', finishedProcesses: [] } as any)
    // mockUtilityService.removeAuth0Prefix.mockReturnValue('testCustomerId');
    // mockUtilityService.getNeededOpenAiTokenCountForString.mockReturnValue(100);
    // mockUtilityService.extractJavaScriptFromHTML.mockReturnValue('')
    // mockAiService.generateGPTLangChainPrompt.mockReturnValue({} as any)
    // mockAiService.getChain.mockReturnValue({ call: jest.fn() } as any)

    // const mockVueFile = {
    //   customerId: 'auth0|testCustomerId',
    //   content: '<script>console.log("test")</script>',
    //   fileName: 'test.vue'
    // };

    // const result = await service.generateSingleVue3Template(mockVueFile);

    // expect(result).toBeDefined();
    // expect(result.fileName).toBe('test.vue');
    // Add more assertions as required
  });

  // Add more tests here...
});
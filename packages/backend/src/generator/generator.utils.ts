import { CompletionCreateParamsNonStreaming } from 'openai/resources/chat';

export const generateGPTPrompt = (
  stringifiedComponentCode: string,
): CompletionCreateParamsNonStreaming => {
  return {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `
      This code is VueJS code that is not Version 3 and is not using the composition API. 
      Please change this code that composition API is implemented. Just return the code, no explaining text.
      This is the code ${stringifiedComponentCode}.
      Always make sure the whole component is returned including template, script and style.
      If you come across special properties prefixed with a '$' make sure to destructure it from the context parameter in the setup function.
      `,
      },
    ],
  };
};

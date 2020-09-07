import { Repository } from "typeorm";

export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  find: jest.fn(entity => entity),
  findOne: jest.fn(entity => entity),
  findOneOrFail: jest.fn(entity => entity),
  merge: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
}));

export const serviceMockFactory: () => MockType<any> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  delete: jest.fn(entity => entity),
}));

export const interceptorMockFactory: () => MockType<any> = jest.fn(() => ({
  intercept: jest.fn(entity => entity),
}));

export const filterMockFactory: () => MockType<any> = jest.fn(() => ({
  catch: jest.fn(entity => entity),
}));